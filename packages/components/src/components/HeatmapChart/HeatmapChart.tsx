import type { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import { HeatmapBlock, type HeatmapBlockProps } from './HeatmapBlock';

export interface HeatmapChartProps extends HTMLAttributes<HTMLDivElement> {
  data: readonly (readonly number[])[];
  size?: HeatmapBlockProps['size'];
  color?: HeatmapBlockProps['color'];
  getBlockLabel?: (value: number, row: number, column: number) => string;
}

export function HeatmapChart({
  data,
  size = 'md',
  color = 'green',
  getBlockLabel = (value, row, column) =>
    `Row ${row + 1}, column ${column + 1}: ${value}%`,
  className,
  'aria-label': ariaLabel = 'Heatmap',
  ...props
}: HeatmapChartProps) {
  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn('w-full min-w-0 overflow-x-auto', className)}
    >
      <div className="flex w-max flex-col gap-space-1 p-space-1">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-space-1">
            {row.map((value, columnIndex) => (
              <HeatmapBlock
                key={columnIndex}
                opacity={value}
                size={size}
                color={color}
                label={getBlockLabel(value, rowIndex, columnIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
