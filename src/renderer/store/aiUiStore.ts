import { create } from 'zustand';

type AiOperation =
    | 'idle'
    | 'generate'
    | 'convert'
    | 'suggest';

interface AiUiState {
    isOpen: boolean;
    operation: AiOperation;
    error: string | null;

    open: () => void;
    close: () => void;

    start: (op: AiOperation) => void;
    finish: () => void;
    fail: (message: string) => void;
    clearError: () => void;
}

export const useAiUiStore = create<AiUiState>((set) => ({
    isOpen: false,
    operation: 'idle',
    error: null,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, error: null }),

    start: (operation) => set({ operation, error: null }),
    finish: () => set({ operation: 'idle' }),
    fail: (message) => set({ operation: 'idle', error: message }),
    clearError: () => set ({ error: null }),
}));