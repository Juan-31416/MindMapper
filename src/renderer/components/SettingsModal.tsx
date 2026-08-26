import React from 'react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { SUPPORTED_LOCALES, SupportedLocale } from '../i18n/i18n';
import '../styles/SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const language = useMindMapStore((state) => state.language);
  const setLanguage = useMindMapStore((state) => state.setLanguage);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="settings-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="settings-modal-header">
          <h2 id="settings-modal-title">{t('settings.title')}</h2>
          <button
            className="settings-modal-close"
            onClick={onClose}
            aria-label={t('settings.close')}
          >
            <LucideIcons.X size={20} />
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-section">
            <label className="settings-label" htmlFor="language-select">
              {t('settings.language')}
            </label>
            <select
              id="language-select"
              className="settings-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLocale)}
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {t(`settings.language.${locale}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;