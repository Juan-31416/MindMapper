import type { LLMSendChatRequest, LLMSendChatResponse } from "../../shared/ipc/llm";

declare global {
  interface Window {
    electronAPI?: {
      llm?: {
        sendChat: (req: LLMSendChatRequest) => Promise<LLMSendChatResponse>;
      };
      // ... el resto de tu electronAPI actual
    };
  }
}

export {};