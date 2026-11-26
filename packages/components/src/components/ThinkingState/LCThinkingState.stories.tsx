import { Fragment } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { LCPlumeIndicator, LCThinkingState } from './LCThinkingState';

const meta = {
  title: 'Components/Status/LCThinkingState',
  component: LCThinkingState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Proof of concept. ThinkingState with the LangChain plume from the GTM agent intro: the stem draws up from its hub, the strands fan out, and each tip lights as its strand arrives. Drawn as an inline animated SVG. It draws 4 heavier strands at 12px, 6 at 16px and 8 from 20px up, so it still reads small. `flow`, `segmentAnimation` and `convergePoint` work as in PlumeLoader, which has the full-size plume and the pattern. Respects reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'poc', 'loading', 'status', 'thinking', 'ai', 'agentic'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    flow: { control: 'inline-radio', options: ['diverge', 'converge'] },
    segmentAnimation: {
      control: 'inline-radio',
      options: ['concurrent', 'independent'],
    },
    convergePoint: {
      control: 'inline-radio',
      options: ['down', 'up', 'left', 'right'],
    },
    tone: { control: 'select', options: ['neutral', 'brand'] },
    motion: { control: 'select', options: ['full', 'subtle', 'none'] },
    speed: { control: 'select', options: ['normal', 'slow'] },
    label: { control: 'text' },
    showElapsed: { control: 'boolean' },
  },
  args: {
    label: 'Thinking',
    size: 'sm',
    flow: 'diverge',
    segmentAnimation: 'concurrent',
    convergePoint: 'down',
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

export const Converge: Story = { args: { size: 'lg', flow: 'converge' } };

export const Independent: Story = {
  args: { size: 'lg', segmentAnimation: 'independent' },
};

export const ConvergePoints: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <div className="flex flex-col gap-space-4">
      {(['down', 'up', 'left', 'right'] as const).map((point) => (
        <LCThinkingState
          key={point}
          {...args}
          convergePoint={point}
          label={`Point ${point}`}
        />
      ))}
    </div>
  ),
};

export const Neutral: Story = { args: { tone: 'neutral' } };

export const Slow: Story = { args: { speed: 'slow' } };

/** The indicator alone, from 12px up to 96px, to judge the animation itself. */
export const IndicatorScale: Story = {
  render: ({ tone, flow, segmentAnimation, convergePoint }) => {
    const shared = { tone, flow, segmentAnimation, convergePoint };
    return (
      <div className="flex items-end gap-space-6">
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <LCPlumeIndicator key={size} size={size} {...shared} />
        ))}
        <LCPlumeIndicator size="lg" width={48} height={48} {...shared} />
        <LCPlumeIndicator size="lg" width={96} height={96} {...shared} />
      </div>
    );
  },
};
