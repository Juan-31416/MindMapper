# MindMapper Architecture

This document provides a comprehensive overview of MindMapper's technical architecture, design decisions, and implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Layers](#architecture-layers)
5. [Data Flow](#data-flow)
6. [Security Model](#security-model)
7. [State Management](#state-management)
8. [Layout Engine](#layout-engine)
9. [IPC Communication](#ipc-communication)
10. [Build System](#build-system)

---

## Overview

MindMapper is a privacy-first, local-first desktop application for creating and managing mind maps.

The application is built on Electron using a strict separation between the Main Process, Preload layer and Renderer process. All user data remains on the local machine and no cloud services are required for normal operation.

The rendering system has been designed around modularity, allowing multiple visualization engines while sharing the same rendering pipeline.

### Key Principles

- Local-first architecture
- Privacy-first by design
- Strong TypeScript typing
- Modular rendering pipeline
- Clear separation of concerns
- Extensible visualization engines
- Security through Electron best practices

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Electron | 27.x | Desktop application framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 5.x | Build tool and dev server |
| Zustand | 4.x | State management |

### Key Libraries

| Library | Purpose |
|---------|---------|
| dagre | Graph layout algorithm |
| lucide-react | Icon set |
| electron-builder | Application packaging |

---

## Project Structure

```
mindmapper/
├── src/
│   ├── main/                 # Main process (Node.js/Electron)
│   │   └── main.ts           # Entry point, window management, IPC handlers
│   │
│   ├── preload/              # Preload scripts (bridge between main and renderer)
│   │   └── preload.ts        # IPC API exposure
│   │
│   └── renderer/             # Renderer process (React/TypeScript)
│       ├── main.tsx          # React entry point
│       ├── App.tsx           # Root component
│       ├── index.html        # main HTML
│       │
│       ├── components/             # React components
│       │   ├── BorderPopover.tsx   # Borer selector pop-up window
│       │   ├── ColorPopover.tsx    # Color selector pop-up window
│       │   ├── NodeEditor.tsx      # Right sidebar editor
│       │   ├── SearchBar.tsx       # Search bar component
│       │   ├── Toolbar.tsx         # Top toolbar
│       │   └── canvas/                  # SVG canvas for mind map
│       │       ├── CanvasNode.tsx
│       │       ├── CanvasEdges.tsx
│       │       ├── CanvasViewport.tsx
│       │       ├── Canvas.tsx              # Clean orchestrator
│       │       ├── index.ts                # Unified re-exports
│       │       └── layouts/
│       │           ├── HierarchicalView.tsx
│       │           └── RadialView.tsx
│       │
│       ├── hooks                   # hooks porcess
│       │   └── useFuzzySearch.ts   # Searching hooks
│       │
│       ├── store/              # State management
│       │   └── mindMapStore.ts # Zustand store
│       │
│       ├── types/            # TypeScript type definitions
│       │   ├── mindmap.ts    # Core data types
│       │   ├── electron.d.ts # Electron API types
│       │   └── search.ts     # Searching types
│       │
│       ├── utils/            # Utility functions
│       │   ├── colorUtils.ts # Changes in colors
│       │   ├── exporters.ts  # Export functionality
│       │   ├── importers.ts  # Import functionality
│       │   ├── index.ts      # Index tree node
│       │   ├── theme.ts      # Theme management
│       │   ├── searcher.ts   # Searching logic
│       │   ├── edges/                      # Edge logic
│       │   │   ├── edgeInersection.ts      # Unified re-exports
│       │   │   ├── edgePath.ts             # Calculate curved path
│       │   │   └── index.ts                # Unified re-exports
│       │   └── layout/              # Graph layout logic
│       │       ├── hierarchical.ts  # Hierarchical layout
│       │       ├── index.ts         # Unified re-exports
│       │       ├── radial.ts        # Radial layout
│       │       └── shared.ts        # Types + constants + measureNodeDimensions
│       │
│       ├── templates/        # Mind map templates
│       │   └── brainstorming.ts
│       │
│       └── styles/           # CSS stylesheets
│           ├── App.css       # App layout
│           ├── Canvas.css    # Canvas styles
│           ├── ColorPopover  # Color and border popover styles
│           ├── edges.css     # Edges styles
│           ├── index.css     # Global styles
│           ├── NodeEditor.css # Editor styles
│           ├── SearchBar.css # Search bar styles
│           └── Toolbar.css   # Toolbar styles
│
├── dist/                     # Compiled output
├── release/                  # Packaged applications
├── docs/
│   └── issues/               # Issues documentation
│       ├── ADR-001-issue-6-dynamic-node-sizing.md 
│       ├── ADR-002-issue-5-node-background-personalization.md
│       └── ADR-003-issue-12-advance-color-management.md 
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── electron-builder.yml      # Packaging configuration
```

---

## Architecture Layers

### 1. Main Process Layer

**Location**: `src/main/`

**Responsibilities**:
- Application lifecycle
- Native window management
- File operations
- IPC handlers
- Native menus
- SQLite access
- Export operations

The Main Process is the only layer allowed to access privileged Node.js APIs directly.

### 2. Preload Layer

**Location**: `src/preload/`

**Responsibilities**:
- Secure bridge between Electron and React
- IPC exposure
- Type-safe APIs
- Renderer isolation

Only explicitly exposed APIs are accessible from the renderer.

### 3. Renderer Layer

**Location**: `src/renderer/`

**Responsibilities**:
- React UI
- Canvas rendering
- User interaction
- State synchronization
- Layout computation
- SVG generation

**Security Measures**:
- Runs in sandboxed environment
- No direct access to Node.js APIs
- All privileged operations go through IPC

### 4. Canvas Rendering Architecture

The canvas follows a modular architecture introduced during Issue #3.

Canvas.tsx
                      │
        ┌─────────────┴─────────────┐
        │                           │
CanvasNodes.tsx              CanvasEdges.tsx
        │                           │
        └─────────────┬─────────────┘
                      │
               LayoutResult
                      │
          ┌───────────┴───────────┐
          │                       │
 Hierarchical Layout       Radial Layout


Responsibilities are clearly separated:

**Canvas**
 
Coordinates rendering.

**CanvasNodes**

Draws every node.

Responsibilities:
- Background
- Borders
- Icons
- Text
- Editing
- Root highlighting
- Collapse controls

**CanvasEdges**

Draws every connection.

**Responsibilities**:

- Straight edges
- Curved edges
- Arrowheads
- Border intersection

**Layout Engines**

Responsible only for computing node positions.

No SVG geometry is generated inside layout algorithms.

---

## Data Flow

The application follows a unidirectional rendering pipeline.

Mind Map Data
       │
       ▼
Layout Engine
(Hierarchical / Radial)
       │
       ▼
LayoutResult
       │
       ├───────────────┐
       ▼               ▼
CanvasNodes      CanvasEdges
       │               │
       └───────┬───────┘
               ▼
             SVG
               │
               ▼
            Renderer

### User Action Flow

```
User Action
    ↓
UI Component (React)
    ↓
Event Handler
    ↓
Store Action (Zustand)
    ↓
State Update
    ↓
Component Re-render
```

### File Operation Flow

```
User Action (e.g., Save)
    ↓
Store Action (saveMap)
    ↓
Serialize Data
    ↓
IPC Call (electronAPI.file.saveDialog)
    ↓
Main Process Handler
    ↓
Show Native Dialog
    ↓
Write to File System
    ↓
Return Result
    ↓
Update Store State (isDirty = false)
    ↓
Show Success Message
```

### Layout Computation Flow

```
Mind Map Data (nodes, edges)
    ↓
buildGraphLayout() [utils/layout.ts]
    ↓
Create Dagre Graph
    ↓
Add Nodes (with dimensions)
    ↓
Add Edges
    ↓
Run Layout Algorithm
    ↓
Extract Positions
    ↓
Return Positioned Nodes
    ↓
Render in Canvas
```

---

## Security Model

### Context Isolation

**Enabled**: Yes (via `contextIsolation: true`)

This ensures that the renderer process cannot directly access Node.js or Electron APIs, preventing malicious code injection.

### Sandbox

**Enabled**: Yes (via `sandbox: true`)

Runs the renderer in a restricted environment with minimal privileges.

### Node Integration

**Disabled**: Yes (via `nodeIntegration: false`)

Prevents direct access to Node.js APIs from the renderer.

### Content Security Policy

While not explicitly set, the architecture naturally follows CSP principles by isolating privileged operations in the main process.

### IPC Security

- All IPC handlers validate inputs
- File paths are sanitized
- User confirmation required for destructive actions
- No eval() or dynamic code execution

---

## State Management

### Zustand Store

MindMapper uses Zustand as its global state container.

**Location**: `src/renderer/store/mindMapStore.ts`

**Responsibilities**:
- Current map
- Selected node
- Editing state
- View mode
- Viewport
- Undo / Redo history
- Current file
- Dirty state

Application state is immutable from the UI perspective and updated exclusively through store actions.

The store represents the single source of truth for the renderer.

---

## Layout Engine

MindMapper currently provides two layout engines.

### Hierarchical Layout

**Implementation**:

utils/layout/hierarchical.ts

**Characteristics**:

- Dagre-based
- Left-to-right organization
- Dynamic node sizing
- Automatic spacing

Best suited for structured diagrams.

### Radial Layout

**Implementation**:

utils/layout/radial.ts

**Characteristics**:

- Custom implementation
- Variable node sizes
- Dynamic radius calculation
- Angular sector distribution
- Collision reduction
- Subtree balancing

Best suited for brainstorming and concept exploration.

### Shared Layout Utilities

utils/layout/shared.ts

**Provides**:

- Shared constants
- Node dimension calculation
- Common geometry
- Shared layout types

### Edge Rendering

Rendering is independent from layout.

    utils/edges/

    edgeIntersection.ts

    edgePath.ts

**Responsibilities**:

- Border intersection
- Bézier generation
- Straight path generation

This allows new edge styles without modifying layout algorithms.

---

## IPC Communication

### Pattern: Invoke/Handle

Main process handlers return promises that resolve in the renderer:

```typescript
// Main Process
ipcMain.handle('file:save', async (event, filePath, content) => {
  await fs.writeFile(filePath, content);
  return { success: true };
});

// Renderer Process
const result = await window.electronAPI.file.save(path, data);
```

### Pattern: Send/On

Main process broadcasts events to renderer:

```typescript
// Main Process
mainWindow.webContents.send('menu:save');

// Renderer Process
window.electronAPI.menu.onSave(() => {
  // Handle save action
});
```

### Error Handling

All IPC handlers follow a consistent error pattern:

```typescript
{
  success: boolean,
  error?: string,
  canceled?: boolean,
  // ... additional fields
}
```

---

## Build System

### Development

**Command**: `npm run dev`

**Process**:
1. Vite starts dev server on port 5173
2. Electron launches with dev URL
3. Hot module replacement enabled
4. DevTools opened automatically

**Technologies**:
- Vite for fast HMR
- ESBuild for TypeScript compilation
- Electron in development mode

### Production Build

**Command**: `npm run build`

**Process**:
1. TypeScript compilation (main + preload)
2. Vite builds renderer bundle
3. Assets optimized and minified
4. Output to `dist/` directory

### Packaging

**Command**: `npm run package`

**Process**:
1. Run production build
2. electron-builder creates installers
3. Platform-specific packages generated
4. Output to `release/` directory

**Platforms**:
- Windows: NSIS installer
- macOS: DMG and ZIP
- Linux: AppImage, deb, rpm

---

## Error Handling

### Error Boundaries

React error boundaries catch rendering errors:

```typescript
<ErrorBoundary fallback={<ErrorUI />}>
  <App />
</ErrorBoundary>
```

### IPC Error Handling

All IPC operations return error states:

```typescript
const result = await electronAPI.file.save(path, data);
if (!result.success) {
  showError(result.error);
}
```

### User Feedback

- Success messages for completed operations
- Error dialogs for failures
- Confirmation dialogs for destructive actions
- Loading states for async operations

---

## Deployment

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run tests (when implemented)
4. Build and package: `npm run package`
5. Test packaged application
6. Create GitHub release
7. Upload installers
8. Publish release notes

### Auto-Update (Future)

Plans to integrate electron-updater for automatic updates.

---

## Troubleshooting

### Build Issues

- Clear `node_modules` and reinstall
- Clear `dist/` directory
- Check Node.js version compatibility

### Development Issues

- Restart Vite dev server
- Clear browser cache
- Check for TypeScript errors

### IPC Issues

- Verify preload script is loaded
- Check main process logs
- Ensure handler is registered

---

## Contributing

See the main README for contribution guidelines. Key points:

- Follow the existing architecture patterns
- Maintain type safety
- Add documentation for new features
- Test thoroughly before submitting PRs

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Dagre Documentation](https://github.com/dagrejs/dagre)

---

For questions or clarifications about the architecture, please open an issue on GitHub.
