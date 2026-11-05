import type { ReactNode } from 'react';

type ChartLegendListItem = {
  marker?: ReactNode;
  markerColor?: string;
  value?: ReactNode;
  secondaryValue?: ReactNode;
  selected?: boolean;
};

export type ChartLegendListColumns = {
  marker: boolean;
  value: boolean;
  secondaryValue: boolean;
  action: boolean;
};

export const getAccessibleText = (value: ReactNode) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'bigint'
    ? String(value)
    : undefined;

export const getChartLegendAriaLabel = (
  label: ReactNode,
  value?: ReactNode,
  secondaryValue?: ReactNode
) => {
  const labelText = getAccessibleText(label);
  if (labelText == null) return undefined;

  return [
    labelText,
    getAccessibleText(value),
    getAccessibleText(secondaryValue),
  ]
    .filter((item) => item != null)
    .join(', ');
};

export const getChartLegendListColumns = (
  items: readonly ChartLegendListItem[],
  hasItemClick: boolean
): ChartLegendListColumns => ({
  marker: items.some((item) => item.marker != null || item.markerColor != null),
  value: items.some((item) => item.value != null),
  secondaryValue: items.some((item) => item.secondaryValue != null),
  action: hasItemClick || items.some((item) => item.selected),
});

export const getChartLegendListGridTemplate = (
  columns: ChartLegendListColumns
) =>
  [
    ...(columns.marker ? ['auto'] : []),
    'minmax(0, 1fr)',
    ...(columns.value ? ['auto'] : []),
    ...(columns.secondaryValue ? ['auto'] : []),
    ...(columns.action ? ['auto'] : []),
  ].join(' ');

export const widthsMatch = (
  current: Record<string, number>,
  next: Record<string, number>
) => {
  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  return (
    currentKeys.length === nextKeys.length &&
    nextKeys.every((key) => current[key] === next[key])
  );
};
