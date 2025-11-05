# MindMapper

<div align="center">
  <h3>🧠 A Powerful Mind Mapping Application</h3>
  <p>Built with Electron, React, and TypeScript</p>
</div>

---

## ✨ Features

MindMapper is a feature-rich mind mapping application designed to help you organize your thoughts, brainstorm ideas, and visualize complex concepts with ease.

### Phase 1 Features (Current)

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

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mindmapper.git
cd mindmapper
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Package the application:
```bash
npm run package
```

---

## 🚀 Quick Start

1. **Launch the application** - Start with a welcome mind map
2. **Create nodes** - Press `Tab` to create a child node, `Enter` for a sibling
3. **Edit text** - Double-click any node to edit its text
4. **Customize** - Use the right sidebar to change colors, icons, and styles
5. **Save your work** - Press `Ctrl+S` to save your mind map
6. **Export** - Export to PDF or JSON from the File menu

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
- Custom styling per node
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

### Phase 2 (Planned)
- Radial view
- Advanced fuzzy search
- More templates (SWOT, Roadmap)
- Local AES-GCM encryption
- Automatic backups with versioning

### Phase 3 (~6 months)
- Additional views (organigram, fishbone, concept map)
- More I/O formats (OPML, FreeMind .mm, PNG, SVG export)
- Minimap and focus mode

### Phase 4 (~9-12 months)
- Full plugin system
- Optional Java backend (Lucene, advanced PDF)
- Full ARIA accessibility
- AI assistant
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
