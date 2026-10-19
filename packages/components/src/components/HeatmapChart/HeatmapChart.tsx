import {
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';

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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  let cellCount = 0;
  const rowOffsets = data.map((row) => {
    const offset = cellCount;
    cellCount += row.length;
    return offset;
  });
  const activeIndex = Math.min(focusedIndex, Math.max(0, cellCount - 1));

  function moveFocus(
    event: KeyboardEvent<HTMLSpanElement>,
    row: number,
    column: number
  ) {
    const offset = rowOffsets[row];
    const length = data[row].length;
    let nextIndex = offset + column;
    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = offset + Math.max(0, column - 1);
        break;
      case 'ArrowRight':
        nextIndex = offset + Math.min(length - 1, column + 1);
        break;
      case 'ArrowUp':
      case 'ArrowDown': {
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        let nextRow = row + direction;
        while (nextRow >= 0 && nextRow < data.length) {
          if (data[nextRow].length > 0) {
            nextIndex =
              rowOffsets[nextRow] + Math.min(column, data[nextRow].length - 1);
            break;
          }
          nextRow += direction;
        }
        break;
      }
      case 'Home':
        nextIndex = event.ctrlKey ? 0 : offset;
        break;
      case 'End':
        nextIndex = event.ctrlKey ? cellCount - 1 : offset + length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    cellRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn('w-full min-w-0 overflow-x-auto', className)}
    >
      <div className="gap-space-1 p-space-1 flex w-max flex-col">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="gap-space-1 flex">
            {row.map((value, columnIndex) => (
              <HeatmapBlock
                key={columnIndex}
                ref={(element) => {
                  cellRefs.current[rowOffsets[rowIndex] + columnIndex] =
                    element;
                }}
                tabIndex={
                  rowOffsets[rowIndex] + columnIndex === activeIndex ? 0 : -1
                }
                onFocus={() =>
                  setFocusedIndex(rowOffsets[rowIndex] + columnIndex)
                }
                onKeyDown={(event) => moveFocus(event, rowIndex, columnIndex)}
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
