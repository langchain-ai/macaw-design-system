import { forwardRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Text } from '../Text';
import {
  LoadingIndicator,
  type LoadingIndicatorProps,
} from './LoadingIndicator';
import { ThinkingStateTimer } from './ThinkingStateTimer';

import styles from './ThinkingState.module.css';

interface ThinkingStateProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /** Short, noninteractive description of the work in progress. */
  label?: ReactNode;
  variant?: LoadingIndicatorProps['variant'];
  size?: LoadingIndicatorProps['size'];
  tone?: LoadingIndicatorProps['tone'];
  /** Full animates the grid and label; subtle animates only the grid; none is static. */
  motion?: 'full' | 'subtle' | 'none';
  speed?: LoadingIndicatorProps['speed'];
  /** Opt in to elapsed time for longer waits. Hidden by default. */
  showElapsed?: boolean;
  /** Supply elapsed milliseconds from the operation to disable the internal clock. */
  elapsedMs?: number;
  /** Seconds updates once per second; tenths preserves the finer-grained source timer. */
  timerPrecision?: 'seconds' | 'tenths';
}

/** Inline status for active AI work. Remount with a new key for a new operation. */
const ThinkingState = forwardRef<HTMLDivElement, ThinkingStateProps>(
  function ThinkingState(
    {
      label = 'Thinking',
      variant = 'drive',
      size = 'sm',
      tone = 'neutral',
      motion = 'full',
      speed = 'normal',
      showElapsed = false,
      elapsedMs,
      timerPrecision = 'seconds',
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'gap-space-2 inline-flex max-w-full items-center align-middle',
          className
        )}
      >
        <LoadingIndicator
          variant={variant}
          size={size}
          tone={tone}
          animated={motion !== 'none'}
          speed={speed}
        />
        <span className="gap-space-2 inline-flex min-w-0 items-baseline">
          <Text
            as="span"
            variant={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'}
            weight={size === 'xs' ? 'normal' : 'medium'}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'min-w-0 break-words',
              size === 'xs' ? 'leading-snug tracking-normal' : 'leading-4',
              motion === 'full' ? styles.shimmer : 'text-secondary',
              motion === 'full' && tone === 'brand' && styles.brandShimmer,
              speed === 'slow' && styles.slow
            )}
          >
            {label}
          </Text>
          <ThinkingStateTimer
            visible={showElapsed}
            elapsedMs={elapsedMs}
            precision={timerPrecision}
            size={size}
          />
        </span>
      </div>
    );
  }
);

export { ThinkingState };
export type { ThinkingStateProps };
