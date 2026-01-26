import { BaseLLMProvider } from "../LLMProvider";
import type { LLMMessage, LLMResponse } from "../../../../shared/types/llm";
import { LLMError, LLMErrorCode } from "../../../../shared/types/llm";
import type { LLMConfig, LLMProviderName } from "../../../../shared/types/aiConfig";
import type {
  LLMSendChatRequest,
  LLMSendChatResponse,
} from "../../../../shared/ipc/llm";

function randomId() {
  return Math.random().toString(36).slice(2);
}

export class MainProcessLLMProvider extends BaseLLMProvider {
  getName(): LLMProviderName {
    return this.config.provider;
  }

  validateConfig(config: LLMConfig): void {
    if (!config.provider) {
      throw new LLMError(
        "provider is required",
        LLMErrorCode.ConfigurationError
      );
    }
  }

  async sendChat(
    messages: LLMMessage[],
    overrides?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    this.validateMessages(messages);

    const effectiveConfig = this.getEffectiveConfig(overrides);

    const api = (window as any).electronAPI?.llm;
    if (!api?.sendChat) {
      throw new LLMError(
        "IPC LLM bridge not available (preload/main not implemented yet)",
        LLMErrorCode.NotImplemented
      );
    }

    const request: LLMSendChatRequest = {
      requestId: randomId(),
      config: effectiveConfig,
      messages,
      timeoutMs: effectiveConfig.timeoutMs,
    };

    let response: LLMSendChatResponse;
    try {
      response = await api.sendChat(request);
    } catch (e) {
      throw new LLMError(
        "IPC sendChat failed",
        LLMErrorCode.NetworkError,
        { cause: e }
      );
    }

    if (!response.ok) {
      throw new LLMError(
        response.error.message,
        LLMErrorCode.ProviderError,
        { code: response.error.code, details: response.error.details }
      );
    }

    return {
      content: response.content,
      raw: response.raw,
      metadata: response.metadata,
    };
  }
}