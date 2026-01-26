/**
 * Shared AI configuration types between main and renderer
 */

export type LLMProviderName =
    | "abacus-route-llm"
    | "openai-compatible"
    | "local-http"
    | "custom";

export type LLMTransport = "direct" | "ipc";

export interface LLMConfig {
    provider: LLMProviderName;
    transport?: LLMTransport;
    apiKey?: string;
    apiKeyStored?: boolean;
    baseUrl?: string;
    model?: string;
    timeoutMs?: number;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    extra?: Record<string, unknown>;
}

export interface AiLimits {
    maxInputChars: number;
    maxNodes: number;
    maxFileSize: number;
    maxResponseTimeMs: number;
}

export interface AiConfig {
    version: string;
    llm: LLMConfig;
    limits: AiLimits;
    language: string;
}

export interface AiConfigPersistence {
    load(): Promise<AiConfig | null>;
    save(config: AiConfig): Promise<void>;
}

export interface AiConfigValidationResult {
    valid: boolean;
    error?: string;
}

export const AI_CONFIG_VERSION = "1.0";
export const AI_CONFIG_STORAGE_KEY = "mindmapper:aiConfig";