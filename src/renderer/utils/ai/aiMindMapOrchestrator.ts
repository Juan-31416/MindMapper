/**
 * AI Facade for UI
 */

import { useMindMapStore } from "../../store/mindMapStore";
import { useAiConfigStore } from "../../store/aiConfigStore";

import { createLLMProvider } from "./providerFactory";
import { DefaultAiMindmapService } from '../AiMindmapService';

import { aiMindMapToMinMap, mindMapToAiMindMap } from "./adapters";
import { AiFileType } from "../AiMindmapService";

export async function createMindMapFromPrompt(prompt: string) {
    const aiConfig = useAiConfigStore.getState().config;
    const provider = createLLMProvider(aiConfig.llm);
    const service = new DefaultAiMindmapService(provider, aiConfig.limits);

    // 1. AI → AiMindMap
    const aiMindMap = await service.generateFromPrompt(prompt, { language: aiConfig.language });

    // 2. Adapt to intern MindMap
    const mindMap = aiMindMapToMinMap(aiMindMap);

    // 3. Store
    useMindMapStore.getState().setMindMap(mindMap);
}

export async function convertFileToMindMap(
    content: string,
    fileType: AiFileType,
    fileName?: string,
) {
    const aiConfig = useAiConfigStore.getState().config;
    const provider = createLLMProvider(aiConfig.llm);
    const service = new DefaultAiMindmapService(provider, aiConfig.limits);

    const aiMindMap = await service.generateFromFile(content, fileType, { fileName, language: aiConfig.language });

    const mindMap = aiMindMapToMinMap(aiMindMap);

    useMindMapStore.getState().setMindMap(mindMap);
}

export async function applySuggestedEdits(instruction: string) {
    const mindMapStore = useMindMapStore.getState();
    const currentMap = mindMapStore.currentMap;
    if (!currentMap) {
        throw new Error("No hay un mapa activo para aplicar sugerencias.");
    };

    const aiConfig = useAiConfigStore.getState().config;
    const provider = createLLMProvider(aiConfig.llm);
    const service = new DefaultAiMindmapService(provider, aiConfig.limits);

    // 1. MindMap → AiMindMap
    const aiMindMap = mindMapToAiMindMap(currentMap);

    // 2. Ask for edits
    const operations = await service.suggestEdits(aiMindMap, instruction, { mode: 'edits', language: aiConfig.language});

    // 3. Apply to store
    if (Array.isArray(operations) && operations.length > 0) {
        mindMapStore.applyAiEdits(operations);
    } else {
        console.warn("La IA no devolvió operaciones de edición válidas.");
    }
}