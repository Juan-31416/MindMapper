import React, { useEffect, useRef, useState } from "react";
import {
    Search,
    X,
    ChevronUp,
    ChevronDown,
    CaseSensitive
} from 'lucide-react';
import { useMindMapStore } from "../store/mindMapStore";
import '../styles/SearchBar.css';



const SearchBar: React.FC = () => {
    
    const {
        search,
        setSearchQuery,
        clearSearch,
        setActiveResultIndex,
        toggleCaseSensitive,
    } = useMindMapStore();

    const inputRef = useRef<HTMLInputElement>(null);

    const navigateResults = (direction: 'next' | 'prev') => {
        if (search.results.length === 0) return;
        
        let newIndex = search.activeResultIndex;
        if (direction === 'next') {
              newIndex = (search.activeResultIndex + 1) % search.results.length;
        } else {
            newIndex = (search.activeResultIndex - 1 + search.results.length) % search.results.length;
        }

        setActiveResultIndex(newIndex);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                navigateResults('prev');
            } else {
                navigateResults('next');
            }
        } else if (e.key === 'Escape') {
            clearSearch();
        }
    };



    return (
    <div className="search-bar-container">
      <div className={`search-bar ${search.query ? 'has-query' : ''}`}>
        <Search className="search-icon" size={18} />
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search nodes or tags..."
          value={search.query}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {search.query && (
          <div className="search-actions">
            {/* Results counter */}
            <span className="search-results-count">
              {search.results.length > 0 
                ? `${search.activeResultIndex + 1} / ${search.results.length}`
                : 'No results'
              }
            </span>

            {/* Navigation Buttons */}
            <div className="search-nav-buttons">
              <button 
                onClick={() => navigateResults('prev')}
                disabled={search.results.length === 0}
                title="Previous (Shift+Enter)"
              >
                <ChevronUp size={16} />
              </button>
              <button 
                onClick={() => navigateResults('next')}
                disabled={search.results.length === 0}
                title="Next (Enter)"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Case Sensitive Toggle */}
            <button
              className={`search-toggle ${search.caseSensitive ? 'active' : ''}`}
              onClick={toggleCaseSensitive}
              title="Match Case"
            >
              <CaseSensitive size={18} />
            </button>

            {/* Clear Button */}
            <button className="search-clear" onClick={clearSearch}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;