// Adapted from TurboKach/ai-native-react-components (MIT). See NOTICE.
import { forwardRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { cn } from '../../utils/cn';
import { VISUAL_ELEMENT_SIZES } from '../../utils/componentSizes';

import styles from './ThinkingState.module.css';

type ThinkingStateVariant = 'drive' | 'dots' | 'orbit';

const SIZES = {
  sm: VISUAL_ELEMENT_SIZES.xs.className,
  md: VISUAL_ELEMENT_SIZES.sm.className,
  lg: VISUAL_ELEMENT_SIZES.md.className,
};

interface LoadingIndicatorProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'children'
> {
  variant?: ThinkingStateVariant;
  /** Indicator outer size: sm=16px, md=20px, lg=24px. */
  size?: keyof typeof SIZES;
  tone?: 'neutral' | 'brand';
  /** Reduced-motion preferences always take precedence. */
  animated?: boolean;
}

const CHEVRON_DELAYS = [90, 180, 270, 0, 90, 180, 90, 180, 270];
const PATTERNS: Record<
  ThinkingStateVariant,
  { delays: (number | null)[]; duration: string }
> = {
  drive: { delays: CHEVRON_DELAYS, duration: '650ms' },
  dots: { delays: CHEVRON_DELAYS, duration: '650ms' },
  orbit: {
    delays: [0, 110, 220, 770, null, 330, 660, 550, 440],
    duration: '950ms',
  },
};

interface IndicatorStyle extends CSSProperties {
  '--loading-cycle': string;
}

/** Decorative indicator. Announce loading on the surrounding control or region. */
const LoadingIndicator = forwardRef<HTMLSpanElement, LoadingIndicatorProps>(
  function LoadingIndicator(
    {
      variant = 'drive',
      size = 'sm',
      tone = 'neutral',
      animated = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const pattern = PATTERNS[variant];
    const indicatorStyle: IndicatorStyle = {
      '--loading-cycle': pattern.duration,
      ...style,
    };

    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        data-animated={animated}
        className={cn(
          styles.grid,
          SIZES[size],
          'shrink-0',
          tone === 'brand' ? 'text-icon-brand' : 'text-icon-primary',
          className
        )}
        style={indicatorStyle}
      >
        {pattern.delays.map((delay, index) => (
          <span
            key={index}
            className={cn(
              styles.pixel,
              'bg-current',
              variant === 'dots' && styles.dot,
              delay === null && styles.inactive
            )}
            style={{ animationDelay: `${delay ?? 0}ms` }}
          />
        ))}
      </span>
    );
  }
);

export { LoadingIndicator };
export type { LoadingIndicatorProps, ThinkingStateVariant };
