/**
 * Theme management utilities
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mindmapper-theme';

/**
 * Get the current theme from localStorage or system preference
 */
export function getCurrentTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'dark'; // Default to dark
}

/**
 * Set the theme
 */
export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): Theme {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  } else {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  }
  
  // Set data attribute for CSS
  root.setAttribute('data-theme', theme);
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-update if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}
