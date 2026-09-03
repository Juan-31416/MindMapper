# Importing and Exporting

> **Version:** v0.2 (beta)

MindMapper lets you bring in content from other file formats and export your maps for sharing or archiving.

---

## Supported Formats at a Glance

| Format | Import | Export | Notes |
|---|---|---|---|
| `.mindmap.json` | ✅ (via Open) | ✅ (via Save) | Native MindMapper format — preserves everything |
| `.json` | ✅ | ✅ | Standalone JSON snapshot |
| `.md` / `.markdown` | ✅ | — | Converts heading structure to a map |
| PDF | — | ✅ | Landscape A4, vectorial quality |

---

## Importing a File

### Opening a native MindMapper file (`.mindmap.json`)

Use **File > Open…** or press **Ctrl + O**. Select a `.mindmap.json` file in the dialog. This restores your map exactly — all node positions, colours, icons, status, and structure are preserved.

### Opening a plain JSON file (`.json`)

Use **File > Open…** and select a `.json` file. The file must contain a compatible node tree structure.

### Opening a Markdown file (`.md` or `.markdown`)

Use **File > Open…** and select a `.md` or `.markdown` file. MindMapper reads the heading hierarchy and converts it to a mind map:

| Markdown level | Becomes |
|---|---|
| `# Heading 1` | Root node |
| `## Heading 2` | First-level child |
| `### Heading 3` | Second-level child |
| … and so on | Deeper children |

> **Note:** Only text and heading levels are imported. Formatting (bold, italic), links, images, and code blocks are not converted.

[SCREENSHOT: A Markdown file on the left and the resulting mind map on the right]

---

## Exporting Your Map

### Export to JSON

**File > Export > Export to JSON…**

Saves a standalone snapshot of your entire map as a `.json` file. Useful for backups, programmatic processing, or sharing map data in a portable format.

### Export to PDF

**File > Export > Export to PDF…** (or press **Ctrl + E**)

Saves your map as a high-quality **landscape A4** PDF using vectorial rendering. The PDF reflects the current state of the canvas — what is visible is what gets exported.

> 💡 **Tip:** Before exporting to PDF, press **Ctrl + 1** (Fit to Screen) to make all nodes visible, and switch to the layout that looks best for sharing.

[SCREENSHOT: An exported PDF viewed in a PDF reader, showing the mind map in landscape orientation]

---

## Saving vs. Exporting

These are two different actions:

| Action | Shortcut | Purpose |
|---|---|---|
| **Save** | **Ctrl + S** | Saves your working copy as `.mindmap.json` for later editing |
| **Export to JSON** | File menu | Saves a portable snapshot you can share or process |
| **Export to PDF** | **Ctrl + E** | Creates a printable / shareable image of your map |

---

## See Also

- [Creating and Managing Maps](creating-maps.md)
- [Keyboard Shortcuts](keyboard-shortcuts.md)

---

*← [Back to Documentation Index](index.md)*
