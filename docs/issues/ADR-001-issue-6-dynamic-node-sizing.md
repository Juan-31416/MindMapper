# ADR 001: Implementation of Dynamic Node Sizing (Issue #6)

**Date:** 2026-06-13
**Status:** Accepted / Implemented
**Issue:** [#6: See full text in the node](https://github.com/Juan-31416/MindMapper/issues/6)

## Context and Problem Statement

Previously, MindMapper nodes had fixed dimensions of `200x60px`. When text content exceeded approximately 25 characters, the system applied static truncation via ellipsis (`...`), hiding vital information on the canvas. To view the full text, users were forced to consult the sidebar, which hindered visual workflow efficiency.

The goal was to enable each node to adapt organically to its content without breaking the integrity of the automatic layout engines (Dagre/Radial).

## Proposed Changes & Technical Decisions

### 1. Off-screen Text Measurement
A measurement engine based on the Canvas 2D API (`ctx.measureText`) was implemented within the renderer thread. This allows for obtaining exact text width before SVG injection, avoiding expensive layout thrashing.

### 2. Manual SVG Word-Wrap Algorithm
Since the SVG `<text>` element does not natively support automatic line breaks, a utility function was developed to fragment text into multiple lines based on a dynamic `maxWidth` using `<tspan>` elements with relative positioning (`dy`).

### 3. Layout Engine Dimension Injection
The workflow in `layout.ts` was refactored so that:
- The layout engine no longer assumes global constants.
- Dimensions for all visible nodes are pre-computed before invoking Dagre or RadialLayout.
- Dagre utilizes these individual dimensions to calculate spacing and positioning, resulting in a natural "reflow" of sibling and child nodes.

### 4. Sizing Constraints
To maintain visual coherence, the following limits were established:
- **Min-width:** 160px
- **Max-width (Children):** 300px
- **Max-width (Root):** 320px
- **Height:** Unbounded (grows vertically based on line count).

### 5. Multi-line Editing
The `<input type="text">` inside the `<foreignObject>` was replaced with a `<textarea>` to allow seamless multi-line editing directly on the canvas.

## Consequences

### Positive
- **Full Readability:** All text is visible on the canvas at all times.
- **Intelligent Layout:** Adjacent nodes automatically shift to avoid overlaps as a node expands.
- **Visual Consistency:** The node editor (textarea) now matches the actual rendered size of the node.

### Negative / Trade-offs
- **Computational Overhead:** The layout now requires a pre-measurement pass, which may impact performance in extremely large maps (>5000 nodes).
- **SVG Complexity:** Node rendering is now more complex due to the management of multiple `<tspan>` fragments.

## Alternatives Considered

- **CSS Flexbox in foreignObject:** Dismissed for main rendering due to performance overhead during massive SVG re-renders and potential issues with clean PDF/PNG exports.
- **Intelligent Truncation:** Dismissed as it did not address the core user requirement of total data visibility.