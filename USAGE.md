# MindMapper Usage Guide

This guide will help you get the most out of MindMapper with detailed instructions, tips, and keyboard shortcuts.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating and Editing Nodes](#creating-and-editing-nodes)
3. [Organizing Your Mind Map](#organizing-your-mind-map)
4. [Customizing Appearance](#customizing-appearance)
5. [File Operations](#file-operations)
6. [Import and Export](#import-and-export)
7. [Using Templates](#using-templates)
8. [Navigation](#navigation)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

### First Launch

When you first launch MindMapper, you'll see a welcome mind map with some sample nodes that demonstrate the basic features. Feel free to explore and experiment with it.

### Creating a New Mind Map

There are several ways to create a new mind map:

1. **From Template**: Click the "New" button in the toolbar and select a template
2. **Menu**: File → New (`Ctrl+N`)
3. **Keyboard**: Press `Ctrl+N`

Available templates:
- **Blank**: Start with a single root node
- **Brainstorming**: Pre-built structure with Planning, Research, Implementation, and Review sections

---

## Creating and Editing Nodes

### Creating Nodes

MindMapper makes it easy to quickly build your mind map:

- **Child Node**: Select a node and press `Tab` (creates a child)
- **Sibling Node**: Select a node and press `Enter` (creates a sibling at the same level)
- **From Toolbar**: Use the "Add Child" or "Add Sibling" buttons in the right sidebar

### Editing Node Text

1. **Double-click** the node you want to edit
2. Type your new text
3. Press `Enter` or click outside to save
4. Press `Escape` to cancel editing

### Deleting Nodes

- Select a node and press `Delete` or `Backspace`
- Note: You cannot delete the root node
- Deleting a node will also delete all its children

---

## Organizing Your Mind Map

### Drag and Drop

You can reorganize your mind map by dragging nodes:

1. Click and hold on a node
2. Drag it to a new location
3. Release to drop

The layout will automatically adjust to accommodate the new structure.

### Collapsing and Expanding

- Click the collapse/expand icon on a node to hide or show its children
- Useful for focusing on specific parts of large mind maps

---

## Customizing Appearance

### Node Styling

Select any node and use the right sidebar to customize:

**Colors**:
- Background color
- Text color
- Border color

**Style Options**:
- Border width (1-5px)
- Border radius (rounded corners)
- Font size
- Font weight
- Padding

**Icons**:
- Choose from a variety of emoji icons
- Icons appear next to the node text

### Theme

Toggle between light and dark themes:
- Click the sun/moon icon in the toolbar
- Or press `Ctrl+T`
- Your preference is saved automatically

---

## File Operations

### Saving Your Work

**Save** (`Ctrl+S`):
- If you've already saved the file, it overwrites the existing file
- If it's a new map, you'll be prompted to choose a location

**Save As** (`Ctrl+Shift+S`):
- Always prompts for a new location
- Useful for creating copies or renaming

**File Format**:
- Mind maps are saved as `.mindmap.json` files
- These are JSON files with a specific structure (see DATA_SCHEMA.md)

### Opening Files

**Open** (`Ctrl+O`):
1. Click File → Open or press `Ctrl+O`
2. Select a `.mindmap.json` file
3. The mind map will load and replace your current map
4. If you have unsaved changes, you'll be prompted to save first

### Auto-Save

MindMapper tracks unsaved changes:
- A small orange indicator appears next to the map name when you have unsaved changes
- You'll be prompted before closing if there are unsaved changes

---

## Import and Export

### Exporting

**Export to PDF** (`Ctrl+E`):
- Creates a vectorial PDF of your mind map
- The viewport is automatically adjusted to fit the entire map
- Perfect for presentations or printing

**Export to JSON**:
- Creates a standalone JSON file
- Can be shared or backed up separately

### Importing

MindMapper can import from multiple formats:

**JSON Files** (`.json`):
- Standard MindMapper format
- Preserves all styling and structure

**Markdown Files** (`.md`, `.markdown`):
- Converts Markdown headings to a hierarchical mind map
- `#` becomes level 1 (root children)
- `##` becomes level 2 (grandchildren)
- `###` and deeper create nested nodes

Example Markdown:
```markdown
# Project Planning
## Phase 1
### Research
### Design
## Phase 2
### Development
### Testing
```

This creates a mind map with "Project Planning" as children of the root, "Phase 1" and "Phase 2" as the next level, and so on.

---

## Using Templates

Templates provide pre-built mind map structures for common use cases.

### Accessing Templates

1. Click the "New" button in the toolbar
2. A dropdown menu appears with available templates
3. Click on a template to load it

### Available Templates

**Blank**:
- Single root node
- Perfect for starting from scratch

**Brainstorming**:
- Pre-structured with 4 main branches:
  - 📋 Planning (Goals & Objectives, Timeline)
  - 🔍 Research (Data Collection, Analysis)
  - ⚙️ Implementation (Development, Testing)
  - ✅ Review (Feedback, Iteration)
- Color-coded sections for easy visual organization

### Creating Your Own Templates

While there's no built-in template creator yet, you can:
1. Create a mind map with your desired structure
2. Save it as a template file
3. Use "Open" to load it whenever you need it

---

## Navigation

### Zooming

- **Zoom In**: `Ctrl++` or click the zoom in button
- **Zoom Out**: `Ctrl+-` or click the zoom out button
- **Reset Zoom**: `Ctrl+0`
- **Mouse Wheel**: Scroll to zoom (if supported)

### Panning

- **Click and Drag**: Click on empty canvas space and drag to pan
- **Arrow Keys**: Use arrow keys to pan (if no node is selected)

### Fit to Screen

- **Keyboard**: `Ctrl+1`
- **Menu**: View → Fit to Screen
- Automatically adjusts the zoom and position to show the entire mind map

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New mind map |
| `Ctrl+O` | Open mind map |
| `Ctrl+S` | Save mind map |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+E` | Export to PDF |

### Editing

| Shortcut | Action |
|----------|--------|
| `Tab` | Create child node |
| `Enter` | Create sibling node |
| `Delete` / `Backspace` | Delete selected node |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Double-click` | Edit node text |
| `Escape` | Cancel editing |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Ctrl+1` | Fit to screen |

### View

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Toggle theme (light/dark) |

### Other

| Shortcut | Action |
|----------|--------|
| `Ctrl+/` | Show keyboard shortcuts (help) |
| `F11` | Toggle fullscreen |
| `F12` | Open developer tools (debug) |

---

## Tips and Tricks

### 1. Quick Brainstorming

For rapid brainstorming sessions:
1. Load the Brainstorming template
2. Use `Tab` and `Enter` to quickly add nodes
3. Don't worry about styling initially—focus on ideas
4. Customize colors and icons later for organization

### 2. Organizing Large Mind Maps

For complex mind maps:
- Use collapsible nodes to hide details
- Apply consistent colors to related sections
- Use icons to create visual categories
- Export to PDF for easier viewing of the full structure

### 3. Presentation Mode

To present your mind map:
1. Collapse all sections you want to reveal progressively
2. Expand them during your presentation for dramatic effect
3. Use `Ctrl+1` to fit the entire map on screen
4. Toggle fullscreen (`F11`) for distraction-free presenting

### 4. Collaboration Workflow

While real-time collaboration isn't available yet, you can:
1. Export your mind map to JSON
2. Share the file via email or cloud storage
3. Team members can open and edit
4. Use version control (Git) for tracking changes

### 5. Markdown Integration

If you're a Markdown user:
1. Write your outline in Markdown
2. Import it into MindMapper
3. Enhance with colors, icons, and visual organization
4. Export as PDF for sharing

### 6. Backup Strategy

Protect your work:
1. Save regularly (`Ctrl+S`)
2. Use "Save As" to create dated backups
3. Store files in a cloud-synced folder (Dropbox, Google Drive, etc.)
4. Export to JSON for archival copies

### 7. Color Coding System

Develop a consistent color system:
- 🔵 Blue: Tasks or actions
- 🟢 Green: Completed items
- 🟡 Yellow: In progress
- 🔴 Red: Important or urgent
- 🟣 Purple: Ideas or concepts

### 8. Keyboard-First Workflow

For maximum productivity:
1. Use templates to start quickly (`Ctrl+N`)
2. Create nodes with `Tab` and `Enter`
3. Navigate with arrow keys
4. Save frequently with `Ctrl+S`
5. Never touch the mouse!

---

## Troubleshooting

### Mind Map Doesn't Load

- Check that the file is a valid `.mindmap.json` file
- Try opening in a text editor to verify it's valid JSON
- Restore from a backup if the file is corrupted

### Performance Issues with Large Maps

- Collapse sections you're not actively working on
- Consider splitting very large maps into multiple files
- Close other applications to free up memory

### Styles Not Applying

- Make sure you have a node selected
- Check that you're not in editing mode (press Escape)
- Try refreshing the view with `Ctrl+1`

### Can't Delete a Node

- You cannot delete the root node (by design)
- Make sure the node is selected (highlighted)
- Try pressing `Delete` instead of `Backspace`

---

## Getting Help

If you need assistance:

- **Documentation**: Check this guide and other documentation files
- **Keyboard Shortcuts**: Press `Ctrl+/` in the app
- **Issues**: Report bugs on GitHub
- **Community**: Join our community forum for tips and discussions

---

Happy Mind Mapping! 🧠✨
