import { X, Minus } from "lucide-react";
import { useAiUiStore } from "../../store/aiUiStore";

export const AiAssistantHeader = ({ onDragStart }: { onDragStart: (e: React.MouseEvent) => void }) => {
    const { minimize, close, activeTab, setActiveTab } = useAiUiStore();

    return (
        <header className="ai-header" onMouseDown={onDragStart}>
            <div className="ai-header-left">
                <span className="ai-header-title">AI Assistant</span>
                <nav className="ai-tabs">
                    <button
                        className={activeTab === "chat" ? "active" : ""}
                        onClick={(e) => { e.stopPropagation(); setActiveTab("chat"); }}
                    >
                        Chat
                    </button>
                    <button
                        className={activeTab === "settings" ? "active" : ""}
                        onClick={(e) => { e.stopPropagation(); setActiveTab("settings"); }}
                    >
                        Ajustes
                    </button>
                </nav>
            </div>

            <div className="ai-header-right" onClick={e => e.stopPropagation()}>
                <button onClick={minimize}><Minus size={16} /></button>
                <button onClick={close}><X size={16} /></button>
            </div>
        </header>
    );
};