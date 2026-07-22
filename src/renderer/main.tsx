
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initI18n } from './i18n/i18n';
import './styles/index.css';



async function bootstrap(): Promise<void> {
  await initI18n();

  const root = document.getElementById('root');
  if (!root) throw new Error('[MindMapper] Root element #root not found in DOM.');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap().catch((err) => {
  console.error('[MindMapper] Fatal error during bootstrap:', err);
});
