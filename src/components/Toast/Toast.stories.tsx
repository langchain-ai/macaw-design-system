import { MemoryRouter, Link as RouterLink } from 'react-router-dom';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { ToastProvider } from '../Toast';
import type { ToastConfig } from '../Toast';
import useToast from '../Toast/useToast';

const meta = {
  title: 'Components/Status/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: null,
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Trigger({ label, config }: { label: string; config: ToastConfig }) {
  const { createToast } = useToast();
  return <Button onClick={() => createToast(config)}>{label}</Button>;
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show default toast"
        config={{
          title: 'Saved your changes.',
        }}
      />
    </ToastProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show error toast"
        config={{
          type: 'error',
          title: 'Failed to save',
          description: 'The server responded with a 500 error.',
        }}
      />
    </ToastProvider>
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show warning toast"
        config={{
          type: 'warning',
          title: 'Approaching usage limit',
          description: "You've used 85% of your monthly trace quota.",
        }}
      />
    </ToastProvider>
  ),
};

export const Success: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show success toast"
        config={{
          type: 'success',
          title: 'Dataset created',
          description: 'Your new dataset is ready to use.',
        }}
      />
    </ToastProvider>
  ),
};

export const Info: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show info toast"
        config={{
          type: 'info',
          title: 'New version available',
          description: 'Refresh to load the latest changes.',
        }}
      />
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show error with actions"
        config={{
          type: 'error',
          title: 'Trace limit exceeded',
          description:
            'This feature is disabled until the end of the month or the limit is increased.',
          action: (
            <div className="flex gap-space-2">
              <Button
                as={<RouterLink to="/settings/billing" />}
                color="secondary"
                variant="underlined"
                size="xs"
              >
                Configure limits
              </Button>
              <Button color="secondary" variant="plain" size="xs">
                Learn more
              </Button>
            </div>
          ),
        }}
      />
    </ToastProvider>
  ),
};

export const DescriptionOnly: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show description-only toast"
        config={{
          description: 'Configuration settings saved successfully.',
        }}
      />
    </ToastProvider>
  ),
};

export const DescriptionOnlyWithLink: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show description-only toast with link"
        config={{
          description: (
            <span>
              <span>{'1 run added to '}</span>
              <RouterLink to="/datasets/example" className="underline">
                Test with schema
              </RouterLink>
            </span>
          ),
        }}
      />
    </ToastProvider>
  ),
};

export const LongDescription: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        label="Show long description (scrolls)"
        config={{
          type: 'error',
          title: "Couldn't modify dataset.",
          description: `Validation failed for the dataset schema. Some examples don't conform to the inputs or outputs declared on the dataset.

Input errors:
- field "user_id" is required but missing on example 12
- field "query" has wrong type (expected string) on example 18
- field "timestamp" is missing on example 23
- field "session_id" must be a UUID on example 41

Output errors:
- field "response" exceeds max length on example 7
- field "tool_calls" must be an array on example 14
- example 22 has no output field at all
- field "score" must be between 0 and 1 on example 31

Request ID: 0x9f3a3c1b`,
        }}
      />
    </ToastProvider>
  ),
};
