import { CHART_AXIS_LABEL_THICKNESS } from './chartConstants';

type ChartAxisLayout = { thickness: number };

export const getChartAxisLabelOffset = (thickness: number) =>
  Math.max(0, thickness - CHART_AXIS_LABEL_THICKNESS / 2);

export const getSecondaryChartAxisOffset = (
  axes: readonly ChartAxisLayout[],
  index: number
) => axes.slice(1, index).reduce((total, axis) => total + axis.thickness, 0);
