import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadarChart } from '.';
import { ChartCard } from '../ChartCard';

const tokenUsage = [
  { id: 'review', label: 'Code Review', value: 29 },
  { id: 'issues', label: 'Issues', value: 0 },
  { id: 'pulls', label: 'Pull Requests', value: 33 },
  { id: 'commits', label: 'Commits', value: 38 },
];

const meta: Meta<typeof RadarChart> = {
  title: 'Components/Charts/RadarChart',
  component: RadarChart,
  tags: ['autodocs', 'radar', 'spider chart', 'token usage', 'multivariate'],
  parameters: { layout: 'padded' },
  args: {
    data: tokenUsage,
    maxValue: 40,
    formatValue: (value) => `${value}%`,
    'aria-label': 'Token usage by activity',
    className: 'max-w-lg',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TokenUsage: Story = {};

export const MultipleAxes: Story = {
  args: {
    data: [
      { id: 'accuracy', label: 'Accuracy', value: 90 },
      { id: 'speed', label: 'Speed', value: 65 },
      { id: 'cost', label: 'Cost Efficiency', value: 75 },
      { id: 'reliability', label: 'Reliability', value: 85 },
      { id: 'coverage', label: 'Coverage', value: 50 },
    ],
    maxValue: 100,
    'aria-label': 'Evaluation scores',
  },
};

export const AllZero: Story = {
  args: { data: tokenUsage.map((datum) => ({ ...datum, value: 0 })) },
};

export const Empty: Story = { args: { data: [] } };

export const Narrow: Story = {
  render: (args) => (
    <div style={{ width: 240 }}>
      <RadarChart {...args} />
    </div>
  ),
};

export const LongLabels: Story = {
  args: {
    data: tokenUsage.map((datum) => ({
      ...datum,
      label: `${datum.label} Across All Repositories`,
    })),
  },
};

export const InCard: Story = {
  render: (args) => (
    <ChartCard title="Token Usage" className="max-w-lg">
      <RadarChart {...args} />
    </ChartCard>
  ),
};

export const Loading: Story = {
  render: () => (
    <ChartCard title="Token Usage" state="loading" className="h-96 max-w-lg" />
  ),
};

export const Error: Story = {
  render: () => (
    <ChartCard title="Token Usage" state="error" className="h-96 max-w-lg" />
  ),
};
