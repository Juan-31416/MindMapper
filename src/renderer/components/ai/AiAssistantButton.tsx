import { useAiUiStore } from "../../store/aiUiStore";
import '../../styles/AiAssistant.css';

export const AiAssistantButton = () => {
    const open = useAiUiStore(s => s.open);

    return (
        <button className="ai-fab" onClick={open} title="AI Assistant (Ctrl+K)">
            ✨
        </button>
    );
};