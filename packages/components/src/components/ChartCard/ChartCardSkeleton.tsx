import type { CSSProperties } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';

export type ChartCardSkeletonVariant =
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'donut'
  | 'metric'
  | 'sparkline'
  | 'radar'
  | 'heatmap'
  | 'sankey';

const HORIZONTAL_BAR_WIDTHS = ['35%', '62%', '48%', '78%', '55%'] as const;

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
    {variant === 'horizontal-bar' && (
      <Plot>
        <div className="flex size-full flex-col gap-space-2 py-space-2">
          {HORIZONTAL_BAR_WIDTHS.map((width, index) => (
            <Skeleton
              key={index}
              className="min-h-0 flex-1 rounded-l-none rounded-r-md motion-reduce:animate-none"
              style={{ width }}
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
    {variant === 'sankey' && (
      <div aria-hidden="true" className="relative min-h-0 flex-1">
        <svg
          viewBox="0 0 400 192"
          preserveAspectRatio="none"
          focusable="false"
          fill="var(--bg-surface-level-3)"
          className="absolute inset-0 size-full animate-pulse motion-reduce:animate-none"
        >
          <g opacity={0.5}>
            {[0, 184].map((offset) => (
              <g key={offset} transform={`translate(${offset} 0)`}>
                <path d="M20 12H196V60H20Z" />
                <path d="M20 60C108 60 108 108 196 108V132C108 132 108 84 20 84Z" />
                <path d="M20 108C108 108 108 60 196 60V84C108 84 108 132 20 132Z" />
                <path d="M20 132H196V180H20Z" />
              </g>
            ))}
          </g>
          {[12, 196, 380].map((x) => (
            <g key={x}>
              <rect x={x} y={12} width={8} height={72} />
              <rect x={x} y={108} width={8} height={72} />
            </g>
          ))}
        </svg>
      </div>
    )}
    {variant === 'radar' && (
      <div aria-hidden="true" className="relative min-h-0 flex-1">
        <svg
          // Match the radar chart's plot and outside-label space.
          viewBox="0 0 440 340"
          focusable="false"
          fill="var(--bg-surface-level-3)"
          className="absolute inset-0 size-full animate-pulse motion-reduce:animate-none"
        >
          <g fill="none" stroke="var(--border-muted)">
            {/* Concentric diamonds suggest axes without implying loaded data. */}
            <path d="M220 74 316 170 220 266 124 170Z" />
            <path d="M220 122 268 170 220 218 172 170Z" />
            <path d="M220 74V266M124 170H316" />
          </g>
          <path d="M220 90 294 170 220 242 178 170Z" opacity={0.6} />
          {/* Paired bars stand in for the four axis names and values. */}
          {[
            [196, 34],
            [340, 156],
            [196, 294],
            [52, 156],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <rect width={48} height={8} rx={4} />
              <rect x={12} y={14} width={24} height={6} rx={3} />
            </g>
          ))}
        </svg>
      </div>
    )}
    {variant === 'heatmap' && (
      <div
        aria-hidden="true"
        className="grid min-h-0 flex-1 grid-cols-15 grid-rows-6 gap-space-1"
      >
        {/* A 6-by-15 grid balances a recognizable matrix with visual breathing room. */}
        {Array.from({ length: 6 * 15 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-full min-h-0 rounded-xs motion-reduce:animate-none"
          />
        ))}
      </div>
    )}
    {variant === 'metric' && (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-space-2">
        <Skeleton className="h-9 w-1/2 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
      </div>
    )}
    {variant !== 'metric' && variant !== 'heatmap' && <LegendSkeleton />}
  </div>
);
