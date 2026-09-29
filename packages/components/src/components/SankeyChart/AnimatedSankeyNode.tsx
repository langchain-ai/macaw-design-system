import type { PointerEvent as ReactPointerEvent } from 'react';

import { animated, type SpringValue } from '@react-spring/web';

import { CHART_DIMMED_OPACITY } from '../../utils/chartConstants';
import { cn } from '../../utils/cn';
import { SANKEY_NODE_WIDTH } from './constants';
import type { SankeyChartLayoutNode } from './SankeyChart.types';

type AnimatedSankeyNodeProps = {
  node: SankeyChartLayoutNode;
  animationProgress: SpringValue<number>;
  ariaLabel?: string;
  isDimmed: boolean;
  onPointerMove?: (node: SankeyChartLayoutNode) => void;
  onPointerOut?: () => void;
  onActivate?: (node: SankeyChartLayoutNode) => void;
  onFocus?: (node: SankeyChartLayoutNode) => void;
  onBlur?: () => void;
};

/** Grows node rectangles out of their column's left edge. */
export const AnimatedSankeyNode = ({
  node,
  animationProgress,
  ariaLabel,
  isDimmed,
  onPointerMove,
  onPointerOut,
  onActivate,
  onFocus,
  onBlur,
}: AnimatedSankeyNodeProps) => {
  const isInteractive =
    onPointerMove != null || onPointerOut != null || onActivate != null;
  const isButton = onActivate != null && ariaLabel != null;
  const handlePointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    // Chromium can match :focus-visible when a focusable SVG rect is clicked.
    // Keep the focus indicator for keyboard navigation without showing it for
    // pointer interaction.
    if (
      (event.pointerType === 'mouse' || event.pointerType === 'pen') &&
      event.currentTarget.hasAttribute('tabindex')
    ) {
      event.preventDefault();
    }
  };

  return (
    <animated.rect
      x={node.x}
      width={animationProgress.to((progress) => SANKEY_NODE_WIDTH * progress)}
      y={node.y0}
      height={Math.max(0, node.y1 - node.y0)}
      fill={node.color}
      opacity={isDimmed ? CHART_DIMMED_OPACITY : 1}
      className={cn(
        'transition-opacity duration-fast focus:outline-none focus-visible:stroke-focus focus-visible:stroke-2 focus-visible:opacity-100 motion-reduce:transition-none',
        isInteractive && 'cursor-pointer'
      )}
      aria-label={ariaLabel}
      role={
        isButton
          ? 'button'
          : ariaLabel == null
            ? undefined
            : 'graphics-symbol img'
      }
      tabIndex={ariaLabel == null ? undefined : 0}
      data-node-id={node.id}
      onPointerMove={() => onPointerMove?.(node)}
      onPointerDown={handlePointerDown}
      onPointerOut={onPointerOut}
      onClick={onActivate == null ? undefined : () => onActivate(node)}
      onKeyDown={
        onActivate == null
          ? undefined
          : (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onActivate(node);
            }
      }
      onFocus={() => onFocus?.(node)}
      onBlur={onBlur}
    />
  );
};
