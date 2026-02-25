import { useAiUiStore } from "../../store/aiUiStore";
import { AiChatView } from "./AiChatView";
import { AiSettingsTab } from "./AiSettings";

export const AiAssistantContent = () => {
    const { activeTab } = useAiUiStore();

    return (
        <div className="ai-panel-content">
            {activeTab === "chat" && <AiChatView />}
            {activeTab === "settings" && <AiSettingsTab />}
        </div>
    );
};