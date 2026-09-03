# Documentation Maintenance Convention

> MindMapper project · For contributors and maintainers

This file describes the conventions for writing, updating, and organising the MindMapper end-user documentation.

---

## Folder Structure

```
docs/
├── DOCUMENTATION.md          ← this file
├── en/                       ← English documentation
│   ├── index.md
│   ├── getting-started.md
│   ├── creating-maps.md
│   ├── nodes.md
│   ├── styling.md
│   ├── views.md
│   ├── search.md
│   ├── import-export.md
│   ├── keyboard-shortcuts.md
│   ├── settings.md
│   └── ai-assistant.md
└── es/                       ← Spanish documentation (Español)
    ├── index.md
    ├── primeros-pasos.md
    ├── crear-mapas.md
    ├── nodos.md
    ├── estilos.md
    ├── vistas.md
    ├── busqueda.md
    ├── importar-exportar.md
    ├── atajos-de-teclado.md
    ├── configuracion.md
    └── asistente-ia.md
```

---

## Language Policy

- **Every document must exist in both English (`en/`) and Spanish (`es/`).** Partial translations are not acceptable for release.
- English is the source language. Write the English version first, then translate to Spanish.
- Keep filenames in English for `en/` and in descriptive Spanish for `es/` (see the table above).
- Do not add other language folders without updating this convention file.

---

## Version Badge

Every document must include a version badge at the top, immediately after the `# Title`:

```markdown
> **Version:** v0.2 (beta)
```

Update the version string whenever the document reflects a new application release.

---

## Feature Status Labels

Use these standard labels consistently throughout the documentation:

| Label | When to use |
|---|---|
| ✅ **Stable** | Feature is complete, tested, and reliable |
| ⚠️ **Partially implemented** | Feature exists but has known gaps or UI inconsistencies |
| 🧪 **Experimental** | Feature is in active development; behaviour may change |

Apply the label inline next to the feature name or in a blockquote at the top of the relevant section.

---

## Screenshot Placeholders

Real screenshots are not committed to the repository. Instead, use descriptive placeholders:

```markdown
[SCREENSHOT: The Node Editor panel with all sections visible]
```

When providing actual screenshots:

1. Save images in `docs/assets/screenshots/`.
2. Use descriptive filenames: `node-editor-full-panel.png`, not `screenshot1.png`.
3. Replace each placeholder with a standard Markdown image tag:
   ```markdown
   ![The Node Editor panel with all sections visible](../assets/screenshots/node-editor-full-panel.png)
   ```
4. Use the same image in both language folders — do not duplicate image files.

---

## Cross-Linking Rules

- All links between documents must be **relative paths** within the same language folder.  
  Correct: `[Working with Nodes](nodes.md)`  
  Incorrect: `[Working with Nodes](/docs/en/nodes.md)`
- Every page must end with a back-link to the index:
  ```markdown
  *← [Back to Documentation Index](index.md)*
  ```
  (In Spanish: `*← [Volver al índice de documentación](index.md)*`)
- The language indexes (`en/index.md` and `es/index.md`) must cross-link to each other:
  ```markdown
  [English](../en/index.md) · Español
  ```

---

## Writing Style

- **Audience:** First-time users with low technical experience.
- **Tone:** Accessible, friendly, direct. No jargon without explanation.
- **Voice:** Second person ("you", "your"). Active verbs ("click", "press", "type").
- **Length:** Keep each page focused on one topic. The getting-started guide must not exceed ~600 words (~3 min read).
- **Tables:** Use Markdown tables for comparisons, shortcut lists, and format summaries.
- **Tips:** Use `> 💡 **Tip:**` blockquotes for helpful hints that are not part of the main flow.
- **Warnings:** Use `> ⚠️ **Warning:**` or `> ⚠️ **Note:**` blockquotes for important cautions.

---

## Updating Documentation for a New Release

When a new version of MindMapper is released:

1. Identify every document affected by the change (new features, changed behaviour, removed features).
2. Update the version badge at the top of each affected document.
3. Remove or update ⚠️ Partial / 🧪 Experimental labels for features that have reached ✅ Stable.
4. Update both language versions simultaneously. Never release with an outdated translation.
5. Update `keyboard-shortcuts.md` / `atajos-de-teclado.md` if any shortcut was added or changed.
6. Add a note in the Git commit referencing the app version: `docs: update for v0.3`.

---

## Adding a New Document

1. Decide on the filename in both `en/` and `es/`.
2. Write the English version first.
3. Add the version badge, the status labels applicable to the content, and the back-link footer.
4. Add the new page to the table in both `en/index.md` and `es/index.md`.
5. Cross-link from any related existing document.
6. Write the Spanish translation.
7. Update this `DOCUMENTATION.md` file with the new filename in the folder structure above.

---

## Known v0.2 Documentation Gaps

These items are documented but pending resolution in the application:

| Item | Status | Notes |
|---|---|---|
| Layout button labels in Spanish ("Jerárquica", "Radial") | ⚠️ App bug | Displays in Spanish regardless of app language setting |
| Search bar placeholder in Spanish | ⚠️ App bug | "Buscar nodos… (Esc para cerrar)" always shown |
| Language setting full translation | ⚠️ Partial | UI exists; not all labels are translated |
| Radial layout spacing | ⚠️ Pending | Visual improvements planned |
| AI Assistant setup steps per provider | 🧪 Pending | Full configuration guide to be written when feature matures |

---

*Last updated for MindMapper v0.2 (beta)*
