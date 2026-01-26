/**
 * Abstract interface for LLM providers
 */

import type { LLMMessage, LLMResponse } from "../../../shared/types/llm";
import type { LLMConfig, LLMProviderName } from "../../../shared/types/aiConfig";
import { LLMError, LLMErrorCode } from "../../../shared/types/llm";

export interface LLMProvider {
    getName(): LLMProviderName;
    validateConfig(config: LLMConfig): void;
    sendChat(
      messages: LLMMessage[],
      overrides?: Partial<LLMConfig>
    ): Promise<LLMResponse>;
  }

/**
 * Abstract base class for LLM provider
 * Gives common fuctionality for all providers
 */

export abstract class BaseLLMProvider implements LLMProvider {
    constructor(protected config: LLMConfig) {};

    abstract sendChat(
        messages: LLMMessage[],
        overrides?: Partial<LLMConfig>
    ): Promise<LLMResponse>;
    abstract getName(): LLMProviderName;
    abstract validateConfig(config: LLMConfig): void;

    protected getEffectiveConfig(overrides?: Partial<LLMConfig>): LLMConfig {
        return { ...this.config, ...overrides };
    }

    protected validateMessages(messages: LLMMessage[]): void {
        if (!messages || messages.length === 0) {
            throw new LLMError(
                "Messages array cannot be empty",
                LLMErrorCode.ConfigurationError
            );
        }

        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                throw new LLMError(
                    "Message content cannot be empty",
                    LLMErrorCode.ConfigurationError,
                    { message: msg }
                );
            }
        }
    }
}
