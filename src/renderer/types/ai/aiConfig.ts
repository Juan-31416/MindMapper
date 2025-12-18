/**
 * Configuration types for LLM providers and AI limits
 */

export type LLMProviderName =
    | "abacus-route-llm"    // Default: RouteLLM from Abacus.AI
    | "openai-compatible"   // Any OpenAI compatible API
    | "local-http"          // HTTP exposed Local LLM server
    | "custom";             // Free config personalized provider

export interface LLMConfig {
    provider: LLMProviderName;
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