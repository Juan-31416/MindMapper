/**
 * AI configuration persistence implementations
 */

import { AiConfig, AiConfigPersistence, AI_CONFIG_STORAGE_KEY } from "../../types/ai/aiConfig";


// Implementation of persistence using localStorage for use in the renderer process
export class localStorageAiConfigPersistence implements AiConfigPersistence {
    private readonly key: string;

    constructor(key: string = AI_CONFIG_STORAGE_KEY) {
        this.key = key;
    }
    
    async load(): Promise<AiConfig | null> {
        try {
            const json = localStorage.getItem(this.key);
            if (!json) return null;

            const config = JSON.parse(json) as AiConfig;
            return config;
        } catch (error) {
            console.error("Error loading AI config from localStorage:", error);
            return null;
        }
    }

    async save(config: AiConfig): Promise<void> {
        try {
            const json = JSON.stringify(config, null, 2);
            localStorage.setItem(this.key, json);
        } catch (error) {
            console.error("Error clearing AI config from localStorage:", error);
            throw new Error("Failed to clear AI configuration");
        }
    }
}

// Implementation of persistence using IPC (for future use with main process)
export class IPCAiConfigPersistence implements AiConfigPersistence {
    async load(): Promise<AiConfig | null> {
        try {
            return await window.Electron.ipcRenderer.invoke("ai:loadConfig");
        } catch (error) {
            console.error("Error loading AI config via IPC:", error);
            return null;
        }
    }

    async save(config: AiConfig): Promise<void> {
        try {
            await window.Electron.ipcRenderer.invoke("ai:saveConfig", config);
        } catch (error) {
            console.error("Error saving AI config via IPC:", error);
            throw new Error("Failed to save AI configuration via IPC");
        }
    }

    async clear(): Promise<void> {
        try {
            await window.Electron.ipcRenderer.invoke("ai:clearConfig");
        } catch (error) {
            console.error("Error clearing AI config via IPC:", error);
            throw new Error("Failed to clear AI configuration via IPC");
        }
    }
}

// Factory to create the appropriate persistence instance
export function createAiConfigPersistence(): AiConfigPersistence {
    return new localStorageAiConfigPersistence();
}