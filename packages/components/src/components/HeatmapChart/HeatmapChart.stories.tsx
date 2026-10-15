import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeatmapBlock, HeatmapChart } from '.';

const data = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 52 }, (_, column) => (row * 37 + column * 19) % 101)
);

const meta = {
  title: 'Components/Charts/HeatmapChart',
  component: HeatmapChart,
  tags: ['autodocs', 'heatmap', 'matrix', 'opacity', 'chart'],
  parameters: { layout: 'padded' },
  args: { data, size: 'md', color: 'green' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'select', options: ['yellow', 'green', 'red', 'blue'] },
  },
} satisfies Meta<typeof HeatmapChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HorizontalScroll: Story = {
  render: (args) => (
    <div className="w-full max-w-xs">
      <HeatmapChart {...args} />
    </div>
  ),
};

export const ColorsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-space-4">
      {(['sm', 'md', 'lg'] satisfies Array<'sm' | 'md' | 'lg'>).map((size) => (
        <div key={size} className="flex gap-space-4">
          {(
            ['yellow', 'green', 'red', 'blue'] satisfies Array<
              'yellow' | 'green' | 'red' | 'blue'
            >
          ).map((color) => (
            <HeatmapChart
              key={color}
              data={[[0, 25, 50, 75, 100]]}
              size={size}
              color={color}
              aria-label={`${color} ${size}`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Empty: Story = { args: { data: [] } };

export const CustomLabels: Story = {
  args: {
    data: [[0, 50, 100]],
    getBlockLabel: (value, row, column) =>
      `Experiment ${row + 1}, day ${column + 1}: ${value}% success`,
  },
};

export const StandaloneBlock: Story = {
  render: () => <HeatmapBlock opacity={75} color="blue" size="lg" />,
};
