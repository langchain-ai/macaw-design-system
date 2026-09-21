import { useMemo } from 'react';

import {
  useColorScheme,
  type ResolvedThemeMode,
} from '../hooks/useColorScheme';

/**
 * Semantic colors for data visualization. These values intentionally remain
 * CSS variable references because SVG fill/stroke props cannot consume
 * Tailwind classes. Theme-specific values live in `src/index.css`.
 */
export const CHART_CATEGORICAL_LINE_COLORS = Array.from(
  { length: 20 },
  (_, index) => `var(--chart-categorical-line-${index + 1})`
);

export const CHART_CATEGORICAL_FILL_COLORS = Array.from(
  { length: 20 },
  (_, index) => `var(--chart-categorical-fill-${index + 1})`
);

export const CHART_COMPARISON_COLORS = Array.from(
  { length: 10 },
  (_, index) => `var(--chart-comparison-${index + 1})`
);

export const CHART_SINGLE_FILL_COLOR = 'var(--chart-single-fill)';
export const CHART_OTHER_COLOR = 'var(--chart-other)';
export const CHART_INTERACTION_CONTRAST_COLOR =
  'var(--chart-interaction-contrast)';
export const CHART_ON_COLOR = 'var(--chart-on-color)';
export const CHART_ON_WARNING_COLOR = 'var(--chart-on-warning)';

export const CHART_STATUS_COLORS = {
  positive: 'var(--chart-positive)',
  warning: 'var(--chart-warning)',
  negative: 'var(--chart-negative)',
  negativeSubtle: 'var(--chart-negative-subtle)',
};

/** Lower-luminance semantic colors for large filled marks. */
export const CHART_STATUS_FILL_COLORS = {
  positive: 'var(--chart-positive-fill)',
  warning: 'var(--chart-warning-fill)',
  negative: 'var(--chart-negative-fill)',
};

export const CHART_BREAKDOWN_COLORS = {
  input: 'var(--chart-breakdown-input)',
  output: 'var(--chart-breakdown-output)',
  other: 'var(--chart-breakdown-other)',
};

export const getCategoricalLineChartColor = (index: number): string =>
  CHART_CATEGORICAL_LINE_COLORS[index % CHART_CATEGORICAL_LINE_COLORS.length] ??
  CHART_CATEGORICAL_LINE_COLORS[0];

export const getCategoricalFillChartColor = (index: number): string =>
  CHART_CATEGORICAL_FILL_COLORS[index % CHART_CATEGORICAL_FILL_COLORS.length] ??
  CHART_SINGLE_FILL_COLOR;

const getPaletteIndexForKey = (key: string): number => {
  let hash = 0;
  for (const character of key) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
};

export const getLineChartColorForKey = (key: string): string =>
  getCategoricalLineChartColor(getPaletteIndexForKey(key));

export const getFillChartColorForKey = (key: string): string =>
  getCategoricalFillChartColor(getPaletteIndexForKey(key));

export const getCategoricalFillColor = (color: string): string => {
  const lineIndex = CHART_CATEGORICAL_LINE_COLORS.indexOf(color);
  return lineIndex === -1
    ? color
    : (CHART_CATEGORICAL_FILL_COLORS[lineIndex] ?? color);
};

export const getChartStatusColor = (
  ...labels: Array<string | undefined>
): string | undefined => {
  const normalized = labels.map((label) => label?.trim().toLowerCase());
  if (normalized.includes('success')) return CHART_STATUS_COLORS.positive;
  if (
    normalized.includes('error') ||
    normalized.some((label) => /^fail(?:ed|ing|ures?|s)?$/.test(label ?? ''))
  ) {
    return CHART_STATUS_COLORS.negative;
  }
  return undefined;
};

export type ChartColorResolver = (color: string) => string;

/** Resolve semantic CSS variables for renderers that run outside the DOM. */
const resolveChartColor = (
  color: string,
  resolvedMode: ResolvedThemeMode
): string => {
  if (typeof document === 'undefined') return color;

  const root = document.documentElement;
  if (root.dataset.theme && root.dataset.theme !== resolvedMode) return color;

  const styles = getComputedStyle(root);
  let resolved = color;
  for (let depth = 0; depth < 10 && resolved.includes('var('); depth += 1) {
    resolved = resolved.replace(
      /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*((?:[^()]|[a-z-]+\([^()]*\))+))?\)/gi,
      (match, property: string, fallback: string | undefined) =>
        styles.getPropertyValue(property).trim() || fallback?.trim() || match
    );
  }
  return resolved;
};

export const useChartColorResolver = (): ChartColorResolver => {
  const { resolvedMode } = useColorScheme();

  return useMemo(() => {
    const cache = new Map<string, string>();
    return (color: string) => {
      const cached = cache.get(color);
      if (cached !== undefined) return cached;

      const resolved = resolveChartColor(color, resolvedMode);
      if (!resolved.includes('var(')) cache.set(color, resolved);
      return resolved;
    };
  }, [resolvedMode]);
};
