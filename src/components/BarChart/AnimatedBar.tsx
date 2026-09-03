import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react';

import { animated, type SpringValue } from '@react-spring/web';

import { clamp } from '../../utils/clamp';
import { cn } from '../../utils/cn';
import type {
  BarChartInteractionBar,
  BarChartOrientation,
  BarChartRenderedBar,
} from './BarChart.types';
import { getRoundedBarPath, toBarChartInteractionBar } from './BarChart.utils';

type AnimatedBarProps = {
  bar: BarChartRenderedBar;
  orientation: BarChartOrientation;
  animationProgress: SpringValue<number>;
  animationStart: number;
  animationEnd: number;
  /** Naming the bar is what makes it a keyboard target. */
  ariaLabel?: string;
  isDimmed: boolean;
  onPointerMove?: (
    bar: BarChartInteractionBar,
    event: PointerEvent<SVGPathElement>
  ) => void;
  onPointerOut?: () => void;
  onActivate?: (
    bar: BarChartInteractionBar,
    event: PointerEvent<SVGPathElement> | KeyboardEvent<SVGPathElement>
  ) => void;
  onFocus?: (
    bar: BarChartInteractionBar,
    event: FocusEvent<SVGPathElement>
  ) => void;
  onBlur?: (
    bar: BarChartInteractionBar,
    event: FocusEvent<SVGPathElement>
  ) => void;
};

export const AnimatedBar = ({
  bar,
  orientation,
  animationProgress,
  animationStart,
  animationEnd,
  ariaLabel,
  isDimmed,
  onPointerMove,
  onPointerOut,
  onActivate,
  onFocus,
  onBlur,
}: AnimatedBarProps) => {
  const interactionBar = toBarChartInteractionBar(bar);
  const isInteractive =
    onPointerMove != null || onPointerOut != null || onActivate != null;
  // A nameless bar must not claim the button role: it would be an unfocusable
  // control with no accessible name.
  const isButton = onActivate != null && ariaLabel != null;
  const handlePointerUp =
    onActivate == null
      ? undefined
      : (event: PointerEvent<SVGPathElement>) => {
          if (event.button !== 0) return;
          onActivate(interactionBar, event);
        };
  const handleKeyDown =
    onActivate == null
      ? undefined
      : (event: KeyboardEvent<SVGPathElement>) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onActivate(interactionBar, event);
        };
  const handlePointerDown = (event: PointerEvent<SVGPathElement>) => {
    // Chromium can match :focus-visible when a focusable SVG path is clicked.
    // Keep the focus indicator for keyboard navigation without showing it for
    // pointer interaction.
    if (
      event.pointerType === 'mouse' &&
      event.currentTarget.hasAttribute('tabindex')
    ) {
      event.preventDefault();
    }
  };

  return (
    <animated.path
      d={animationProgress.to((progress) => {
        const revealPosition =
          animationStart + (animationEnd - animationStart) * progress;
        let { x, y, width, height } = bar;

        if (orientation === 'vertical') {
          if (animationEnd < animationStart) {
            const visibleStart = clamp(revealPosition, y, y + height);
            height = y + height - visibleStart;
            y = visibleStart;
          } else {
            height = clamp(revealPosition, y, y + height) - y;
          }
        } else if (animationEnd < animationStart) {
          const visibleStart = clamp(revealPosition, x, x + width);
          width = x + width - visibleStart;
          x = visibleStart;
        } else {
          width = clamp(revealPosition, x, x + width) - x;
        }

        return getRoundedBarPath({
          x,
          y,
          width,
          height,
          radius: bar.cornerRadius,
          orientation,
          isNegative: bar.value < 0,
          roundEnd: bar.isStackEnd,
          cornerStyle: bar.cornerStyle,
        });
      })}
      fill={bar.color}
      opacity={isDimmed ? bar.opacity * 0.45 : bar.opacity}
      className={cn(
        'focus-visible:stroke-focus focus-visible:stroke-2 focus-visible:outline-none',
        isInteractive && 'cursor-pointer'
      )}
      data-bar-id={bar.id}
      tabIndex={ariaLabel == null ? undefined : 0}
      aria-label={ariaLabel}
      role={isButton ? 'button' : undefined}
      onPointerMove={
        onPointerMove == null
          ? undefined
          : (event) => onPointerMove(interactionBar, event)
      }
      onPointerDown={handlePointerDown}
      onPointerOut={onPointerOut}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      onFocus={
        onFocus == null ? undefined : (event) => onFocus(interactionBar, event)
      }
      onBlur={
        onBlur == null ? undefined : (event) => onBlur(interactionBar, event)
      }
    />
  );
};
