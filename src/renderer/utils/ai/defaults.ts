/**
 * AI configuration default values
 */

import { LLMConfig, AiLimits, AiConfig, LLMProviderName, AI_CONFIG_VERSION } from "../../../shared/types/aiConfig";

export const DEFAULT_LLM_CONFIG: LLMConfig = {
    provider: "abacus-route-llm",
    transport: "direct",
    apiKey: "",                                 // Introduced by the user
    apiKeyStored: false,        
    baseUrl: "https://routellm.abacus.ai/v1",   // RouteLLM URL
    model: "gpt-4o",
    timeoutMs: 30000,                           // 30 seconds
    maxTokens: 4096,                            // Limit (consrvative)
    temperature: 0.7,                           // Balanced
    topP: 1.0,                                  // No nucleus sampling by defect
    extra: {}
};

export const DEFAULT_AI_LIMITS: AiLimits = {
    maxInputChars: 50000,                       // ~50k characters (~12k tokens)
    maxNodes: 500,                              // 500 nodes max
    maxFileSize: 5 * 1024 * 1024,               // 5 MB
    maxResponseTimeMs: 60000                    // 60 seconds
}

export const DEFAULT_AI_CONFIG: AiConfig = {
    version: AI_CONFIG_VERSION,
    llm: DEFAULT_LLM_CONFIG,
    limits: DEFAULT_AI_LIMITS,
    language: "es,"
};

export const PROVIDER_PRESETS: Record<LLMProviderName, Partial<LLMConfig>> = {
    "abacus-route-llm": {
        baseUrl: "https://routellm.abacus.ai/v1",
        model: "gpt-4o",
        timeoutMs: 30000,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1.0
    },
    "openai-compatible": {
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4",
        timeoutMs: 30000,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1.0
    },
    "local-http": {
        baseUrl: "http://localhost:11434/v1",       // Example
        model: "llama3",
        timeoutMs: 60000,                           // More time for local models
        maxTokens: 2048,
        temperature: 0.7,
        topP: 1.0,
        apiKey: undefined                           // No API key for local models
    },
    "custom": {
        baseUrl: "",
        model: "",
        timeoutMs: 30000,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1.0
  }
};

export function applyProviderPreset(
    currentConfig: LLMConfig,
    provider: LLMProviderName
): LLMConfig {
    const preset = PROVIDER_PRESETS[provider];

    return {
        ...currentConfig,
        provider,
        baseUrl: currentConfig.baseUrl || preset.baseUrl,
        model: currentConfig.model || preset.model,
        timeoutMs: currentConfig.timeoutMs || preset.timeoutMs,
        maxTokens: currentConfig.maxTokens || preset.maxTokens,
        temperature: currentConfig.temperature || preset.temperature,
        topP: currentConfig.topP ?? preset.topP,
        apiKey: preset.apiKey === undefined ? undefined : currentConfig.apiKey
    };
}