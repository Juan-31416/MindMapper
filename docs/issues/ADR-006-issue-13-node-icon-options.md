# ADR 006: Node Icon Options Redesign (Issue #13)

**Date:** 2026-07-02  
**Status:** Accepted / Implemented  
**Issue:** [#13: Node Icon Options](https://github.com/Juan-31416/MindMapper/issues/13)

## Context and Problem Statement

Previously, every node was created with a default icon (`Circle`) and icon selection consisted of a static grid permanently displayed inside the node editor.

This approach presented several usability issues:

- Icons occupied valuable space in the sidebar even when they were not being modified.
- There was no way to remove an icon from a node once assigned.
- All nodes were forced to display an icon, even when it added no semantic value.
- The icon selector was not scalable for future support of emojis, SVG icons or custom image assets.
- There was no mechanism for applying icon operations globally.

The objective was to redesign the icon selection workflow into a dedicated popover similar to Canva's interaction model while introducing the concept of "no icon" as a first-class styling option.

## Proposed Changes & Technical Decisions

### 1. Icons Become Optional

The node style model was modified so that icons are optional.

Instead of assigning `Circle` as the default icon, newly created nodes now use:

```ts
icon: undefined
```

This establishes "no icon" as the default state, reducing unnecessary visual noise across newly created mind maps.

### 2. Dedicated Icon Popover

The static icon grid embedded inside the sidebar was replaced by a dedicated floating popover.

The popover:

- Opens from a compact icon button.
- Displays the currently selected icon.
- Uses a placeholder icon when no icon is assigned.
- Closes automatically when clicking outside or pressing Escape.
- Uses React Portal rendering to avoid clipping and z-index issues.

Its positioning logic follows the same implementation used by the Color Popover to ensure a consistent interaction model across the application.

### 3. "No Icon" Option

A dedicated visual option was introduced to explicitly remove the icon from a node.

Instead of using textual labels such as "None", a Lucide `Ban` icon represents the absence of an icon.

Selecting this option updates the node style as:

```ts
icon: undefined
```

This keeps the interaction entirely visual and language-independent.

### 4. Dynamic Text Positioning

Node rendering was updated so that text alignment depends on whether an icon exists.

When a node contains an icon:

- Text is offset to leave space for the icon.

When no icon exists:

- Text automatically shifts left.
- The editable textarea width expands accordingly.

This allows nodes without icons to use the available horizontal space while preserving alignment for nodes that do contain icons.

### 5. Global Icon Removal

A new store action was introduced:

```ts
updateAllNodesStyle()
```

This enables batch operations affecting every node in the current mind map.

The first supported operation is:

- Remove icons from all nodes.

The action is executed as a single history operation, producing only one Undo step.

## Consequences

### Positive

- Cleaner sidebar with reduced visual clutter.
- Nodes no longer require meaningless default icons.
- Better use of available horizontal space when icons are absent.
- More intuitive interaction model inspired by modern design tools.
- Architecture prepared for future icon sources such as emojis, SVG assets and custom images.
- Batch icon operations become possible through reusable store infrastructure.

### Negative / Trade-offs

- Additional component complexity due to the dedicated popover implementation.
- Rendering logic now depends on icon presence when computing text positioning.
- Batch style updates require careful integration with the undo/redo history system.

## Alternatives Considered

### Keep the Existing Static Grid

Rejected because it permanently occupied editor space while offering limited scalability.

### Use a Textual "None" Entry

Rejected because every other option in the selector is represented visually. A dedicated icon provides a more consistent and language-independent experience.

### Continue Using a Default Circle Icon

Rejected because forcing every node to display an icon introduces unnecessary visual noise and prevents icons from acting as meaningful semantic markers.

### Separate Global Icon Management into Another Dialog

Rejected because removing icons is directly related to icon selection. Keeping both actions inside the same popover reduces navigation and improves discoverability.