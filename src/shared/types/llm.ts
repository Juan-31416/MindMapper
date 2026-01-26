/**
 * Shared LLM types between main and renderer
 */

export type LLMMessageRole = "system" | "user" | "assistant";

export interface LLMMessage {
    role: LLMMessageRole;
    content: string;
}

export interface LLMResponse {
    content: string;
    raw?: unknown;
    metadata?: {
        tokensUsed?: number;
        model?: string;
        responseTimeMs?: number;
        requestId?: string;
        provider?: string;
    };
}

export class LLMError extends Error {
    constructor(
        message: string,
        public readonly code: LLMErrorCode,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "LLMError";
    }
}

export enum LLMErrorCode {
    NetworkError = "NETWORK_ERROR",
    AuthenticationError = "AUTHENTICATION_ERROR",
    ConfigurationError = "CONFIGURATION_ERROR",
    RateLimitError = "RATE_LIMIT_ERROR",
    ParseError = "PARSE_ERROR",
    ProviderError = "PROVIDER_ERROR",
    UnknownError = "UNKNOWN_ERROR",
    NotImplemented = "NOT_IMPLEMENTED",
    Aborted = "ABORTED"
}

// Helper functions
export function createSystemMessage(content: string): LLMMessage {
    return { role: "system", content };
}

export function createUserMessage(content: string): LLMMessage {
    return { role: "user", content };
}
  
export function createAssistantMessage(content: string): LLMMessage {
    return { role: "assistant", content };
}