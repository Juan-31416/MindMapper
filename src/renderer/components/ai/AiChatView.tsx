import { useState } from "react";
import { useAiUiStore } from "../../store/aiUiStore";
import { useAiAssistant } from "../../hooks/useAiAssistant";
import { AiErrorBanner } from "./AiErrorBanner";

export const AiChatView = () => {
    const [prompt, setPrompt] = useState("");
    const { operation } = useAiUiStore();
    const ai = useAiAssistant();

    return (
        <div className="ai-chat-view">
            <AiErrorBanner />

            <textarea
                className="ai-input"
                placeholder="Describe el mapa o da instrucciones…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="ai-actions">
                <button
                    disabled={!prompt || operation !== "idle"}
                    onClick={() => ai.generateFromPrompt(prompt)}
                >
                    {operation === "generate" ? "Generando…" : "Crear mapa"}
                </button>

                <button
                    disabled={!prompt || operation !== "idle"}
                    onClick={() => ai.suggestEdits(prompt)}
                >
                    {operation === "suggest" ? "Pensando…" : "Sugerir cambios"}
                </button>
            </div>
        </div>
    );
};