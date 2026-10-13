import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { SPACE_SCALE_PX } from '../../utils/spacing';
import { Text } from '../Text';

export type MetricChartSize = 'sm' | 'md' | 'lg' | 'xl';

export type MetricChartUnit =
  | 'days'
  | 'hours'
  | 'issues'
  | 'milliseconds'
  | 'minutes'
  | 'requests'
  | 'seconds'
  | 'tokens'
  | 'traces';

export interface MetricChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  value: string | number;
  unit?: MetricChartUnit;
  secondaryContent?: ReactNode;
  layout?: 'default' | 'centered';
  size?: MetricChartSize;
}

const VALUE_VARIANTS: Record<MetricChartSize, 'h1' | 'h2' | 'h3'> = {
  sm: 'h3',
  md: 'h2',
  lg: 'h1',
  xl: 'h1',
};

const getApproximateFontSize = (value: string | number) => {
  const approximateCharacterWidth = Math.max(String(value).length, 1) * 0.5;
  const horizontalPadding = SPACE_SCALE_PX[3] * 2;

  return `min(80px, calc(${100 / approximateCharacterWidth}cqi - ${horizontalPadding / approximateCharacterWidth}px))`;
};

export const MetricChart = forwardRef<HTMLDivElement, MetricChartProps>(
  (
    {
      value,
      unit,
      secondaryContent,
      layout = 'default',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const isCentered = layout === 'centered';
    const hasUnit = unit != null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-w-0 flex-col',
          size === 'xl' ? 'gap-space-2' : 'gap-space-1',
          size === 'xl' && '@container',
          isCentered && 'items-center justify-center text-center',
          className
        )}
        {...props}
      >
        <Text
          as="div"
          variant={VALUE_VARIANTS[size]}
          weight="semibold"
          color="primary"
          className={cn(
            'min-w-0 max-w-full tabular-nums',
            size === 'xl' && 'whitespace-nowrap',
            size !== 'xl' && !hasUnit && 'break-words',
            hasUnit &&
              'flex items-baseline gap-space-1 overflow-hidden whitespace-nowrap',
            isCentered && 'text-center'
          )}
          style={
            size === 'xl'
              ? { fontSize: getApproximateFontSize(value) }
              : undefined
          }
        >
          {hasUnit ? (
            <>
              <span className="shrink-0">{value}</span>
              <Text
                as="span"
                variant="xs"
                weight="normal"
                color="secondary"
                className="min-w-0 truncate"
              >
                {unit}
              </Text>
            </>
          ) : (
            value
          )}
        </Text>
        {secondaryContent != null && (
          <div
            className={cn(
              'flex min-w-0 flex-wrap items-center gap-space-1',
              isCentered && 'justify-center text-center'
            )}
          >
            {secondaryContent}
          </div>
        )}
      </div>
    );
  }
);

MetricChart.displayName = 'MetricChart';
