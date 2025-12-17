# Changelog

All notable changes to MindMapper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Nothing yet

### Security
- Nothing yet

## [0.1.0] - 2024-01-XX

### Added
- **Initial Release** 🎉
- **Core Mind Mapping Features**
  - Visual drag-and-drop interface for creating mind maps
  - Hierarchical node structure with automatic layout using Dagre algorithm
  - Customizable node styles (colors, borders, icons)
  - Smooth zoom and pan navigation
  - Node collapse/expand functionality

- **Editing & Organization**
  - Quick node creation with keyboard shortcuts (Tab for child, Enter for sibling)
  - Inline text editing with double-click
  - Undo/Redo support with full history tracking
  - Context menu for node operations

- **File Management**
  - Save and load mind maps in `.mindmap.json` format
  - Import from JSON and Markdown outline files
  - Export to PDF (vectorial) and JSON formats
  - File operations through secure IPC communication

- **Templates System**
  - Blank template for starting fresh
  - Brainstorming template with pre-built structure
  - Template selection from toolbar

- **Theming Support**
  - Light and dark themes
  - Smooth theme transitions
  - Theme persistence across sessions

- **Keyboard Shortcuts**
  - Full keyboard navigation support
  - Quick file operations (Ctrl+S to save)
  - Productivity-focused workflow shortcuts

- **Security Features**
  - Secure IPC communication between main and renderer processes
  - Context isolation enabled
  - Sandboxed renderer process

- **Cross-Platform Support**
  - Windows (NSIS installer)
  - macOS (DMG package)
  - Linux (AppImage and DEB packages)

### Technical Details
- Built with Electron 28.0.0
- React 18.2.0 with TypeScript 5.3.3
- Zustand for state management
- Vite for fast development and building
- Lucide React for beautiful icons

### Known Issues
- None at this time

---

## Release Notes Format

Each release should follow this format:

### Version Numbering
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Categories
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Date Format
Use YYYY-MM-DD format for release dates.

---

## Contributing to Changelog

When contributing to the project:

1. Add your changes to the `[Unreleased]` section
2. Use the appropriate category (Added, Changed, Fixed, etc.)
3. Be descriptive but concise
4. Include issue numbers when applicable: `(#123)`
5. Group related changes together
6. Use present tense ("Add feature" not "Added feature")
7. Don't include changes that don't affect the end user

Example:
```markdown
### Added
- New export format for mind maps (#45)
- Keyboard shortcut for quick save (Ctrl+Shift+S)

### Fixed
- Memory leak when loading large mind maps (#67)
- Export dialog not showing on Linux (#89)
```
