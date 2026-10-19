import { forwardRef, type ComponentPropsWithoutRef } from 'react';

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

export interface HeatmapBlockProps extends Pick<
  ComponentPropsWithoutRef<'span'>,
  'tabIndex' | 'onFocus' | 'onKeyDown'
> {
  opacity: number;
  size?: HeatmapBlockSize;
  color?: HeatmapBlockColor;
  label?: string;
}

export const HeatmapBlock = forwardRef<HTMLSpanElement, HeatmapBlockProps>(
  function HeatmapBlock(
    {
      opacity,
      size = 'md',
      color = 'green',
      label,
      tabIndex = 0,
      onFocus,
      onKeyDown,
    },
    ref
  ) {
    const value = Number.isFinite(opacity) ? clamp(opacity, 0, 100) : 0;
    const dimension = BLOCK_SIZES[size];
    const accessibleLabel = label ?? `${value}%`;

    return (
      <Tooltip title={accessibleLabel} disableHoverableContent={false}>
        <span
          ref={ref}
          role="img"
          aria-label={accessibleLabel}
          tabIndex={tabIndex}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className="text-primary inline-flex shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
);
