# ADR 004: Radial View Refactor and Layout Improvements (Issue #3)

**Date:** 2026-06-30  
**Status:** Accepted / Implemented  
**Issue:** [#3: Radial View Enhancement](https://github.com/Juan-31416/MindMapper/issues/3)

## Context and Problem Statement

The original implementation of the Radial View was functional but presented several architectural and usability limitations.

From an architectural perspective, the rendering pipeline tightly coupled layout computation with SVG edge generation inside the Canvas component. As the project evolved, this monolithic design made the addition of new visualization modes increasingly difficult.

From a usability perspective, several problems were identified:

- Edge paths depended on the layout algorithm.
- Arrowheads could be rendered underneath nodes.
- Radial layouts produced node overlaps in multiple situations.
- Dynamic node dimensions introduced in Issue #6 were not fully respected.
- The root node lacked sufficient visual hierarchy.
- Canvas responsibilities continued growing, reducing maintainability.

The objective of this issue was therefore twofold:

- Improve the Radial View user experience.
- Refactor the rendering architecture to support future visualization modes while keeping the codebase modular and maintainable.

---

## Proposed Changes & Technical Decisions

### 1. Canvas Modularization

The original monolithic `Canvas.tsx` was decomposed into specialized rendering components.

New structure:

```
Canvas/
│
├── Canvas.tsx
├── CanvasNodes.tsx
├── CanvasEdges.tsx
├── layouts/
│   ├── HierarchicalView.tsx
│   └── RadialView.tsx
└── index.ts
```

Each component now has a single responsibility:

- Canvas orchestration
- Node rendering
- Edge rendering
- View-specific rendering

This separation significantly reduces coupling between rendering responsibilities.

---

### 2. Layout / Rendering Separation

The layout engine no longer generates SVG geometry.

Instead, responsibilities are clearly separated:

```
Layout Engine
        ↓
Node positions
        ↓
CanvasEdges
        ↓
SVG paths
```

This allows rendering styles to evolve independently from positioning algorithms.

---

### 3. Edge Utilities

A dedicated edge module was introduced.

```
utils/
└── edges/
    ├── edgeIntersection.ts
    ├── edgePath.ts
    └── index.ts
```

Responsibilities include:

- Border intersection calculation
- Bézier path generation
- Straight path generation
- Future edge styles

The layout engine now outputs topology only.

---

### 4. Border-aware Edge Rendering

Arrowheads previously terminated at node centers, frequently becoming hidden underneath node backgrounds.

A geometric border-intersection algorithm was introduced to compute the exact connection point between an edge and a rectangular node.

Benefits:

- Arrowheads remain visible.
- Cleaner visual appearance.
- Shape-independent rendering pipeline.

---

### 5. Radial Layout Improvements

The custom radial layout algorithm was redesigned to support dynamic node dimensions.

Improvements include:

- Variable node sizes.
- Dynamic radius calculation.
- Angular sector distribution.
- Collision reduction.
- Better subtree balancing.
- Renderer-independent positioning.

The algorithm now computes only node coordinates while leaving all visual rendering to the Canvas layer.

---

### 6. Dynamic Edge Generation

Edge geometry is now generated at render time.

Current supported styles:

- Straight edges
- Curved Bézier edges

The architecture allows future implementations such as:

- Orthogonal edges
- Smooth splines
- Organic connections

without modifying layout algorithms.

---

### 7. Root Node Highlight

The root node now receives dedicated visual treatment in order to improve hierarchy recognition.

Current improvements include:

- Larger typography.
- Stronger visual emphasis.
- Dedicated halo effect.
- Independent styling from standard nodes.

This makes the central idea immediately identifiable in both Hierarchical and Radial views.

---

## Consequences

### Positive

- Clear separation between layout and rendering.
- Reduced Canvas complexity.
- Easier implementation of additional visualization modes.
- Arrowheads correctly terminate on node borders.
- Better readability of radial maps.
- Dynamic node sizing is fully respected.
- Improved visual hierarchy through root highlighting.
- Edge styles can evolve independently of layout algorithms.

### Negative / Trade-offs

- Increased number of source files.
- Additional geometric calculations during rendering.
- Slightly more complex rendering pipeline.

These trade-offs are considered acceptable given the substantial improvements in maintainability and extensibility.

---

## Alternatives Considered

### Keeping a Monolithic Canvas

Rejected because the component had accumulated multiple unrelated responsibilities, making future maintenance increasingly difficult.

### Generating SVG Paths Inside Layout Algorithms

Rejected because layout computation should remain independent from rendering decisions.

Separating both responsibilities follows the Single Responsibility Principle and greatly simplifies future extensions.

### Rendering Arrowheads at Node Centers

Rejected because arrowheads frequently became partially hidden beneath node backgrounds, especially after introducing dynamic node sizing.

Border intersection provides a significantly cleaner and more professional visual result.

---

## Architectural Impact

This ADR establishes the architectural principles that future visualization engines must follow.

Layout engines are responsible only for computing node positions.

Rendering components are responsible for generating SVG geometry.

Future visualization modes (Organic, Timeline, Fishbone, Force-directed, etc.) should implement only a new layout engine while reusing the existing rendering pipeline.

---

## Related ADRs

- ADR-001 — Dynamic Node Sizing
- ADR-002 — Node Background Personalization
- ADR-003 — Advanced Color Management

Together, these decisions progressively establish the rendering architecture of MindMapper around modularity, extensibility and separation of concerns.