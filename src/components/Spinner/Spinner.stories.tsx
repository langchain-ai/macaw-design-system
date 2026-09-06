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
          'Visual-only indicator for brief indeterminate activity. Announce loading on the surrounding control or region. Uses the visual-element outer-box scale: xs=16px, sm=20px, md=24px, with lg=32px retained as a compatibility tier.',
      },
    },
  },
  tags: ['autodocs'],
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
