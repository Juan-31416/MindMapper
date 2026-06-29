import { 
    createMindMapFromPrompt,
    convertFileToMindMap,
    applySuggestedEdits,
} from "../utils/ai";
import { useAiUiStore } from "../store/aiUiStore";
import * as orchestrator from "../utils/ai/aiMindMapOrchestrator";

export function useAiAssistant() {
    const { start, finish, fail } = useAiUiStore();

    return {
        generateFromPrompt: async (prompt: string) => {
            try {
                start('generate');
                await orchestrator.createMindMapFromPrompt(prompt);
                finish();
            } catch (e: any) {
                fail(e.message || "Error al generar el mapa");
            }
        },

        convertFile: async (content: string, type: any, name?: string) => {
            start('convert');
            try {
                await orchestrator.convertFileToMindMap(content, type, name);
                finish();
            } catch (e: any) {
                fail(e.message || "Error al convertir el archivo");
            }
        },

        suggestEdits: async (instruction: string) => {
            try {
                start('suggest');
                await orchestrator.applySuggestedEdits(instruction);
                finish();
            } catch (e: any) {
                fail(e.message || "Error al aplicar sugerencias");
            }
        },
    };
}