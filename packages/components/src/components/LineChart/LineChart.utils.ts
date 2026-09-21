import { scaleBand, scaleLinear } from '@visx/scale';

import type {
  LineChartPoint,
  LineChartSeries,
  LineChartXScale,
} from './LineChart.types';

export type NormalizedLineChartSeries = Omit<LineChartSeries, 'points'> & {
  points: readonly LineChartPoint[];
};

type CreateLineChartXScaleAdapterArgs = {
  type: LineChartXScale;
  domain: readonly [number, number];
  values: readonly number[];
  width: number;
  nice: boolean;
};

export type LineChartScale =
  | ReturnType<typeof scaleBand<number>>
  | ReturnType<typeof scaleLinear<number>>;

export type LineChartXScaleAdapter = {
  scale: LineChartScale;
  getPosition: (value: number) => number;
  getValue: (position: number) => number;
  getRangePosition: (value: number) => number;
};

export const getSelectionBounds = (
  start: number | null,
  end: number | null,
  maximum: number
) => {
  if (
    start == null ||
    end == null ||
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  ) {
    return null;
  }
  const clampedStart = Math.max(0, Math.min(maximum, start));
  const clampedEnd = Math.max(0, Math.min(maximum, end));
  return {
    x: Math.min(clampedStart, clampedEnd),
    width: Math.abs(clampedEnd - clampedStart),
  };
};

const expandFlatDomain = (value: number): [number, number] => {
  const padding = Math.max(Math.abs(value) * 0.05, 1);
  return [value - padding, value + padding];
};

const interpolateValue = (
  value: number,
  inputs: readonly number[],
  outputs: readonly number[]
): number => {
  const firstInput = inputs[0];
  const firstOutput = outputs[0];
  if (firstInput == null || firstOutput == null) return 0;
  if (inputs.length === 1) return firstOutput;

  const lastInput = inputs.at(-1);
  const lastOutput = outputs.at(-1);
  if (lastInput == null || lastOutput == null) return firstOutput;

  const upperIndex = inputs.findIndex(
    (input, index) => index > 0 && value <= input
  );
  const resolvedUpperIndex = upperIndex === -1 ? inputs.length - 1 : upperIndex;
  const input = inputs[resolvedUpperIndex];
  const previousInput = inputs[resolvedUpperIndex - 1];
  const output = outputs[resolvedUpperIndex];
  const previousOutput = outputs[resolvedUpperIndex - 1];
  if (
    input == null ||
    previousInput == null ||
    output == null ||
    previousOutput == null
  ) {
    return lastOutput;
  }

  const inputDistance = input - previousInput;
  if (inputDistance === 0) return previousOutput;
  const ratio = (value - previousInput) / inputDistance;
  return previousOutput + ratio * (output - previousOutput);
};

export const createLineChartXScaleAdapter = ({
  type,
  domain,
  values,
  width,
  nice,
}: CreateLineChartXScaleAdapterArgs): LineChartXScaleAdapter => {
  if (type === 'band') {
    const scale = scaleBand<number>({
      domain: Array.from(values),
      range: [0, width],
      padding: 0.1,
    });
    const positions = values.map(
      (value) => (scale(value) ?? 0) + scale.bandwidth() / 2
    );
    const getBandPosition = (value: number) => {
      const firstValue = values[0];
      if (firstValue == null) return Number.NaN;
      if (values.length === 1 && value !== firstValue) {
        return value < firstValue ? -scale.step() : width + scale.step();
      }
      return interpolateValue(value, values, positions);
    };
    return {
      scale,
      getPosition: getBandPosition,
      getValue: (position: number) =>
        Math.max(
          domain[0],
          Math.min(domain[1], interpolateValue(position, positions, values))
        ),
      getRangePosition: getBandPosition,
    };
  }

  const scale = scaleLinear<number>({
    domain: Array.from(domain),
    range: [0, width],
    nice,
  });
  return {
    scale,
    getPosition: (value: number) => scale(value),
    getValue: (position: number) => scale.invert(position),
    getRangePosition: (value: number) => scale(value),
  };
};

export const getNumericDomain = (
  values: readonly number[],
  configuredDomain?: readonly [number, number]
): [number, number] => {
  if (
    configuredDomain != null &&
    Number.isFinite(configuredDomain[0]) &&
    Number.isFinite(configuredDomain[1])
  ) {
    const minimum = Math.min(configuredDomain[0], configuredDomain[1]);
    const maximum = Math.max(configuredDomain[0], configuredDomain[1]);
    return minimum === maximum ? expandFlatDomain(minimum) : [minimum, maximum];
  }

  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) return [0, 1];

  const minimum = Math.min(...finiteValues);
  const maximum = Math.max(...finiteValues);
  return minimum === maximum ? expandFlatDomain(minimum) : [minimum, maximum];
};

export const normalizeLineChartSeries = (
  series: readonly LineChartSeries[]
): readonly NormalizedLineChartSeries[] =>
  series.map((item) => ({
    ...item,
    points: item.points
      .reduce<LineChartPoint[]>((points, point) => {
        if (!Number.isFinite(point.x)) return points;
        points.push({
          x: point.x,
          y: point.y != null && Number.isFinite(point.y) ? point.y : null,
        });
        return points;
      }, [])
      .sort((left, right) => left.x - right.x),
  }));

export const getLineSegments = (
  points: readonly LineChartPoint[],
  connectNulls = true
): readonly LineChartPoint[][] => {
  if (connectNulls) {
    const validPoints = points.filter((point) => point.y != null);
    return validPoints.length === 0 ? [] : [validPoints];
  }

  const segments: LineChartPoint[][] = [];
  let current: LineChartPoint[] = [];

  for (const point of points) {
    if (point.y == null) {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push(point);
    }
  }

  if (current.length > 0) segments.push(current);
  return segments;
};

export const getLineChartYDomainValues = (
  points: readonly LineChartPoint[],
  domain: readonly [number, number],
  connectNulls = true
): number[] => {
  const values = points.flatMap((point) =>
    point.x >= domain[0] && point.x <= domain[1] && point.y != null
      ? [point.y]
      : []
  );
  const renderedPoints = connectNulls
    ? points.filter((point) => point.y != null)
    : points;

  for (let index = 1; index < renderedPoints.length; index += 1) {
    const previousPoint = renderedPoints[index - 1];
    const point = renderedPoints[index];
    if (
      previousPoint?.y == null ||
      point?.y == null ||
      previousPoint.x === point.x
    ) {
      continue;
    }

    for (const boundary of domain) {
      if (previousPoint.x >= boundary || point.x <= boundary) continue;
      const ratio = (boundary - previousPoint.x) / (point.x - previousPoint.x);
      values.push(previousPoint.y + ratio * (point.y - previousPoint.y));
    }
  }

  return values;
};
