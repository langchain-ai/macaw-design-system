import { useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  RadarChart,
  type RadarChartMultiSeriesProps,
  type RadarChartSeries,
  type RadarChartSingleSeriesProps,
} from '.';
import {
  getCategoricalFillChartColor,
  getCategoricalLineChartColor,
} from '../../utils/chartColors';
import { ChartCard } from '../ChartCard';
import { ChartLegend } from '../ChartLegend';
import {
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../ChartTooltip';

const workTypes = [
  { id: 'feature', label: 'Feature', value: 38, threads: 23, cost: 6 },
  { id: 'bugfix', label: 'Bugfix', value: 28, threads: 17, cost: 2.7 },
  { id: 'review', label: 'Review', value: 25, threads: 15, cost: 1.71 },
  { id: 'off-topic', label: 'Off Topic', value: 8, threads: 5, cost: 0.06 },
];

const tokenUsage = [
  { id: 'review', label: 'Code Review', value: 29 },
  { id: 'issues', label: 'Issues', value: 0 },
  { id: 'pulls', label: 'Pull Requests', value: 33 },
  { id: 'commits', label: 'Commits', value: 38 },
];

const evaluators = [
  { id: 'correctness', label: 'Correctness' },
  { id: 'helpfulness', label: 'Helpfulness' },
  { id: 'groundedness', label: 'Groundedness' },
  { id: 'conciseness', label: 'Conciseness' },
  { id: 'tool-use', label: 'Tool Use' },
  { id: 'safety', label: 'Safety' },
];

const experiments: RadarChartSeries[] = [
  {
    id: 'baseline',
    label: 'Baseline',
    values: {
      correctness: 72,
      helpfulness: 78,
      groundedness: 64,
      conciseness: 86,
      'tool-use': 58,
      safety: 92,
    },
  },
  {
    id: 'prompt-v2',
    label: 'Prompt v2',
    values: {
      correctness: 81,
      helpfulness: 88,
      groundedness: 71,
      conciseness: 70,
      'tool-use': 67,
      safety: 94,
    },
  },
  {
    id: 'rerank-v3',
    label: 'Rerank v3',
    values: {
      correctness: 87,
      helpfulness: 80,
      groundedness: 91,
      conciseness: 74,
      'tool-use': 76,
      safety: 89,
    },
  },
];

const formatPercent = (value: number) => `${value}%`;
const renderShareTooltip: RadarChartSingleSeriesProps['renderTooltip'] = (
  datum
) => (
  <>
    <ChartTooltipHeader title={datum.label} />
    <ChartTooltipRow
      label="Share"
      value={formatPercent(datum.value)}
      markerColor={datum.color}
    />
  </>
);

const RadarExample = ({ className, ...args }: RadarChartSingleSeriesProps) => (
  <div className={className}>
    <RadarChart {...args} />
    {args.data.length >= 3 && (
      <ChartLegend
        layout="inline"
        items={args.data.map((datum, index) => ({
          id: datum.id,
          label: datum.label,
          markerColor: datum.color ?? getCategoricalFillChartColor(index),
        }))}
      />
    )}
  </div>
);

const toggleId = (current: ReadonlySet<string>, id: string) => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

/** Hovering a legend item emphasizes its area; clicking isolates series. */
const SeriesExample = ({
  className,
  series,
  ...args
}: Omit<RadarChartMultiSeriesProps, 'renderAxisTooltip'>) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  return (
    <div className={className}>
      <RadarChart
        {...args}
        series={series}
        selectedIds={selectedIds}
        activeLegendItemId={activeId}
        renderAxisTooltip={(axis) => (
          <>
            <ChartTooltipHeader title={axis.label} />
            <ChartTooltipBody>
              {axis.values.map((item) => (
                <ChartTooltipRow
                  key={item.id}
                  label={item.label}
                  value={formatPercent(item.value)}
                  markerColor={item.color}
                  highlighted={item.id === activeId}
                />
              ))}
            </ChartTooltipBody>
          </>
        )}
      />
      <ChartLegend
        layout="inline"
        items={series.map((item, index) => ({
          id: item.id,
          label: item.label,
          markerColor: item.color ?? getCategoricalLineChartColor(index),
          selected: selectedIds.has(item.id),
        }))}
        onItemActiveChange={(item) => setActiveId(item?.id ?? null)}
        onItemClick={(item) =>
          setSelectedIds((current) => toggleId(current, item.id))
        }
      />
    </div>
  );
};

const meta = {
  title: 'Components/Charts/RadarChart',
  component: RadarChart,
  tags: [
    'autodocs',
    'a11y-test',
    'radar',
    'spider chart',
    'multivariate',
    'categorical',
    'legend',
    'tooltip',
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'A radial comparison with a shared scale. Pass `data` for one series with categorical point colors, or `axes` and `series` for up to about four overlapping areas, such as experiments scored by the same evaluators. Compose with ChartLegend and supply ChartTooltipHeader / ChartTooltipRow through renderTooltip or renderAxisTooltip. Hover a point, axis, or label, or Tab through the axes, to inspect values. Use a shared maxValue when comparing charts.',
      },
    },
  },
  args: {
    data: workTypes,
    maxValue: 40,
    formatValue: formatPercent,
    renderTooltip: renderShareTooltip,
    'aria-label': 'Share of labeled threads by work type',
    className: 'w-full max-w-lg',
  },
  render: (args) => <RadarExample {...args} />,
} satisfies Meta<RadarChartSingleSeriesProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkType: Story = {
  args: {
    renderTooltip: (datum) => {
      const details = workTypes.find(({ id }) => id === datum.id);
      return (
        <>
          <ChartTooltipHeader title={datum.label} />
          <ChartTooltipBody>
            <ChartTooltipRow
              label="Share"
              value={formatPercent(datum.value)}
              markerColor={datum.color}
            />
            {details && (
              <>
                <ChartTooltipRow label="Threads" value={details.threads} />
                <ChartTooltipRow
                  label="Cost"
                  value={`$${details.cost.toFixed(2)}`}
                />
              </>
            )}
          </ChartTooltipBody>
        </>
      );
    },
  },
  render: (args) => (
    <ChartCard
      title="Work Type"
      description="60 of 68 threads labeled"
      className="max-w-lg"
    >
      <RadarExample {...args} />
    </ChartCard>
  ),
};

export const TokenUsage: Story = {
  args: { data: tokenUsage, 'aria-label': 'Token usage by activity' },
};

export const MultipleAxes: Story = {
  args: {
    data: [
      { id: 'accuracy', label: 'Accuracy', value: 90 },
      { id: 'speed', label: 'Speed', value: 65 },
      { id: 'cost', label: 'Cost Efficiency', value: 75 },
      { id: 'reliability', label: 'Reliability', value: 85 },
      { id: 'coverage', label: 'Coverage', value: 50 },
      { id: 'consistency', label: 'Consistency', value: 80 },
    ],
    maxValue: 100,
    'aria-label': 'Evaluation scores',
    renderTooltip: (datum) => (
      <>
        <ChartTooltipHeader title={datum.label} />
        <ChartTooltipRow
          label="Score"
          value={`${datum.value} / 100`}
          markerColor={datum.color}
        />
      </>
    ),
  },
};

export const MultipleSeries: Story = {
  render: () => (
    <SeriesExample
      axes={evaluators}
      series={experiments.slice(0, 2)}
      maxValue={100}
      formatValue={formatPercent}
      aria-label="Evaluator scores for Baseline and Prompt v2"
      className="w-full max-w-lg"
    />
  ),
};

export const ExperimentComparison: Story = {
  render: () => (
    <ChartCard
      title="Experiment Comparison"
      description="Mean evaluator score across 240 examples"
      className="max-w-lg"
    >
      <SeriesExample
        axes={evaluators}
        series={experiments}
        maxValue={100}
        formatValue={formatPercent}
        aria-label="Evaluator scores by experiment"
      />
    </ChartCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(
      canvas.getByRole('img', {
        name: 'Correctness: Baseline 72%, Prompt v2 81%, Rerank v3 87%',
      })
    ).toHaveFocus();
    await waitFor(() =>
      expect(page.getByRole('tooltip')).toHaveTextContent(
        'CorrectnessBaseline72%Prompt v281%Rerank v387%'
      )
    );
    await userEvent.keyboard('{Escape}');
    const legendItem = canvas.getByRole('button', { name: 'Rerank v3' });
    await userEvent.click(legendItem);
    await expect(
      canvas.getByRole('img', { name: 'Correctness: Rerank v3 87%' })
    ).toBeInTheDocument();
    // Restore every series so the story opens on the full comparison.
    await userEvent.click(legendItem);
    await expect(
      canvas.getByRole('img', { name: /^Correctness: Baseline/ })
    ).toBeInTheDocument();
    await userEvent.unhover(legendItem);
    legendItem.blur();
  },
};

export const CustomColors: Story = {
  args: {
    data: workTypes.map((datum, index) => ({
      ...datum,
      color: getCategoricalFillChartColor(index + 4),
    })),
  },
};

export const AllZero: Story = {
  args: { data: workTypes.map((datum) => ({ ...datum, value: 0 })) },
};

export const Empty: Story = { args: { data: [] } };

export const Narrow: Story = {
  render: (args) => (
    <div className="w-60">
      <RadarExample {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const firstAxis = canvas.getByRole('img', { name: 'Feature: 38%' });
    firstAxis.focus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('img', { name: 'Bugfix: 28%' })
    ).toHaveFocus();
    await waitFor(() => {
      expect(page.getByRole('tooltip')).toHaveTextContent('Bugfix');
      expect(
        firstAxis.closest('svg')?.parentElement?.scrollLeft
      ).toBeGreaterThan(0);
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument()
    );
  },
};

export const LongLabels: Story = {
  args: {
    data: workTypes.map((datum) => ({
      ...datum,
      label: `${datum.label} Across All Repositories`,
    })),
  },
};

export const Static: Story = { args: { renderTooltip: undefined } };

export const InCard: Story = {
  args: { data: tokenUsage, 'aria-label': 'Token usage by activity' },
  render: (args) => (
    <ChartCard title="Token Usage" className="max-w-lg">
      <RadarExample {...args} />
    </ChartCard>
  ),
};

export const Loading: Story = {
  render: () => (
    <ChartCard
      title="Work Type"
      description="60 of 68 threads labeled"
      state="loading"
      skeletonVariant="radar"
      // Reserve the 440:340 plot plus its legend and gap, like the ready story.
      skeletonClassName="aspect-[440/364]"
      className="max-w-lg"
    />
  ),
};
