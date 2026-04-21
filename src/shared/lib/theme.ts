export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'dark' | 'light';

export const DEFAULT_THEME: Theme = 'dark';

export const isTheme = (value: string | null): value is Theme =>
  value === 'dark' || value === 'light';

export const getThemeInitScript = () => `
(() => {
  const storageKey = '${THEME_STORAGE_KEY}';
  const defaultTheme = '${DEFAULT_THEME}';
  const root = document.documentElement;

  try {
    const storedTheme = localStorage.getItem(storageKey);
    const theme =
      storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : defaultTheme;

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch {
    root.classList.toggle('dark', defaultTheme === 'dark');
    root.style.colorScheme = defaultTheme;
  }
})();
`;
