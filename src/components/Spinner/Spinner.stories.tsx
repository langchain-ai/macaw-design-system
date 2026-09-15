import type { StoryObj } from '@storybook/react-vite';

import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Status/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'For routine saving, fetching, or refreshing, including within AI screens. Use `ThinkingState` for active AI work and `Skeleton` for known content layouts. Announce loading on the surrounding control or region.',
      },
    },
  },
  tags: ['autodocs', 'loading', 'busy', 'indeterminate'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'sm',
  },
};

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};
