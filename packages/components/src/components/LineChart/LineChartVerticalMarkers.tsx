import { getStringWidth } from '@visx/text';

import {
  CHART_DASHED_STROKE_DASHARRAY,
  CHART_TICK_FONT_SIZE,
} from '../../utils/chartConstants';
import type {
  LineChartVerticalMarker,
  LineChartVerticalMarkerVariant,
} from './LineChart.types';

/** Gap between a marker and its label, in px. */
const LABEL_OFFSET = 4;

const MARKER_COLORS: Record<LineChartVerticalMarkerVariant, string> = {
  default: 'var(--border-strong)',
  error: 'var(--border-error-strong)',
};

/**
 * Flips to the left of the marker when it would run past the plot and fits
 * there; otherwise stays right so at least its start is readable.
 */
const MarkerLabel = ({
  label,
  x,
  innerWidth,
}: {
  label: string;
  x: number;
  innerWidth: number;
}) => {
  const width =
    getStringWidth(label, { fontSize: `${CHART_TICK_FONT_SIZE}px` }) ?? 0;
  const placeLeft =
    x + LABEL_OFFSET + width > innerWidth && x - LABEL_OFFSET - width >= 0;
  return (
    <text
      x={placeLeft ? x - LABEL_OFFSET : x + LABEL_OFFSET}
      y={CHART_TICK_FONT_SIZE}
      fill="var(--text-tertiary)"
      fontSize={CHART_TICK_FONT_SIZE}
      textAnchor={placeLeft ? 'end' : 'start'}
    >
      {label}
    </text>
  );
};

export const LineChartVerticalMarkers = ({
  verticalMarkers,
  innerWidth,
  innerHeight,
  getXPosition,
}: {
  verticalMarkers: readonly LineChartVerticalMarker[];
  innerWidth: number;
  innerHeight: number;
  /** Same projection the crosshair uses, so band scales centre correctly. */
  getXPosition: (value: number) => number;
}) => (
  <>
    {verticalMarkers.map((marker) => {
      const x = getXPosition(marker.x);
      // Dropped rather than clamped: on an axis edge a marker reads as a bound
      // of the data rather than a moment in it.
      if (!Number.isFinite(x) || x < 0 || x > innerWidth) return null;
      return (
        <g key={marker.id}>
          <line
            x1={x}
            x2={x}
            y1={0}
            y2={innerHeight}
            stroke={MARKER_COLORS[marker.variant ?? 'default']}
            strokeWidth={1}
            strokeDasharray={CHART_DASHED_STROKE_DASHARRAY}
          />
          {marker.label != null && (
            <MarkerLabel label={marker.label} x={x} innerWidth={innerWidth} />
          )}
        </g>
      );
    })}
  </>
);
