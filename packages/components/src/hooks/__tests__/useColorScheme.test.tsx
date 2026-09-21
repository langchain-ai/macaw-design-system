import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../../components';
import { AppThemeProvider } from '../AppThemeProvider';
import { THEME_MODE_STORAGE_KEY, useColorScheme } from '../useColorScheme';

function createMockStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
}

function ThemeProbe() {
  const { mode, resolvedMode, isDarkMode, setMode } = useColorScheme();

  return (
    <Button type="button" onClick={() => setMode('dark')}>
      {mode} / {resolvedMode} / {isDarkMode ? 'dark' : 'light'}
    </Button>
  );
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMockStorage(),
    });
  });

  afterEach(() => {
    window.localStorage.removeItem(THEME_MODE_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themeMode;
    document.documentElement.style.colorScheme = '';
  });

  it('stamps the app-owned dark class when mode changes', () => {
    render(
      <AppThemeProvider defaultMode="light" storageKey={null}>
        <ThemeProbe />
      </AppThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent(
      'light / light / light'
    );
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement.dataset.theme).toBe('light');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('dark / dark / dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.themeMode).toBe('dark');
  });

  it('restores a preference saved under the configured key', () => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark');

    render(
      <AppThemeProvider defaultMode="system">
        <ThemeProbe />
      </AppThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent('dark / dark / dark');
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('falls back to the default mode when storage is invalid', () => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, 'invalid');

    render(
      <AppThemeProvider defaultMode="system">
        <ThemeProbe />
      </AppThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent(
      'system / light / light'
    );
  });
});
