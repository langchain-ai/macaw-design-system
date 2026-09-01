import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartCard } from '../components/ChartCard';
import {
  ChartTooltip,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../components/ChartTooltip';
import {
  collateDonutSegments,
  DonutChart,
  type DonutChartSegment,
} from '../components/DonutChart';
import { DropdownMenuItem } from '../components/DropdownMenu';
import { Text } from '../components/Text';
import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_OTHER_COLOR,
} from '../utils/chartColors';

const modelSegments: readonly DonutChartSegment[] = [
  { id: 'gpt-5.6-sol', label: 'gpt-5.6-sol', value: 3820 },
  { id: 'gpt-5.6-luna', label: 'gpt-5.6-luna', value: 2015 },
  { id: 'claude-opus-5', label: 'claude-opus-5', value: 1804 },
  { id: 'claude-opus-4.8', label: 'claude-opus-4.8', value: 1526 },
  { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite', value: 1114 },
  { id: 'claude-haiku-4.5', label: 'claude-haiku-4.5', value: 883 },
].map((segment, index) => ({
  ...segment,
  color:
    CHART_CATEGORICAL_FILL_COLORS[index] ?? CHART_CATEGORICAL_FILL_COLORS[0]!,
}));

/** A long tail of sub-1% models, the case `otherCollationThreshold` is for. */
const LONG_TAIL_THRESHOLD = 2;

const longTailSegments: readonly DonutChartSegment[] = [
  ...modelSegments,
  { id: 'gpt-5.2', label: 'gpt-5.2', value: 96 },
  { id: 'claude-sonnet-4.5', label: 'claude-sonnet-4.5', value: 74 },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro', value: 51 },
  { id: 'llama-4-maverick', label: 'llama-4-maverick', value: 33 },
  { id: 'mistral-large-3', label: 'mistral-large-3', value: 18 },
  { id: 'gpt-4.1-nano', label: 'gpt-4.1-nano', value: 9 },
].map((segment, index) => ({
  ...segment,
  color:
    CHART_CATEGORICAL_FILL_COLORS[index] ?? CHART_CATEGORICAL_FILL_COLORS[0]!,
}));

/**
 * A long tail alongside a rollup the data source computed itself, flagged
 * `isOther` so collation merges the two rather than drawing both.
 */
const rollupSegments: readonly DonutChartSegment[] = [
  ...longTailSegments,
  {
    id: 'unattributed',
    label: 'Other',
    value: 1203,
    color: CHART_OTHER_COLOR,
    isOther: true,
  },
];

const numberFormatter = new Intl.NumberFormat('en-US');

/** The center total reports whatever the legend has filtered the donut to. */
const getVisibleTotal = (
  segments: readonly DonutChartSegment[],
  selectedIds: ReadonlySet<string>
) => {
  const visible =
    selectedIds.size === 0
      ? segments
      : segments.filter((segment) => selectedIds.has(segment.id));
  return visible.reduce((sum, segment) => sum + segment.value, 0);
};

const modelTotal = getVisibleTotal(modelSegments, new Set());

const toggleId = (
  current: ReadonlySet<string>,
  id: string
): ReadonlySet<string> => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const meta = {
  title: 'Components/Charts/DonutChart',
  component: DonutChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { segments: modelSegments },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const total = getVisibleTotal(modelSegments, selectedIds);

    return (
      <div className="mx-auto h-[22rem] w-[42rem] max-w-full">
        <DonutChart
          segments={modelSegments}
          selectedIds={selectedIds}
          legendProps={{
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
          aria-label="Trace count by model"
          centerNumber={numberFormatter.format(total)}
          centerDescriptor="traces"
        />
      </div>
    );
  },
};

export const StackedLegend: Story = {
  name: 'Stacked legend (narrow container)',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const total = getVisibleTotal(modelSegments, selectedIds);

    return (
      <div className="mx-auto h-[30rem] w-80 max-w-full">
        <DonutChart
          segments={modelSegments}
          selectedIds={selectedIds}
          legendProps={{
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
          aria-label="Trace count by model"
          centerNumber={numberFormatter.format(total)}
          centerDescriptor="traces"
        />
      </div>
    );
  },
};

export const InlineLegend: Story = {
  name: 'Inline legend',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const total = getVisibleTotal(modelSegments, selectedIds);

    return (
      <div className="mx-auto h-96 w-[30rem] max-w-full">
        <DonutChart
          segments={modelSegments}
          selectedIds={selectedIds}
          legendProps={{
            layout: 'inline',
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
          aria-label="Trace count by model"
          centerNumber={numberFormatter.format(total)}
          centerDescriptor="traces"
        />
      </div>
    );
  },
};

export const OtherCollation: Story = {
  name: 'Collating small segments into Other',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    // Total the collated list, so selecting "Other" counts everything in it.
    const total = getVisibleTotal(
      collateDonutSegments(longTailSegments, LONG_TAIL_THRESHOLD),
      selectedIds
    );

    return (
      <div className="mx-auto h-[22rem] w-[42rem] max-w-full">
        <DonutChart
          segments={longTailSegments}
          otherCollationThreshold={LONG_TAIL_THRESHOLD}
          selectedIds={selectedIds}
          legendProps={{
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
          aria-label="Trace count by model"
          centerNumber={numberFormatter.format(total)}
          centerDescriptor="traces"
        />
      </div>
    );
  },
};

export const MergedRollup: Story = {
  name: 'Merging a rollup the data source computed',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    // Total the collated list, so selecting "Other" counts everything in it.
    const total = getVisibleTotal(
      collateDonutSegments(rollupSegments, LONG_TAIL_THRESHOLD),
      selectedIds
    );

    return (
      <div className="mx-auto h-[22rem] w-[42rem] max-w-full">
        <DonutChart
          segments={rollupSegments}
          otherCollationThreshold={LONG_TAIL_THRESHOLD}
          scaleCenterNumberSize
          selectedIds={selectedIds}
          legendProps={{
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
          aria-label="Trace count by model"
          centerNumber={numberFormatter.format(total)}
          centerDescriptor="traces"
        />
      </div>
    );
  },
};

export const WithoutLegend: Story = {
  name: 'Without legend',
  render: () => (
    <div className="mx-auto size-96">
      <DonutChart
        showLegend={false}
        segments={modelSegments}
        aria-label="Trace count by model"
        centerNumber={numberFormatter.format(modelTotal)}
        centerDescriptor="traces"
      />
    </div>
  ),
};

export const InChartCard: Story = {
  name: 'In ChartCard',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const [hovered, setHovered] = useState<DonutChartSegment | null>(null);
    const total = getVisibleTotal(modelSegments, selectedIds);

    return (
      <div className="mx-auto w-full max-w-2xl">
        <ChartCard
          title="Traces by model"
          description="Last 24 hours"
          isMovable
          dragHandleProps={{ onPointerDown: () => undefined }}
          expandButtonProps={{ onClick: () => undefined }}
          menuItems={
            <>
              <DropdownMenuItem onSelect={() => undefined}>
                <Text as="span" variant="sm">
                  Edit chart
                </Text>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => undefined}>
                <Text as="span" variant="sm" color="error">
                  Delete chart
                </Text>
              </DropdownMenuItem>
            </>
          }
          className="h-96"
        >
          <div className="relative size-full min-h-0 min-w-0">
            <DonutChart
              segments={modelSegments}
              selectedIds={selectedIds}
              activeSegmentId={hovered?.id}
              legendProps={{
                onItemClick: (item) =>
                  setSelectedIds((current) => toggleId(current, item.id)),
              }}
              aria-label="Traces by model"
              centerNumber={numberFormatter.format(total)}
              centerDescriptor="traces"
              getSegmentAriaLabel={(segment) =>
                `${String(segment.label)}: ${numberFormatter.format(segment.value)} traces`
              }
              onSegmentPointerMove={(segment) => setHovered(segment)}
              onSegmentPointerOut={() => setHovered(null)}
              onSegmentFocus={(segment) => setHovered(segment)}
              onSegmentBlur={() => setHovered(null)}
            />
            {hovered != null && (
              <div className="top-space-2 pointer-events-none absolute left-1/4 -translate-x-1/2">
                <ChartTooltip>
                  <ChartTooltipHeader
                    title={hovered.label}
                    leading={
                      <div
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: hovered.color }}
                      />
                    }
                  />
                  <ChartTooltipRow
                    label="Traces"
                    value={numberFormatter.format(hovered.value)}
                  />
                </ChartTooltip>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    );
  },
};
