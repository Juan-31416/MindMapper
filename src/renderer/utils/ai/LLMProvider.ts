/**
 * Abstract interface for LLM providers
 */

import { LLMMessage, LLMResponse } from "../../types/llm";
import { LLMConfig, LLMProviderName } from "../../types/ai/aiConfig";

export interface LLMProvider {
    /**
     * Send a conversation to LLM and receives a response
     * @param messages - Conversation message list
     * @param config - Optional configuration that overwrites the one from the provider
     * @returns - LLM response
     * @throws {LLMError} If there is any error
     */
    sendChat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse>;

    /**
     * Attain provider name
     * @returns Provaider name
     */
    getName(): LLMProviderName;

    /**
     * Validate provider configuration
     * @param config - Configuration to validate
     * @throws {Error} if configuration is invalid
     */
    validateConfig(config: LLMConfig): void;

    /**
     * Verify if provider is correctly configurated and ready to use
     * @returns true if ready, false if not
     */
    isReady(): boolean;
}

/**
 * Abstract base class for LLM provider
 * Gives common fuctionality for all providers
 */

export abstract class BaseLLMProvider implements LLMProvider {
    protected config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
        this.validateConfig(config);
    }

    abstract sendChat(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse>;
    abstract getName(): LLMProviderName;
    abstract validateConfig(config: LLMConfig): void;

    isReady(): boolean {
        try {
            this.validateConfig(this.config);
            return true;
        } catch {
            return false;
        }
    }

    protected getEffectiveConfig(overrides?: Partial<LLMConfig>): LLMConfig {
        return {
            ...this.config,
            ...overrides
        };
    }

    protected createAbortSignal(timeouMs: number): AbortSignal {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeouMs);
        return controller.signal;
    }

    protected validateMessages(messages: LLMMessage[]): void {
        if (!messages || messages.length === 0) {
            throw new Error("Messages array cannot be empty");
        }

        for (const msg of messages) {
            if (!msg.content || msg.content.trim().length === 0) {
                throw new Error("Message content cannot be empty");
            }
        }
    }
}
