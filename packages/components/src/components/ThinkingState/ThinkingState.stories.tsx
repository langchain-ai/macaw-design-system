import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoadingIndicator, ThinkingState } from '.';
import { Button } from '../Button';
import { Card } from '../Card';
import { Text } from '../Text';

const meta = {
  title: 'Components/Status/ThinkingState',
  component: ThinkingState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'For active AI work: generating replies, reasoning, or using tools. Use `Spinner` for routine fetching/saving and `Skeleton` for known content layouts. Includes an optional elapsed timer; `LoadingIndicator` provides the animation alone.',
      },
    },
  },
  tags: [
    'autodocs',
    'loading',
    'status',
    'pixel',
    'shimmer',
    'elapsed',
    'thinking',
    'ai',
    'agentic',
    'indeterminate',
  ],
  argTypes: {
    variant: { control: 'select', options: ['drive', 'dots', 'orbit'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tone: { control: 'select', options: ['neutral', 'brand'] },
    motion: { control: 'select', options: ['full', 'subtle', 'none'] },
    label: { control: 'text' },
    showElapsed: { control: 'boolean' },
    elapsedMs: { control: { type: 'number', min: 0, step: 1000 } },
    timerPrecision: { control: 'select', options: ['seconds', 'tenths'] },
  },
  args: {
    label: 'Thinking',
    variant: 'drive',
    size: 'sm',
    tone: 'neutral',
    motion: 'full',
    showElapsed: false,
    timerPrecision: 'seconds',
  },
} satisfies Meta<typeof ThinkingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-space-6 gap-y-space-5">
      <Text variant="sm" color="secondary">
        Drive
      </Text>
      <ThinkingState {...args} variant="drive" />
      <Text variant="sm" color="secondary">
        Dots
      </Text>
      <ThinkingState {...args} variant="dots" />
      <Text variant="sm" color="secondary">
        Orbit
      </Text>
      <ThinkingState {...args} variant="orbit" />
    </div>
  ),
};

export const Sizes: Story = {
  args: { tone: 'brand', label: 'Gathering context', showElapsed: true },
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-space-6 gap-y-space-5">
      <Text variant="sm" color="secondary">
        Small
      </Text>
      <ThinkingState {...args} size="sm" />
      <Text variant="sm" color="secondary">
        Medium
      </Text>
      <ThinkingState {...args} size="md" />
      <Text variant="sm" color="secondary">
        Large
      </Text>
      <ThinkingState {...args} size="lg" />
    </div>
  ),
};

export const Motion: Story = {
  args: { tone: 'brand' },
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-space-6 gap-y-space-5">
      <Text variant="sm" color="secondary">
        Full
      </Text>
      <ThinkingState {...args} motion="full" />
      <Text variant="sm" color="secondary">
        Subtle
      </Text>
      <ThinkingState {...args} motion="subtle" />
      <Text variant="sm" color="secondary">
        None
      </Text>
      <ThinkingState {...args} motion="none" />
    </div>
  ),
};

export const WithTimer: Story = { args: { showElapsed: true } };

export const ControlledTimer: Story = {
  args: {
    label: 'Running AI evaluation',
    tone: 'brand',
    showElapsed: true,
    elapsedMs: 65_400,
    timerPrecision: 'tenths',
  },
};

export const IndicatorOnly: Story = {
  render: ({ variant, size, tone, motion }) => (
    <div role="status" className="flex items-center gap-space-2">
      <LoadingIndicator
        variant={variant}
        size={size}
        tone={tone}
        animated={motion !== 'none'}
      />
      <Text variant="sm">Generating reply</Text>
    </div>
  ),
};

export const InContext: Story = {
  args: { tone: 'brand', motion: 'subtle', showElapsed: true },
  render: (args) => (
    <Card className="flex w-80 max-w-full flex-col gap-space-4">
      <Text variant="h3">Evaluation</Text>
      <ThinkingState {...args} label="Running AI evaluators" />
      <Text variant="sm" color="tertiary">
        Results will appear as each evaluator finishes.
      </Text>
    </Card>
  ),
};

export const Narrow: Story = {
  args: { label: 'Gathering context and reviewing the results' },
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
};

function TimerDemo() {
  const [operation, setOperation] = useState(0);
  const [showElapsed, setShowElapsed] = useState(true);
  return (
    <div className="flex flex-col items-start gap-space-4">
      <ThinkingState
        key={operation}
        label="Gathering context"
        tone="brand"
        showElapsed={showElapsed}
      />
      <div className="flex gap-space-2">
        <Button color="secondary" onClick={() => setShowElapsed(!showElapsed)}>
          {showElapsed ? 'Hide timer' : 'Show timer'}
        </Button>
        <Button color="secondary" onClick={() => setOperation(operation + 1)}>
          Restart
        </Button>
      </div>
    </div>
  );
}

export const TimerLifecycle: Story = { render: () => <TimerDemo /> };
