'use client';

import { useEffect, useState } from 'react';

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from '@/shared/lib/theme';
import { ThemeContext } from '@/shared/lib/theme-context';

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

const getDocumentTheme = (): Theme => {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  const [theme, setThemeState] = useState<Theme>(getDocumentTheme);

  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isTheme(event.newValue)) {
        return;
      }

      setThemeState(event.newValue);
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
