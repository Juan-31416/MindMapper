import { useAiUiStore } from "../../store/aiUiStore";
import '../../styles/AiAssistant.css';
import { Bot } from "lucide-react";

export const AiAssistantButton = () => {
    const toggleViewMode = useAiUiStore(s => s.toggleViewMode);

    return (
        <button className="ai-fab" onClick={toggleViewMode} title="AI Assistant (Ctrl+K)">
            <Bot size={22} />
        </button>
    );
};