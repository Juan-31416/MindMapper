# ADR 005: Precise Search Highlighting with Exact Substring Underlining (Issue #1)

**Date:** 2026-07-01
**Status:** Accepted / Implemented
**Issue:** [#1: All text is underlined in search](https://github.com/Juan-31416/MindMapper/issues/1)

## Context and Problem Statement

The original search implementation highlighted every matching node correctly, but the rendered text was entirely underlined whenever a node matched the search query.

This behavior introduced two major usability problems:

- Users could not easily identify which part of the node matched the query.
- Fuzzy search could underline characters that were not part of an exact contiguous match, reducing readability.

The objective was to improve the search visualization so that:

- Only the exact matching substring is underlined.
- All occurrences of the substring are highlighted.
- Search remains powered by Fuse.js while preserving fuzzy ranking.
- One search result is considered active while the remaining matches stay softly highlighted.
- Users can toggle between case-sensitive and case-insensitive searches.

---

## Proposed Changes & Technical Decisions

### 1. Exact Match Extraction

Fuse.js continues to be responsible for candidate discovery and ranking.

Instead of using Fuse match indices directly for rendering, a second processing step extracts every contiguous occurrence of the searched text inside each node.

This approach guarantees:

- Only exact substrings are underlined.
- Multiple occurrences are detected.
- Rendering is deterministic regardless of Fuse's internal scoring.

---

### 2. Search State Refactor

The global search state stored in Zustand was extended with two new properties:

- `activeResultIndex`
- `caseSensitive`

Moving the active result into the global store removes duplicated UI state and allows every component to react consistently to search navigation.

---

### 3. Search Result Model Simplification

The previous generic match structure was replaced by a dedicated collection of text segments.

Instead of exposing generic Fuse field matches, every search result now provides:

- Exact substring ranges.
- Character offsets required by the SVG renderer.

This considerably simplifies rendering inside `CanvasNode`.

---

### 4. SVG Text Rendering

Because SVG does not support partial text decoration inside a single `<text>` element, node rendering was redesigned.

The renderer now:

- Wraps node text into visual lines.
- Maps global character offsets to wrapped lines.
- Splits each affected line into multiple `<tspan>` fragments.
- Applies underline only to matching fragments while preserving every existing style attribute.

No font, color or size modifications are introduced.

Only the matching substring receives the underline decoration.

---

### 5. Search Navigation

Search navigation was centralized inside the global store.

The interface now supports:

- Previous result
- Next result
- Active result tracking
- Automatic synchronization between the search bar and the canvas

The currently selected result receives the primary highlight while every remaining result keeps a softer secondary highlight.

---

### 6. Case-Sensitive Search

A new toggle was introduced in the search bar allowing users to switch between:

- Case-insensitive search (default)
- Case-sensitive search

Changing the mode immediately re-executes the current search without modifying the query.

---

### 7. SearchBar Refactor

The existing SearchBar UI was preserved to avoid unnecessary visual changes.

Only the following functionality was added:

- Case-sensitive toggle button.
- Navigation backed by the global search state.
- Global active result synchronization.

The original layout, styling and interaction model remain unchanged.

---

## Consequences

### Positive

- Only the exact searched text is underlined.
- Multiple occurrences inside the same node are highlighted.
- Search navigation remains synchronized across the application.
- Active and secondary search results are visually differentiated.
- Case-sensitive searches improve precision.
- Existing user experience and visual design are preserved.

### Negative / Trade-offs

- SVG rendering became significantly more complex due to character-to-line offset mapping.
- Text rendering now requires splitting lines into multiple `<tspan>` elements.
- Additional preprocessing is required before rendering highlighted text.

---

## Alternatives Considered

### CSS `text-decoration`

Rejected because it only allows underlining the complete SVG `<text>` element.

### Rendering HTML inside `foreignObject`

Rejected due to poorer SVG compatibility, increased rendering overhead and export limitations.

### Using Fuse.js Match Indices Directly

Rejected because fuzzy matches may contain non-contiguous character sequences, producing confusing visual feedback.

### Maintaining Active Search State Locally

Rejected because navigation state is shared between multiple components and belongs to the application's global search state.

---

## Files Modified

- `src/renderer/types/search.ts`
- `src/renderer/utils/searcher.ts`
- `src/renderer/store/mindMapStore.ts`
- `src/renderer/hooks/useFuzzySearch.ts`
- `src/renderer/components/SearchBar.tsx`
- `src/renderer/components/canvas/CanvasNode.tsx`
- `src/renderer/components/Canvas.tsx`
- `src/renderer/components/views/HierarchicalView.tsx`
- `src/renderer/components/views/RadialView.tsx`
- `src/renderer/styles/SearchBar.css`
- `src/renderer/styles/Canvas.css`

## Summary

This ADR redesigns MindMapper's search rendering pipeline by separating fuzzy candidate discovery from exact substring visualization.

The resulting implementation provides precise underlining, synchronized search navigation, case-sensitive search support, and preserves the existing user interface while substantially improving search readability.