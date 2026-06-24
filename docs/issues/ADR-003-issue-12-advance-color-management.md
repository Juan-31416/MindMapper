# ADR 003: Advanced Color Management System (Issue #12)

**Date:** 2026-06-24
**Status:** Accepted / Implemented
**Issue:** [#12: Nuevos colores](https://github.com/Juan-31416/MindMapper/issues/12)

## Context and Problem Statement

The original color selection system offered a limited predefined palette, restricting node customization and making it difficult to maintain visual consistency across large mind maps.

Furthermore, users had no mechanism to:
- Define custom colors.
- Reuse frequently used colors.
- Enter colors manually through HEX or RGB values.
- Prepare the application for future features such as palette extraction from images.

The objective was to redesign the color selection system while preserving MindMapper's local-first philosophy and keeping the architecture extensible for future personalization features.

## Proposed Changes & Technical Decisions

### 1. Extended Standard Palette

The original predefined color list was replaced by a significantly larger standard palette inspired by productivity applications such as Microsoft Office and Canva.

The implementation introduces:

- `STANDARD_PALETTE` as the canonical color source.
- `ALL_STANDARD_COLORS` as a flattened representation for UI rendering.
- `DEFAULT_COLORS` maintained as a backward-compatible alias to avoid breaking existing components.

This separation allows future palette evolution without affecting legacy code.

### 2. Advanced Color Selection

The previous native color selector was replaced by a dedicated color management workflow.

New capabilities include:

- Complete predefined palette.
- Floating color picker using `react-colorful`.
- Manual HEX input.
- Manual RGB input with validation.
- Live preview of the selected color.

The color picker is displayed as an independent floating window, reducing the height of the main popover and improving usability on smaller displays.

### 3. Favorite Colors

A persistent favorites system was introduced.

Characteristics:

- Maximum of 10 colors.
- FIFO replacement strategy.
- Duplicate prevention.
- Stored locally through the application preferences.
- Data model prepared for future per-user profiles.

Although the current application has a single-user model, the persistence layer already supports optional user identifiers.

### 4. Color Utilities Refactor

The color utility module was expanded to centralize all color conversions and validation.

New utilities include:

- HEX normalization.
- HEX validation.
- RGB validation.
- RGB ↔ HEX conversion.
- Input parsing helpers.

Renderer-only compatibility was also improved by removing an unnecessary Node.js dependency.

### 5. Unified Popover Architecture

Both background and border editors now share the same interaction model.

Common characteristics include:

- Shared standard palette.
- Floating advanced picker.
- Manual color input.
- Responsive viewport-aware positioning.
- Automatic repositioning when insufficient screen space is available.

This establishes a consistent user experience across all color-editing interfaces.

### 6. Future Image Palette Extraction

The architecture now includes the abstraction required for automatic color extraction from images.

The extraction engine has intentionally been left as a future implementation in order to:

- Keep renderer responsibilities minimal.
- Route image processing through Electron IPC.
- Allow interchangeable extraction libraries without modifying the UI.

### 7. Architectural Preparation

The implementation intentionally separates:

- Color persistence
- Color validation
- Color conversion
- User interface
- Future image analysis

This modularization minimizes coupling between the UI and business logic, allowing future features such as:

- User-specific palettes.
- Workspace palettes.
- Theme synchronization.
- Image color extraction.
- AI-assisted palette generation.

without requiring modifications to the existing editor components.

## Consequences

### Positive

- Significantly improved customization capabilities.
- Consistent user experience across all color editors.
- Persistent reusable favorite colors.
- Better scalability for future personalization features.
- Architecture prepared for multi-user support.
- Cleaner separation between UI, state management and color utilities.

### Negative / Trade-offs

- Increased implementation complexity compared to the original selector.
- Additional application state due to favorite color persistence.
- One external dependency (`react-colorful`) is now required.

## Alternatives Considered

- **Native `<input type="color">` only:** Rejected due to poor usability and inconsistent browser implementations.
- **Unlimited favorite colors:** Rejected to avoid excessive UI growth and persistence complexity.
- **Custom color picker implementation:** Rejected in favor of the mature and lightweight `react-colorful` library.
- **Image palette extraction in the initial implementation:** Deferred to keep the current issue focused and avoid introducing image-processing dependencies before they are required.