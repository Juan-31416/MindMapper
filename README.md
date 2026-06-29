# MindMapper

<div align="center">
  <h3>🧠 A Powerful Mind Mapping Application</h3>
  <p>Built with Electron, React, and TypeScript</p>
  
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/L3L01NYP70)
</div>

---

## ✨ Features

MindMapper is a feature-rich mind mapping application designed to help you organize your thoughts, brainstorm ideas, and visualize complex concepts with ease.

### Phase 2 Features (Current)

- **🎨 Visual Mind Mapping**
  - Intuitive drag-and-drop interface
  - Hierarchical node structure with automatic layout
  - Customizable node styles (colors, borders, icons)
  - Smooth zoom and pan navigation

- **✏️ Editing & Organization**
  - Quick node creation with keyboard shortcuts
  - Inline text editing
  - Undo/Redo support with full history
  - Node collapse/expand functionality
  - Smart search functionality

- **💾 File Management**
  - Save and load mind maps (.mindmap.json format)
  - Import from JSON and Markdown outline files
  - Export to PDF (vectorial) and JSON

- **🎭 Templates**
  - Blank template for starting fresh
  - Brainstorming template with pre-built structure
  - Easy template selection from toolbar

- **🌓 Theming**
  - Light and dark themes
  - Smooth theme transitions
  - Theme persistence across sessions

- **⌨️ Keyboard Shortcuts**
  - Full keyboard navigation support
  - Quick file operations
  - Productivity-focused workflow

- **🔒 Security**
  - Secure IPC communication
  - Context isolation enabled
  - Sandboxed renderer process

---

## 📦 Installation

### Option A — Download a binary (recommended)

Go to [Releases](https://github.com/Juan-31416/MindMapper/releases) and download the file for your platform.

**Linux (AppImage):**
```bash
chmod +x MindMapper*.AppImage
./MindMapper*.AppImage
```

**Linux (Debian/Ubuntu):**
```bash
sudo dpkg -i mindmapper*.deb
```

**Windows**: Run MindMapper Setup.exe and follow the installer.

**macOS**: Open MindMapper.dmg, drag to Applications.

### Option B - Build from source

**Prerequisites**: Node.js v16+, npm

1. Clone the repository:
```bash
git clone https://github.com/Juan-31416/MindMapper.git
cd MindMapper
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev          # development mode
```

4. Build for production:
```bash
npm run build
```

5. Package the application:
```bash
npm run package      # build for current platform
```

---

## 🚀 Quick Start

1. **Launch the application** - Start with a welcome mind map
2. **Create nodes** - Press `Tab` to create a child node, `Enter` for a sibling
3. **Edit text** - Double-click any node to edit its text
4. **Customize** - Use the right sidebar to change colors, icons, and styles
5. **Save your work** - Press `Ctrl+S` to save your mind map
6. **Export** - Export to PDF or JSON from the File menu

For a beginner-friendly first-use guide in Spanish, see [QUICKSTART.md](./QUICKSTART.md).

---

## 💡 Usage

For detailed usage instructions, keyboard shortcuts, and advanced features, see [USAGE.md](./USAGE.md).

---

## 🏗️ Architecture

MindMapper follows a modern architecture with clear separation of concerns:

- **Main Process (Electron)**: File operations, window management, application menu
- **Renderer Process (React)**: UI rendering, user interactions, state management
- **IPC Bridge (Preload)**: Secure communication between main and renderer

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 📊 Data Format

Mind maps are stored in JSON format with the `.mindmap.json` extension. The format supports:

- Hierarchical node structure
- Per-node custom styling
- Metadata (creation date, last modified)
- Full state preservation

For the complete data schema, see [DATA_SCHEMA.md](./DATA_SCHEMA.md).

---

## 🛠️ Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better code quality
- **Zustand**: Lightweight state management
- **Dagre**: Graph layout algorithm for automatic positioning
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful icon set

---

## 🗺️ Roadmap

### v0.3 (Next)
- Radial view
- Advanced fuzzy search
- More templates (SWOT, Roadmap)
- Local AES-GCM encryption
- Automatic backups with versioning

### v0.4 (~6 months)
- Additional views (organigram, fishbone, concept map)
- More I/O formats (OPML, FreeMind .mm, PNG, SVG export)
- Minimap and focus mode

### v1.0 (~9-12 months)
- Full plugin system
- Optional Java backend (Lucene, advanced PDF)
- Full ARIA accessibility
- AI assistant (local LLM + pluggable providers)
- Anki card creation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
## 💰 Help the development

https://ko-fi.com/mindmapper

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Inspired by traditional mind mapping techniques
- Designed for productivity and creativity

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report a bug](https://github.com/Juan-31416/MindMapper/issues)
- 💡 [Request a feature](https://github.com/Juan-31416/MindMapper/issues)
- 📧 [Contact us](mailto:jp.martintejeiro@qelronzal.com)

---

<div align="center">
  <p>Made with 🧠 by the MindMapper Team</p>
</div>
