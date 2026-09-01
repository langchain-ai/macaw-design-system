import type { Meta, StoryObj } from '@storybook/react-vite';

import { LinearProgress } from '../components/LinearProgress';

const meta = {
  title: 'Components/Status/LinearProgress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    thicknessPx: { control: { type: 'number' } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Indeterminate: Story = {
  args: {
    'aria-label': 'Loading',
  },
};

export const Determinate: Story = {
  args: {
    'aria-label': 'Usage',
    value: 42,
  },
};

export const CustomThickness: Story = {
  args: {
    'aria-label': 'Custom thickness',
    value: 65,
    thicknessPx: 8,
  },
};
