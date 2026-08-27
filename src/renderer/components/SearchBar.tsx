import React, { useEffect, useRef } from "react";
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from "../store/mindMapStore";
import { DEFAULT_SEARCH_CONFIG } from "../utils/searcher";
import { useTranslation } from "react-i18next";
import { MindMapNode } from "../types/mindmap";
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import '../styles/SearchBar.css';



interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const {
        focusOnNode,
        currentMap,
        search,
        setActiveResultIndex,
        toggleCaseSensitive,
    } = useMindMapStore();

    const {
        query,
        results,
        isSearching,
        setQuery,
        clear,
    } = useFuzzySearch();

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);



    // Auto-focus
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    // Reset active index when results change
    useEffect(() => {
        setActiveResultIndex(0);
    }, [results.length, setActiveResultIndex]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleClose = () => {
        clear();
        setActiveResultIndex(0);
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                navigateToPrevious();
            } else {
                navigateToNext();
            }
        }
    };

    const navigateToNext = () => {
        if (results.length === 0) return;
        const nextIndex = (search.activeResultIndex + 1) % results.length;
        setActiveResultIndex(nextIndex);
        focusOnResult(nextIndex);
    };

    const navigateToPrevious = () => {
        if (results.length === 0) return;
        const prevIndex = search.activeResultIndex === 0
            ? results.length - 1
            : search.activeResultIndex - 1;
        setActiveResultIndex(prevIndex);
        focusOnResult(prevIndex);
    };

    const focusOnResult = (index: number) => {
        const result = results[index];
        if (!result) return;
        expandPathToNode(result.nodeId);
        focusOnNode(result.nodeId);
    };

    const expandPathToNode = (nodeId: string) => {
        if (!currentMap) return;

        const path: string[] = [];
        let currentId: string | null = nodeId;

        while (currentId) {
            path.unshift(currentId);
            const node = currentMap.nodes[currentId] as MindMapNode | undefined;
            currentId = node?.parentId || null;
        }

        path.slice(0, -1).forEach(id => {
            const node = currentMap.nodes[id] as MindMapNode | undefined;
            if (node?.collapsed) {
                useMindMapStore.getState().toggleCollapse(id);
            }
        });
    };

    if (!isOpen) return null;

    const minLen = DEFAULT_SEARCH_CONFIG.MinQueryLength;
    const qLen = query.trim().length;
    const hasQuery = qLen >= minLen;
    const hasResults = hasQuery && results.length > 0;

    return (
        <div className="search-bar-overlay">
            <div ref={containerRef} className="search-bar">
                <div className="search-input-wrapper">
                    <LucideIcons.Search size={18} className="search-icon" />

                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder={t('searchBar.placeholder')}
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />

                    {isSearching && (
                        <div className="search-spinner">
                            <LucideIcons.Loader2 size={16} className="spinning" />
                        </div>
                    )}

                    {query && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setQuery('')}
                            title={t('searchBar.clearSearch')}
                        >
                            <LucideIcons.X size={16} />
                        </button>
                    )}
                </div>

                {qLen > 0 && (
                    <div className="search-results-info">
                        {qLen < minLen ? (
                            <span className="search-no-results">
                                {t('searchBar.minChars', { count: minLen })}
                            </span>
                        ) : hasResults ? (
                            <>
                                <span className="search-count">
                                {t('searchBar.resultCount', { current: search.activeResultIndex + 1, total: results.length })}
                                </span>

                                <div className="search-navigation">
                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToPrevious}
                                        disabled={results.length === 0}
                                        title={t('searchBar.previous')}
                                    >
                                        <LucideIcons.ChevronUp size={16} />
                                    </button>

                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToNext}
                                        disabled={results.length === 0}
                                        title={t('searchBar.next')}
                                    >
                                        <LucideIcons.ChevronDown size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <span className="search-no-results">
                                {t('searchBar.noResults')}
                            </span>
                        )}

                        {/* ── NEW: Case Sensitive Toggle ── */}
                        {hasQuery && (
                            <button
                                className={`search-nav-btn search-case-btn ${search.caseSensitive ? 'active' : ''}`}
                                onClick={toggleCaseSensitive}
                                title={t('searchBar.caseSensitive')}
                            >
                                <LucideIcons.CaseSensitive size={18} />
                            </button>
                        )}
                    </div>
                )}

                <button
                    className="search-close-btn"
                    onClick={handleClose}
                    title={t('searchBar.close')}
                >
                    <LucideIcons.X size={20} />
                </button>
            </div>
        </div>
    );
};

export default SearchBar;