import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { ErrorState } from '../ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/Status/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [null, 404],
    },
    withoutOverlay: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    backLabel: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] w-full bg-surface-level-1">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Full 404 page — as rendered by the NoMatch route. */
export const NotFound404: Story = {
  args: {
    title: 'Page not found',
    message: "The page you're looking for doesn't exist or has moved.",
    status: 404,
    backTo: '/',
  },
};

/** 404 without the animated wave — used for full-screen not-found views. */
export const NotFoundNoOverlay: Story = {
  args: {
    title: 'Run not found',
    message: 'This run may have been deleted or you may not have access to it.',
    status: 404,
    backTo: '/',
    backLabel: 'Back to project',
    withoutOverlay: true,
  },
};

/** Inline error inside a panel/table — no illustration, reduced top padding. */
export const InlinePanelError: Story = {
  args: {
    title: 'Something went wrong',
    message: 'Failed to load runs. Please try again.',
    contentClassName: 'pt-space-6',
  },
};

/** Custom action slot in place of the default back button (empty-state usage). */
export const WithAction: Story = {
  args: {
    title: 'No messages to display',
    message: 'This trace has no chat messages.',
    contentClassName: 'pt-space-6',
    action: (
      <Button variant="normal" size="sm" color="secondary">
        Switch to details view
      </Button>
    ),
  },
};
