/**
 * Abacus RouteLLM provider implementation
 */

import { BaseLLMProvider } from "../LLMProvider";
import { 
    LLMMessage,
    LLMResponse,
    LLMError,
    LLMErrorCode
} from "../../../types/llm";
import { 
    LLMConfig, 
    LLMProviderName
} from "../../../types/ai/aiConfig";
import { 
    llmHttpRequest,
    buildUrl,
    validateUrl
} from "../httpUtils";

// Conceptual contract of the request
interface RouteLLMChatRequest {
    model: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    [key:string]:unknown;
}

// Conceptual contract of the response
interface RouteLLMChatResponse {
    id?: string;
    model?: string;
    usage?: {
        prompot_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
    };
    choices?: Array<{
        index?: number;
        message?: {
            role?: "system" | "user" | "assistant";
            content: string;
        };
        finish_reason?: string;
    }>
    [key:string]: unknown;
}

export class AbacusRouteLLMProvider extends BaseLLMProvider {
    constructor(config: LLMConfig) {
        super(config);
    }

    getName(): LLMProviderName {
        return "abacus-route-llm";
    }

    validateConfig(config: LLMConfig): void {
        if (config.provider !== "abacus-route-llm") {
            throw new LLMError(
                `Invalid provider for AbacusRouteLLMProvider: ${config.provider}`,
                LLMErrorCode.ConfigurationError,
                { expected: "abacus-route-llm" }
            );
        }

        if (!config.baseUrl) {
            throw new LLMError(
                "RouteLLM baseUrl is required",
                LLMErrorCode.ConfigurationError
            );
        }

        try {
            validateUrl(config.baseUrl);
        } catch (error) {
            throw new LLMError(
                (error as Error).message,
                LLMErrorCode.ConfigurationError
            );
        }

        if (!config.model || config.model.trim().length === 0) {
            throw new LLMError(
                "RouteLLM model is required",
                LLMErrorCode.ConfigurationError
            );
        }

        if (!config.apiKey && !config.apiKeyStored) {
            throw new LLMError(
                "API key is required for Abacus RouteLLM",
                LLMErrorCode.AuthenticationError
            );
        }
    }

    async sendChat(
        messages: LLMMessage[],
        overrides?: Partial<LLMConfig>
    ): Promise<LLMResponse> {
        this.validateMessages(messages);

        const effectiveConfig = this.getEffectiveConfig(overrides);

        this.validateConfig(effectiveConfig);

        const url = buildUrl(effectiveConfig.baseUrl!,"/chat/completions");

        const requestBody: RouteLLMChatRequest = {
            model: effectiveConfig.model!,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content
            })),
            ...(effectiveConfig.temperature !== undefined && {
                temperature: effectiveConfig.temperature
            }),
            ...(effectiveConfig.maxTokens !== undefined && {
                max_tokens: effectiveConfig.maxTokens
            }),
            ...(effectiveConfig.topP !== undefined && {
                top_p: effectiveConfig.topP
            }),
            ...(effectiveConfig.extra ?? {})
        };

        const startedAt = performance.now();

        // HTTP request using common helper
        const responseJson = await llmHttpRequest<RouteLLMChatResponse>({
            url,
            method: "POST",
            apiKey: effectiveConfig.apiKey,
            timeoutMs: effectiveConfig.timeoutMs ?? 30000,
            body: requestBody
        });

        const elapsedMs = performance.now() - startedAt;

        const content = this.extractContentFromResponse(responseJson);

        const LLMResponse: LLMResponse = {
            content,
            raw: responseJson,
            metadata: {
                tokensUsed: responseJson.usage?.total_tokens,
                model: responseJson.model ?? effectiveConfig.model,
                responseTimeMs: Math.round(elapsedMs),
                requestId: responseJson.id
            }
        };

        return LLMResponse;
    }

    /**
     * Extract text from RouteLLM response
     * Strategy:
     * - Use the first `choice.message.content` not empty.
     * - If there are several, concatenate them with a double line break.
     * - If there are no choices or content, launch LLMError.ParseError 
     */
    private extractContentFromResponse(response: RouteLLMChatResponse): string {
        if (!response.choices || response.choices.length === 0) {
            throw new LLMError(
                "RouteLLM response has no choices",
                LLMErrorCode.ParseError,
                { response }
            );
        }

        const contents: string[] = [];

        for (const choice of response.choices) {
            const text = choice.message?.content?.trim();
            if (text && text.length > 0) {
                contents.push(text);
            }
        }

        if (contents.length === 0) {
            throw new LLMError(
                "RouteLLM response has no content in choices",
                LLMErrorCode.ParseError,
                { response }
            );
        }

        return contents.join("\n\n");
    }
}