import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'sepia' | 'night';

const STORAGE_KEY = 'theme_preference';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'sepia' || stored === 'night') {
      return stored;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'sepia', 'night');

    // Add the current theme class
    root.classList.add(theme);

    // Store preference
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
