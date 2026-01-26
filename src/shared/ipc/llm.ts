/**
 * IPC contracts for communication between renderer and main (LLM)
 */

import type { LLMConfig } from "../types/aiConfig";
import type { LLMMessage } from "../types/llm";

export const LLM_IPC_CHANNELS = {
    sendChat: "llm:sendChat",
} as const;

export type LLMSendChatRequest = {
    requestId: string;
    config: LLMConfig;
    messages: LLMMessage[];
    timeoutMs?: number;
};

export type LLMSendChatSuccess = {
    ok: true;
    requestId: string;
    content: string;
    raw?: unknown;
    metadata?: Record<string, unknown>;
};

export type LLMSendChatFailure = {
    ok: false;
    requestId: string;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export type LLMSendChatResponse = LLMSendChatSuccess | LLMSendChatFailure;