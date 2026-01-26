import { BaseLLMProvider } from "../LLMProvider";
import type { LLMMessage, LLMResponse } from "../../../../shared/types/llm";
import { LLMError, LLMErrorCode } from "../../../../shared/types/llm";
import type { LLMConfig, LLMProviderName } from "../../../../shared/types/aiConfig";
import { llmHttpRequest, buildUrl, validateUrl } from "../httpUtils";

/**
 * LocalHttpProvider para endpoint propio (no OpenAI-compatible)
 * 
 * Formato esperado del request (configurable vía extra):
 * POST /generate (o el path que definas en extra.endpoint)
 * {
 *   "prompt": "...",
 *   "model": "...",
 *   "temperature": 0.7,
 *   ...
 * }
 * 
 * Formato esperado del response:
 * {
 *   "text": "..." | "response": "..." | "content": "..."
 * }
 */

type LocalHttpRequest = {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
};

type LocalHttpResponse = {
  text?: string;
  response?: string;
  content?: string;
  [key: string]: unknown;
};

export class LocalHttpProvider extends BaseLLMProvider {
  getName(): LLMProviderName {
    return "local-http";
  }

  validateConfig(config: LLMConfig): void {
    if (!config.baseUrl) {
      throw new LLMError(
        "baseUrl is required for local-http provider",
        LLMErrorCode.ConfigurationError
      );
    }
    try {
      validateUrl(config.baseUrl);
    } catch (e) {
      throw new LLMError((e as Error).message, LLMErrorCode.ConfigurationError);
    }
  }

  async sendChat(messages: LLMMessage[], overrides?: Partial<LLMConfig>): Promise<LLMResponse> {
    this.validateMessages(messages);

    const effectiveConfig = this.getEffectiveConfig(overrides);
    this.validateConfig(effectiveConfig);

    // Endpoint configurable (por defecto "/generate")
    const endpoint = (effectiveConfig.extra?.endpoint as string) || "/generate";
    const url = buildUrl(effectiveConfig.baseUrl!, endpoint);

    // Convertir mensajes a prompt único
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

    const body: LocalHttpRequest = {
      prompt,
      model: effectiveConfig.model,
      temperature: effectiveConfig.temperature,
      max_tokens: effectiveConfig.maxTokens,
      ...effectiveConfig.extra,
    };

    const json = await llmHttpRequest<LocalHttpResponse>({
      url,
      method: "POST",
      timeoutMs: effectiveConfig.timeoutMs,
      body,
    });

    // Intentar extraer contenido de varios campos posibles
    const content = json.text || json.response || json.content;
    if (!content) {
      throw new LLMError(
        "Local HTTP response missing text/response/content field",
        LLMErrorCode.ParseError,
        { raw: json }
      );
    }

    return { content, raw: json, metadata: { provider: "local-http" } };
  }
}