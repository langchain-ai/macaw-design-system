import type { CSSProperties } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';

export type ChartCardSkeletonVariant =
  | 'bar'
  | 'line'
  | 'donut'
  | 'metric'
  | 'sparkline';

const BAR_HEIGHTS = ['35%', '62%', '48%', '78%', '55%', '70%', '42%'] as const;

const LegendSkeleton = () => (
  <div aria-hidden="true" className="flex min-w-0 items-center gap-space-2">
    <Skeleton className="h-4 w-20 motion-reduce:animate-none" />
    <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
    <Skeleton className="h-4 w-16 motion-reduce:animate-none" />
  </div>
);

const Plot = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-0 flex-1 border-b border-l border-muted">
    {/* Anchor percentage-sized marks to the plot even in auto-height cards. */}
    <div className="absolute inset-0 flex px-space-2">{children}</div>
  </div>
);

export const ChartCardSkeleton = ({
  variant,
  className,
  style,
}: {
  variant: ChartCardSkeletonVariant;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    role="status"
    aria-label="Loading chart"
    style={style}
    className={cn(
      'flex min-h-[13.5rem] flex-1 flex-col gap-space-2',
      variant === 'metric' && 'min-h-0',
      className
    )}
  >
    {variant === 'bar' && (
      <Plot>
        <div className="flex size-full items-end gap-space-2">
          {BAR_HEIGHTS.map((height, index) => (
            <Skeleton
              key={index}
              className="min-w-0 flex-1 rounded-b-none rounded-t-md motion-reduce:animate-none"
              style={{ height }}
            />
          ))}
        </div>
      </Plot>
    )}
    {(variant === 'line' || variant === 'sparkline') && (
      <Plot>
        <Skeleton
          className="size-full rounded-none motion-reduce:animate-none"
          style={{
            clipPath:
              'polygon(0 63%, 20% 43%, 38% 56%, 60% 26%, 78% 40%, 100% 13%, 100% 17%, 78% 44%, 60% 30%, 38% 60%, 20% 47%, 0 67%)',
          }}
        />
      </Plot>
    )}
    {variant === 'donut' && (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="size-32 animate-pulse rounded-full border-[1.5rem] border-muted motion-reduce:animate-none" />
      </div>
    )}
    {variant === 'metric' && (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-space-2">
        <Skeleton className="h-9 w-1/2 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
      </div>
    )}
    {variant !== 'metric' && <LegendSkeleton />}
  </div>
);
