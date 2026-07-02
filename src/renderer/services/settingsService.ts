import { LayoutType } from '../types/mindmap';
import { FavoriteColor } from '../types/mindmap';



// ─── Types ───

export type EdgeStyle = 'curved' | 'straight';
export type ThemeType = 'light' | 'dark';

export interface StoredPreferences {
  layout?: LayoutType;
  theme?: ThemeType;
  favoriteColors?: FavoriteColor[];
  edgeStyle?: EdgeStyle;
  language?: string;
}

export interface AppSettings {
  layout: LayoutType;
  theme: ThemeType;
  favoriteColors: FavoriteColor[];
  edgeStyle: EdgeStyle;
  language: string;
}



// ─── Constants ───

const STORAGE_KEY = 'mindmapper-preferences';

export const DEFAULT_SETTINGS: AppSettings = {
  layout: 'hierarchical',
  theme: 'dark',
  favoriteColors: [],
  edgeStyle: 'curved',
  language: 'es',
};



// ─── Service ───

export const SettingsService = {
  load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };

      const stored: StoredPreferences = JSON.parse(raw);
      return {
        layout:         stored.layout         ?? DEFAULT_SETTINGS.layout,
        theme:          stored.theme          ?? DEFAULT_SETTINGS.theme,
        favoriteColors: stored.favoriteColors ?? DEFAULT_SETTINGS.favoriteColors,
        edgeStyle:      stored.edgeStyle      ?? DEFAULT_SETTINGS.edgeStyle,
        language:       stored.language       ?? DEFAULT_SETTINGS.language,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  save(patch: Partial<AppSettings>): void {
    try {
      const current = this.load();
      const updated: AppSettings = { ...current, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[SettingsService] Failed to save preferences:', err);
    }
  },

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.load()[key];
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
} as const;