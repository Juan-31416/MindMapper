/**CONFIGURATE FUSE TO  INDEX text & tags WITH DIFFERENT PONDERATIONS */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchResult, SearchableNode } from '../types/search';

// General search config
export const DEFAULT_SEARCH_CONFIG = {
    MinQueryLength: 2,
    debounceMs: 300,
};

// Config de Fuse.js
const FUSE_OPTIONS: IFuseOptions<SearchableNode> = {
    includeScore: true,
    includeMatches: true,
    useExtendedSearch: false,
    threshold: 0.2,     // Error tolerance
    distance: 60,
    minMatchCharLength: 2,
    keys: [
        { name: 'text', weight: 0.7 },      // main field
        { name: 'text', weight: 0.3 },      // tags opcionales
    ],
};

export const createSearchIndex = (nodes: Record<string, SearchableNode> | null) => {
    if(!nodes) return null;
    const nodeList = Object.values(nodes);
    if (!nodeList.length) return null;
    return new Fuse(nodeList, FUSE_OPTIONS);
};

export const runSearch = (
    fuse: Fuse<SearchableNode> | null,
    query: string
): SearchResult[] => {
    if (!fuse) return [];
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const fuseResults = fuse.search(trimmed);

    return fuseResults.map((res) => ({
        nodeId: res.item.id,
        score: res.score ?? 1,
        matches:
        res.matches?.map((m) => ({
            'key': m.key ?? '',
            indices: m.indices.map(([start, end]) => ({ start, end })),
        })) ?? [],
    }));
};

