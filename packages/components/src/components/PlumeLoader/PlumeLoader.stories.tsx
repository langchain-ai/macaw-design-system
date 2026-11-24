import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlumeLoader } from '.';

const meta = {
  title: 'Components/Status/PlumeLoader',
  component: PlumeLoader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Proof of concept. The plume from the GTM agent intro animation as a loader, drawn as an inline animated SVG in LangChain light blue (#7FC8FF). `plume` is one full-size plume: the stem draws up from its hub, the strands fan out and each tip lights as its strand arrives. `field` tiles hubs of four plumes into a network that lights in a wave from the centre outward. Respects reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'poc', 'loading', 'status', 'ai', 'agentic'],
  argTypes: {
    variant: { control: 'select', options: ['plume', 'field'] },
    size: { control: { type: 'number', min: 48, step: 8 } },
    columns: { control: { type: 'number', min: 1, max: 9 } },
    rows: { control: { type: 'number', min: 1, max: 6 } },
    tone: { control: 'select', options: ['neutral', 'brand'] },
    animated: { control: 'boolean' },
    speed: { control: 'select', options: ['normal', 'slow'] },
  },
  args: {
    variant: 'plume',
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

export const Static: Story = { args: { size: 200, animated: false } };

export const Slow: Story = { args: { size: 200, speed: 'slow' } };
