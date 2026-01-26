/**
 * Factory to create LLM provider instances
 */

import { LLMProvider } from "./LLMProvider";
import { LLMConfig, LLMProviderName } from "../../../shared/types/aiConfig";
import { LLMError, LLMErrorCode } from "../../../shared/types/llm";

import { AbacusRouteLLMProvider } from "./providers/AbacusRouteLLMProvider";
import { OpenAICompatibleProvider } from "./providers/OpenAICompatibleProvider";
import { LocalHttpProvider } from "./providers/LocalHttpProvider";
import { MainProcessLLMProvider } from "./providers/MainProcessLLMProvider";

/**
 * Create an apropiate LLM provider instace
 */
export function createLLMProvider(config: LLMConfig): LLMProvider {
    if (config.transport === "ipc") {
        return new MainProcessLLMProvider(config);
    }

    switch (config.provider) {
        case "abacus-route-llm":{
            return new AbacusRouteLLMProvider(config);
        }
        
        case "openai-compatible":
            return new OpenAICompatibleProvider(config);

        case "local-http":
            return new LocalHttpProvider(config);

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
 */
export function getSupportedProviders(): string[] {
    return [
        "abacus-route-llm",
        "openai-compatible",
        "local-http",
        "custom"
    ];
}
