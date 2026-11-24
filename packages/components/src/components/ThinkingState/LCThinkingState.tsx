// Proof of concept: a LangChain fan-out variant of ThinkingState, drawn as an
// inline animated SVG. Not exported from the package yet; see the Storybook
// story under Components/Status/LCThinkingState.
import { forwardRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { cn } from '../../utils/cn';
import { Text } from '../Text';
import type { ThinkingStateProps } from './ThinkingState';
import { ThinkingStateTimer } from './ThinkingStateTimer';

import fanStyles from './LCThinkingState.module.css';
import styles from './ThinkingState.module.css';

type FanSize = 'xs' | 'sm' | 'md' | 'lg';

/** Outer size in px, matching LoadingIndicator: xs=12, sm=16, md=20, lg=24. */
const PIXELS: Record<FanSize, number> = { xs: 12, sm: 16, md: 20, lg: 24 };

const ROOT = { x: 4, y: 12 };

interface FanGeometry {
  /** End nodes in a 24×24 viewBox, fanning out from ROOT. */
  leaves: { x: number; y: number; delay: number }[];
  stroke: number;
  leafRadius: number;
  rootRadius: number;
}

/*
 * Small sizes draw three thicker branches so the fan still reads at 12–16px;
 * larger sizes draw five. Delays run from the middle branch outward.
 */
const COMPACT: FanGeometry = {
  leaves: [
    { x: 17.4, y: 3.6, delay: 160 },
    { x: 20, y: 12, delay: 0 },
    { x: 17.4, y: 20.4, delay: 160 },
  ],
  stroke: 2.2,
  leafRadius: 2.6,
  rootRadius: 3.4,
};

const FULL: FanGeometry = {
  leaves: [
    { x: 17.6, y: 2.83, delay: 240 },
    { x: 19.68, y: 7.2, delay: 120 },
    { x: 20.4, y: 12, delay: 0 },
    { x: 19.68, y: 16.8, delay: 120 },
    { x: 17.6, y: 21.17, delay: 240 },
  ],
  stroke: 1.6,
  leafRadius: 2,
  rootRadius: 3,
};

/** Branch path from just outside the root to just short of the leaf. */
function branchPath(
  leaf: { x: number; y: number },
  geometry: FanGeometry
): string {
  const dx = leaf.x - ROOT.x;
  const dy = leaf.y - ROOT.y;
  const length = Math.hypot(dx, dy);
  const start = geometry.rootRadius + 1.6;
  const end = geometry.leafRadius + 0.8;
  const f = (n: number) => n.toFixed(2);
  return `M${f(ROOT.x + (dx / length) * start)} ${f(ROOT.y + (dy / length) * start)}L${f(leaf.x - (dx / length) * end)} ${f(leaf.y - (dy / length) * end)}`;
}

interface FanStyle extends CSSProperties {
  '--fan-cycle': string;
}

interface LCFanOutIndicatorProps extends Omit<
  ComponentPropsWithRef<'svg'>,
  'children'
> {
  size?: FanSize;
  tone?: 'neutral' | 'brand';
  /** Reduced-motion preferences always take precedence. */
  animated?: boolean;
  speed?: 'normal' | 'slow';
}

/** Decorative fan-out indicator. Announce loading on the surrounding region. */
const LCFanOutIndicator = forwardRef<SVGSVGElement, LCFanOutIndicatorProps>(
  function LCFanOutIndicator(
    {
      size = 'sm',
      tone = 'neutral',
      animated = true,
      speed = 'normal',
      className,
      style,
      ...props
    },
    ref
  ) {
    const geometry = size === 'xs' || size === 'sm' ? COMPACT : FULL;
    const scale = speed === 'slow' ? 2 : 1;
    const px = PIXELS[size];
    const fanStyle: FanStyle = {
      '--fan-cycle': `${1800 * scale}ms`,
      ...style,
    };

    return (
      <svg
        width={px}
        height={px}
        {...props}
        ref={ref}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        data-animated={animated}
        className={cn(
          fanStyles.fan,
          'shrink-0',
          tone === 'brand' ? 'text-icon-brand' : 'text-icon-primary',
          className
        )}
        style={fanStyle}
      >
        {geometry.leaves.map((leaf, index) => (
          <path
            key={`track-${index}`}
            className={fanStyles.track}
            d={branchPath(leaf, geometry)}
            strokeWidth={geometry.stroke}
          />
        ))}
        {geometry.leaves.map((leaf, index) => (
          <path
            key={`branch-${index}`}
            className={fanStyles.branch}
            d={branchPath(leaf, geometry)}
            pathLength={1}
            strokeWidth={geometry.stroke}
            style={{ animationDelay: `${leaf.delay * scale}ms` }}
          />
        ))}
        {geometry.leaves.map((leaf, index) => (
          <circle
            key={`leaf-${index}`}
            className={fanStyles.leaf}
            cx={leaf.x}
            cy={leaf.y}
            r={geometry.leafRadius}
            style={{ animationDelay: `${leaf.delay * scale}ms` }}
          />
        ))}
        <circle
          className={fanStyles.root}
          cx={ROOT.x}
          cy={ROOT.y}
          r={geometry.rootRadius}
        />
      </svg>
    );
  }
);

type LCThinkingStateProps = Omit<ThinkingStateProps, 'variant'>;

/** ThinkingState with the LangChain fan-out indicator. Proof of concept. */
const LCThinkingState = forwardRef<HTMLDivElement, LCThinkingStateProps>(
  function LCThinkingState(
    {
      label = 'Thinking',
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
          'inline-flex max-w-full items-center gap-space-2 align-middle',
          className
        )}
      >
        <LCFanOutIndicator
          size={size}
          tone={tone}
          animated={motion !== 'none'}
          speed={speed}
        />
        <span className="inline-flex min-w-0 items-baseline gap-space-2">
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

export { LCFanOutIndicator, LCThinkingState };
export type { LCFanOutIndicatorProps, LCThinkingStateProps };
