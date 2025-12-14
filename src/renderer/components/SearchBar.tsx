import React, { useEffect, useRef, useState } from "react";
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from "../store/mindMapStore";
import { DEFAULT_SEARCH_CONFIG } from "../utils/searcher";
import '../styles/SearchBar.css';
import { MindMapNode } from "../types/mindmap";

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
    const {
        search,
        setSearchQuery,
        clearSearch,
        runSearchNow,
        focusOnNode,
        currentMap,
    } = useMindMapStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-focus
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (search.query.trim().length >= DEFAULT_SEARCH_CONFIG.MinQueryLength) {
            debounceTimerRef.current = setTimeout(() => {
                runSearchNow();
            }, DEFAULT_SEARCH_CONFIG.debounceMs);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [search.query, runSearchNow]);

    // Reset index when results changes
    useEffect(() => {
        setCurrentResultIndex(0);
    }, [search.results.length]);

    const handleClose = () => {
        clearSearch();
        setCurrentResultIndex(0);
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
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
        if (search.results.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % search.results.length;
        setCurrentResultIndex(nextIndex);
        focusOnResult(nextIndex);
    };

    const navigateToPrevious = () => {
        if (search.results.length === 0) return;
        const prevIndex = currentResultIndex === 0 ? search.results.length - 1 : currentResultIndex - 1;
        setCurrentResultIndex(prevIndex);
        focusOnResult(prevIndex);
    };

    const focusOnResult = (index: number) => {
        const result = search.results[index];
        if(!result) return;

        // Expand all collapsed node
        expandPathToNode(result.nodeId);

        // Center node
        focusOnNode(result.nodeId);
    };

    const expandPathToNode = (nodeId: string) => {
        if(!currentMap) return;

        const path: string[] = [];
        let currentId: string | null = nodeId;

        // Build path from node to root
        while (currentId) {
            path.unshift(currentId);
            const node = currentMap.nodes[currentId] as MindMapNode | undefined;
            currentId = node?.parentId || null;
        }

        // Expand all nodes in path except for target
        path.slice(0, -1).forEach(id => {
            const node = currentMap.nodes[id] as MindMapNode | undefined;
            if(node?.collapsed) {
                useMindMapStore.getState().toggleCollapse(id);
            }
        });
    };

    if (!isOpen) return null;

    const hasQuery = search.query.trim().length >= DEFAULT_SEARCH_CONFIG.MinQueryLength;
    const hasResults = search.results.length > 0;

    return (
        <div className="search-bar-overlay">
            <div className="search-bar">
                <div className="search-input-wrapper">
                    <LucideIcons.Search size={18} className="search-icon" />
                    
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Buscar nodos... (Esc para cerrar)"
                        value={search.query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />

                    {search.isSearching && (
                        <div className="search-spinner">
                        <LucideIcons.Loader2 size={16} className="spinning" />
                        </div>
                    )}

                    {search.query && (
                        <button
                        className="search-clear-btn"
                        onClick={() => setSearchQuery('')}
                        title="Limpiar búsqueda"
                        >
                        <LucideIcons.X size={16} />
                        </button>
                    )}
                </div>

                {hasQuery && (
                    <div className="search-results-info">
                        {hasResults ? (
                            <>
                                <span className="search-count">
                                    {currentResultIndex + 1} de {search.results.length}
                                </span>
                                
                                <div className="search-navigation">
                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToPrevious}
                                        disabled={search.results.length === 0}
                                        title="Anterior (Shift+Enter)"
                                    >
                                        <LucideIcons.ChevronUp size={16} />
                                    </button>
                                    
                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToNext}
                                        disabled={search.results.length === 0}
                                        title="Siguiente (Enter)"
                                    >
                                        <LucideIcons.ChevronDown size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                        <span className="search-no-results">
                            No se encontraron nodos
                        </span>
                        )}
                    </div>
                )}

                <button
                    className="search-close-btn"
                    onClick={handleClose}
                    title="Cerrar (Esc)"
                >
                    <LucideIcons.X size={20} />
                </button>
            </div>
        </div>
    );
};

export default SearchBar;