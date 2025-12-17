import { AiMindMap, AI_MINDMAP_SCHEMA_VERSION } from "./aiMindmap";
import { AiMindMapEditOperation, AI_MINDMAP_EDITS_SCHEMA_VERSION } from "./aiOperations";

export type AiSuggestEditsMode = "full-map" | "edits";

export interface AiGenerateMindMapResponse {
    schemaVersion: string;
    mindmap: AiMindMap;
}

export type AiSuggestEditsFullMapResponse = AiGenerateMindMapResponse;

export interface AiSuggestEditsEditsResponse {
    schemaVersion: string;
    edits: AiMindMapEditOperation[];
}

export type AiSuggestEditsResponse =
    | AiSuggestEditsFullMapResponse
    | AiSuggestEditsEditsResponse;

export function isFullMapResponse(
    response: AiSuggestEditsResponse
): response is AiSuggestEditsFullMapResponse {
    return "mindmap" in response;
}

export function isEditsResponse(
    response: AiSuggestEditsResponse
): response is AiSuggestEditsEditsResponse {
    return "edits" in response;
}

export function createMindMapResponse(
    mindmap: AiMindMap
): AiGenerateMindMapResponse {
    return {
        schemaVersion: AI_MINDMAP_SCHEMA_VERSION,
        mindmap
    };
}

export function createEditsResponse(
    edits: AiMindMapEditOperation[]
): AiSuggestEditsEditsResponse {
    return {
        schemaVersion: AI_MINDMAP_EDITS_SCHEMA_VERSION,
        edits
    };
}

export const AI_RESPONSE_KEYS = {
    SCHEMA_VERSION: "schemaVersion",
    MINDMAP: "mindmap",
    EDITS: "edits"
} as const;