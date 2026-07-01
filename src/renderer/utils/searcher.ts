import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchResult, SearchableNode, SearchMatchSegment } from '../types/search';
import { Search } from 'lucide-react';



// General search config
export const DEFAULT_SEARCH_CONFIG = {
    MinQueryLength: 2,
    debounceMs: 300,
};

// Config de Fuse.js
const FUSE_OPTIONS: IFuseOptions<SearchableNode> = {
    includeScore: true,
    includeMatches: false,
    useExtendedSearch: false,
    threshold: 0.3,     // Error tolerance
    distance: 60,
    minMatchCharLength: 2,
    keys: [
        { name: 'text', weight: 0.7 },      // main field
        { name: 'tags', weight: 0.3 },      // tags opcionales
    ],
};

const extractExactMatches = (
    text: string, 
    query: string, 
    caseSensitive: boolean
): SearchMatchSegment[] => {
    const indices: SearchMatchSegment[] = [];
    if (!query) return indices;

    const source = caseSensitive ? text : text.toLowerCase();
    const searchStr = caseSensitive ? query : query.toLowerCase();
    
    let startIndex = 0;
    while ((startIndex = source.indexOf(searchStr, startIndex)) !== -1) {
        indices.push({
            start: startIndex,
            end: startIndex + searchStr.length - 1
        });
        startIndex += searchStr.length;
    }
    
    return indices;
};

export const createSearchIndex = (nodes: Record<string, SearchableNode> | null) => {
    if(!nodes) return null;
    const nodeList = Object.values(nodes);
    
    return nodeList.length ? new Fuse(nodeList, FUSE_OPTIONS) : null;
};

export const runSearch = (
    fuse: Fuse<SearchableNode> | null,
    query: string,
    caseSensitive: boolean = false
): SearchResult[] => {
    if (!fuse) return [];
    const trimmed = query.trim();
    if (trimmed.length < DEFAULT_SEARCH_CONFIG.MinQueryLength) return [];

    const fuseResults = fuse.search(trimmed);

    return fuseResults.map((res) => {
        const matches = extractExactMatches(res.item.text, trimmed, caseSensitive);

        if (matches.length === 0) return null;

        return {
            nodeId: res.item.id,
            score: res.score ?? 1,
            textMatches: matches
        };
    }).filter((res): res is SearchResult => res !== null);
};

