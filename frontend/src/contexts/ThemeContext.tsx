import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'sepia' | 'night';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'sepia' || stored === 'night') {
      return stored as Theme;
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
