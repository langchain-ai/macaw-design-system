import { useMemo, useState, type HTMLAttributes } from 'react';

import { useResizeObserver } from '@mantine/hooks';
import { useReducedMotion, useSpring } from '@react-spring/web';

import { getCategoricalFillChartColor } from '../../utils/chartColors';
import { cn } from '../../utils/cn';
import {
  ChartLegend,
  getAccessibleText,
  type ChartLegendItem,
  type ChartLegendProps,
} from '../ChartLegend';
import { AnimatedSankeyLink } from './AnimatedSankeyLink';
import { AnimatedSankeyNode } from './AnimatedSankeyNode';
import {
  SANKEY_MINIMUM_PLOT_WIDTH,
  SANKEY_NODE_LABEL_WIDTH,
} from './constants';
import type {
  SankeyChartAlignment,
  SankeyChartInteractionProps,
  SankeyChartLayoutLink,
  SankeyChartLayoutNode,
  SankeyChartLink,
  SankeyChartNode,
  SankeyChartSlots,
} from './SankeyChart.types';
import { getSankeyChartLayout } from './SankeyChart.utils';
import { SankeyNodeLabel } from './SankeyNodeLabel';
import { getSankeyNodeLabels } from './SankeyNodeLabel.utils';

export type SankeyChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'aria-label'
> &
  SankeyChartInteractionProps & {
    nodes: readonly SankeyChartNode[];
    links: readonly SankeyChartLink[];
    /** Column assignment strategy. Defaults to `justified`. */
    alignment?: SankeyChartAlignment;
    /** Vertical gap between nodes in one column, in SVG pixels. Defaults to 12. */
    nodePadding?: number;
    /** Controlled legend filter. An empty set renders every node. */
    selectedIds?: ReadonlySet<string>;
    /** Emphasizes one node and the links touching it; dims the rest. */
    activeNodeId?: string | null;
    /** Emphasizes one link and its endpoint nodes; dims the rest. */
    activeLinkId?: string | null;
    /** Emphasizes marks represented by one external legend item. Built-in legends set this automatically. */
    activeLegendItemId?: string | null;
    /** Minimum plot width before scrolling. Defaults to 160; 0 allows smaller plots. Stage spacing is always preserved. */
    minimumPlotWidth?: number;
    /** Animates the diagram unless reduced motion is preferred. Defaults to true. */
    shouldAnimate?: boolean;
    /** Set false to drop the marks while a parent is actively resizing. Defaults to true. */
    isRendering?: boolean;
    /** Defaults to true when the chart has more than one node. */
    showLegend?: boolean;
    /** Forwarded to the rendered `ChartLegend`. Inert when there is no legend. */
    legendProps?: Omit<ChartLegendProps, 'items'>;
    slots?: SankeyChartSlots;
    'aria-label'?: string;
    'aria-describedby'?: string;
    /** Overrides the node's accessible name. Defaults to its ariaLabel, text label, then ID. */
    getNodeAriaLabel?: (node: SankeyChartLayoutNode) => string | undefined;
    /** Names a link and makes it a keyboard target. Actionable/focusable links default to endpoints and value. */
    getLinkAriaLabel?: (link: SankeyChartLayoutLink) => string | undefined;
  };

/**
 * Renders weighted flows with automatic columns and source-colored links.
 * Consumers own data, value formatting, tooltips, and navigation; compose with
 * ChartCard, ChartTooltip, and ChartLegend. Slots customize SVG labels and overlays.
 */
export const SankeyChart = ({
  nodes,
  links,
  alignment = 'justified',
  nodePadding,
  selectedIds,
  activeNodeId,
  activeLinkId,
  activeLegendItemId,
  minimumPlotWidth = SANKEY_MINIMUM_PLOT_WIDTH,
  shouldAnimate = true,
  isRendering = true,
  showLegend,
  legendProps,
  slots,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  getNodeAriaLabel,
  getLinkAriaLabel,
  onNodePointerMove,
  onNodePointerOut,
  onNodeActivate,
  onNodeFocus,
  onNodeBlur,
  onLinkPointerMove,
  onLinkPointerOut,
  onLinkActivate,
  onLinkFocus,
  onLinkBlur,
  ...rest
}: SankeyChartProps) => {
  const [containerRef, dimensions] = useResizeObserver();
  const [activeBuiltInLegendItemId, setActiveBuiltInLegendItemId] = useState<
    string | null
  >(null);
  const isReducedMotion = (useReducedMotion() ?? false) || !shouldAnimate;

  const normalizedNodes = useMemo(
    () =>
      nodes.map((node, index) => ({
        ...node,
        color: node.color ?? getCategoricalFillChartColor(index),
      })),
    [nodes]
  );
  // Labels sit beside the node rectangles: right of them for every column but
  // the last, which flips left. Narrow containers skip the built-in labels
  // entirely — the legend still names every node — so the plot keeps its width.
  const hasLabels = dimensions.width >= 480;
  const chartMargin = {
    top: 8,
    right: (hasLabels ? SANKEY_NODE_LABEL_WIDTH : 0) + 8,
    bottom: 8,
    left: (hasLabels ? SANKEY_NODE_LABEL_WIDTH : 0) + 8,
  };
  const innerWidth =
    dimensions.width === 0
      ? 0
      : Math.max(
          0,
          minimumPlotWidth,
          dimensions.width - chartMargin.left - chartMargin.right
        );
  const innerHeight = Math.max(
    0,
    dimensions.height - chartMargin.top - chartMargin.bottom
  );
  const hasData = nodes.length > 0;
  const layout = useMemo(() => {
    const selectedNodes = normalizedNodes.filter((node) =>
      selectedIds?.has(node.id)
    );
    // Empty or stale selections show every node; the layout drops dangling links.
    return getSankeyChartLayout({
      nodes: selectedNodes.length > 0 ? selectedNodes : normalizedNodes,
      links,
      innerWidth,
      innerHeight,
      alignment,
      nodePadding,
    });
  }, [
    normalizedNodes,
    selectedIds,
    links,
    innerWidth,
    innerHeight,
    alignment,
    nodePadding,
  ]);
  const chartWidth =
    dimensions.width === 0
      ? 0
      : layout.innerWidth + chartMargin.left + chartMargin.right;
  const chartHeight = Math.max(
    dimensions.height,
    layout.innerHeight + chartMargin.top + chartMargin.bottom
  );
  const animationKey = JSON.stringify([
    layout.nodes.map((node) => [node.id, node.x, node.y0, node.y1]),
    layout.links.map((link) => [
      link.id,
      link.sourceId,
      link.targetId,
      link.value,
      link.width,
      link.y0,
      link.y1,
    ]),
  ]);
  const [animation] = useSpring(
    () => ({
      from: { progress: 0 },
      to: { progress: hasData && isRendering ? 1 : 0 },
      reset: true,
      immediate: isReducedMotion,
    }),
    [animationKey, hasData, isRendering, isReducedMotion]
  );

  const drawnNodeIds = new Set(layout.nodes.map((node) => node.id));
  const nodeLabels = getSankeyNodeLabels(layout.nodes, alignment);

  const legendItems: readonly ChartLegendItem[] = normalizedNodes.map(
    (node) => ({
      id: node.id,
      label: node.label,
      'aria-label': node.ariaLabel,
      markerColor: node.color,
      selected: selectedIds?.has(node.id) ?? false,
    })
  );
  const hasLegend =
    (showLegend ?? legendItems.length > 1) && legendItems.length > 0;

  const requestedActiveId =
    (hasLegend ? activeBuiltInLegendItemId : null) ?? activeLegendItemId;
  const activeId =
    requestedActiveId != null && drawnNodeIds.has(requestedActiveId)
      ? requestedActiveId
      : activeNodeId != null && drawnNodeIds.has(activeNodeId)
        ? activeNodeId
        : null;
  const activeLink =
    activeLinkId == null
      ? null
      : (layout.links.find((link) => link.id === activeLinkId) ?? null);

  const isLinkDimmed = (link: SankeyChartLayoutLink) =>
    activeId != null
      ? link.sourceId !== activeId && link.targetId !== activeId
      : activeLink != null && link.id !== activeLink.id;

  const isNodeDimmed = (node: SankeyChartLayoutNode) =>
    activeId != null
      ? node.id !== activeId
      : activeLink != null &&
        node.id !== activeLink.sourceId &&
        node.id !== activeLink.targetId;

  const canDraw = dimensions.width > 0 && dimensions.height > 0 && hasData;

  const plot = (
    <div
      ref={containerRef}
      className="relative min-h-0 min-w-0 flex-1 overflow-auto"
    >
      <div style={{ width: chartWidth, height: chartHeight }}>
        <svg
          width={chartWidth}
          height={chartHeight}
          role={hasData ? 'graphics-document group' : 'img'}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="block size-full"
        >
          {canDraw && isRendering && (
            <g transform={`translate(${chartMargin.left}, ${chartMargin.top})`}>
              {layout.links.map((link) => (
                <AnimatedSankeyLink
                  key={link.id}
                  link={link}
                  animationProgress={animation.progress}
                  ariaLabel={
                    getLinkAriaLabel?.(link) ??
                    (onLinkActivate != null || onLinkFocus != null
                      ? `${link.source.ariaLabel ?? getAccessibleText(link.source.label) ?? link.sourceId} to ${link.target.ariaLabel ?? getAccessibleText(link.target.label) ?? link.targetId}: ${link.value}`
                      : undefined)
                  }
                  isDimmed={isLinkDimmed(link)}
                  isEmphasized={
                    activeLink?.id === link.id ||
                    (activeId != null &&
                      (link.sourceId === activeId ||
                        link.targetId === activeId))
                  }
                  onPointerMove={onLinkPointerMove}
                  onPointerOut={onLinkPointerOut}
                  onActivate={onLinkActivate}
                  onFocus={onLinkFocus}
                  onBlur={onLinkBlur}
                />
              ))}
              {layout.nodes.map((node) => (
                <AnimatedSankeyNode
                  key={node.id}
                  node={node}
                  animationProgress={animation.progress}
                  ariaLabel={
                    getNodeAriaLabel?.(node) ??
                    node.ariaLabel ??
                    getAccessibleText(node.label) ??
                    node.id
                  }
                  isDimmed={isNodeDimmed(node)}
                  onPointerMove={onNodePointerMove}
                  onPointerOut={onNodePointerOut}
                  onActivate={onNodeActivate}
                  onFocus={onNodeFocus}
                  onBlur={onNodeBlur}
                />
              ))}
              {hasLabels &&
                nodeLabels.map(({ node, isVisible, ...bounds }) =>
                  slots?.nodeLabel != null ? (
                    <g key={`label:${node.id}`}>
                      {slots.nodeLabel({
                        node,
                        alignment,
                        ...bounds,
                      })}
                    </g>
                  ) : isVisible ? (
                    <SankeyNodeLabel
                      key={`label:${node.id}`}
                      node={node}
                      isDimmed={isNodeDimmed(node)}
                      isActive={activeId === node.id}
                      {...bounds}
                    />
                  ) : null
                )}
              {slots?.overlay?.({
                nodes: layout.nodes,
                links: layout.links,
                innerWidth: layout.innerWidth,
                innerHeight: layout.innerHeight,
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );

  const legend = (
    <ChartLegend
      aria-label={ariaLabel == null ? undefined : `${ariaLabel} legend`}
      {...legendProps}
      items={legendItems}
      onItemActiveChange={(item) => {
        setActiveBuiltInLegendItemId(item?.id ?? null);
        legendProps?.onItemActiveChange?.(item);
      }}
    />
  );

  return (
    <div
      className={cn(
        'flex size-full min-h-0 min-w-0 flex-col gap-space-2 @container',
        className
      )}
      {...rest}
    >
      {plot}
      {hasLegend && <div className="shrink-0">{legend}</div>}
    </div>
  );
};
