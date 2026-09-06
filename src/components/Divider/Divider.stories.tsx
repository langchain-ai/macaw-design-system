import type { Meta, StoryObj } from '@storybook/react-vite';

import { Divider } from '.';

const meta: Meta<typeof Divider> = {
  title: 'Components/Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-space-4 rounded-md border border-subtle bg-surface-level-2 p-space-4">
      <span className="text-sm text-primary">Section content</span>
      <Divider {...args} />
      <span className="text-sm text-secondary">Separated content</span>
    </div>
  ),
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-20 items-center gap-space-4 rounded-md border border-subtle bg-surface-level-2 p-space-4">
      <span className="text-sm text-primary">Left</span>
      <Divider {...args} />
      <span className="text-sm text-secondary">Right</span>
    </div>
  ),
  args: {
    orientation: 'vertical',
  },
};

export const AccessibleSeparator: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-space-4 rounded-md border border-subtle bg-surface-level-2 p-space-4">
      <span className="text-sm text-primary">Primary actions</span>
      <Divider {...args} />
      <span className="text-sm text-secondary">Secondary actions</span>
    </div>
  ),
  args: {
    decorative: false,
  },
};
