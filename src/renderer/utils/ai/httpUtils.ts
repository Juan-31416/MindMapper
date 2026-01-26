/**
 * Common HTTP utilities for LLM providers
 */

import { LLMError, LLMErrorCode } from "../../types/llm";

export interface LLMHttpRequestOptions {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
    apiKey?: string;
}

/**
 * Realize a HTTP request to a provider with error management
 * @param options - Request options
 * @returns JSON parsed answer
 * @throws {LLMError} if any error
 */
export async function llmHttpRequest<T = unknown>(options: LLMHttpRequestOptions): Promise<T> {
    const {
        url,
        method,
        headers = {},
        body,
        timeoutMs = 30000,
        apiKey
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const requestHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...headers
        };

        if (apiKey) {
            requestHeaders["Authorization"] = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok) {
            await handleHttpError(response);
        }

        // Parse JSON
        const data = await response.json();
        return data as T;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error && error.name === "AbortError") {
            throw new LLMError(
                `Request timeout after ${timeoutMs}ms`,
                LLMErrorCode.NetworkError,
                { url, timeoutMs }
            );
        }

        if (error instanceof TypeError) {
            throw new LLMError(
                `Network error: ${error.message}`,
                LLMErrorCode.NetworkError,
                { url, originalError: error }
              );
        }

        // Re-launch LLMError
        if (error instanceof LLMError) {
            throw error;
        }

        // Unknown error
        throw new LLMError(
            `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
            LLMErrorCode.UnknownError,
            { url, originalError: error }
        );
    }
}

async function handleHttpError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown;

    try {
        const errorBody = await response.json();
        errorDetails: errorBody;

        if (errorBody.error?.message) {
            errorMessage = errorBody.error.message;
        } else if (errorBody.message) {
            errorMessage = errorBody.message;
        }
    } catch {
        errorDetails = { statusText: response.statusText };
    }

    let errorCode: LLMErrorCode;

    if (response.status === 401 || response.status === 403) {
        errorCode = LLMErrorCode.AuthenticationError;
    } else if (response.status === 429) {
        errorCode = LLMErrorCode.RateLimitError;
    } else if (response.status >= 400 && response.status < 500) {
        errorCode = LLMErrorCode.ConfigurationError;
    } else if (response.status >= 500) {
        errorCode = LLMErrorCode.ProviderError;
    } else {
        errorCode = LLMErrorCode.UnknownError;
    }

    throw new LLMError(errorMessage, errorCode, {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails
    });
}

/**
 * Validate URL
 * @param url - URL to validate
 * @throws {Error} if URL is invalid
 */
export function validateUrl(url: string): void {
    try {
        new URL(url);
    } catch {
        throw new Error(`Invalid URL: ${url}`);
    }
}

/**
 * Build a valid URL combining base URL and path
 * @param baseUrl - URL base
 * @param path - Endpoint path
 * @returns complete URL
 */
export function buildUrl(baseUrl: string, path: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
}