import { useId, type SVGProps } from 'react';

import { animated, useReducedMotion, useSpring } from '@react-spring/web';

import {
  CHART_OTHER_COLOR,
  CHART_STATUS_COLORS,
  getCategoricalLineChartColor,
} from '../../utils/chartColors';
import { cn } from '../../utils/cn';

export interface SparkLinePoint {
  x: number;
  y: number;
}

export type SparkLineChartColor =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error';

export interface SparkLineChartProps extends Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'color'
> {
  data: readonly SparkLinePoint[];
  color?: SparkLineChartColor;
  /** Animates the chart unless reduced motion is preferred. Defaults to true. */
  shouldAnimate?: boolean;
  'aria-label'?: string;
}

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
const VERTICAL_PADDING = 2;
const SPARKLINE_COLORS: Record<SparkLineChartColor, string> = {
  brand: getCategoricalLineChartColor(0),
  neutral: CHART_OTHER_COLOR,
  success: CHART_STATUS_COLORS.positive,
  warning: CHART_STATUS_COLORS.warning,
  error: CHART_STATUS_COLORS.negative,
};

const getPaths = (data: readonly SparkLinePoint[]) => {
  const points = data.filter(
    ({ x, y }) => Number.isFinite(x) && Number.isFinite(y)
  );
  if (points.length < 2) return null;

  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;
  const usableHeight = VIEWBOX_HEIGHT - VERTICAL_PADDING * 2;

  const normalizedPoints = points.map(({ x, y }, index) => {
    const normalizedX =
      xSpan === 0
        ? (index / (points.length - 1)) * VIEWBOX_WIDTH
        : ((x - xMin) / xSpan) * VIEWBOX_WIDTH;
    const normalizedY =
      ySpan === 0
        ? VIEWBOX_HEIGHT / 2
        : VERTICAL_PADDING + (1 - (y - yMin) / ySpan) * usableHeight;
    return { x: normalizedX, y: normalizedY };
  });

  const pathPoints = normalizedPoints.map(({ x, y }) => `${x},${y}`);
  const firstX = normalizedPoints[0]?.x ?? 0;
  const lastX = normalizedPoints.at(-1)?.x ?? VIEWBOX_WIDTH;
  const line = `M${pathPoints.join(' L')}`;
  const area = `M${firstX},${VIEWBOX_HEIGHT} L${pathPoints.join(
    ' L'
  )} L${lastX},${VIEWBOX_HEIGHT} Z`;

  return { area, line };
};

export const SparkLineChart = ({
  data,
  color = 'brand',
  shouldAnimate = true,
  className,
  'aria-label': ariaLabel = 'Trend sparkline',
  ...props
}: SparkLineChartProps) => {
  const paths = getPaths(data);
  const gradientId = useId().replace(/:/g, '');
  const revealClipId = `${gradientId}-reveal`;
  const prefersReducedMotion = useReducedMotion();
  const spring = useSpring({
    from: { progress: 0 },
    to: { progress: paths == null ? 0 : 1 },
    config: { tension: 60, friction: 18 },
    immediate: (prefersReducedMotion ?? false) || !shouldAnimate,
  });

  return (
    <svg
      {...props}
      role="img"
      aria-label={ariaLabel}
      focusable="false"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('block h-full w-full', className)}
    >
      {paths != null && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={SPARKLINE_COLORS[color]}
                stopOpacity={0.18}
              />
              <stop
                offset="100%"
                stopColor={SPARKLINE_COLORS[color]}
                stopOpacity={0.02}
              />
            </linearGradient>
            <clipPath id={revealClipId}>
              <animated.rect
                x={0}
                y={0}
                width={spring.progress.to(
                  (progress) => progress * VIEWBOX_WIDTH
                )}
                height={VIEWBOX_HEIGHT}
              />
            </clipPath>
          </defs>
          <animated.path
            d={paths.area}
            fill={`url(#${gradientId})`}
            opacity={spring.progress}
          />
          <animated.path
            d={paths.line}
            fill="none"
            stroke={SPARKLINE_COLORS[color]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            clipPath={`url(#${revealClipId})`}
          />
        </>
      )}
    </svg>
  );
};
