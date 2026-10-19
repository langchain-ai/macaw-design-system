import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SparkLineChart } from '.';
import type { SparkLineChartColor } from '.';
import { ChartCard } from '../ChartCard';
import { DropdownMenuItem } from '../DropdownMenu';
import { MetricChart } from '../MetricChart';
import { Text } from '../Text';

const standardData = [
  { x: 0, y: 8 },
  { x: 1, y: 13 },
  { x: 2, y: 10 },
  { x: 3, y: 19 },
  { x: 4, y: 16 },
  { x: 5, y: 24 },
];

const sparkLineColors: SparkLineChartColor[] = [
  'brand',
  'neutral',
  'success',
  'warning',
  'error',
];

interface InlineTableRowDefinition {
  label: string;
  value: string;
  values: number[];
  color: SparkLineChartColor;
}

const inlineTableRowDefinitions: InlineTableRowDefinition[] = [
  {
    label: 'Successful runs',
    value: '1,248',
    values: [8, 13, 10, 19, 16, 24],
    color: 'success',
  },
  {
    label: 'Errors',
    value: '84',
    values: [14, 12, 16, 10, 8, 6],
    color: 'error',
  },
  {
    label: 'Latency',
    value: '842 ms',
    values: [12, 18, 15, 22, 20, 28],
    color: 'warning',
  },
  {
    label: 'Token usage',
    value: '2.4M',
    values: [5, 9, 7, 13, 18, 17],
    color: 'warning',
  },
  {
    label: 'Cost',
    value: '$184.32',
    values: [4, 6, 8, 7, 12, 14],
    color: 'warning',
  },
  {
    label: 'Feedback score',
    value: '0.91',
    values: [14, 13, 16, 15, 18, 19],
    color: 'success',
  },
  {
    label: 'Traces',
    value: '3,482',
    values: [6, 8, 12, 11, 16, 21],
    color: 'success',
  },
  {
    label: 'Users',
    value: '642',
    values: [9, 11, 10, 14, 17, 18],
    color: 'success',
  },
  {
    label: 'Projects',
    value: '28',
    values: [3, 4, 4, 5, 7, 8],
    color: 'success',
  },
  {
    label: 'Alerts',
    value: '12',
    values: [18, 15, 13, 10, 8, 5],
    color: 'error',
  },
];

const inlineTableRows = inlineTableRowDefinitions.map(
  ({ label, value, values, color }) => ({
    label,
    value,
    color,
    data: values.map((y, x) => ({ x, y })),
  })
);

const meta: Meta<typeof SparkLineChart> = {
  title: 'Components/Charts/SparkLineChart',
  component: SparkLineChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a lightweight, responsive SVG trend line with a translucent area from x/y points. Use it as non-interactive trend context in compact inline spaces or inside other components (e.g., table cells, KPI charts).',
      },
    },
  },
  tags: ['autodocs', 'small', 'inline line graph', 'trend'],
  argTypes: {
    shouldAnimate: {
      control: 'boolean',
      description:
        'Animates chart marks unless disabled or reduced motion is preferred.',
      table: { defaultValue: { summary: 'true' } },
    },
    color: {
      control: 'select',
      options: sparkLineColors,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StandardData: Story = {
  args: {
    data: standardData,
    color: 'brand',
    className: 'h-32 w-full',
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div className="grid gap-space-5 sm:grid-cols-2">
      {sparkLineColors.map((color) => (
        <div key={color} className="flex flex-col gap-space-2">
          <Text variant="sm" weight="medium">
            {color}
          </Text>
          <SparkLineChart
            data={standardData}
            color={color}
            className="h-24 w-full"
            aria-label={`${color} trend`}
          />
        </div>
      ))}
    </div>
  ),
};

export const FlatAndNegativeData: Story = {
  render: () => (
    <div className="grid gap-space-5 sm:grid-cols-2">
      <div className="flex flex-col gap-space-2">
        <Text variant="sm" color="secondary">
          Flat domain
        </Text>
        <SparkLineChart
          data={[
            { x: 0, y: -4 },
            { x: 1, y: -4 },
            { x: 2, y: -4 },
          ]}
          className="h-24 w-full"
          aria-label="Flat negative trend"
        />
      </div>
      <div className="flex flex-col gap-space-2">
        <Text variant="sm" color="secondary">
          Mixed negative values
        </Text>
        <SparkLineChart
          data={[
            { x: 0, y: -12 },
            { x: 1, y: -3 },
            { x: 2, y: -18 },
            { x: 3, y: 2 },
          ]}
          className="h-24 w-full"
          aria-label="Mixed negative trend"
        />
      </div>
    </div>
  ),
};

export const InlineTableExample: Story = {
  render: () => (
    <div className="max-w-xl overflow-x-auto rounded-md border border-subtle">
      <table className="w-full border-collapse">
        <thead className="bg-surface-level-2">
          <tr>
            <th scope="col" className="px-space-3 py-space-2 text-left">
              <Text as="span" variant="xs" weight="semibold" color="tertiary">
                Metric
              </Text>
            </th>
            <th scope="col" className="px-space-3 py-space-2 text-left">
              <Text as="span" variant="xs" weight="semibold" color="tertiary">
                Trend
              </Text>
            </th>
            <th scope="col" className="px-space-3 py-space-2 text-right">
              <Text as="span" variant="xs" weight="semibold" color="tertiary">
                Value
              </Text>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary bg-surface-level-1">
          {inlineTableRows.map((row) => (
            <tr key={row.label}>
              <td className="px-space-3 py-space-2">
                <Text variant="sm" weight="medium">
                  {row.label}
                </Text>
              </td>
              <td className="w-32 px-space-3 py-space-2">
                <SparkLineChart
                  data={row.data}
                  color={row.color}
                  className="h-6 w-24"
                  aria-label={`${row.label} trend`}
                />
              </td>
              <td className="px-space-3 py-space-2 text-right">
                <Text variant="sm" className="tabular-nums">
                  {row.value}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const LargeBackgroundExample: Story = {
  render: () => (
    <ChartCard
      title="Total runs"
      className="h-64 w-full max-w-3xl"
      contentClassName="relative"
      isMovable
      dragHandleProps={{ onPointerDown: fn() }}
      expandButtonProps={{ onClick: fn() }}
      menuItems={
        <DropdownMenuItem onSelect={fn()}>
          <Text as="span" variant="sm">
            View details
          </Text>
        </DropdownMenuItem>
      }
    >
      <SparkLineChart
        data={standardData}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
      />
      <MetricChart
        layout="centered"
        size="xl"
        value="1,248,392"
        className="relative h-full"
      />
    </ChartCard>
  ),
};
