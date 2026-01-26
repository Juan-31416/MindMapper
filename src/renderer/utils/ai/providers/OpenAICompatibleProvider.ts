import { BaseLLMProvider } from "../LLMProvider";
import type { LLMMessage, LLMResponse } from "../../../../shared/types/llm";
import { LLMError, LLMErrorCode } from "../../../../shared/types/llm";
import type { LLMConfig, LLMProviderName } from "../../../../shared/types/aiConfig";
import { llmHttpRequest, buildUrl, validateUrl } from "../httpUtils";

type OpenAIChatRequest = {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
};

type OpenAIChatResponse = {
  id?: string;
  choices?: Array<{
    message?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  error?: { message?: string; type?: string; code?: string };
};

export class OpenAICompatibleProvider extends BaseLLMProvider {
  getName(): LLMProviderName {
    return "openai-compatible";
  }

  validateConfig(config: LLMConfig): void {
    if (!config.apiKey && !config.apiKeyStored) {
      throw new LLMError(
        "API key is required for openai-compatible provider",
        LLMErrorCode.AuthenticationError
      );
    }
    if (!config.baseUrl) {
      throw new LLMError(
        "baseUrl is required for openai-compatible provider",
        LLMErrorCode.ConfigurationError
      );
    }
    try {
      validateUrl(config.baseUrl);
    } catch (e) {
      throw new LLMError((e as Error).message, LLMErrorCode.ConfigurationError);
    }
    if (!config.model) {
      throw new LLMError(
        "model is required for openai-compatible provider",
        LLMErrorCode.ConfigurationError
      );
    }
  }

  async sendChat(messages: LLMMessage[], overrides?: Partial<LLMConfig>): Promise<LLMResponse> {
    this.validateMessages(messages);

    const effectiveConfig = this.getEffectiveConfig(overrides);
    this.validateConfig(effectiveConfig);

    const url = buildUrl(effectiveConfig.baseUrl!, "/chat/completions");

    const body: OpenAIChatRequest = {
      model: effectiveConfig.model!,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: effectiveConfig.temperature,
      top_p: effectiveConfig.topP,
      max_tokens: effectiveConfig.maxTokens,
    };

    const json = await llmHttpRequest<OpenAIChatResponse>({
      url,
      method: "POST",
      apiKey: effectiveConfig.apiKey,
      timeoutMs: effectiveConfig.timeoutMs,
      body,
    });

    const content = json?.choices?.[0]?.message?.content;
    if (!content) {
      throw new LLMError(
        "OpenAI compatible response missing content",
        LLMErrorCode.ParseError,
        { raw: json }
      );
    }

    return { content, raw: json, metadata: { provider: "openai-compatible" } };
  }
}