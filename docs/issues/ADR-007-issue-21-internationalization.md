# ADR 007: Internationalization and Native Menu Synchronization (Issue #21)

**Date:** 2026-09-01  
**Status:** Accepted / Implemented  
**Issue:** [#21: Multi-language support (i18n)](https://github.com/Juan-31416/MindMapper/issues/21)

## Context and Problem Statement

MindMapper initially exposed its interface through hardcoded UI strings. This prevented users from selecting their preferred application language and created duplicated text across React components, the Zustand store and Electron's native application menu.

Because MindMapper is a local-first Electron application, internationalization must preserve the product's privacy guarantees:

- Language selection must work offline.
- User language preferences must remain on the local machine.
- No translation service or external API may receive user content.
- The renderer, preload and main-process boundaries must remain explicit and secure.
- Electron's native menu must use the same language as the renderer UI.

The initial supported languages are Spanish (`es`) and English (`en`). Spanish is the application fallback language.

## Objectives

- Provide a complete Spanish and English interface.
- Persist the selected language locally.
- Resolve the initial language predictably on first launch.
- Avoid hardcoded translatable UI strings in the renderer.
- Support right-to-left layout direction for future RTL locales.
- Rebuild Electron's native application menu when the language changes.
- Keep localization responsibilities separate from mind-map domain logic.
- Preserve strict Electron security boundaries: no direct Node.js access from React.

## Decision

MindMapper adopts `i18next`, `react-i18next` and `i18next-http-backend` for renderer internationalization.

Translation resources are maintained as JSON files and loaded lazily by the renderer. The main process does not load renderer translation files. Instead, the renderer resolves translated native-menu labels and sends a minimal, explicit label payload over IPC. The main process uses that payload to rebuild the native Electron menu.

The selected locale is persisted through `SettingsService`, backed by local storage. On first launch, the renderer queries the operating-system locale through a dedicated IPC method, maps it to a supported locale, persists the result and falls back to Spanish when the locale cannot be resolved.

## Architecture

### Locale Resolution Order

The initial locale is resolved in this order:

1. A previously persisted language preference from `SettingsService`.
2. The OS locale returned by Main through `app:getLocale`.
3. Spanish (`es`) as the deterministic fallback.

The OS locale is used only for first-launch initialization. Once a language has been resolved, it is persisted locally and reused on subsequent launches.

```text
Renderer startup
    │
    ├── SettingsService.get('language')
    │       │
    │       ├── Valid supported locale ──> use persisted locale
    │       │
    │       └── Missing / invalid
    │               │
    │               └── IPC: app:getLocale
    │                       │
    │                       ├── Supported OS language ──> persist and use it
    │                       └── Unsupported / IPC failure ──> use Spanish
    │
    └── initialize i18next and apply document direction
```

### Electron Process Boundaries

```text
React renderer
    │
    │  window.electronAPI.app.getLocale()
    │  window.electronAPI.menu.setLabels(labels)
    ▼
Preload (contextBridge)
    │
    │  Explicit and typed IPC channels only
    ▼
Electron main process
    │
    ├── Resolve operating-system locale
    └── Rebuild Menu from localized label payload
```

The renderer does not obtain Node.js access. `contextIsolation` remains enabled, sandboxing remains enabled and the preload bridge exposes only the specific operations required by the feature.

### State Ownership

- **i18next** owns the currently active translation resources and emits language-change events.
- **Zustand** owns the application's selected language as user-facing domain/preferences state.
- **SettingsService** persists that language locally.
- **The renderer i18n integration** owns document-language and document-direction updates, plus synchronization of translated labels to the native menu.
- **The Electron main process** owns construction and installation of the native menu.

This separation prevents `mindMapStore` from becoming responsible for native-menu presentation details.

## Implementation

### 1. Dependencies

The renderer uses:

- `i18next`
- `react-i18next`
- `i18next-http-backend`

`i18next-http-backend` loads translation JSON resources from the application bundle rather than from a third-party translation endpoint.

### 2. Translation Resources

Translation files were introduced for Spanish and English:

```text
locales/
├── es/
│   └── translation.json
└── en/
    └── translation.json
```

The resources include strings for:

- Common actions and dialog buttons.
- Toolbar controls and tooltips.
- Unsaved-changes, save, open and export dialogs.
- Canvas defaults.
- Node editor sections, actions, status values and tooltips.
- Search UI.
- Settings UI.
- Native Electron menu labels.

Translation keys are semantic and stable. Components render keys through `t(...)` rather than embedding language-specific copy.

### 3. Vite Resource Serving

Vite is configured so the locale JSON files are available to `i18next-http-backend` at:

```text
/locales/{{lng}}/{{ns}}.json
```

This keeps the translation resources compatible with development and packaged renderer builds.

### 4. i18n Initialization

`src/renderer/i18n/i18n.ts` centralizes:

- Supported locale definitions.
- Fallback language selection.
- Initial locale resolution.
- i18next initialization.
- Lazy translation loading.
- `document.documentElement.lang` updates.
- `document.documentElement.dir` updates.

RTL behavior is based on a maintained list of RTL language codes. Current supported locales are left-to-right, but the document-level direction mechanism permits introducing RTL languages without redesigning the initialization flow.

### 5. Zustand and Local Preference Persistence

The selected language is represented by a strict locale type rather than an unrestricted `string`. When the language changes, the store:

1. Updates the in-memory locale state.
2. Persists the choice through `SettingsService`.
3. Requests the i18next language change.
4. Applies the matching document direction.

Default user-visible node text is resolved through i18n rather than hardcoded in the store.

### 6. Renderer Component Localization

The following components were migrated from hardcoded strings to translation keys:

- `App.tsx`
- `Toolbar.tsx`
- `NodeEditor.tsx`
- `SearchBar.tsx`
- `SettingsModal.tsx`

Dynamic user content, such as a user-defined mind-map name or node text, is not translated. Only application-controlled labels, instructions, tooltips, dialog copy and default values are localized.

### 7. Settings Modal

A settings modal provides an explicit user-facing language selector. The language names are localized through translation resources while the selected locale remains a stable internal identifier (`es` or `en`).

The toolbar settings action is connected to the modal. Its interaction is isolated from search state so closing the settings modal does not inadvertently activate the search UI.

### 8. Native Electron Menu

The application menu is rebuilt in the Electron main process whenever it receives a `menu:setLabels` IPC request.

A shared `MenuLabels` contract defines the exact label payload exchanged through IPC. It is used to avoid duplicated type definitions and to prevent an untyped `any` boundary between main, preload and renderer code.

The renderer synchronizes menu labels:

- After i18n initialization.
- On every `languageChanged` event emitted by i18next.

This ensures the native menu matches the active application language at startup and after a user changes language.

Menu commands remain event-based: main sends a `menu:*` event to the renderer through the preload bridge, and the preload callback invokes the registered renderer handler.

Electron role-based actions remain native roles where appropriate. Their labels may follow Electron and operating-system localization behavior; custom menu entries are localized from the renderer-supplied label payload.

## Consequences

### Positive

- Users can choose Spanish or English without restarting the application.
- First launch adopts a supported OS language when possible.
- The application remains fully offline-capable for localization.
- Locale preferences remain local to the device.
- UI strings are centralized in translation JSON resources.
- The renderer and native Electron menu remain synchronized.
- RTL support has a prepared document-level foundation.
- The architecture supports adding locales without scattering conditional language logic across UI components.
- Strict process separation is preserved.

### Negative / Trade-offs

- Adding a locale requires maintaining a complete translation resource.
- Translation keys must be kept consistent across all language files.
- Native menu localization introduces an additional IPC contract and synchronization path.
- Electron role-based menu labels are not wholly controlled by app translation resources.
- File-dialog titles and filter descriptions require explicit localized IPC payloads if they are to follow the in-app language instead of native defaults.

## Alternatives Considered

### Keep Hardcoded Strings in Components

Rejected because it duplicates copy, makes language expansion error-prone and forces UI code changes for textual edits.

### Bundle All Translations Directly into the Renderer

Rejected in favor of lazy resource loading. Backend loading gives a clearer path to adding languages without increasing the initial renderer payload proportionally.

### Use the OS Locale on Every Application Start

Rejected because a user's explicit application-level choice must take priority over operating-system preferences. The OS locale is therefore only a first-launch default.

### Store Locale Only in Zustand

Rejected because Zustand state is ephemeral across restarts. `SettingsService` is required to retain an explicit user choice locally.

### Translate the Native Menu Entirely in Main

Rejected because the renderer already owns i18next state and translation resources. Duplicating translation loading and locale-resolution logic in main would introduce two sources of truth. Passing a narrowly typed label payload over IPC keeps the main process independent of renderer i18n implementation details.

### Grant the Renderer Direct Electron or Node.js Access

Rejected because it violates Electron security boundaries. Locale detection and native-menu management must be available only through a minimal preload IPC bridge.

## Verification Checklist

- [ ] TypeScript passes for the Electron main-process configuration.
- [ ] TypeScript passes for the renderer configuration.
- [ ] On first launch with no stored preference, a supported OS locale is selected.
- [ ] On first launch with an unsupported OS locale, Spanish is selected.
- [ ] A manually selected language persists after restarting the application.
- [ ] Toolbar, node editor, search bar, settings modal and dialogs update after changing language.
- [ ] Default application-created node text uses the active translation.
- [ ] `document.documentElement.lang` reflects the active locale.
- [ ] `document.documentElement.dir` is `ltr` for Spanish and English.
- [ ] The native menu is localized at startup.
- [ ] The native menu rebuilds when language changes.
- [ ] Every `menu:*` preload listener invokes its callback.
- [ ] No renderer component receives direct Node.js or Electron module access.

## Follow-up Work

The i18n architecture is complete for the planned Spanish/English scope. Future changes should be tracked separately:

- Add another locale only together with complete translation coverage and UI verification.
- Localize file-dialog titles, messages and filters by passing explicit localized dialog payloads through IPC.
- Define date, number and relative-time formatting conventions using `Intl` where such UI values are introduced.
- Decide whether AI-assisted content should use the active UI language as a default prompt preference, subject to explicit provider and user-consent boundaries.
