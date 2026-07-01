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
    textMatches: SearchMatchSegment[];
}

export interface SearchState {
    query: string;
    results: SearchResult[];
    activeResultIndex: number;
    caseSensitive: boolean;
    isSearching: boolean;
    isActive: boolean;
    lastUpdatedAt: number | null;
}

export interface SearchConfig {
    minQueryLength: number;
    debounceMs: number;
}

export type SearchableNode = any;