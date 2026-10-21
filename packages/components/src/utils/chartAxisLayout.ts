import { getStringWidth } from '@visx/text';

import {
  CHART_AXIS_LABEL_THICKNESS,
  CHART_TICK_FONT_SIZE,
  CHART_TICK_LABEL_DX_EM,
  CHART_VALUE_AXIS_TICK_LENGTH,
} from './chartConstants';

/** Measures a side axis, or uses a supplied tick-label height for a top/bottom axis. */
export const getChartAxisThickness = ({
  tickLabels,
  label,
  tickLabelThickness,
  fontSize = CHART_TICK_FONT_SIZE,
  tickLength = CHART_VALUE_AXIS_TICK_LENGTH,
  tickLabelOffsetEm = CHART_TICK_LABEL_DX_EM,
}: {
  tickLabels: readonly string[];
  label?: string;
  tickLabelThickness?: number;
  fontSize?: number;
  tickLength?: number;
  tickLabelOffsetEm?: number;
}) => {
  const measuredThickness =
    tickLabelThickness ??
    Math.ceil(
      Math.max(
        0,
        ...tickLabels.map(
          (text) => getStringWidth(text, { fontSize: `${fontSize}px` }) ?? 0
        )
      )
    ) +
      tickLength +
      fontSize * tickLabelOffsetEm;

  return measuredThickness + (label == null ? 0 : CHART_AXIS_LABEL_THICKNESS);
};

type ChartAxisLayout = { thickness: number };

export const getChartAxisLabelOffset = (thickness: number) =>
  Math.max(0, thickness - CHART_AXIS_LABEL_THICKNESS / 2);

export const getSecondaryChartAxisOffset = (
  axes: readonly ChartAxisLayout[],
  index: number
) => axes.slice(1, index).reduce((total, axis) => total + axis.thickness, 0);
