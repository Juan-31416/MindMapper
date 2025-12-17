import { useEffect, useRef } from 'react';
import { useMindMapStore } from '../store/mindMapStore';
import { DEFAULT_SEARCH_CONFIG } from '../utils/searcher';

export interface UseFuzzySearchOptions {
    debounceMs?: number;
    minQueryLength?: number;
}

export const useFuzzySearch = (options: UseFuzzySearchOptions = {}) => {
    const {
        search,
        setSearchQuery,
        clearSearch,
        runSearchNow,
    } = useMindMapStore();

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debounceMs = options.debounceMs ?? DEFAULT_SEARCH_CONFIG.debounceMs;
    const minQueryLength = options.minQueryLength ?? DEFAULT_SEARCH_CONFIG.MinQueryLength;

    useEffect(() => {
        const q = search.query.trim();

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        if (q.length >= minQueryLength) {
            debounceTimerRef.current =  setTimeout(() => {
                runSearchNow();
            }, debounceMs);
        } else {
            if (search.results.length > 0 || search.isSearching) {
                clearSearch();
            }
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [search.query, debounceMs, minQueryLength, runSearchNow, clearSearch, search.results.length, search.isSearching]);

    // Hook API
    return {
        query: search.query,
        results: search.results,
        isSearching: search.isSearching,
        setQuery: setSearchQuery,
        clear: clearSearch,
        forceSearch: runSearchNow,
    };
};

