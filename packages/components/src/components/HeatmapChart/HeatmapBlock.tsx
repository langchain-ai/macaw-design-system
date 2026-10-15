import { getCategoricalFillChartColor } from '../../utils/chartColors';
import { clamp } from '../../utils/clamp';
import { Tooltip } from '../Tooltip';

const BLOCK_SIZES = { sm: 12, md: 16, lg: 20 };
const BLOCK_COLORS = {
  yellow: getCategoricalFillChartColor(4),
  green: getCategoricalFillChartColor(2),
  red: getCategoricalFillChartColor(7),
  blue: getCategoricalFillChartColor(6),
};

export type HeatmapBlockSize = keyof typeof BLOCK_SIZES;
export type HeatmapBlockColor = keyof typeof BLOCK_COLORS;

export interface HeatmapBlockProps {
  opacity: number;
  size?: HeatmapBlockSize;
  color?: HeatmapBlockColor;
  label?: string;
}

export function HeatmapBlock({
  opacity,
  size = 'md',
  color = 'green',
  label,
}: HeatmapBlockProps) {
  const value = Number.isFinite(opacity) ? clamp(opacity, 0, 100) : 0;
  const dimension = BLOCK_SIZES[size];
  const accessibleLabel = label ?? `${value}%`;

  return (
    <Tooltip title={accessibleLabel} disableHoverableContent={false}>
      <span
        role="img"
        aria-label={accessibleLabel}
        tabIndex={0}
        className="inline-flex shrink-0 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ width: dimension, height: dimension }}
      >
        <svg width={dimension} height={dimension} aria-hidden="true">
          <rect
            width={dimension}
            height={dimension}
            fill={BLOCK_COLORS[color]}
            fillOpacity={value / 100}
          />
        </svg>
      </span>
    </Tooltip>
  );
}
