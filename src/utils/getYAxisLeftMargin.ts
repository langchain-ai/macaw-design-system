import { scaleLinear } from '@visx/scale';
import { getStringWidth } from '@visx/text';

const XYCHART_TICK_LENGTH = 4;
const TICK_LABEL_DX_EM = 0.25;

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

  const tickLabelStyle = { fontSize: `${fontSize}px` };
  const maxLabelWidth = Math.max(
    0,
    ...resolvedTickValues.map(
      (value) => getStringWidth(formatTick(value), tickLabelStyle) ?? 0
    )
  );

  return Math.ceil(maxLabelWidth) + tickLength + TICK_LABEL_DX_EM * fontSize;
}
