import { clamp } from '../../utils/clamp';
import {
  SANKEY_LINK_CURVATURE,
  SANKEY_MINIMUM_COLUMN_GAP,
  SANKEY_MINIMUM_NODE_HEIGHT,
  SANKEY_NODE_PADDING,
  SANKEY_NODE_WIDTH,
} from './constants';
import type {
  SankeyChartAlignment,
  SankeyChartLayout,
  SankeyChartLayoutLink,
  SankeyChartLayoutNode,
  SankeyChartLink,
  SankeyChartNode,
} from './SankeyChart.types';

type WorkingNode = SankeyChartNode & {
  depth: number;
  height: number;
  layer: number;
  weight: number;
  y0: number;
  y1: number;
  sourceLinks: WorkingLink[];
  targetLinks: WorkingLink[];
};

type WorkingLink = {
  id: string;
  sourceId: string;
  targetId: string;
  value: number;
  weight: number;
  color?: string;
  width: number;
  y0: number;
  y1: number;
  source: WorkingNode;
  target: WorkingNode;
};

/** Ignores links naming unknown nodes or with non-positive / non-finite values. */
const isValidLink = (link: SankeyChartLink, nodeIds: ReadonlySet<string>) =>
  nodeIds.has(link.sourceId) &&
  nodeIds.has(link.targetId) &&
  Number.isFinite(link.value) &&
  link.value > 0;

/** Longest-path depths from sources and heights from sinks, rejecting cycles. */
const computeDepthsAndHeights = (nodes: WorkingNode[]) => {
  let frontier = nodes.filter((node) => node.targetLinks.length === 0);
  let depth = 0;
  const visited = new Set<WorkingNode>();
  while (frontier.length > 0) {
    const next = new Set<WorkingNode>();
    for (const node of frontier) {
      visited.add(node);
      // Reconverging paths can revisit a node at a greater depth.
      if (depth > node.depth || node.depth === 0) {
        node.depth = depth;
      }
      for (const link of node.sourceLinks) {
        if (link.target.depth <= depth) next.add(link.target);
      }
    }
    frontier = [...next];
    depth += 1;
    if (frontier.length > 0 && depth > nodes.length) {
      throw new Error('circular link');
    }
  }
  if (visited.size < nodes.length) throw new Error('circular link');
  let sinkFrontier = nodes.filter((node) => node.sourceLinks.length === 0);
  let sinkDepth = 0;
  while (sinkFrontier.length > 0) {
    const next = new Set<WorkingNode>();
    for (const node of sinkFrontier) {
      if (sinkDepth > node.height || node.height === 0) {
        node.height = sinkDepth;
      }
      for (const link of node.targetLinks) {
        if (link.source.height <= sinkDepth) next.add(link.source);
      }
    }
    sinkFrontier = [...next];
    sinkDepth += 1;
  }
};

const getAlignmentLayer = (
  node: WorkingNode,
  columnCount: number,
  alignment: SankeyChartAlignment
): number => {
  const lastColumn = columnCount - 1;
  switch (alignment) {
    case 'left':
      return node.depth;
    case 'right':
      return lastColumn - node.height;
    case 'center':
      return node.targetLinks.length > 0
        ? node.depth
        : Math.min(
            node.sourceLinks.length > 0
              ? Math.min(...node.sourceLinks.map((link) => link.target.depth)) -
                  1
              : 0,
            lastColumn
          );
    default:
      return node.sourceLinks.length > 0 ? node.depth : lastColumn;
  }
};

/** Mean incoming link position, the quantity both relaxation passes minimize. */
const relaxLeftToRight = (
  columns: readonly WorkingNode[][],
  innerHeight: number,
  nodePadding: number,
  alpha: number,
  beta: number
) => {
  for (let index = 1; index < columns.length; index += 1) {
    for (const node of columns[index] ?? []) {
      let total = 0;
      let weight = 0;
      for (const link of node.targetLinks) {
        const layerDistance = node.layer - link.source.layer;
        total += link.source.y0 * link.weight * layerDistance;
        weight += link.weight * layerDistance;
      }
      if (weight <= 0) continue;
      const ideal = total / weight;
      const shift = (ideal - node.y0) * alpha * beta;
      node.y0 += shift;
      node.y1 += shift;
    }
    resolveCollisions(columns[index], innerHeight, nodePadding);
  }
};

const relaxRightToLeft = (
  columns: readonly WorkingNode[][],
  innerHeight: number,
  nodePadding: number,
  alpha: number,
  beta: number
) => {
  for (let index = columns.length - 2; index >= 0; index -= 1) {
    for (const node of columns[index] ?? []) {
      let total = 0;
      let weight = 0;
      for (const link of node.sourceLinks) {
        const layerDistance = link.target.layer - node.layer;
        total += link.target.y0 * link.weight * layerDistance;
        weight += link.weight * layerDistance;
      }
      if (weight <= 0) continue;
      const ideal = total / weight;
      const shift = (ideal - node.y0) * alpha * beta;
      node.y0 += shift;
      node.y1 += shift;
    }
    resolveCollisions(columns[index], innerHeight, nodePadding);
  }
};

/** Shifts a column back inside the plot without changing node spacing. */
const clampColumnToPlot = (sorted: WorkingNode[], innerHeight: number) => {
  const top = sorted[0]?.y0 ?? 0;
  const bottom = sorted[sorted.length - 1]?.y1 ?? 0;
  const overBottom = Math.max(0, bottom - innerHeight);
  const drift =
    top < 0 ? -top : overBottom > 0 ? -Math.min(overBottom, top) : 0;
  if (Math.abs(drift) > 1e-6) {
    for (const node of sorted) {
      node.y0 += drift;
      node.y1 += drift;
    }
  }
};

/** Nudges the column's nodes back inside the plot and pushes overlaps apart. */
const resolveCollisions = (
  column: WorkingNode[] | undefined,
  innerHeight: number,
  nodePadding: number
) => {
  if (column == null || column.length === 0) return;
  column.sort((left, right) => left.y0 - right.y0);
  clampColumnToPlot(column, innerHeight);
  for (const [index, node] of column.entries()) {
    const previous = column[index - 1];
    if (previous == null) continue;
    const overlap = previous.y1 + nodePadding - node.y0;
    if (overlap > 1e-6) {
      node.y0 += overlap;
      node.y1 += overlap;
    }
  }
  // Separating overlaps can push the last node below the plot.
  clampColumnToPlot(column, innerHeight);
};

/** Packs links along node edges in the order of their opposite endpoints. */
const computeLinkBreadths = (nodes: readonly WorkingNode[]) => {
  for (const node of nodes) {
    node.sourceLinks.sort((left, right) => left.target.y0 - right.target.y0);
    node.targetLinks.sort((left, right) => left.source.y0 - right.source.y0);
    let y = node.y0;
    for (const link of node.sourceLinks) {
      link.y0 = y + link.width / 2;
      y += link.width;
    }
    y = node.y0;
    for (const link of node.targetLinks) {
      link.y1 = y + link.width / 2;
      y += link.width;
    }
  }
};

/**
 * Assigns columns, scales flow, and relaxes positions toward connected nodes.
 * Nodes use the larger of inflow and outflow; crowded plots expand to fit.
 */
export const getSankeyChartLayout = ({
  nodes,
  links,
  innerWidth: requestedInnerWidth,
  innerHeight: requestedInnerHeight,
  alignment = 'justified',
  nodePadding = SANKEY_NODE_PADDING,
}: {
  nodes: readonly SankeyChartNode[];
  links: readonly SankeyChartLink[];
  innerWidth: number;
  innerHeight: number;
  alignment?: SankeyChartAlignment;
  nodePadding?: number;
}): SankeyChartLayout => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const workingNodes: WorkingNode[] = nodes.map((node) => ({
    ...node,
    depth: 0,
    height: 0,
    layer: 0,
    weight: 0,
    y0: 0,
    y1: 0,
    sourceLinks: [],
    targetLinks: [],
  }));
  const nodeById = new Map(
    workingNodes.map((node) => [node.id, node] as const)
  );
  const validLinks = links.filter((link) => isValidLink(link, nodeIds));
  const explicitLinkIds = new Set(validLinks.flatMap((link) => link.id ?? []));
  const seenLinkIds = new Set<string>();
  const workingLinks: WorkingLink[] = [];
  for (const link of validLinks) {
    const source = nodeById.get(link.sourceId);
    const target = nodeById.get(link.targetId);
    if (source == null || target == null) continue;
    const baseId = `${link.sourceId}->${link.targetId}`;
    let id = link.id ?? baseId;
    if (link.id == null) {
      let suffix = 1;
      while (seenLinkIds.has(id) || explicitLinkIds.has(id)) {
        id = `${baseId}#${suffix++}`;
      }
    }
    if (seenLinkIds.has(id)) continue;
    seenLinkIds.add(id);
    const working: WorkingLink = {
      id,
      sourceId: link.sourceId,
      targetId: link.targetId,
      value: link.value,
      weight: 0,
      color: link.color,
      width: 0,
      y0: 0,
      y1: 0,
      source,
      target,
    };
    source.sourceLinks.push(working);
    target.targetLinks.push(working);
    workingLinks.push(working);
  }
  if (workingNodes.length === 0) {
    return {
      nodes: [],
      links: [],
      innerWidth: Math.max(0, requestedInnerWidth),
      innerHeight: Math.max(0, requestedInnerHeight),
    };
  }

  // Relative weights keep totals, pixel scaling, and relaxation finite.
  const maximumValue = workingLinks.reduce(
    (maximum, link) => Math.max(maximum, link.value),
    0
  );
  for (const link of workingLinks) link.weight = link.value / maximumValue;

  computeDepthsAndHeights(workingNodes);
  const columnCount = Math.max(...workingNodes.map((node) => node.depth)) + 1;
  const innerWidth = Math.max(
    requestedInnerWidth,
    columnCount * SANKEY_NODE_WIDTH +
      (columnCount - 1) * SANKEY_MINIMUM_COLUMN_GAP
  );
  for (const node of workingNodes) {
    node.layer = clamp(
      getAlignmentLayer(node, columnCount, alignment),
      0,
      columnCount - 1
    );
    node.weight = Math.max(
      node.sourceLinks.reduce((sum, link) => sum + link.weight, 0),
      node.targetLinks.reduce((sum, link) => sum + link.weight, 0)
    );
  }

  const columns: WorkingNode[][] = Array.from(
    { length: columnCount },
    () => []
  );
  for (const node of workingNodes) columns[node.layer]?.push(node);

  const maximumColumnSize = Math.max(...columns.map((column) => column.length));
  const innerHeight = Math.max(
    requestedInnerHeight,
    maximumColumnSize * SANKEY_MINIMUM_NODE_HEIGHT
  );
  nodePadding = clamp(
    nodePadding,
    0,
    (innerHeight - maximumColumnSize * SANKEY_MINIMUM_NODE_HEIGHT) /
      Math.max(1, maximumColumnSize - 1)
  );
  // Reserve minimum heights for small nodes before scaling the remaining flow.
  const columnScales = columns.map((column) => {
    let availableHeight = innerHeight - (column.length - 1) * nodePadding;
    let remainingValue = column.reduce((sum, node) => sum + node.weight, 0);
    // Keep the largest node in the scale calculation even when rounding makes
    // the available height slightly smaller than its minimum height.
    for (const node of [...column]
      .sort((left, right) => left.weight - right.weight)
      .slice(0, -1)) {
      if (
        node.weight * availableHeight >=
        SANKEY_MINIMUM_NODE_HEIGHT * remainingValue
      )
        break;
      availableHeight -= SANKEY_MINIMUM_NODE_HEIGHT;
      remainingValue -= node.weight;
    }
    return remainingValue > 0
      ? Math.max(0, availableHeight / remainingValue)
      : Infinity;
  });
  const minimumScale = Math.min(...columnScales);
  const scale = Number.isFinite(minimumScale) ? minimumScale : 0;
  for (const link of workingLinks) {
    // Only magnify before normalizing when the relative weight loses precision.
    // Ordinary weights must share the node scale, even for subnormal inputs.
    const scaledValue = link.value * scale;
    link.width =
      link.weight < Number.MIN_VALUE / Number.EPSILON &&
      scale > 1 &&
      Number.isFinite(scaledValue)
        ? scaledValue / maximumValue
        : link.weight * scale;
  }

  for (const column of columns) {
    let y = 0;
    for (const node of column) {
      node.y0 = y;
      node.y1 = y + Math.max(node.weight * scale, SANKEY_MINIMUM_NODE_HEIGHT);
      y = node.y1 + nodePadding;
    }
    // Center the column's occupied band in the plot, like d3's remainder split.
    const freeSpace = innerHeight - (y - nodePadding);
    const lead = Math.max(0, freeSpace / 2);
    for (const node of column) {
      node.y0 += lead;
      node.y1 += lead;
    }
  }

  const iterations = 6;
  for (let index = 0; index < iterations; index += 1) {
    const alpha = Math.pow(0.99, index);
    const beta = Math.max(1 - alpha, (index + 1) / iterations);
    relaxRightToLeft(columns, innerHeight, nodePadding, alpha, beta);
    relaxLeftToRight(columns, innerHeight, nodePadding, alpha, beta);
  }
  // Pack the settled node order to eliminate gaps left by collision resolution.
  for (const column of columns) {
    column.sort((left, right) => left.y0 - right.y0);
    const occupied = column.reduce((sum, node) => sum + (node.y1 - node.y0), 0);
    const lead = Math.max(
      0,
      (innerHeight - occupied - (column.length - 1) * nodePadding) / 2
    );
    let y = lead;
    for (const node of column) {
      const height = node.y1 - node.y0;
      node.y0 = y;
      node.y1 = y + height;
      y = node.y1 + nodePadding;
    }
  }
  computeLinkBreadths(workingNodes);

  const layoutNodes = new Map<string, SankeyChartLayoutNode>();
  const columnGap =
    Math.max(0, innerWidth - SANKEY_NODE_WIDTH) / Math.max(columnCount - 1, 1);
  for (const node of workingNodes) {
    layoutNodes.set(node.id, {
      id: node.id,
      label: node.label,
      ariaLabel: node.ariaLabel,
      color: node.color ?? 'var(--chart-single-fill)',
      depth: node.layer,
      value: Math.min(
        Number.MAX_VALUE,
        Math.max(
          node.sourceLinks.reduce((sum, link) => sum + link.value, 0),
          node.targetLinks.reduce((sum, link) => sum + link.value, 0)
        )
      ),
      x: node.layer * columnGap,
      y0: node.y0,
      y1: node.y1,
    });
  }
  const layoutLinks: SankeyChartLayoutLink[] = workingLinks.map((link) => ({
    id: link.id,
    sourceId: link.sourceId,
    targetId: link.targetId,
    value: link.value,
    color:
      link.color ??
      layoutNodes.get(link.sourceId)?.color ??
      'var(--chart-single-fill)',
    width: link.width,
    y0: link.y0,
    y1: link.y1,
    source: layoutNodes.get(link.sourceId)!,
    target: layoutNodes.get(link.targetId)!,
  }));

  return {
    nodes: [...layoutNodes.values()],
    links: layoutLinks,
    innerWidth,
    innerHeight,
  };
};

/** Cubic bezier flow ribbon between a link's node edges. */
export const getSankeyLinkPath = (link: {
  sourceX: number;
  targetX: number;
  y0: number;
  y1: number;
  width: number;
}): string => {
  const sourceX = link.sourceX;
  const targetX = link.targetX;
  const controlSource = sourceX + (targetX - sourceX) * SANKEY_LINK_CURVATURE;
  const controlTarget =
    sourceX + (targetX - sourceX) * (1 - SANKEY_LINK_CURVATURE);
  const halfWidth = link.width / 2;
  return [
    `M ${sourceX} ${link.y0 - halfWidth}`,
    `C ${controlSource} ${link.y0 - halfWidth}`,
    `${controlTarget} ${link.y1 - halfWidth}`,
    `${targetX} ${link.y1 - halfWidth}`,
    `L ${targetX} ${link.y1 + halfWidth}`,
    `C ${controlTarget} ${link.y1 + halfWidth}`,
    `${controlSource} ${link.y0 + halfWidth}`,
    `${sourceX} ${link.y0 + halfWidth}`,
    'Z',
  ].join(' ');
};
