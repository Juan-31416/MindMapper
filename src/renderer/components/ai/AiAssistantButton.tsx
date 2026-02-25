import { useAiUiStore } from "../../store/aiUiStore";
import '../../styles/AiAssistant.css';

export const AiAssistantButton = () => {
    const toggleViewMode = useAiUiStore(s => s.toggleViewMode);

    return (
        <button className="ai-fab" onClick={toggleViewMode} title="AI Assistant (Ctrl+K)">
            ✨
        </button>
    );
};