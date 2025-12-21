/**
 * Factory to create LLM provider instances
 */

import { LLMProvider } from "./LLMProvider";
import { LLMConfig } from "../../types/ai/aiConfig";
import { LLMError, LLMErrorCode } from "../../types/llm";

/**
 * Create an apropiate LLM provider instace
 * @param config - LLM provider configuration
 * @retrurns LLM provider instance
 * @throws {LLMError} if LLM provider not supported o invalid config
 */
export function createLLMProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
        case "abacus-route-llm":
            // ToDo
            throw new LLMError(
                "Abacus RouteLLM provider not yet implemented",
                LLMErrorCode.ConfigurationError,
                { provider: config.provider }
            );
        
        case "openai-compatible":
            // ToDo
            throw new LLMError(
                "OpenAI-compatible provider not yet implemented",
                LLMErrorCode.ConfigurationError,
                { provider: config.provider }
            );

        case "local-http":
            // ToDo
            throw new LLMError(
                "Local HTTP provider not yet implemented",
                LLMErrorCode.ConfigurationError,
                { provider: config.provider }
            );

        case "custom":
            // ToDo
            throw new LLMError(
                "Custom provider not yet implemented",
                LLMErrorCode.ConfigurationError,
                { provider: config.provider }
            );
        
        default:
            throw new LLMError(
                "Unsupported provider: ${config.provider}",
                LLMErrorCode.ConfigurationError,
                { provider: config.provider }
            );
    }
}

/**
 * Verify if a provider is supported
 * @param providerName - Provider name to verify
 * @returns true if supported, false if not
 */
export function isProviderSupported(providerName: string): boolean {
    const supportedProviders = [
        "abacus-route-llm",
        "openai-compatible",
        "local-http",
        "custom"
    ];

    return supportedProviders.includes(providerName);
}

/**
 * Obtain supported provider list
 * @returns Array with provider names
 */
export function getSupportedProviders(): string[] {
    return [
        "abacus-route-llm",
        "openai-compatible",
        "local-http",
        "custom"
    ];
}
