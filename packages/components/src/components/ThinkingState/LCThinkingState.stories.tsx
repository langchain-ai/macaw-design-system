import { Fragment } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { LCFanOutIndicator, LCThinkingState } from './LCThinkingState';

const meta = {
  title: 'Components/Status/LCThinkingState',
  component: LCThinkingState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Proof of concept. ThinkingState with a LangChain fan-out indicator: one root node sends out its branches and each end node lights as its branch arrives. Drawn as an inline animated SVG. At 12px and 16px it draws three thicker branches so it still reads; at 20px and up it draws five. Respects reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'poc', 'loading', 'status', 'thinking', 'ai', 'agentic'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    tone: { control: 'select', options: ['neutral', 'brand'] },
    motion: { control: 'select', options: ['full', 'subtle', 'none'] },
    speed: { control: 'select', options: ['normal', 'slow'] },
    label: { control: 'text' },
    showElapsed: { control: 'boolean' },
  },
  args: {
    label: 'Thinking',
    size: 'sm',
    tone: 'brand',
    motion: 'full',
    speed: 'normal',
    showElapsed: false,
  },
} satisfies Meta<typeof LCThinkingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  args: { label: 'Gathering context', showElapsed: true },
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-space-6 gap-y-space-5">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Fragment key={size}>
          <Text variant="sm" color="secondary">
            {size}
          </Text>
          <LCThinkingState {...args} size={size} />
        </Fragment>
      ))}
    </div>
  ),
};

export const Motion: Story = {
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-space-6 gap-y-space-5">
      {(['full', 'subtle', 'none'] as const).map((motion) => (
        <Fragment key={motion}>
          <Text variant="sm" color="secondary">
            {motion}
          </Text>
          <LCThinkingState {...args} motion={motion} />
        </Fragment>
      ))}
    </div>
  ),
};

export const Neutral: Story = { args: { tone: 'neutral' } };

export const Slow: Story = { args: { speed: 'slow' } };

/** The indicator alone, from 12px up to 96px, to judge the animation itself. */
export const IndicatorScale: Story = {
  render: ({ tone }) => (
    <div className="flex items-end gap-space-6">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <LCFanOutIndicator key={size} size={size} tone={tone} />
      ))}
      <LCFanOutIndicator size="lg" tone={tone} width={48} height={48} />
      <LCFanOutIndicator size="lg" tone={tone} width={96} height={96} />
    </div>
  ),
};
