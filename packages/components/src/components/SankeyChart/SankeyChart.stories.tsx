import { useState } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SankeyChart } from '.';
import type {
  SankeyChartLayoutLink,
  SankeyChartLayoutNode,
  SankeyChartLink,
  SankeyChartNode,
} from '.';
import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_OTHER_COLOR,
  CHART_STATUS_FILL_COLORS,
  getCategoricalFillChartColor,
} from '../../utils/chartColors';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChartCard } from '../ChartCard';
import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../ChartTooltip';
import { EmptyState } from '../EmptyState';
import { Text } from '../Text';
import {
  SANKEY_NODE_LABEL_GAP,
  SANKEY_NODE_LABEL_WIDTH,
  SANKEY_NODE_WIDTH,
} from './constants';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const colorFor = (index: number) =>
  CHART_CATEGORICAL_FILL_COLORS[index] ?? CHART_CATEGORICAL_FILL_COLORS[0]!;

/** Sources feeding a chat assistant, flowing through models to outcomes. */
const trafficNodes: readonly SankeyChartNode[] = [
  { id: 'web', label: 'Web app', color: colorFor(0) },
  { id: 'api', label: 'Public API', color: colorFor(1) },
  { id: 'sdk', label: 'SDK', color: colorFor(2) },
  { id: 'gpt', label: 'GPT-5.6', color: colorFor(3) },
  { id: 'claude', label: 'Claude Opus 5', color: colorFor(4) },
  { id: 'gemini', label: 'Gemini 3.1 Flash', color: colorFor(5) },
  { id: 'ok', label: 'Successful', color: CHART_STATUS_FILL_COLORS.positive },
  { id: 'error', label: 'Errored', color: CHART_STATUS_FILL_COLORS.negative },
  { id: 'other', label: 'Other models', color: CHART_OTHER_COLOR },
];

const trafficLinks: readonly SankeyChartLink[] = [
  { sourceId: 'web', targetId: 'gpt', value: 4_120 },
  { sourceId: 'web', targetId: 'claude', value: 1_980 },
  { sourceId: 'api', targetId: 'gpt', value: 2_640 },
  { sourceId: 'api', targetId: 'gemini', value: 1_510 },
  { sourceId: 'sdk', targetId: 'claude', value: 940 },
  { sourceId: 'sdk', targetId: 'other', value: 610 },
  { sourceId: 'gpt', targetId: 'ok', value: 6_120 },
  { sourceId: 'gpt', targetId: 'error', value: 640 },
  { sourceId: 'claude', targetId: 'ok', value: 2_570 },
  { sourceId: 'claude', targetId: 'error', value: 350 },
  { sourceId: 'gemini', targetId: 'ok', value: 1_390 },
  { sourceId: 'gemini', targetId: 'error', value: 120 },
  { sourceId: 'other', targetId: 'ok', value: 520 },
  { sourceId: 'other', targetId: 'error', value: 90 },
];

const toggleId = (
  current: ReadonlySet<string>,
  id: string
): ReadonlySet<string> => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

type FlowTooltipTarget =
  | { node: SankeyChartLayoutNode; link?: never }
  | { node?: never; link: SankeyChartLayoutLink };

/** Positions a ChartTooltip at the plot center for the active mark. */
const FlowTooltip = ({ node, link }: FlowTooltipTarget) => {
  const mark = node ?? link;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <ChartTooltip>
        <ChartTooltipHeader
          title={
            node != null
              ? (node.ariaLabel ?? String(node.label))
              : `${link.source.ariaLabel ?? String(link.source.label)} → ${link.target.ariaLabel ?? String(link.target.label)}`
          }
          leading={
            <div
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: mark.color }}
            />
          }
        />
        <ChartTooltipBody>
          <ChartTooltipRow
            label="Traces"
            value={numberFormatter.format(mark.value)}
          />
        </ChartTooltipBody>
      </ChartTooltip>
    </div>
  );
};

const meta = {
  title: 'Components/Charts/SankeyChart',
  component: SankeyChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive flow-diagram renderer for stage-to-stage volume. Nodes are sized by the larger of inflow and outflow, and link thickness carries the flow value. Supports justified, centered, left, and right column alignment, controlled legend filtering, node and link emphasis, keyboard targets, and generic SVG slots. Consumers retain fetching, formatting, tooltip content, and navigation — pair it with `ChartCard`, `ChartTooltip`, and `ChartLegend`.',
      },
    },
  },
  argTypes: {
    shouldAnimate: {
      control: 'boolean',
      description:
        'Animates chart marks unless disabled or reduced motion is preferred.',
      table: { defaultValue: { summary: 'true' } },
    },
    alignment: {
      control: 'select',
      options: ['justified', 'center', 'left', 'right'],
      description:
        'Assigns sink columns: `justified` pushes endpoints to the last column, `center` packs middle nodes beside their sources, `left` and `right` pin each node to its shortest-path side.',
      table: { defaultValue: { summary: 'justified' } },
    },
    nodePadding: {
      control: 'number',
      description: 'Vertical gap between nodes in one column, in pixels.',
      table: { defaultValue: { summary: '12' } },
    },
    slots: {
      description:
        'Generic SVG render slots for an overlay above the marks and custom node labels.',
    },
  },
  tags: ['autodocs', 'sankey', 'flow', 'graph', 'funnel'],
  args: {
    'aria-label': 'Trace flow by source, model, and outcome',
    nodes: trafficNodes,
    links: trafficLinks,
  },
} satisfies Meta<typeof SankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RightSideValues: Story = {
  name: 'Destination labels and values on the right',
  render: () => (
    <div className="mx-auto h-96 w-full max-w-3xl">
      <SankeyChart
        aria-label="Trace flow with destination totals"
        nodes={trafficNodes}
        links={trafficLinks}
        getNodeAriaLabel={(node) =>
          `${String(node.label)}: ${numberFormatter.format(node.value)} traces`
        }
        slots={{
          nodeLabel: ({ node, side, x, width }) => {
            const isDestination = !trafficLinks.some(
              (link) => link.sourceId === node.id
            );
            return (
              <foreignObject
                aria-hidden="true"
                x={
                  isDestination
                    ? node.x + SANKEY_NODE_WIDTH + SANKEY_NODE_LABEL_GAP
                    : x
                }
                y={(node.y0 + node.y1) / 2 - 16}
                width={isDestination ? SANKEY_NODE_LABEL_WIDTH : width}
                height={32}
                className="pointer-events-none overflow-hidden"
              >
                <div
                  className={cn(
                    'flex h-full flex-col justify-center',
                    !isDestination && side === 'left' && 'text-right'
                  )}
                >
                  <Text variant="xs" className="block truncate">
                    {node.label}
                  </Text>
                  {isDestination && (
                    <Text
                      variant="xs"
                      color="secondary"
                      className="block truncate tabular-nums"
                    >
                      {numberFormatter.format(node.value)} traces
                    </Text>
                  )}
                </div>
              </foreignObject>
            );
          },
        }}
      />
    </div>
  ),
};

export const InChartCardWithTooltip: Story = {
  name: 'In ChartCard with node and link tooltips',
  render: ({ shouldAnimate }) => {
    const [preview, setPreview] = useState<FlowTooltipTarget | null>(null);
    const [pinnedNode, setPinnedNode] = useState<SankeyChartLayoutNode | null>(
      null
    );
    const tooltip: FlowTooltipTarget | null =
      pinnedNode == null ? preview : { node: pinnedNode };
    const clearPin = () => {
      setPinnedNode(null);
      setPreview(null);
    };
    useHotkeys('esc', clearPin, { enabled: tooltip != null });

    return (
      <div className="mx-auto w-full max-w-3xl">
        <ChartCard
          title="Trace flow"
          description="Sources → models → outcomes, last 7 days"
          className="h-[26rem]"
        >
          <div className="relative size-full min-h-0 min-w-0">
            <SankeyChart
              aria-label="Trace flow by source, model, and outcome"
              nodes={trafficNodes}
              links={trafficLinks}
              shouldAnimate={shouldAnimate}
              showLegend={false}
              activeNodeId={tooltip?.node?.id}
              activeLinkId={tooltip?.link?.id}
              getNodeAriaLabel={(node) =>
                `${String(node.label)}: ${numberFormatter.format(node.value)} traces`
              }
              getLinkAriaLabel={(link) =>
                `${String(link.source.label)} to ${String(link.target.label)}: ${numberFormatter.format(link.value)} traces`
              }
              onNodePointerMove={(node) => setPreview({ node })}
              onNodePointerOut={() => setPreview(null)}
              onNodeFocus={(node) => setPreview({ node })}
              onNodeBlur={() => setPreview(null)}
              onNodeActivate={(node) => {
                setPreview(null);
                setPinnedNode((current) =>
                  current?.id === node.id ? null : node
                );
              }}
              onLinkPointerMove={(link) => setPreview({ link })}
              onLinkPointerOut={() => setPreview(null)}
              onLinkFocus={(link) => setPreview({ link })}
              onLinkBlur={() => setPreview(null)}
            />
            {tooltip != null && <FlowTooltip {...tooltip} />}
          </div>
        </ChartCard>
        <div className="mt-space-2 flex items-center gap-space-2">
          <Text as="p" variant="xs" color="secondary" role="status">
            {pinnedNode == null
              ? 'Click a stage to pin its tooltip and flows.'
              : `Pinned: ${String(pinnedNode.label)}. Click it again or press Escape to clear.`}
          </Text>
          <Button
            color="secondary"
            variant="plain"
            disabled={pinnedNode == null}
            onClick={clearPin}
          >
            Unpin
          </Button>
        </div>
      </div>
    );
  },
};

export const Default: Story = {
  render: (args) => (
    <div className="mx-auto h-96 w-full max-w-3xl">
      <SankeyChart {...args} />
    </div>
  ),
};

export const LargeFiniteFlows: Story = {
  ...Default,
  args: {
    links: trafficLinks.map((link) => ({ ...link, value: 1e308 })),
  },
};

export const SubnormalFlows: Story = {
  ...Default,
  args: {
    nodes: [
      { id: 'a', label: 'Source' },
      { id: 'b', label: 'Destination' },
    ],
    links: Array.from({ length: 51 }, (_, index) => ({
      sourceId: 'a',
      targetId: 'b',
      value: (index === 50 ? 2 : 1) * Number.MIN_VALUE,
    })),
    shouldAnimate: false,
  },
};

export const UpdatingFlows: Story = {
  name: 'Animate changing flows',
  render: (args) => {
    const [includeSdk, setIncludeSdk] = useState(true);
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-2">
        <Button
          className="self-start"
          onClick={() => setIncludeSdk((current) => !current)}
        >
          {includeSdk ? 'Remove SDK flows' : 'Add SDK flows'}
        </Button>
        <div className="h-96">
          <SankeyChart
            {...args}
            links={trafficLinks.filter(
              (link) => includeSdk || link.sourceId !== 'sdk'
            )}
          />
        </div>
      </div>
    );
  },
};

export const LongLabels: Story = {
  name: 'Long labels across closely spaced stages',
  render: () => {
    const stages = [
      'Incoming requests from the production web application',
      'Input validation and request preprocessing',
      'Retrieval from the documentation knowledge base',
      'Response generation with the selected language model',
      'Completed responses delivered to the user',
    ].map((label, index) => ({ id: String(index), label }));
    const flows = stages.slice(1).map((stage, index) => ({
      sourceId: String(index),
      targetId: stage.id,
      value: 12345,
    }));
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-4">
        {(['justified', 'left'] as const).map((alignment) => (
          <div key={alignment} className="h-80">
            <SankeyChart
              aria-label={`Long labels with ${alignment} alignment`}
              nodes={stages}
              links={flows}
              alignment={alignment}
              showLegend={false}
            />
          </div>
        ))}
      </div>
    );
  },
};

export const CostFlow: Story = {
  name: 'Cost flow with currency formatting',
  render: () => {
    const costNodes: readonly SankeyChartNode[] = [
      { id: 'prod', label: 'Production', color: colorFor(0) },
      { id: 'staging', label: 'Staging', color: colorFor(1) },
      { id: 'agent', label: 'Agent runs', color: colorFor(2) },
      { id: 'evals', label: 'Evaluations', color: colorFor(3) },
      { id: 'opus', label: 'Claude Opus 5', color: colorFor(4) },
      { id: 'sol', label: 'GPT-5.6 Sol', color: colorFor(5) },
      { id: 'luna', label: 'GPT-5.6 Luna', color: colorFor(6) },
    ];
    const costLinks: readonly SankeyChartLink[] = [
      { sourceId: 'prod', targetId: 'agent', value: 8_420 },
      { sourceId: 'prod', targetId: 'evals', value: 2_180 },
      { sourceId: 'staging', targetId: 'agent', value: 1_240 },
      { sourceId: 'staging', targetId: 'evals', value: 660 },
      { sourceId: 'agent', targetId: 'opus', value: 6_310 },
      { sourceId: 'agent', targetId: 'sol', value: 2_890 },
      { sourceId: 'agent', targetId: 'luna', value: 460 },
      { sourceId: 'evals', targetId: 'sol', value: 2_840 },
    ];

    return (
      <div className="mx-auto h-96 w-full max-w-3xl">
        <SankeyChart
          aria-label="Spend flow by environment, workload, and model"
          nodes={costNodes}
          links={costLinks}
          getNodeAriaLabel={(node) =>
            `${String(node.label)}: ${currencyFormatter.format(node.value)}`
          }
        />
      </div>
    );
  },
};

export const AlignmentStrategies: Story = {
  name: 'Column alignment strategies',
  render: () => (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-4">
      {(['justified', 'center', 'left', 'right'] as const).map((alignment) => (
        <div key={alignment} className="flex flex-col gap-space-1">
          <Text variant="xs" color="secondary">
            alignment=&quot;{alignment}&quot;
          </Text>
          <div className="h-56 w-full border border-faint">
            <SankeyChart
              aria-label={`${alignment} aligned trace flow`}
              nodes={trafficNodes}
              links={trafficLinks}
              alignment={alignment}
              showLegend={false}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const FilterableLegend: Story = {
  name: 'Legend filtering',
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const hasSelectedFlow = args.links.some(
      (link) => selectedIds.has(link.sourceId) && selectedIds.has(link.targetId)
    );

    return (
      <div className="mx-auto flex h-[26rem] w-full max-w-3xl flex-col gap-space-2">
        <SankeyChart
          {...args}
          selectedIds={selectedIds}
          legendProps={{
            layout: 'inline',
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
        />
        <Text variant="xs" color="secondary" role="status">
          {selectedIds.size > 0 && !hasSelectedFlow
            ? 'Select a connected node in a neighboring column to display the filtered chart.'
            : 'Select connected nodes in the legend to filter flows. Deselect all legend items to show the full chart.'}
        </Text>
      </div>
    );
  },
};

export const LoadingInChartCard: Story = {
  name: 'Sankey skeleton in ChartCard',
  render: () => (
    <div className="mx-auto w-full max-w-3xl">
      <ChartCard
        title="Trace flow"
        description="Sources → models → outcomes, last 7 days"
        state="loading"
        skeletonVariant="sankey"
        className="h-[26rem]"
      />
    </div>
  ),
};

export const EmptyInChartCard: Story = {
  name: 'Empty state composed with EmptyState',
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <ChartCard
        title="Trace flow"
        description="No traces in the selected window"
        className="h-96"
      >
        <EmptyState
          title="No flow to chart"
          description="Trace traffic for this period will appear here once runs finish."
          size="sm"
          className="flex-1"
        />
      </ChartCard>
    </div>
  ),
};

export const Narrow: Story = {
  name: 'Narrow container',
  render: (args) => (
    <div className="mx-auto h-[28rem] w-80 max-w-full">
      <SankeyChart
        {...args}
        minimumPlotWidth={0}
        legendProps={{ layout: 'list' }}
      />
    </div>
  ),
};

export const CompactContainers: Story = {
  name: 'Compact containers with scrolling',
  render: () => {
    const sources = Array.from({ length: 6 }, (_, index) => ({
      id: `source-${index}`,
      label: `Source ${index + 1}`,
    }));
    return (
      <div className="flex flex-col gap-space-4">
        {[
          { width: 100, height: 160 },
          { width: 320, height: 66 },
          { width: 320, height: 24 },
          { width: 640, height: 66 },
          { width: 640, height: 24 },
        ].map(({ width, height }) => (
          <div key={width + ':' + height} className="flex flex-col gap-space-2">
            <Text variant="sm">
              {width} × {height}px
            </Text>
            <div style={{ width, height }} className="border border-faint">
              <SankeyChart
                aria-label={`Compact flow ${width} by ${height}`}
                nodes={[...sources, { id: 'target', label: 'Target' }]}
                links={sources.map((node) => ({
                  sourceId: node.id,
                  targetId: 'target',
                  value: 1,
                }))}
                showLegend={false}
                shouldAnimate={false}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const SparseCrowdedColumn: Story = {
  name: 'Crowded column at a fractional height',
  render: () => (
    <div
      className="w-full max-w-3xl border border-faint"
      style={{ height: 48.0625 }}
    >
      <SankeyChart
        aria-label="One flow alongside seven isolated stages"
        nodes={[
          ...Array.from({ length: 8 }, (_, index) => ({
            id: String(index),
            label: `Source ${index + 1}`,
          })),
          { id: 'sink', label: 'Sink' },
        ]}
        links={[{ sourceId: '0', targetId: 'sink', value: 1 }]}
        alignment="left"
        showLegend={false}
        shouldAnimate={false}
      />
    </div>
  ),
};

export const CustomLabels: Story = {
  name: 'Custom node labels with share of total',
  render: () => {
    const total = trafficLinks.reduce((sum, link) => sum + link.value, 0);

    return (
      <div className="mx-auto h-96 w-full max-w-3xl">
        <SankeyChart
          aria-label="Trace flow with share labels"
          nodes={trafficNodes}
          links={trafficLinks}
          showLegend={false}
          slots={{
            nodeLabel: ({ node, side, x, width }) => {
              const share = total > 0 ? (node.value / total) * 100 : 0;
              return (
                <foreignObject
                  aria-hidden="true"
                  x={x}
                  y={(node.y0 + node.y1) / 2 - 8}
                  width={width}
                  height={16}
                >
                  <Text
                    variant="xs"
                    color="secondary"
                    className={`block truncate ${side === 'left' ? 'text-right' : 'text-left'}`}
                  >
                    {String(node.label)} · {share.toFixed(0)}%
                  </Text>
                </foreignObject>
              );
            },
          }}
        />
      </div>
    );
  },
};

export const ManyNodes: Story = {
  name: 'Many nodes with padding squeeze',
  render: () => {
    const sources = Array.from({ length: 6 }, (_, index) => ({
      id: `source-${index}`,
      label: `Source ${index + 1}`,
      color: getCategoricalFillChartColor(index),
    }));
    const models = ['gpt', 'claude', 'gemini'].map((id, index) => ({
      id,
      label: ['GPT-5.6', 'Claude Opus 5', 'Gemini 3.1 Flash'][index]!,
      color: getCategoricalFillChartColor(index + 6),
    }));
    const outcomes = [
      {
        id: 'ok',
        label: 'Successful',
        color: CHART_STATUS_FILL_COLORS.positive,
      },
      {
        id: 'error',
        label: 'Errored',
        color: CHART_STATUS_FILL_COLORS.negative,
      },
    ];
    const manyNodes = [...sources, ...models, ...outcomes];
    const manyLinks: readonly SankeyChartLink[] = [
      ...sources.flatMap((source, index) => [
        {
          sourceId: source.id,
          targetId: models[index % 3]!.id,
          value: 900 - index * 90,
        },
        {
          sourceId: source.id,
          targetId: models[(index + 1) % 3]!.id,
          value: 420 - index * 40,
        },
      ]),
      ...models.flatMap((model, index) => [
        { sourceId: model.id, targetId: 'ok', value: 2_400 - index * 500 },
        { sourceId: model.id, targetId: 'error', value: 300 - index * 60 },
      ]),
    ];

    return (
      <div className="mx-auto h-[30rem] w-full max-w-3xl">
        <SankeyChart
          aria-label="Traffic from six sources through three models to two outcomes"
          nodes={manyNodes}
          links={manyLinks}
          legendProps={{ layout: 'list' }}
        />
      </div>
    );
  },
};
