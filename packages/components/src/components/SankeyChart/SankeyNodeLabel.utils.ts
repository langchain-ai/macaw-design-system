import {
  SANKEY_NODE_WIDTH,
  SANKEY_NODE_LABEL_GAP,
  SANKEY_NODE_LABEL_HEIGHT,
  SANKEY_NODE_LABEL_WIDTH,
} from './constants';
import type {
  SankeyChartAlignment,
  SankeyChartLayoutNode,
  SankeyChartLabelSide,
} from './SankeyChart.types';

/** Bounds labels to outer gutters or the space between occupied columns. */
export const getSankeyNodeLabels = (
  nodes: readonly SankeyChartLayoutNode[],
  alignment: SankeyChartAlignment
): Array<{
  node: SankeyChartLayoutNode;
  side: SankeyChartLabelSide;
  x: number;
  width: number;
  isVisible: boolean;
}> => {
  const columns = [...new Set(nodes.map((node) => node.x))].sort(
    (a, b) => a - b
  );
  const lastLabelCenter = new Map<number, number>();
  return [...nodes]
    .sort((a, b) => a.y0 + a.y1 - b.y0 - b.y1)
    .map((node) => {
      const center = (node.y0 + node.y1) / 2;
      const isVisible =
        center - (lastLabelCenter.get(node.x) ?? -Infinity) >=
        SANKEY_NODE_LABEL_HEIGHT;
      if (isVisible) lastLabelCenter.set(node.x, center);
      const column = columns.indexOf(node.x);
      const side =
        alignment === 'left' || column === columns.length - 1
          ? 'left'
          : 'right';
      const neighbor = columns[column + (side === 'left' ? -1 : 1)];
      let available =
        neighbor == null
          ? SANKEY_NODE_LABEL_WIDTH
          : Math.abs(neighbor - node.x) -
            SANKEY_NODE_WIDTH -
            2 * SANKEY_NODE_LABEL_GAP;
      // The final pair face each other and share the same gap.
      if (
        alignment !== 'left' &&
        neighbor != null &&
        column >= columns.length - 2
      ) {
        available = (available - SANKEY_NODE_LABEL_GAP) / 2;
      }
      const width = Math.max(0, Math.min(SANKEY_NODE_LABEL_WIDTH, available));
      return {
        node,
        side,
        width,
        isVisible,
        x:
          side === 'left'
            ? node.x - SANKEY_NODE_LABEL_GAP - width
            : node.x + SANKEY_NODE_WIDTH + SANKEY_NODE_LABEL_GAP,
      };
    });
};
