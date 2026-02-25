import { useAiConfigStore } from "../../store/aiConfigStore";

export const AiSettings = () => {
    const {
        config, 
        setProvider,
        setApiKey,
        setBaseUrl,
        setModel,
        setLanguage,
        validateConfig,
    } = useAiConfigStore();

    return (
        <section>
            <h4>AI Settings</h4>

            <select
                value={config.llm.provider}
                onChange={e => setProvider(e.target.value as any)}
            >
                <option value={"abacus-route-llm"}>Abacus RouteLLM</option>
                <option value={"openai-compatible"}>OpenAI compatible</option>
                <option value={"local-http"}>Local HTTP</option>
            </select>

            <input
                placeholder="API Key"
                type="password"
                value={config.llm.apiKey ?? ''}
                onChange={e => setApiKey(e.target.value)}
            />

            <input
                placeholder="Base URL"
                value={config.llm.baseUrl ?? ''}
                onChange={e => setBaseUrl(e.target.value)}
            />

            <input
                placeholder="Model"
                value={config.llm.model ?? ''}
                onChange={e => setModel(e.target.value)}
            />

            <input
                placeholder="Language (es/en)"
                value={config.language}
                onChange={e => setLanguage(e.target.value)}
            />
        </section>
    );
};

//import { AiSettings } from "./AiSettings";

export const AiSettingsTab = () => {
    return (
        <div className="ai-settings-tab">
            <AiSettings />
        </div>
    );
};