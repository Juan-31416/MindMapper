# Phase 1 Analysis — MindMapper v0.2 Source Review

> Internal reference for documentation authoring. Not a user-facing file.

---

## Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                        │
│  [New▼][Open][Save] | [Undo][Redo] | [Jerárquica][Radial] |    │
│  [−][zoom%][+]          🧠 Map Name ●        [☀/🌙]           │
├────────────────────────────────────────┬────────────────────────┤
│                                        │  SIDEBAR               │
│  CANVAS (SVG)                          │  Node Properties       │
│                                        │  ─ Node Info           │
│  [nodes + connections]                 │  ─ Actions             │
│                                        │  ─ Background Color    │
│       [⊡ fit] [↺ reset] [zoom%]       │  ─ Icon               │
│                                        │  ─ Status              │
│                                        │  ─ Keyboard Shortcuts  │
└────────────────────────────────────────┴────────────────────────┘
   [SEARCH BAR — floating overlay, triggered by Ctrl+F]
```

---

## Menus (exact labels from main.ts)

### File
- **New** (`Ctrl+N`) → triggers `menu:new` → opens template dropdown
- **Open...** (`Ctrl+O`) → opens file dialog
- *(separator)*
- **Save** (`Ctrl+S`)
- **Save As...** (`Ctrl+Shift+S`)
- *(separator)*
- **Export** → submenu:
  - **Export to PDF...** (`Ctrl+E`)
  - **Export to JSON...**
- *(separator)*
- **Exit** (`Alt+F4` / `Cmd+Q` on macOS)

### Edit
- **Undo** (`Ctrl+Z`)
- **Redo** (`Ctrl+Shift+Z`)
- *(separator)*
- Cut, Copy, Paste, Select All (native roles)

### View
- **Zoom In** (`Ctrl++`)
- **Zoom Out** (`Ctrl+-`)
- **Reset Zoom** (`Ctrl+0`)
- **Fit to Screen** (`Ctrl+1`)
- *(separator)*
- **Toggle Theme** (`Ctrl+T`)
- *(separator)*
- Toggle DevTools, Reload

### Help
- **Documentation** → opens external browser to GitHub
- **Keyboard Shortcuts** (`Ctrl+/`)
- *(separator)*
- **About MindMapper**

---

## Toolbar (from Toolbar.tsx)

**Left section:**
- `New` button (primary, with FilePlus icon) — opens dropdown with available templates
- Dropdown items: **Blank**, **Brainstorming**
- `Open` button (FolderOpen icon) — tooltip: "Open (Ctrl+O)"
- `Save` button (Save icon) — tooltip: "Save (Ctrl+S)"
- *divider*
- `Undo` (Undo icon) — disabled when nothing to undo — tooltip: "Undo (Ctrl+Z)"
- `Redo` (Redo icon) — disabled when nothing to redo — tooltip: "Redo (Ctrl+Y)"
- *divider*
- `Jerárquica` layout button — active when hierarchical selected — tooltip: "Vista Jerárquica"
- `Radial` layout button — active when radial selected — tooltip: "Vista Radial"
- *divider*
- Zoom Out button (ZoomOut icon)
- Zoom percentage display (e.g. "100%")
- Zoom In button (ZoomIn icon)

**Center:**
- Brain icon + current map name
- Orange dot (`dirty-indicator`) when there are unsaved changes — tooltip: "Unsaved changes"

**Right section:**
- Theme toggle: Sun icon (when dark theme) / Moon icon (when light theme) — tooltip: "Toggle Theme (Ctrl+T)"

---

## Canvas Controls (bottom-right overlay)

- **Fit to Screen** (Maximize2 icon) — fits entire map in view
- **Reset View** (RotateCcw icon) — resets zoom to 100%, pan to 0,0
- Zoom % indicator (read-only)

---

## Node Editor (right sidebar — from NodeEditor.tsx)

Header: **"Node Properties"**

Shown only when a node is selected. Otherwise shows: Info icon + "Select a node to edit".

**Node Info section:**
- Text: (node text preview)
- Children: (count of direct children)

**Actions section:**
- `Add Child` button (Plus icon, primary) — tooltip: "Create Child Node (Tab)"
- `Add Sibling` button (Plus icon, secondary) — disabled for root node — tooltip: "Create Sibling Node (Enter)"
- `Delete` button (Trash2 icon, danger) — disabled for root node — tooltip: "Delete Node (Delete)"

**Background Color section:**
8 preset colors (hex values from DEFAULT_COLORS):
1. `#60A5FA` — blue
2. `#34D399` — green
3. `#FBBF24` — yellow
4. `#F87171` — red
5. `#A78BFA` — purple
6. `#FB923C` — orange
7. `#EC4899` — pink
8. `#14B8A6` — teal

Currently selected color is highlighted.

**Icon section:**
24 Lucide icons (rendered as icon buttons):
Circle, Star, Heart, Lightbulb, Target, Zap,
CheckCircle, AlertCircle, XCircle, Info,
Folder, File, Book, Bookmark,
User, Users, MessageSquare, Mail,
Calendar, Clock, Flag, Award,
TrendingUp, Activity, BarChart, PieChart

**Status section:**
Three toggle buttons:
- `Pending` — gray dot — status = 'pending'
- `In Progress` — yellow dot — status = 'in-progress'
- `Done` — green dot — status = 'done'
> Clicking active status again clears it (sets to undefined)

Status dot appears on canvas as small colored circle in top-right corner of node:
- gray (#6B7280) = pending
- yellow (#F59E0B) = in-progress
- green (#10B981) = done

**Keyboard Shortcuts (compact reference at bottom of sidebar):**
Tab / Enter / Delete / Double Click / Ctrl+Z / Ctrl+Y

---

## Node Rendering (from Canvas.tsx)

Node dimensions: **200px × 60px**, rounded rectangle (rx=8)

Node anatomy:
- Background rect (fill = `node.style.backgroundColor`)
- White selection ring (stroke: white, 3px) when selected
- Gold ring (stroke: #FFD700, 2px) when search match
- Icon (Lucide, 20px) — left side, 15px from left edge
- Text — centered, truncated at 25 chars (40 chars when search match)
- Status dot — top-right corner (cx: nodeWidth/2-15, cy: -nodeHeight/2+15, r=6)
- Collapse toggle (+/-) — appears below node when it has children; circle button with text + or -

**Collapse/expand button:**
- Visual: gray circle (fill #4B5563) at (0, 20) from bottom of node
- `+` = node is collapsed (children hidden)
- `-` = node is expanded (children visible)
- Large invisible hit area (40×50px) for easier clicking

**Node interactions:**
- Click → select node
- Double-click → enter text edit mode
- Click + drag → drag to reparent
- During drag: nodes within 100px radius become drop targets

**Text edit mode:**
- Shows HTML `<input>` inside the node
- Enter or blur → save and exit edit mode
- Escape → cancel and exit edit mode (no change)

---

## Search (from SearchBar.tsx + searcher.ts)

**Trigger:** Ctrl+F — toggles open/close
**Min query length:** 2 characters
**Debounce:** 300ms
**Fuzzy threshold:** 0.2 (quite strict — only close matches returned)
**Algorithm:** Fuse.js on `text` field of all nodes

UI elements:
- Search icon (left)
- Input: placeholder "Buscar nodos... (Esc para cerrar)" (currently Spanish)
- Spinner while searching
- Clear button (X) when query has text
- Results info row: "X de Y" count + ↑↓ navigation buttons

Navigation:
- Enter → next result
- Shift+Enter → previous result
- ↑↓ buttons in results info row

Results behavior:
- All matching nodes get gold ring on canvas
- Canvas pans to center selected result
- Collapsed ancestors are automatically expanded

Close: Escape key, X button, or click outside search bar

---

## Templates (from brainstorming.ts)

### Blank
- Single root node: text "Main Idea"
- Style: purple (#8b5cf6 bg, white text)

### Brainstorming
- Root: "💡 Main Idea" (purple #8b5cf6)
- Branch 1: "📋 Planning" (blue #3b82f6)
  - "Goals & Objectives" (light blue)
  - "Timeline" (light blue)
- Branch 2: "🔍 Research" (green #10b981)
  - "Data Collection" (light green)
  - "Analysis" (light green)
- Branch 3: "⚙️ Implementation" (amber #f59e0b)
  - "Development" (light amber)
  - "Testing" (light amber)
- Branch 4: "✅ Review" (red #ef4444)
  - "Feedback" (light red)
  - "Iteration" (light red)

---

## File Formats

### Native save format
- Extension: `.mindmap.json`
- Content: full JSON serialization of MindMap object
- Save dialog title: "Save Mind Map"

### Import formats
File dialog accepts: `.mindmap.json`, `.json`, `.md`, `.markdown`
Detection is automatic based on content (not extension):
- If content starts with `{` and ends with `}` and is valid JSON → parsed as MindMapper JSON
- If content contains `^#{1,6}\s+.+$` → parsed as Markdown
- Otherwise → "Unknown file format" error

### Export formats
- **PDF**: vectorial, landscape A4, no margins — dialog title "Export to PDF"
  - Canvas is auto-fit to viewport before capture, then restored
  - Default filename: `<mapname>.pdf`
- **JSON**: standalone JSON file — dialog title "Export to JSON"
  - Default filename: `<mapname>-export.json`

### Markdown import rules
- `# Text` → child of root
- `## Text` → grandchild
- `### Text` → great-grandchild (etc.)
- Non-header lines → children of last header node (bullet markers stripped)
- If no `#` found, all nodes become children of auto-created "Main Idea" root

---

## Layouts (from layout.ts)

### Hierarchical
- Algorithm: Dagre
- Direction: **Top-to-Bottom** (`rankdir: 'TB'`)
- Node separation: 50px
- Rank separation: 100px
- Margin: 50px on each side

### Radial
- Algorithm: custom implementation
- Root at center (radius 0)
- Level gap: 180px (in Canvas.tsx config)
- Start angle: -π/2 (top)
- Angle distribution: proportional to subtree size
- Edges: smooth cubic bezier curves

---

## Theme System (from theme.ts)

- Storage: localStorage key `mindmapper-theme`
- Default: follows system `prefers-color-scheme`, fallback dark
- Applied via: `data-theme` attribute on `<html>` + CSS class `light-theme`/`dark-theme`
- Auto-follows system changes if user hasn't manually set a preference
- Layout preference also persisted in localStorage key `mindmapper-preferences`

---

## History / Undo-Redo (from mindMapStore.ts)

- Every mutating action (create, delete, update text, update style, move, toggle collapse) adds to history
- Deep clone on each state snapshot
- Linear history (no branching)
- `canUndo()` = historyIndex > 0
- `canRedo()` = historyIndex < history.length - 1

---

## Keyboard Shortcuts (confirmed from App.tsx + main.ts)

| Shortcut | Action | Source |
|---|---|---|
| `Ctrl+N` | New mind map | App.tsx keyboard handler + menu |
| `Ctrl+O` | Open mind map | App.tsx + menu |
| `Ctrl+S` | Save | App.tsx + menu |
| `Ctrl+Shift+S` | Save As | menu only |
| `Ctrl+E` | Export to PDF | App.tsx + menu |
| `Ctrl+Z` | Undo | App.tsx + menu |
| `Ctrl+Y` | Redo | App.tsx keyboard handler |
| `Ctrl+Shift+Z` | Redo | menu only |
| `Ctrl+F` | Toggle search | App.tsx keyboard handler |
| `Ctrl+T` | Toggle theme | menu |
| `Ctrl+/` | Show keyboard shortcuts | menu |
| `Ctrl+1` | Fit to screen | menu |
| `Ctrl++` | Zoom in | menu |
| `Ctrl+-` | Zoom out | menu |
| `Ctrl+0` | Reset zoom | menu |
| `Tab` | Create child node | App.tsx (requires node selected) |
| `Enter` | Create sibling node | App.tsx (requires node selected) |
| `Delete` / `Backspace` | Delete selected node | App.tsx (not root) |
| `Double-click` | Edit node text | Canvas.tsx |
| `Enter` (in edit) | Save text + exit edit | Canvas.tsx |
| `Escape` (in edit) | Cancel edit | Canvas.tsx |
| `Escape` (search) | Close search | SearchBar.tsx |
| `Enter` (search) | Next result | SearchBar.tsx |
| `Shift+Enter` (search) | Previous result | SearchBar.tsx |
| `F11` | Toggle fullscreen | (described in USAGE.md) |
| `F12` | Open DevTools | menu |

---

## Dialogs (exact button labels from App.tsx)

**Unsaved changes on New/Open:**
- Title: "Unsaved Changes"
- Message: "You have unsaved changes. Do you want to continue?"
- Buttons: `Cancel` (0), `Continue` (1)

**Unsaved changes on Close:**
- Title: "Unsaved Changes"
- Message: "You have unsaved changes. Do you want to save before closing?"
- Buttons: `Cancel` (0), `Close Without Saving` (1), `Save and Close` (2)

**Export success:**
- Title: "Export Successful"
- "Mind map exported to PDF successfully!" / "Mind map exported to JSON successfully!"
- Button: `OK`

**Save/Open errors:**
- Title: "Save Error" / "Open Error" / "Export Error"

---

## Feature Status (per user)

| Feature | Status |
|---|---|
| Creating a mind map | ✅ Complete and stable |
| Adding, editing, deleting, moving nodes | ✅ Complete and stable |
| Connecting nodes | ✅ Complete and stable |
| Styling nodes | ✅ Complete and stable |
| Hierarchical view | ✅ Complete and stable |
| Radial view | ⚠️ Complete with UX improvements pending |
| Free-canvas view | ✅ Complete and stable |
| Pan and zoom | ✅ Complete and stable |
| Search | ✅ Complete and stable |
| Import and export | ✅ Complete and stable |
| Persistence and reopening maps | ✅ Complete and stable |
| Settings | 🔬 Partially implemented |
| Language selection | 🔬 Partially implemented, functional |
| AI-assisted map generation | 🧪 Experimental |
| AI provider configuration | 🧪 Experimental |
| Keyboard shortcuts | ✅ Complete and stable |
| Undo/redo | ✅ Complete and stable |
| Change color and border | ✅ Complete and stable |
| Change icon | ✅ Complete and stable |
| Status | ✅ Complete and stable |

---

## Welcome Map (on first launch)

Name: "Welcome to MindMapper"

Structure:
- Root: "Welcome to MindMapper"
  - "Getting Started"
    - "Create nodes with Tab"
    - "Edit text with double-click"
    - "Drag to reorganize"
  - "Features"
  - "Customize Styles"

---

## Version

v0.2 (beta)

---

*End of Phase 1 analysis.*
