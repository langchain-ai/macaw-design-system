import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from '.';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/Display/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'status', 'state', 'badge', 'health', 'label'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: ['xxs', 'xs', 'sm', 'md'] },
    icon: { control: false },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'success', children: 'Active' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-space-2">
      <StatusBadge>Owner</StatusBadge>
      <StatusBadge variant="info">Beta</StatusBadge>
      <StatusBadge variant="success">Active</StatusBadge>
      <StatusBadge variant="warning">Expires in 3 days</StatusBadge>
      <StatusBadge variant="error">Failed</StatusBadge>
    </div>
  ),
};

/**
 * `xs` (16px) is the default, for beside a title or in a row. `sm` (20px) and
 * `md` (24px) suit roomier headers; the icon grows to 16px at `md`. `xxs`
 * matches `xs` in height with normal-weight text.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-space-3">
      {(['xxs', 'xs', 'sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-space-2">
          <StatusBadge size={size}>Owner</StatusBadge>
          <StatusBadge size={size} variant="info">
            Beta
          </StatusBadge>
          <StatusBadge size={size} variant="success">
            Active
          </StatusBadge>
          <StatusBadge size={size} variant="warning">
            Expires in 3 days
          </StatusBadge>
          <StatusBadge size={size} variant="error">
            Failed
          </StatusBadge>
        </div>
      ))}
    </div>
  ),
};

/** A different icon, or `null` for none. */
export const CustomIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-space-2">
      <StatusBadge variant="info" icon={ClockIcon}>
        Scheduled
      </StatusBadge>
      <StatusBadge variant="success" icon={null}>
        Paid
      </StatusBadge>
    </div>
  ),
};
