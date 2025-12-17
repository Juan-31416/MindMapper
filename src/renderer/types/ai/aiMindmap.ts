/**
 * Types to represent mind maps in AI domain
 * No layout dependencies, position or visual details
 */

// Origin source
export type AiMindMapSource = "prompt" | "file" | "mindmap";

// Opcional metadata
export interface AiMindMapMetadata {
    source?: AiMindMapSource;
    language?: string;
    summary?: string;
    tags?: string[];
    extra?: Record<string, unknown>;
}

// Individual node form an AI Mindmap
export interface AiMindMapNode {
    id: string;
    label: string;
    parentId: string | null;
    notes?: string;
    tags?: string[];
    order?: number;
    childrenIDs?: string[];
    metadata?: Record<string, unknown>;
}

// Complete AI Mindmap structure
export interface AiMindMap {
    schemaVersion: string;
    nodes: AiMindMapNode[];
    rootNodeId?: string;
    metadata?: AiMindMapMetadata;
}

export const AI_MINDMAP_SCHEMA_VERSION = "0.1";