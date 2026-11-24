// Proof of concept: ThinkingState with a LangChain plume indicator, drawn as an
// inline animated SVG. Not exported from the package yet; see the Storybook
// story under Components/Status/LCThinkingState.
import { forwardRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { cn } from '../../utils/cn';
import { PlumeGlyph } from '../PlumeLoader/PlumeGlyph';
import {
  CONVERGE_POINT_ROTATION,
  PLUME_TOP,
  hubDelay,
} from '../PlumeLoader/plumeGeometry';
import type {
  ConvergePoint,
  PlumeFlow,
  SegmentAnimation,
  StrandCount,
} from '../PlumeLoader/plumeGeometry';
import { Text } from '../Text';
import type { ThinkingStateProps } from './ThinkingState';
import { ThinkingStateTimer } from './ThinkingStateTimer';

import plumeStyles from '../PlumeLoader/PlumeLoader.module.css';
import styles from './ThinkingState.module.css';

type IndicatorSize = 'xs' | 'sm' | 'md' | 'lg';

interface IndicatorGeometry {
  px: number;
  strands: StrandCount;
  stem: number;
  strokeWidth: number;
  tipRadius: number;
}

/*
 * Matches LoadingIndicator's outer sizes. Smaller sizes draw fewer, heavier
 * strands so the plume still reads as a plume at 12px and 16px.
 */
const GEOMETRY: Record<IndicatorSize, IndicatorGeometry> = {
  xs: { px: 12, strands: 4, stem: 7, strokeWidth: 3.6, tipRadius: 3.2 },
  sm: { px: 16, strands: 6, stem: 9, strokeWidth: 2.8, tipRadius: 2.6 },
  md: { px: 20, strands: 8, stem: 12, strokeWidth: 2.2, tipRadius: 2.1 },
  lg: { px: 24, strands: 8, stem: 13, strokeWidth: 1.9, tipRadius: 1.9 },
};

interface PlumeIndicatorStyle extends CSSProperties {
  '--plume-cycle': string;
}

interface LCPlumeIndicatorProps extends Omit<
  ComponentPropsWithRef<'svg'>,
  'children'
> {
  size?: IndicatorSize;
  /** Diverge draws out from the single point; converge draws in to it. */
  flow?: PlumeFlow;
  /** Concurrent runs every strand together; independent runs each on its own random timing. */
  segmentAnimation?: SegmentAnimation;
  /** Where the single point sits. The strands open the other way. */
  convergePoint?: ConvergePoint;
  /** Brand is LangChain light blue (#7FC8FF) in both themes; neutral follows the icon colour. */
  tone?: 'neutral' | 'brand';
  /** Reduced-motion preferences always take precedence. */
  animated?: boolean;
  speed?: 'normal' | 'slow';
}

/** Decorative plume indicator. Announce loading on the surrounding region. */
const LCPlumeIndicator = forwardRef<SVGSVGElement, LCPlumeIndicatorProps>(
  function LCPlumeIndicator(
    {
      size = 'sm',
      flow = 'diverge',
      segmentAnimation = 'concurrent',
      convergePoint = 'down',
      tone = 'brand',
      animated = true,
      speed = 'normal',
      className,
      style,
      ...props
    },
    ref
  ) {
    const geometry = GEOMETRY[size];
    const delayScale = speed === 'slow' ? 2 : 1;
    const hubRadius = geometry.tipRadius * 1.3;
    // Centre the plume, from its highest tip dot to the bottom of its hub.
    const top = PLUME_TOP - geometry.tipRadius;
    const bottom = geometry.stem + hubRadius;
    const offsetY = -(top + bottom) / 2;
    const cycleMs = 2000 * delayScale;
    const indicatorStyle: PlumeIndicatorStyle = {
      '--plume-cycle': `${cycleMs}ms`,
      ...style,
    };

    return (
      <svg
        width={geometry.px}
        height={geometry.px}
        {...props}
        ref={ref}
        viewBox="-24 -24 48 48"
        aria-hidden="true"
        focusable="false"
        data-animated={animated}
        data-flow={flow}
        className={cn(
          plumeStyles.svg,
          'shrink-0',
          tone === 'brand' ? plumeStyles.brand : 'text-icon-primary',
          className
        )}
        style={indicatorStyle}
      >
        <g
          transform={`rotate(${CONVERGE_POINT_ROTATION[convergePoint]}) translate(0 ${offsetY})`}
        >
          <PlumeGlyph
            strands={geometry.strands}
            stem={geometry.stem}
            strokeWidth={geometry.strokeWidth}
            tipRadius={geometry.tipRadius}
            baseRadius={geometry.tipRadius}
            cycleMs={cycleMs}
            flow={flow}
            segmentAnimation={segmentAnimation}
            delayScale={delayScale}
          />
          <circle
            className={plumeStyles.hub}
            cx={0}
            cy={geometry.stem}
            r={hubRadius}
            style={{ animationDelay: `${hubDelay(flow) * delayScale}ms` }}
          />
        </g>
      </svg>
    );
  }
);

type LCThinkingStateProps = Omit<ThinkingStateProps, 'variant'> &
  Pick<LCPlumeIndicatorProps, 'flow' | 'segmentAnimation' | 'convergePoint'>;

/** ThinkingState with the LangChain plume indicator. Proof of concept. */
const LCThinkingState = forwardRef<HTMLDivElement, LCThinkingStateProps>(
  function LCThinkingState(
    {
      label = 'Thinking',
      size = 'sm',
      flow,
      segmentAnimation,
      convergePoint,
      tone = 'brand',
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
        <LCPlumeIndicator
          size={size}
          flow={flow}
          segmentAnimation={segmentAnimation}
          convergePoint={convergePoint}
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

export { LCPlumeIndicator, LCThinkingState };
export type { LCPlumeIndicatorProps, LCThinkingStateProps };
