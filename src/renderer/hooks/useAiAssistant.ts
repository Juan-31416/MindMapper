import { 
    createMindMapFromPrompt,
    convertFileToMindMap,
    applySuggestedEdits,
} from "../utils/ai";

import { useAiUiStore } from "../store/aiUiStore";

export function useAiAssistant() {
    const ui = useAiUiStore();

    return {
        generateFromPrompt: async (prompt: string) => {
            ui.start('generate');
            try {
                await createMindMapFromPrompt(prompt);
                ui.finish();
            } catch (e) {
                ui.fail((e as Error).message);
            }
        },

        convertFile: async (content: string, type: any, name?: string) => {
            ui.start('convert');
            try {
                await convertFileToMindMap(content, type, name);
                ui.finish();
            } catch (e) {
                ui.fail((e as Error).message);
            }
        },

        suggestEdits: async (instruction: string) => {
            ui.start('suggest');
            try {
                await applySuggestedEdits(instruction);
                ui.finish();
            } catch (e) {
                ui.fail((e as Error).message);
            }
        },
    };
}