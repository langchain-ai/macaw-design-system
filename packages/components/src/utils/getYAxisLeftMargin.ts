import { scaleLinear } from '@visx/scale';

import { getChartAxisThickness } from './chartAxisLayout';

const XYCHART_TICK_LENGTH = 4;

export interface GetYAxisLeftMarginArgs {
  yDomain: [number, number];
  formatTick: (value: number) => string;
  fontSize: number;
  numTicks: number;
  tickValues?: readonly number[];
  tickLength?: number;
  nice?: boolean;
}

export function getYAxisLeftMargin({
  yDomain,
  formatTick,
  fontSize,
  numTicks,
  tickValues,
  tickLength = XYCHART_TICK_LENGTH,
  nice = false,
}: GetYAxisLeftMarginArgs): number {
  const scale = scaleLinear({ domain: yDomain, range: [0, 100], nice });
  const resolvedTickValues = tickValues ?? scale.ticks(numTicks);

  return getChartAxisThickness({
    tickLabels: resolvedTickValues.map(formatTick),
    fontSize,
    tickLength,
  });
}
