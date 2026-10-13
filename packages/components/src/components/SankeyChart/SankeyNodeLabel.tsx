import { CHART_DIMMED_OPACITY } from '../../utils/chartConstants';
import { cn } from '../../utils/cn';
import { Text } from '../Text';
import { SANKEY_NODE_LABEL_HEIGHT } from './constants';
import type {
  SankeyChartLayoutNode,
  SankeyChartLabelSide,
} from './SankeyChart.types';

/** Label rendered just past the node rectangle, on the given side. */
export const SankeyNodeLabel = ({
  node,
  isDimmed,
  isActive,
  side,
  x,
  width,
}: {
  node: SankeyChartLayoutNode;
  isDimmed: boolean;
  isActive: boolean;
  side: SankeyChartLabelSide;
  x: number;
  width: number;
}) => (
  <foreignObject
    aria-hidden="true"
    x={x}
    y={(node.y0 + node.y1 - SANKEY_NODE_LABEL_HEIGHT) / 2}
    width={width}
    height={SANKEY_NODE_LABEL_HEIGHT}
    opacity={isDimmed ? CHART_DIMMED_OPACITY : 1}
    className="pointer-events-none overflow-hidden transition-opacity duration-fast motion-reduce:transition-none"
  >
    <div
      className={cn(
        'flex size-full items-center',
        side === 'left' && 'justify-end'
      )}
    >
      <Text
        variant="xs"
        color="primary"
        weight={isActive ? 'medium' : 'normal'}
        className="block truncate"
      >
        {node.label == null || typeof node.label === 'boolean'
          ? (node.ariaLabel ?? node.id)
          : node.label}
      </Text>
    </div>
  </foreignObject>
);
