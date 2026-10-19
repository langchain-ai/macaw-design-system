import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar, type ProgressBarProps } from '.';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

type ProgressBarStoryArgs = Extract<ProgressBarProps, { 'aria-label': string }>;

function StoryProgressBar(props: ProgressBarStoryArgs) {
  return <ProgressBar {...props} />;
}

const meta = {
  title: 'Components/Status/ProgressBar',
  component: StoryProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: [
    'autodocs',
    'completion',
    'percentage',
    'labeled',
    'progress indicator',
    'bar',
  ],
  args: {
    value: 42,
    'aria-label': 'Progress',
  },
  argTypes: {
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    label: { control: { type: 'text' } },
    labelPosition: {
      control: { type: 'select' },
      options: ['top', 'bottom'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: { type: 'select' },
      options: ['brand', 'neutral', 'success', 'warning', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ProgressBarStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const POLICY_USAGE_ROWS = [
  {
    name: 'Default model',
    spent: '$40.00',
    percent: 40,
    color: 'success',
  },
  {
    name: 'Team budget',
    spent: '$82.00',
    percent: 82,
    color: 'warning',
  },
  {
    name: 'Workspace cap',
    spent: '$100.00',
    percent: 100,
    color: 'error',
  },
] as const;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    value: 65,
    label: '65%',
    'aria-label': 'Usage',
  },
  render: function LabelPositions(args) {
    return (
      <div className="gap-space-5 flex flex-col">
        <ProgressBar
          {...args}
          labelPosition="top"
          aria-label="Usage with label above"
        />
        <ProgressBar
          {...args}
          labelPosition="bottom"
          aria-label="Usage with label below"
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: function SizesShowcase() {
    return (
      <div className="gap-space-4 flex flex-col">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="gap-space-1 flex flex-col">
            <Text variant="xs" color="secondary">
              {size}
            </Text>
            <ProgressBar
              value={65}
              size={size}
              label="65%"
              aria-label={`${size} progress`}
            />
          </div>
        ))}
      </div>
    );
  },
};

export const Colors: Story = {
  render: function ColorsShowcase() {
    return (
      <div className="gap-space-4 flex flex-col">
        {(['brand', 'neutral', 'success', 'warning', 'error'] as const).map(
          (color) => (
            <div key={color} className="gap-space-1 flex flex-col">
              <Text variant="xs" color="secondary">
                {color}
              </Text>
              <ProgressBar
                value={65}
                color={color}
                aria-label={`${color} progress`}
              />
            </div>
          )
        )}
      </div>
    );
  },
};

export const InsideTable: Story = {
  render: function CompactTableExample() {
    return (
      <div className="border-subtle flex flex-col rounded-md border">
        <div className="gap-space-2 border-subtle px-space-3 py-space-2 grid grid-cols-[7rem_1fr] border-b">
          <Text as="span" variant="xs" weight="medium">
            Policy
          </Text>
          <Text as="span" variant="xs" weight="medium">
            Usage
          </Text>
        </div>
        {POLICY_USAGE_ROWS.map((row, index) => (
          <div
            key={row.name}
            className={cn(
              'gap-space-2 px-space-3 py-space-2 grid grid-cols-[7rem_1fr] items-center',
              index > 0 && 'border-subtle border-t'
            )}
          >
            <Text as="span" variant="xs" weight="medium">
              {row.name}
            </Text>
            <div className="gap-space-1 flex flex-col">
              <div className="gap-space-2 flex items-baseline justify-between">
                <Text as="span" variant="xs" color="secondary">
                  {row.spent} used
                </Text>
                <Text as="span" variant="xs" color="tertiary">
                  {row.percent}%
                </Text>
              </div>
              <ProgressBar
                value={row.percent}
                size="sm"
                color={row.color}
                aria-label={`${row.name} spend usage`}
                aria-valuetext={`${row.spent} of $100.00 used`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};
