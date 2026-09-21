import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

export interface ColorScheme {
  mode: ThemeMode;
  systemMode: ResolvedThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isLightMode: boolean;
}

// Keep the original key so the Macaw rename preserves saved theme preferences.
export const THEME_MODE_STORAGE_KEY = 'langchain-design-system-theme-mode';
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

const noop = () => {};

export const defaultColorScheme: ColorScheme = {
  mode: 'light',
  systemMode: 'light',
  resolvedMode: 'light',
  setMode: noop,
  isDarkMode: false,
  isLightMode: true,
};

export const ColorSchemeContext =
  createContext<ColorScheme>(defaultColorScheme);

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getStoredMode(storageKey: string | null): ThemeMode | null {
  if (typeof window === 'undefined' || storageKey === null) {
    return null;
  }

  try {
    const storedMode = window.localStorage.getItem(storageKey);
    return isThemeMode(storedMode) ? storedMode : null;
  } catch {
    return null;
  }
}

export function storeMode(storageKey: string | null, mode: ThemeMode) {
  if (typeof window === 'undefined' || storageKey === null) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Local storage may be unavailable in private windows or embedded contexts.
  }
}

export function resolveMode(
  mode: ThemeMode,
  systemMode: ResolvedThemeMode
): ResolvedThemeMode {
  return mode === 'system' ? systemMode : mode;
}

export function applyThemeToDocument(
  mode: ThemeMode,
  resolvedMode: ResolvedThemeMode
) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', resolvedMode === 'dark');
  root.dataset.theme = resolvedMode;
  root.dataset.themeMode = mode;
  root.style.colorScheme = resolvedMode;
}

export function useColorScheme(): ColorScheme {
  return useContext(ColorSchemeContext);
}
