import { animated, type SpringValue } from '@react-spring/web';

import { cn } from '../../utils/cn';
import {
  SANKEY_LINK_DIMMED_OPACITY,
  SANKEY_LINK_REST_OPACITY,
  SANKEY_NODE_WIDTH,
} from './constants';
import type { SankeyChartLayoutLink } from './SankeyChart.types';
import { getSankeyLinkPath } from './SankeyChart.utils';

type AnimatedSankeyLinkProps = {
  link: SankeyChartLayoutLink;
  animationProgress: SpringValue<number>;
  ariaLabel?: string;
  isDimmed: boolean;
  isEmphasized: boolean;
  onPointerMove?: (link: SankeyChartLayoutLink) => void;
  onPointerOut?: () => void;
  onActivate?: (link: SankeyChartLayoutLink) => void;
  onFocus?: (link: SankeyChartLayoutLink) => void;
  onBlur?: () => void;
};

/** Reveals links left-to-right with the chart's shared spring. */
export const AnimatedSankeyLink = ({
  link,
  animationProgress,
  ariaLabel,
  isDimmed,
  isEmphasized,
  onPointerMove,
  onPointerOut,
  onActivate,
  onFocus,
  onBlur,
}: AnimatedSankeyLinkProps) => {
  const isInteractive =
    onPointerMove != null || onPointerOut != null || onActivate != null;
  const opacity = isDimmed
    ? SANKEY_LINK_DIMMED_OPACITY
    : isEmphasized
      ? 1
      : SANKEY_LINK_REST_OPACITY;

  return (
    <animated.path
      d={animationProgress.to((progress) => {
        const sourceX = link.source.x + SANKEY_NODE_WIDTH * progress;
        return getSankeyLinkPath({
          sourceX,
          targetX: sourceX + (link.target.x - sourceX) * progress,
          y0: link.y0,
          y1: link.y1,
          width: link.width,
        });
      })}
      fill={link.color}
      opacity={opacity}
      className={cn(
        'transition-opacity duration-fast focus:outline-none focus-visible:stroke-focus focus-visible:stroke-2 focus-visible:opacity-100 motion-reduce:transition-none',
        isInteractive && 'cursor-pointer'
      )}
      aria-label={ariaLabel}
      role={
        ariaLabel == null
          ? undefined
          : onActivate != null
            ? 'button'
            : 'graphics-symbol img'
      }
      tabIndex={ariaLabel == null ? undefined : 0}
      data-link-id={link.id}
      onPointerMove={() => onPointerMove?.(link)}
      onPointerOut={onPointerOut}
      onClick={onActivate == null ? undefined : () => onActivate(link)}
      onKeyDown={
        onActivate == null
          ? undefined
          : (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onActivate(link);
            }
      }
      onFocus={() => onFocus?.(link)}
      onBlur={onBlur}
    />
  );
};
