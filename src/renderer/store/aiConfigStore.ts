/**
 * Store Zustand for AI configuration management
 */

import { create } from "zustand";
import { 
    AiConfig,
    LLMConfig,
    AiLimits,
    LLMProviderName,
    AiConfigValidationResult
} from "../types/ai/aiConfig";
import { DEFAULT_AI_CONFIG, applyProviderPreset } from "../utils/ai/defaults";
import { createAiConfigPersistence } from "../utils/ai/persistence";

interface Ai_ConfigState {
    config: AiConfig;
    isLoaded: boolean;
    error: string | null;
    isDirty: boolean;
}

interface AiConfigActions {
    setProvider: (provider: LLMProviderName) => void;
    setApiKey: (apiKey: string) => void;
    setBaseUrl: (baseUrl: string) => void;
    setModel: (model: string) => void;
    setLLMConfig: (config: Partial<LLMConfig>) => void;
    setLimits: (limits: Partial<AiLimits>) => void;
    setConfig: (config:AiConfig) => void;
    resetToDefaults: () => void;
    loadConfig: () => Promise<void>;
    saveConfig: () => Promise<void>;
    validateConfig: () => AiConfigValidationResult;
    clearError: () => void;
}

type AiConfigStore = Ai_ConfigState & AiConfigActions;

const persistence = createAiConfigPersistence();

function validateAiConfig(config: AiConfig): AiConfigValidationResult {
    // Validate provider and API key
    if (config.llm.provider === "abacus-route-llm" || config.llm.provider === "openai-compatible") {
        if (!config.llm.apiKey && !config.llm.apiKeyStored) {
            return {
                valid: false,
                error: "API key is required for this provider"
            };
        }
    }

    if (config.llm.baseUrl) {
        try {
            new URL(config.llm.baseUrl);
        } catch {
            return {
                valid: false,
                error: "Invalid base URL format"
            };
        }
    }

    if (config.limits.maxInputChars <= 0) {
        return {
            valid: false,
            error: "maxInputChars must be positive"
        };
    }

    if (config.limits.maxNodes <= 0 ) {
        return {
            valid: false,
            error: "maxNodes must be positive"
        };
    }

    if (config.limits.maxFileSize <= 0) {
        return {
            valid: false,
            error: "maxFileSize must be positive"
        };
    }

    if (config.llm.maxTokens !== undefined && config.llm.maxTokens <= 0) {
        return {
            valid: false,
            error: "maxTokens must be positive"
        };
    }

    if (config.llm.temperature !== undefined && (config.llm.temperature < 0 || config.llm.temperature > 2)) {
        return {
            valid: false,
            error: "temperature must be between 0 and 2"
        };
    }

    if (config.llm.topP !== undefined &&  (config.llm.topP < 0 || config.llm.topP > 1 )) {
        return {
            valid: false,
            error: "topP must be between 0 and 1"
        };
    }

    return { valid: true };
}

// Store Configuration Status AI
export const useAiConfigStore = create<AiConfigStore> ((set, get) => ({
    config: DEFAULT_AI_CONFIG,
    isLoaded: false,
    error: null,
    isDirty: false,
    setProvider: (provider) => {
        const currentConfig = get().config;
        const newLLMConfig = applyProviderPreset(currentConfig.llm, provider);

        set({
            config: {
                ...currentConfig,
                llm: newLLMConfig,
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setApiKey: (apiKey) => {
        const currentConfig = get().config;
        set({
            config: {
                ...currentConfig,
                llm: {
                    ...currentConfig.llm,
                    apiKey,
                    apiKeyStored: false
                }
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setBaseUrl: (baseUrl) => {
        const currentConfig = get().config;
        set({
            config: {
                ...currentConfig,
                llm: {
                    ...currentConfig.llm,
                    baseUrl
                }
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setModel: (model) => {
        const currentConfig = get().config;
        set({
            config: {
                ...currentConfig,
                llm: {
                    ...currentConfig.llm,
                    model
                }
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setLLMConfig: (llmConfig) => {
        const currentConfig = get().config;
        set({
            config: {
                ...currentConfig,
                llm: {
                    ...currentConfig.llm,
                    ...llmConfig
                }
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setLimits: (limits) => {
        const currentConfig = get().config;
        set({
            config: {
                ...currentConfig,
                limits: {
                    ...currentConfig.limits,
                    ...limits
                }
            },
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    setConfig: (config) => {
        const validation = validateAiConfig(config);

        if (!validation.valid) {
            set({ error: validation.error || "Invalid configuration"});
            return;
        }

        set({
            config,
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    resetToDefaults: () => {
        set({
            config: DEFAULT_AI_CONFIG,
            isDirty: true,
            error: null
        });

        get().saveConfig();
    },

    loadConfig: async () => {
        try {
            const loadedConfig = await persistence.load();

            if (loadedConfig) {
                const validation = validateAiConfig(loadedConfig);

                if (validation.valid) {
                    set({
                        config: loadedConfig,
                        isLoaded: true,
                        isDirty: false,
                        error: null
                    });
                } else {
                    console.warn("loaded config is invalid, using defaults:", validation.error);
                    set({
                        config: DEFAULT_AI_CONFIG,
                        isLoaded: true,
                        isDirty: false,
                        error: validation.error || "Invalid configuration loaded"
                    });
                }
            } else {
                // No saved config, use defaults
                set({
                    config: DEFAULT_AI_CONFIG,
                    isLoaded: true,
                    isDirty: false,
                    error: null
                });
            }
        } catch (error) {
            console.error("Error loading AI config:", error);
            set({
                config: DEFAULT_AI_CONFIG,
                isLoaded: true,
                isDirty: false,
                error: error instanceof Error ? error.message : "Failed to load configuration"
            });
        }
    },

    saveConfig: async () => {
        const currentConfig = get().config;
        const validation = validateAiConfig(currentConfig);

        if (!validation.valid) {
            set({ error: validation.error || "Cannot save invalid configuration" });
            return;
        }

        try {
            await persistence.save(currentConfig);
            set({
                isDirty: false,
                error: null
            });
        } catch (error) {
            console.error("Error saving AI config:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to save configuration"
            });
        }
    },

    // Validation
    validateConfig: (): AiConfigValidationResult => {
        return validateAiConfig(get().config);
    },
    
    // Utilities
    clearError: () => {
        set({ error: null });
    }
}));

// Hook to initialize the store when mounting the app. Must be called once in the root component
export function useInitAiConfig() {
    const loadConfig = useAiConfigStore((state) => state.loadConfig);
    const isLoaded = useAiConfigStore((state) => state.isLoaded);

    if (!isLoaded) {
        loadConfig();
    }
}