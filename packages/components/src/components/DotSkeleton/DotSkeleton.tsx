import type { CSSProperties } from 'react';

import { cn } from '../../utils/cn';

export interface DotSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
  style?: CSSProperties;
}

export function DotSkeleton({
  rows = 2,
  cols = 9,
  className,
  style,
}: DotSkeletonProps) {
  const size = 3;
  const step = 0.07;
  const count = rows * cols;

  const cycle = count * step + 0.6;

  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-grid align-middle', className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gap: size,
        ...style,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="lc-dot-skeleton__dot rounded-full bg-current"
          style={{
            width: size,
            height: size,
            animationDuration: `${cycle}s`,
            animationDelay: `${(i * step).toFixed(3)}s`,
          }}
        />
      ))}
    </span>
  );
}
