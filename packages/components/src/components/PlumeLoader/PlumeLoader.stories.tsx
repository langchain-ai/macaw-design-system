import { Fragment } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlumeLoader } from '.';
import { Text } from '../Text';

const meta = {
  title: 'Components/Status/PlumeLoader',
  component: PlumeLoader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Proof of concept. The plume from the GTM agent intro animation as a loader, drawn as an inline animated SVG in LangChain light blue (#7FC8FF). `plume` is one full-size plume: the stem draws up from its hub, the strands fan out and each tip lights as its strand arrives. `field` tiles hubs of four plumes into a network that lights in a wave from the centre outward. `flow` runs it outward (diverge) or inward to the single point (converge), `segmentAnimation` runs the strands together (concurrent) or each on its own random timing (independent), and `convergePoint` sets where the single point sits. Respects reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'poc', 'loading', 'status', 'ai', 'agentic'],
  argTypes: {
    variant: { control: 'select', options: ['plume', 'field'] },
    flow: { control: 'inline-radio', options: ['diverge', 'converge'] },
    segmentAnimation: {
      control: 'inline-radio',
      options: ['concurrent', 'independent'],
    },
    convergePoint: {
      control: 'inline-radio',
      options: ['down', 'up', 'left', 'right'],
    },
    size: { control: { type: 'number', min: 48, step: 8 } },
    columns: { control: { type: 'number', min: 1, max: 9 } },
    rows: { control: { type: 'number', min: 1, max: 6 } },
    tone: { control: 'select', options: ['neutral', 'brand'] },
    animated: { control: 'boolean' },
    speed: { control: 'select', options: ['normal', 'slow'] },
  },
  args: {
    variant: 'plume',
    flow: 'diverge',
    segmentAnimation: 'concurrent',
    convergePoint: 'down',
    tone: 'brand',
    animated: true,
    speed: 'normal',
    label: 'Loading',
  },
} satisfies Meta<typeof PlumeLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plume: Story = { args: { size: 200 } };

export const PlumeOnDark: Story = {
  args: { size: 240 },
  decorators: [
    (Story) => (
      <div
        className="rounded-lg p-space-8"
        style={{ background: '#030710' }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Field: Story = {
  args: { variant: 'field', columns: 5, rows: 3 },
  parameters: { layout: 'fullscreen' },
};

export const FieldOnDark: Story = {
  args: { variant: 'field', columns: 7, rows: 4, size: 420 },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#030710' }}>
        <Story />
      </div>
    ),
  ],
};

export const Converge: Story = { args: { size: 200, flow: 'converge' } };

export const Independent: Story = {
  args: { size: 200, segmentAnimation: 'independent' },
};

/** Every combination of flow and segment animation, at each converge point. */
export const Matrix: Story = {
  args: { size: 120 },
  render: (args) => (
    <div className="grid grid-cols-[auto_repeat(4,auto)] items-center gap-x-space-6 gap-y-space-4">
      <span />
      {(['down', 'up', 'left', 'right'] as const).map((point) => (
        <Text key={point} variant="sm" color="secondary">
          {point}
        </Text>
      ))}
      {(['diverge', 'converge'] as const).flatMap((flow) =>
        (['concurrent', 'independent'] as const).map((segmentAnimation) => (
          <Fragment key={`${flow}-${segmentAnimation}`}>
            <Text variant="sm" color="secondary">
              {flow}, {segmentAnimation}
            </Text>
            {(['down', 'up', 'left', 'right'] as const).map((point) => (
              <PlumeLoader
                key={point}
                {...args}
                variant="plume"
                flow={flow}
                segmentAnimation={segmentAnimation}
                convergePoint={point}
              />
            ))}
          </Fragment>
        ))
      )}
    </div>
  ),
};

export const FieldConvergeIndependent: Story = {
  args: {
    variant: 'field',
    flow: 'converge',
    segmentAnimation: 'independent',
  },
  parameters: { layout: 'fullscreen' },
};

export const Static: Story = { args: { size: 200, animated: false } };

export const Slow: Story = { args: { size: 200, speed: 'slow' } };
