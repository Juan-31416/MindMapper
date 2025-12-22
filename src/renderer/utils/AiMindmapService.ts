/**
 * AI domain service specific to mind maps
 * 
 * Layer on top of LLMProvider that:
 * - Builds prompts (system + user)
 * - Calls LLMProvider.sendChat
 * - Parses/validates JSON -> AiMindMap/AiMindMapEditOperation[]
 * - Applies context limits (number of nodes, note length, input size)
 */

import { 
    AiMindMap,
    AiMindMapNode
 } from "../types/ai/aiMindmap";
import { AiMindMapEditOperation } from "../types/ai/aiOperations";
import { 
    AiSuggestEditsMode,
    AiGenerateMindMapResponse,
    AiSuggestEditsResponse,
    isFullMapResponse,
    isEditsResponse
 } from "../types/ai/aiContracts";
import { LLMProvider } from "./ai/LLMProvider";
import { 
    LLMMessage, 
    LLMResponse, 
    LLMError,
    LLMErrorCode,
    createSystemMessage,
    createUserMessage
 } from "../types/llm";
import { 
    LLMConfig,
    AiLimits
 } from "../types/ai/aiConfig";

export type AiFileType =
    | "plain"
    |"markdown"
    | "html-extracted"
    | "pdf-extracted"
    | "code"
    | "other";

export interface GenerateMindMapOptions {
    language?: string;
    tags?: string[];
    llmConfigOverrides?: Partial<LLMConfig>;
}

export interface GenerateFromFileOptions extends GenerateMindMapOptions {
    fileName?: string;
}

export interface SuggestEditsOptions {
    mode?: AiSuggestEditsMode;
    llmConfigOverrides?: Partial<LLMConfig>;
}

export class AiJsonParseError extends Error {
    constructor(
        message: string,
        public readonly rawText: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = "AiJsonParseError";
    }
}

export class AiServiceError extends Error {
    constructor(
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = "AiServiceError";
    }
}

export interface AiMindmapService {
    generateFromPrompt(
        userPrompt: string,
        options?: GenerateMindMapOptions
    ): Promise<AiMindMap>;

    generateFromFile(
        fileContent: string,
        fileType: AiFileType,
        options?: GenerateFromFileOptions
    ): Promise<AiMindMap>;

    suggestEdits(
        currentMindMap: AiMindMap,
        instruction: string,
        options?: SuggestEditsOptions
    ): Promise<AiMindMap | AiMindMapEditOperation[]>;
}

export class DeafultAiMindmapService implements AiMindmapService {
    private readonly provider: LLMProvider;
    private readonly limits: AiLimits;

    constructor(provider: LLMProvider, limits: AiLimits) {
        this.provider = provider;
        this.limits = limits;
    }

    async generateFromPrompt(
        userPrompt: string, 
        options?: GenerateMindMapOptions
    ): Promise<AiMindMap> {
        const systemMessage = this.buildGenerateFromPromptSystemMessage(options);
        const userMessage = this.buildGenerateFromPromptUserMessage(
            userPrompt,
            options
        );

        const messages: LLMMessage[] = [systemMessage, userMessage];

        const llmResponse = await this.safeSendChat(
            messages,
            options?.llmConfigOverrides
        );

        const parsedJson = this.safeParseJson(llmResponse);

        const mindMap = this.parseGenerateMindMapResponse(parsedJson);
        return mindMap;
    };

    async generateFromFile(
        fileContent: string,
        fileType: AiFileType,
        options?: GenerateFromFileOptions
    ): Promise<AiMindMap> {
        const truncatedContent = this.truncateToLimit(
            fileContent,
            this.limits.maxInputChars
        );

        const systemMessage = this.buildGenerateFromFileSystemMessage(
            fileType,
            options
        );
        const userMessage = this.buildGenerateFromFileUserMessage(
            truncatedContent,
            fileType,
            options
        );

        const messages: LLMMessage[] = [systemMessage, userMessage];

        const llmResponse = await this.safeSendChat(
            messages,
            options?.llmConfigOverrides
        );

        const parsedJson = this.safeParseJson(llmResponse);

        const mindMap = this.parseGenerateMindMapResponse(parsedJson);
        return mindMap;
    }

    async suggestEdits(
        currentMindMap: AiMindMap, 
        instruction: string, 
        options?: SuggestEditsOptions
    ): Promise<AiMindMap | AiMindMapEditOperation[]> {
        const mode: AiSuggestEditsMode = options?.mode ?? "edits";

        const compactSnapshot = this.buildCompactMindMapSnapshot(currentMindMap);

        const systemMessage = this.buildSuggestEditsSystemMessage(mode);
        const userMessage = this.buildSuggestEditsUserMessage(
            compactSnapshot,
            instruction,
            mode
        );

        const messages: LLMMessage[] = [systemMessage, userMessage];

        const llmResponse = await this.safeSendChat(
            messages,
            options?.llmConfigOverrides
        );

        const parsedJson = this.safeParseJson(llmResponse);

        const result = this.parseSuggestEditsResponse(parsedJson, mode);
        return result;
    }

    /**
     * Message construction (prompts)
     */

    private buildGenerateFromPromptSystemMessage(
        options?: GenerateMindMapOptions
    ): LLMMessage {
        const language = options?.language ?? "es";

        const content = `
        Eres un experto en creación de mapas mentales estructurados.
        Tu tarea es generar un mapa mental bien organizado a partir de las instrucciones del usuario.

        REQUISITOS IMPORTANTES:
        - Devuelve ÚNICAMENTE un JSON VÁLIDO.
        - NO incluyas texto fuera del JSON.
        - NO uses formato Markdown.
        - Respeta exactamente los nombres de las propiedades.

        Esquema esperado (TypeScript):

        {
        "schemaVersion": string,
        "mindmap": {
            "title": string,
            "rootNodeId": string,
            "nodes": Array<{
            "id": string,
            "label": string,
            "parentId"?: string | null,
            "notes"?: string,
            "tags"?: string[],
            "order"?: number,
            "childrenIds"?: string[],
            "metadata"?: Record<string, unknown>
            }>,
            "metadata"?: {
            "source"?: string,
            "language"?: string,
            "summary"?: string,
            "tags"?: string[],
            "extra"?: Record<string, unknown>
            }
        }
        }

        Condiciones adicionales:
        - El idioma principal del contenido debe ser: "${language}".
        - Usa "rootNodeId" para identificar el nodo raíz del mapa.
        - Asegúrate de que todos los nodos (excepto el raíz) tienen "parentId".
        - La estructura debe ser un árbol coherente.
        `.trim();
        
        return createSystemMessage(content);
    }

    private buildGenerateFromPromptUserMessage(
        userPrompt: string,
        options?: GenerateMindMapOptions
    ): LLMMessage {
        const tagsPart = options?.tags && options.tags.length > 0 ? `\n\nEtiquetas sugeridas para el mapa: ${options.tags.join(", ")}`: "";

        const content = `
        Genera un mapa mental a partir de esta descripción del usuario:

        """ 
        ${userPrompt}
        """

        ${tagsPart}

        Devuelve SOLO el JSON con la estructura indicada en el mensaje del sistema.
        `.trim();

        return createUserMessage(content);
    }

    private buildGenerateFromFileSystemMessage(
        fileType: AiFileType,
        options?: GenerateFromFileOptions
      ): LLMMessage {
        const language = options?.language ?? "es";
    
        const content = `
        Eres un experto en análisis de documentos y creación de mapas mentales estructurados.
        Recibirás el contenido de un fichero de tipo "${fileType}" y debes convertirlo en un mapa mental.
        
        REQUISITOS:
        - Devuelve ÚNICAMENTE un JSON VÁLIDO con el mismo esquema de AiMindMap.
        - NO incluyas texto fuera del JSON.
        - NO uses formato Markdown.
        - El idioma principal del contenido del mapa debe ser: "${language}".
        
        Esquema esperado (TypeScript):
        
        {
        "schemaVersion": string,
        "mindmap": {
            "title": string,
            "rootNodeId": string,
            "nodes": Array<{
            "id": string,
            "label": string,
            "parentId"?: string | null,
            "notes"?: string,
            "tags"?: string[],
            "order"?: number,
            "childrenIds"?: string[],
            "metadata"?: Record<string, unknown>
            }>,
            "metadata"?: {
            "source"?: string,
            "language"?: string,
            "summary"?: string,
            "tags"?: string[],
            "extra"?: Record<string, unknown>
            }
        }
        }
        `.trim();
    
        return createSystemMessage(content);
    }

      private buildGenerateFromFileUserMessage(
        truncatedContent: string,
        fileType: AiFileType,
        options?: GenerateFromFileOptions
      ): LLMMessage {
        const fileNamePart = options?.fileName
          ? `Nombre de fichero original: "${options.fileName}".\n`
          : "";
    
        const content = `
        ${fileNamePart}
        El siguiente contenido proviene de un fichero de tipo "${fileType}".
        Genera un mapa mental que resuma y estructure la información del documento.
        
        Contenido (puede estar truncado si era muy largo):
        
        <<<FILE_CONTENT_START>>>
        ${truncatedContent}
        <<<FILE_CONTENT_END>>>
        
        Devuelve SOLO el JSON con la estructura indicada en el mensaje del sistema.
        `.trim();
    
        return createUserMessage(content);
    }

    private buildSuggestEditsSystemMessage(mode: AiSuggestEditsMode): LLMMessage {
        const content = `
        Eres un asistente experto en edición de mapas mentales.
        Recibirás un mapa mental actual y una instrucción de edición del usuario.
        
        Tu tarea es devolver ${
            mode === "edits"
                ? "UNA LISTA DE OPERACIONES DE EDICIÓN"
                : "UN NUEVO MAPA MENTAL COMPLETO"
            } en formato JSON ESTRICTO.
        
        Modo actual: "${mode}".
        
        Esquema de respuesta:
        
        Si mode = "full":
        {
        "schemaVersion": string,
        "mode": "full",
        "mindmap": { ...AiMindMap... }
        }
        
        Si mode = "edits":
        {
        "schemaVersion": string,
        "mode": "edits",
        "edits": Array<AiMindMapEditOperation>
        }
        
        Donde AiMindMap y AiMindMapEditOperation siguen el contrato definido
        (previamente descrito) y deben usar los IDs de nodo existentes o nuevos
        en caso de nodos añadidos.
        
        REQUISITOS:
        - Devuelve ÚNICAMENTE un JSON VÁLIDO.
        - NO incluyas texto fuera del JSON.
        - NO uses Markdown ni comentarios.
        `.trim();
    
        return createSystemMessage(content);
    }

    private buildSuggestEditsUserMessage(
        compactSnapshot: CompactMindMapSnapshot,
        instruction: string,
        mode: AiSuggestEditsMode
      ): LLMMessage {
        const snapshotJson = JSON.stringify(compactSnapshot, null, 2);
    
        const content = `
        Mapa mental actual (versión compacta):
        
        <<<MINDMAP_SNAPSHOT_JSON>>>
        ${snapshotJson}
        <<<MINDMAP_SNAPSHOT_JSON_END>>>
        
        Instrucción del usuario para modificar el mapa:
        
        """
        ${instruction}
        """
        
        Devuelve SOLO el JSON con el esquema indicado en el mensaje del sistema
        para mode = "${mode}".
        `.trim();
    
        return createUserMessage(content);
    }

    // Secure call to LLM provider + error mapping

    private async safeSendChat(
        messages: LLMMessage[],
        overrrides?: Partial<LLMConfig>
    ): Promise<LLMResponse> {
        try {
            return await this.provider.sendChat(messages, overrrides);
        } catch (error) {
            if (error instanceof LLMError) {
                const friendlyMessage = this.mapLLMErrorToUserMessage(error);
                throw new AiServiceError(friendlyMessage, error);
            }

            throw new AiServiceError(
                "Unexpected error while calling AI provider",
                error
            );
        }
    }

    private mapLLMErrorToUserMessage(error: LLMError): string {
        switch (error.code) {
            case LLMErrorCode.AuthenticationError:
                return "There is a problem with the AI API credentials. Please check your API key.";
            case LLMErrorCode.NetworkError:
                return "Network error while contacting the AI service. Please check your connection and try again.";
            case LLMErrorCode.RateLimitError:
                return "The AI service is being used too frequently. Please wait a moment and try again.";
            case LLMErrorCode.ConfigurationError:
                return "AI configuration is invalid. Please review the AI settings.";
            case LLMErrorCode.ProviderError:
                return "The AI provider returned an error. Please try again later.";
            case LLMErrorCode.ParseError:
                return "The AI response could not be understood. Please try again.";
            case LLMErrorCode.UnknownError:
            default:
                return "An unknown error occurred while using the AI service.";
        }
    }

    private safeParseJson(llmResponse: LLMResponse): unknown {
        try {
            return JSON.parse(llmResponse.content);
        } catch (error) {
            throw new AiJsonParseError(
                "Failed to parse AI response as JSON",
                llmResponse.content,
                error
            );
        }
    }

    // Parsing and light validation to atrong types

    private parseGenerateMindMapResponse(raw: unknown): AiMindMap {
        const obj = raw as Partial<AiGenerateMindMapResponse>;

        if (
            !obj ||
            typeof obj !== "object" ||
            !("mindmap" in obj) ||
            !obj.mindmap
        ) {
            throw new AiJsonParseError(
                "AI response does not contain a valid 'mindmap object",
                JSON.stringify(raw, null, 2)
            );
        }

        // It is supposed that obj.mindmap already complies with AiMindMap
        return obj.mindmap as AiMindMap;
    }

    private parseSuggestEditsResponse(
        raw: unknown,
        expectedMode: AiSuggestEditsMode
    ): AiMindMap | AiMindMapEditOperation[] {
        const obj = raw as AiSuggestEditsResponse;

        if (!obj || typeof obj !== "object") {
            throw new AiJsonParseError(
                "AI response is not a valid object",
                JSON.stringify(raw, null, 2)
            );
        }

        if (isFullMapResponse(obj)) {
            if (expectedMode !== "full-map") {
                console.warn(`AI responded with mode 'full' but expected mode was '${expectedMode}'`);
            }
            return obj.mindmap as AiMindMap;
        }

        if (isEditsResponse(obj)) {
            if (expectedMode !== "edits") {
                console.warn(`AI responded with mode 'edits' but expected mode was '${expectedMode}'`);
            }
            return (obj.edits ?? []) as AiMindMapEditOperation[];
        }

        throw new AiJsonParseError("AI response does not match any known suggest-edits schema", JSON.stringify(raw, null, 2));
    }

    // Context limitation

    private truncateToLimit(text: string, maxChars: number): string {
        if (text.length <= maxChars) return  text;
        const hardLimit = Math.max(0, maxChars - 500);
        return text.slice(0, hardLimit) + "\n\n[TRUNCATED]";
    }

    /**
     * Build a compact version of AiMindMap to send to the LLM.
     * - Limit the number of nodes to this.limits.maxNodes
     * - Truncate long notes
     */

    private buildCompactMindMapSnapshot(
        mindMap: AiMindMap
    ): CompactMindMapSnapshot {
        const maxNodes = this.limits.maxNodes;
        const maxNoteLength = 500;

        const nodes: CompactMindMapNodeSnapshot[] = [];

        for (const node of mindMap.nodes) {
            if (nodes.length >= maxNodes) break;

            nodes.push({
                id: node.id,
                label: node.label,
                parentId: node.parentId ?? null,
                notes:
                node.notes && node.notes.length > maxNoteLength
                ? node.notes.slice(0, maxNoteLength) + "...[truncated]"
                : node.notes
            });
        }

        return {
            title: mindMap.title,
            rootNodeId: mindMap.rootNodeId ?? nodes[0]?.id ?? "root",
            nodes
        };
    }
}

// Aux types for compact snapshots
interface CompactMindMapNodeSnapshot {
    id: string;
    label: string;
    parentId: string | null;
    notes?: string;
}

interface CompactMindMapSnapshot {
    title: string;
    rootNodeId: string;
    nodes: CompactMindMapNodeSnapshot[];
}