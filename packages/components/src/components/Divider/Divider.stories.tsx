import type { Meta, StoryObj } from '@storybook/react-vite';

import { Divider } from '.';

const meta: Meta<typeof Divider> = {
  title: 'Components/Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'separator', 'rule'],
  argTypes: {
    weight: {
      control: 'select',
      options: ['default', 'strong'],
    },
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
    <div className="gap-space-4 border-subtle bg-surface-level-2 p-space-4 flex w-96 flex-col rounded-md border">
      <span className="text-primary text-sm">Section content</span>
      <Divider {...args} />
      <span className="text-secondary text-sm">Separated content</span>
    </div>
  ),
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  render: (args) => (
    <div className="gap-space-4 border-subtle bg-surface-level-2 p-space-4 flex h-20 items-center rounded-md border">
      <span className="text-primary text-sm">Left</span>
      <Divider {...args} />
      <span className="text-secondary text-sm">Right</span>
    </div>
  ),
  args: {
    orientation: 'vertical',
  },
};

export const Strong: Story = {
  ...Horizontal,
  args: {
    orientation: 'horizontal',
    weight: 'strong',
  },
};

export const AccessibleSeparator: Story = {
  render: (args) => (
    <div className="gap-space-4 border-subtle bg-surface-level-2 p-space-4 flex w-96 flex-col rounded-md border">
      <span className="text-primary text-sm">Primary actions</span>
      <Divider {...args} />
      <span className="text-secondary text-sm">Secondary actions</span>
    </div>
  ),
  args: {
    decorative: false,
  },
};
