import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadarChart, type RadarChartProps } from '.';
import { getCategoricalLineChartColor } from '../../utils/chartColors';
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

const formatPercent = (value: number) => `${value}%`;
const renderShareTooltip: RadarChartProps['renderTooltip'] = (datum) => (
  <>
    <ChartTooltipHeader title={datum.label} />
    <ChartTooltipRow
      label="Share"
      value={formatPercent(datum.value)}
      markerColor={datum.color}
    />
  </>
);

const RadarExample = ({ className, ...args }: RadarChartProps) => (
  <div className={className}>
    <RadarChart {...args} />
    {args.data.length >= 3 && (
      <ChartLegend
        layout="inline"
        items={args.data.map((datum, index) => ({
          id: datum.id,
          label: datum.label,
          markerColor: datum.color ?? getCategoricalLineChartColor(index),
        }))}
      />
    )}
  </div>
);

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
          'A single-series radial comparison with a shared scale and categorical point colors. Compose with ChartLegend and supply ChartTooltipHeader / ChartTooltipRow through renderTooltip. Hover a point or axis label, or Tab through the axes, to inspect its value. Use a shared maxValue when comparing charts.',
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
} satisfies Meta<typeof RadarChart>;

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

export const CustomColors: Story = {
  args: {
    data: workTypes.map((datum, index) => ({
      ...datum,
      color: getCategoricalLineChartColor(index + 4),
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
