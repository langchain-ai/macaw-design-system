import type { ReactNode } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { useMediaQuery } from '@mantine/hooks';

import {
  ColorSchemeContext,
  PREFERS_DARK_QUERY,
  THEME_MODE_STORAGE_KEY,
  applyThemeToDocument,
  getStoredMode,
  isThemeMode,
  resolveMode,
  storeMode,
  type ColorScheme,
  type ResolvedThemeMode,
  type ThemeMode,
} from './useColorScheme';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface AppThemeProviderProps {
  children?: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string | null;
}

export function AppThemeProvider({
  children,
  defaultMode = 'system',
  storageKey = THEME_MODE_STORAGE_KEY,
}: AppThemeProviderProps) {
  const prefersDarkMode = useMediaQuery(PREFERS_DARK_QUERY, false, {
    getInitialValueInEffect: false,
  });
  const systemMode: ResolvedThemeMode = prefersDarkMode ? 'dark' : 'light';
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return getStoredMode(storageKey) ?? defaultMode;
  });

  const resolvedMode = resolveMode(mode, systemMode);

  useEffect(() => {
    if (typeof window === 'undefined' || storageKey === null) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      if (isThemeMode(event.newValue)) {
        setModeState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [storageKey]);

  useIsomorphicLayoutEffect(() => {
    applyThemeToDocument(mode, resolvedMode);
  }, [mode, resolvedMode]);

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      setModeState(nextMode);
      storeMode(storageKey, nextMode);
    },
    [storageKey]
  );

  const value = useMemo<ColorScheme>(
    () => ({
      mode,
      systemMode,
      resolvedMode,
      setMode,
      isDarkMode: resolvedMode === 'dark',
      isLightMode: resolvedMode === 'light',
    }),
    [mode, systemMode, resolvedMode, setMode]
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
