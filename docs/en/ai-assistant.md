# AI Assistant

> **Version:** v0.2 (beta) · 🧪 **Experimental**

> 🧪 This feature is **experimental** and will be included in v0.3. Its interface and behaviour may change significantly in future releases.

The AI Assistant can generate a mind map structure from a plain-language prompt, saving you time on the initial brainstorming phase.

---

## What the AI Assistant Does

You describe a topic in your own words. The AI generates a structured set of nodes — a root node with branches and children — and inserts them into your current map. You can then edit, expand, or restyle the generated structure freely.

---

## Supported AI Providers

MindMapper is designed to work with multiple AI providers. You choose which one to use:

| Provider | Notes |
|---|---|
| **OpenAI** | External service — requires your own API key |
| **Gemini** | External service — requires your own API key |
| **ChatLLM** | External service — requires your own API key |
| **Local LLM** | Self-hosted — no API key needed, maximum privacy |

> 🔒 **Privacy:** When you use an external provider (OpenAI, Gemini, ChatLLM), your prompt is sent to that provider's servers. If you prefer that no text leaves your machine, use a **local LLM**. No data is ever sent without your explicit action.

---

## Using the AI Assistant

> **Note:** Detailed setup steps for each provider will be added as the feature matures. The steps below reflect v0.2 behaviour.

1. With a map open, activate the AI Assistant. *(Check the toolbar or the New button drop-down for the entry point in your version.)*
2. Type a prompt describing the topic you want to explore. Examples:
   - *"Plan a 4-week web app launch"*
   - *"Brainstorm content ideas for a sustainable living blog"*
   - *"Outline the chapters of a book on machine learning for beginners"*
3. The assistant generates a mind map structure and adds it to your map.
4. Review the generated nodes. Edit, delete, or expand them as needed.

[SCREENSHOT: The AI Assistant prompt input and a generated mind map with several branches]

---

## AI is Always Optional

MindMapper is fully functional without the AI Assistant. You never need to configure a provider to use the core features of the application.

---

## Data and Privacy Guarantees

- Your prompts are processed by the AI provider you selected — not by MindMapper.
- MindMapper does **not** log or store your prompts.
- No map data is sent silently in the background.
- All AI configuration is stored **locally** on your machine.

---

## See Also

- [Creating and Managing Maps](creating-maps.md)
- [Settings and Preferences](settings.md)
- [Keyboard Shortcuts](keyboard-shortcuts.md)

---

*← [Back to Documentation Index](index.md)*
