import { useState } from "react";
import { useAiUiStore } from "../../store/aiUiStore";
import { useAiAssistant } from "../../hooks/useAiAssistant";
import { AiSettings } from "./AiSettings";
import { AiErrorBanner } from "./AiErrorBanner";

export const AiAssistantPanel = () => {
    const { viewMode, close, operation } = useAiUiStore();
    const ai = useAiAssistant();
    const [prompt, setPrompt] = useState('');

    if (!viewMode) return null;

    return (
        <div className="ai-panel">
            <header>
                <h3>AI Assistant</h3>
                <button onClick={close}>x</button>
            </header>

            <AiErrorBanner />

            <textarea
                placeholder="Describe el mapa, o da instrucciones..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
            />

            <button 
                disabled={!prompt || operation !== 'idle'}
                onClick={() => ai.generateFromPrompt(prompt)}
            >
                {operation === 'generate' ? 'Generando...' : 'Crear mapa con IA'}
            </button>

            <button 
                disabled={!prompt || operation !== 'idle'}
                onClick={() => ai.generateFromPrompt(prompt)}
            >
                {operation === 'suggest' ? 'Pensando...' : 'Sugerencias IA'}
            </button>

            <AiSettings />
        </div>
    );
};