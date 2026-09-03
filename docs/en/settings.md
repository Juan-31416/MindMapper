# Settings and Preferences

> **Version:** v0.2 (beta)

MindMapper stores your preferences **locally** on your machine. No settings are ever sent to a server.

---

## Theme (Light / Dark Mode)

MindMapper supports both **light** and **dark** themes.

### How to switch the theme

Three ways to toggle:

- Click the **☀ / 🌙** button in the top-right corner of the toolbar.
- Go to **View > Toggle Theme** in the menu bar.
- Press **Ctrl + T**.

[SCREENSHOT: The sun/moon theme toggle button in the top-right of the toolbar]

### How the theme is remembered

Your choice is saved automatically to your device's local storage (key: `mindmapper-theme`). The next time you open MindMapper, it restores your last theme.

If you have **never set a theme manually**, MindMapper follows your operating system's light/dark preference.

---

## Layout Preference

You can switch between **Hierarchical** and **Radial** layouts at any time using the toolbar buttons. Each new map starts in Hierarchical layout by default.

See [Views and Navigation](views.md) for full details.

---

## Language

> ⚠️ **Partially implemented in v0.2:** A language setting UI exists, but the full translation of all interface labels is not yet complete. Some UI elements (such as the layout buttons) currently display in Spanish regardless of the selected language. This will be fully resolved in a future release.

---

## Privacy and Data

MindMapper is **local-first** and **offline by default**:

- All your mind maps are stored as files on your own device (`.mindmap.json`).
- No map data is sent to any cloud service or server.
- The AI Assistant (if configured) connects **only to the provider you choose** — no data is shared silently in the background.

See [AI Assistant](ai-assistant.md) for details on configuring an AI provider.

---

## See Also

- [Views and Navigation](views.md)
- [AI Assistant](ai-assistant.md)
- [Keyboard Shortcuts](keyboard-shortcuts.md)

---

*← [Back to Documentation Index](index.md)*
