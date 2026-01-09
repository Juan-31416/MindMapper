import { useAiUiStore } from '../../store/aiUiStore';

export const AiErrorBanner = () => {
  const { error, clearError } = useAiUiStore();

  if (!error) return null;

  return (
    <div className="ai-error">
      <span>{error}</span>
      <button onClick={clearError}>✕</button>
    </div>
  );
};