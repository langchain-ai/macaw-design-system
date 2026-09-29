/** Layout tuning shared by the Sankey renderer and its tests. */
/** Width of every node rectangle, in SVG pixels. */
export const SANKEY_NODE_WIDTH = 16;

/** Minimum horizontal space between node rectangles in adjacent columns. */
export const SANKEY_MINIMUM_COLUMN_GAP = 32;

/** Narrowest comfortable node rectangle. */
export const SANKEY_MINIMUM_NODE_HEIGHT = 2;

/** Vertical breathing room between nodes in one column, in SVG pixels. */
export const SANKEY_NODE_PADDING = 12;

/** Maximum width of a built-in node label, in SVG pixels. */
export const SANKEY_NODE_LABEL_WIDTH = 128;

export const SANKEY_NODE_LABEL_HEIGHT = 16;

/** Gap between a node rectangle and the label rendered beside it. */
export const SANKEY_NODE_LABEL_GAP = 6;

/** Narrowest the plot area gets before the diagram scrolls horizontally. */
export const SANKEY_MINIMUM_PLOT_WIDTH = 160;

/** Bezier bend shared by every link ribbon. */
export const SANKEY_LINK_CURVATURE = 0.5;

/** Resting opacity of a link that is not emphasized or dimmed. */
export const SANKEY_LINK_REST_OPACITY = 0.5;

/** Opacity of a link that does not match the active node or link. */
export const SANKEY_LINK_DIMMED_OPACITY = 0.08;
