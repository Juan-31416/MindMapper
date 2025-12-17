import type { MindMapNode } from './mindmap';

export interface SearchMatchSegment {
    start: number;
    end: number;
}

export interface SearchFieldMatch {
    key: string;
    indices: SearchMatchSegment[];
}

export interface SearchResult {
    nodeId: string;
    score: number;      // 0 = best match
    matches: SearchFieldMatch[];
}

export interface SearchState {
    query: string;
    results: SearchResult[];
    isSearching: boolean;
    isActive: boolean;
    lastUpdatedAt: number | null;
}

export interface SearchConfig {
    minQueryLength: number;
    debounceMs: number;
}

export type SearchableNode = MindMapNode & {
    tags?: string[];
};