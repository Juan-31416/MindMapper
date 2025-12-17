import React, { useEffect, useRef, useState } from "react";
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from "../store/mindMapStore";
import { DEFAULT_SEARCH_CONFIG } from "../utils/searcher";
import '../styles/SearchBar.css';
import { MindMapNode } from "../types/mindmap";
import { useFuzzySearch } from '../hooks/useFuzzySearch';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
    const { focusOnNode, currentMap } = useMindMapStore();
    const {
        query,
        results,
        isSearching,
        setQuery,
        clear,
        forceSearch
    } = useFuzzySearch();

    const inputRef = useRef<HTMLInputElement>(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-focus
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    useEffect(() => {
        setCurrentResultIndex(0);
    }, [results.length]);

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

    // Handlye close cases
    const handleClose = () => {
        clear();
        setCurrentResultIndex(0);
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
        const nextIndex = (currentResultIndex + 1) % results.length;
        setCurrentResultIndex(nextIndex);
        focusOnResult(nextIndex);
    };

    const navigateToPrevious = () => {
        if (results.length === 0) return;
        const prevIndex = currentResultIndex === 0 ? results.length - 1 : currentResultIndex - 1;
        setCurrentResultIndex(prevIndex);
        focusOnResult(prevIndex);
    };

    const focusOnResult = (index: number) => {
        const result = results[index];
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
                        placeholder="Buscar nodos... (Esc para cerrar)"
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
                        title="Limpiar búsqueda"
                        >
                        <LucideIcons.X size={16} />
                        </button>
                    )}
                </div>

                {qLen > 0 && (
                    <div className="search-results-info">
                        {qLen < minLen ? (
                            <span className="search-no-results">
                                Escribe al menos {minLen} caracteres
                            </span>
                            ) : hasResults ? (
                                <>
                                    <span className="search-count">
                                    {currentResultIndex + 1} de {results.length}
                                    </span>
                                    
                                    <div className="search-navigation">
                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToPrevious}
                                        disabled={results.length === 0}
                                        title="Anterior (Shift+Enter)"
                                    >
                                        <LucideIcons.ChevronUp size={16} />
                                    </button>
                                    
                                    <button
                                        className="search-nav-btn"
                                        onClick={navigateToNext}
                                        disabled={results.length === 0}
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