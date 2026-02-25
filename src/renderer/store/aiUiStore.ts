// src/renderer/store/aiUiStore.ts
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiOperation =
    | 'idle'
    | 'generate'
    | 'convert'
    | 'suggest';

export type AiPanelViewMode =
    | 'hidden'      // Panel cerrado, FAB visible
    | 'minimized'   // Header visible, contenido colapsado
    | 'expanded';   // Panel completo visible

export type AiPanelTab =
    | 'chat'
    | 'settings';

export interface PanelPosition {
    x: number;
    y: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Posición inicial: esquina inferior derecha con margen.
 * Se calcula en tiempo de módulo para adaptarse al tamaño de ventana actual.
 */
export const DEFAULT_PANEL_POSITION: PanelPosition = {
    x: window.innerWidth - 380,
    y: window.innerHeight - 520,
};

// ─── State & Actions interfaces ───────────────────────────────────────────────

interface AiUiState {
    // Panel visibility & layout
    viewMode: AiPanelViewMode;
    activeTab: AiPanelTab;
    position: PanelPosition;
    isDragging: boolean;

    // Operation tracking (mantenemos contrato previo)
    operation: AiOperation;
    error: string | null;
}

interface AiUiActions {
    // Panel controls
    open: () => void;
    close: () => void;
    minimize: () => void;
    expand: () => void;
    toggleViewMode: () => void;

    // Tab navigation
    setActiveTab: (tab: AiPanelTab) => void;

    // Drag & drop
    setPosition: (position: PanelPosition) => void;
    setIsDragging: (isDragging: boolean) => void;

    // Operation lifecycle (contrato previo preservado)
    start: (op: AiOperation) => void;
    finish: () => void;
    fail: (message: string) => void;
    clearError: () => void;
}

export type AiUiStore = AiUiState & AiUiActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAiUiStore = create<AiUiStore>((set, get) => ({
    // ── Initial State ──
    viewMode: 'hidden',
    activeTab: 'chat',
    position: DEFAULT_PANEL_POSITION,
    isDragging: false,
    operation: 'idle',
    error: null,

    // ── Panel Controls ──

    /** Abre el panel en modo expandido. Si estaba minimizado, lo expande. */
    open: () => set({ viewMode: 'expanded', error: null }),

    /** Cierra el panel completamente. Limpia el error para no mostrar estado sucio al reabrir. */
    close: () => set({ viewMode: 'hidden', error: null }),

    /** Colapsa el panel a solo el header. Útil para liberar espacio sin perder contexto. */
    minimize: () => set({ viewMode: 'minimized' }),

    /** Expande el panel desde minimizado. */
    expand: () => set({ viewMode: 'expanded' }),

    /**
     * Toggle inteligente:
     * - hidden → expanded
     * - minimized → expanded
     * - expanded → minimized (no cierra, para no perder el prompt)
     */
    toggleViewMode: () => {
        const { viewMode } = get();
        if (viewMode === 'hidden') {
            set({ viewMode: 'expanded', error: null });
        } else if (viewMode === 'minimized') {
            set({ viewMode: 'expanded' });
        } else {
            set({ viewMode: 'minimized' });
        }
    },

    // ── Tab Navigation ───

    setActiveTab: (tab) => set({ activeTab: tab }),

    // ── Drag & Drop ───

    setPosition: (position) => set({ position }),
    setIsDragging: (isDragging) => set({ isDragging }),

    // ── Operation Lifecycle ───

    start: (operation) => set({ operation, error: null }),
    finish: () => set({ operation: 'idle' }),
    fail: (message) => set({ operation: 'idle', error: message }),
    clearError: () => set({ error: null }),
}));