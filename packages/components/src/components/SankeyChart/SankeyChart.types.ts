import type { ReactNode } from 'react';

export type SankeyChartNode = {
  /** Stable ID. Must be unique within the chart. */
  id: string;
  label: ReactNode;
  /** Plain-text name for assistive technology. Defaults to `label` when it is text, then `id`. */
  ariaLabel?: string;
  /** Use a design-system CSS chart color token. Defaults to a categorical fill by node order. */
  color?: string;
};

export type SankeyChartLink = {
  /** Unique ID. Defaults to `${sourceId}->${targetId}`, with numeric suffixes for collisions.
   * Supply an ID to preserve a parallel link's identity across reordering. */
  id?: string;
  sourceId: string;
  targetId: string;
  value: number;
  /** Use a design-system CSS chart color token. Defaults to the source node color. */
  color?: string;
};

export type SankeyChartLayoutNode = {
  id: string;
  label: ReactNode;
  ariaLabel?: string;
  color: string;
  /** Zero-based column, derived from the graph topology and alignment. */
  depth: number;
  /** Larger inflow/outflow total, capped at Number.MAX_VALUE on numeric overflow. */
  value: number;
  x: number;
  y0: number;
  y1: number;
};

export type SankeyChartLayoutLink = {
  id: string;
  sourceId: string;
  targetId: string;
  value: number;
  color: string;
  /** Link thickness in SVG pixels. */
  width: number;
  /** Vertical center of the link where it leaves the source node. */
  y0: number;
  /** Vertical center of the link where it enters the target node. */
  y1: number;
  source: SankeyChartLayoutNode;
  target: SankeyChartLayoutNode;
};

export type SankeyChartLayout = {
  nodes: readonly SankeyChartLayoutNode[];
  links: readonly SankeyChartLayoutLink[];
  /** Required plot width, expanded to keep adjacent stages apart. */
  innerWidth: number;
  /** Required plot height, expanded when minimum node heights cannot fit. */
  innerHeight: number;
};

export type SankeyChartAlignment = 'justified' | 'center' | 'left' | 'right';

/** Side of the node rectangle its label renders on. */
export type SankeyChartLabelSide = 'right' | 'left';

export type SankeyChartRenderProps = {
  nodes: readonly SankeyChartLayoutNode[];
  links: readonly SankeyChartLayoutLink[];
  innerWidth: number;
  innerHeight: number;
};

export type SankeyChartSlots = {
  /** Renders SVG-compatible content above the links, nodes, and labels. */
  overlay?: (props: SankeyChartRenderProps) => ReactNode;
  /** Replaces the built-in node labels. Return SVG-compatible content. */
  nodeLabel?: (props: {
    node: SankeyChartLayoutNode;
    alignment: SankeyChartAlignment;
    side: SankeyChartLabelSide;
    /** Available label bounds in plot coordinates. */
    x: number;
    width: number;
  }) => ReactNode;
};

export type SankeyChartInteractionProps = {
  onNodePointerMove?: (node: SankeyChartLayoutNode) => void;
  onNodePointerOut?: () => void;
  onNodeActivate?: (node: SankeyChartLayoutNode) => void;
  onNodeFocus?: (node: SankeyChartLayoutNode) => void;
  onNodeBlur?: () => void;
  onLinkPointerMove?: (link: SankeyChartLayoutLink) => void;
  onLinkPointerOut?: () => void;
  onLinkActivate?: (link: SankeyChartLayoutLink) => void;
  onLinkFocus?: (link: SankeyChartLayoutLink) => void;
  onLinkBlur?: () => void;
};
