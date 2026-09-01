import { fn } from 'storybook/test';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { ArrowRightIcon } from '../icons/PaddedPhosphorIcons';

const meta = {
  title: 'Components/Status/Banner',
  component: Banner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
- Keep banner copy concise and action-oriented. State important info in one short sentence and use the \`action\` prop for a clear, specific CTA.
- We recommend full-page (\`flush\`) banners to remain on single-line at standard widths. Avoid forced line breaks and block children.
- Avoid spamming or stacking multiple banners in a single page. Consider a single banner with a list of items or a link to a dedicated page.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: { type: 'select' },
      options: ['warning', 'info', 'success', 'error', 'neutral'],
    },
    title: {
      control: { type: 'text' },
    },
    children: {
      control: { type: 'text' },
    },
    dismissible: {
      control: { type: 'boolean' },
    },
    shadow: {
      control: { type: 'boolean' },
    },
    flush: {
      control: { type: 'boolean' },
    },
  },
  args: {
    onDismiss: fn(),
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {
  args: {
    intent: 'warning',
    title: 'Heads up',
    children: 'This action may have unintended consequences.',
  },
};

export const Info: Story = {
  args: {
    intent: 'info',
    title: 'New: LangSmith Engine',
    children: 'Triage and fix issues found in your traces.',
    dismissible: true,
    action: (
      <Button variant="plain" size="sm" color="primary" onClick={fn()}>
        Try it now
      </Button>
    ),
  },
};

export const Success: Story = {
  args: {
    intent: 'success',
    title: 'Changes saved',
    children: 'Your updates were applied successfully.',
  },
};

export const Error: Story = {
  args: {
    intent: 'error',
    title: 'Something went wrong',
    children: 'We could not complete your request. Please try again.',
  },
};

export const Neutral: Story = {
  args: {
    intent: 'neutral',
    title: 'Heads up',
    children: 'A general-purpose notice with no urgency attached.',
  },
};

export const Responsive: Story = {
  parameters: {
    layout: 'padded',
  },
  args: {
    intent: 'info',
    title: 'Responsive example',
    children:
      'Resize the story to see the title and content wrap together without truncation while the icon and action remain in place.',
    action: (
      <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
        Learn more
      </Button>
    ),
    dismissible: true,
  },
  render: (args) => (
    <div className="w-full max-w-[52rem]">
      <Banner {...args} />
    </div>
  ),
};

export const Flush: Story = {
  args: {
    flush: true,
    intent: 'info',
    title: 'Scheduled maintenance',
    children: 'Maintenance begins Saturday at 2am UTC.',
    dismissible: true,
    action: (
      <Button variant="plain" size="xs" color="primary" onClick={fn()}>
        View details
      </Button>
    ),
  },
  render: (args) => (
    <div className="flex h-[17.5rem] w-[52rem] flex-col overflow-hidden border border-subtle">
      <Banner {...args} className="flex-none" />
      <div className="flex-1 bg-surface-level-1 p-space-4 text-sm text-tertiary">
        main content
      </div>
    </div>
  ),
};

export const WithoutTitle: Story = {
  args: {
    intent: 'warning',
  },
  render: () => (
    <div className="flex w-[45rem] flex-col gap-space-3">
      <Banner intent="warning">
        Postgres TTL is reaching its threshold — older traces may be pruned
        soon.
      </Banner>
      <Banner intent="warning" dismissible>
        Postgres TTL is reaching its threshold — older traces may be pruned
        soon. Adjust your retention policy in settings if you need to keep this
        data longer.
      </Banner>
    </div>
  ),
};

export const AllIntents: Story = {
  args: {
    title: 'Banner title',
  },
  render: () => (
    <div className="flex w-[52rem] flex-col gap-space-6">
      <div className="flex flex-col gap-space-3">
        <Banner
          intent="warning"
          title="Action required"
          action={
            <Button
              variant="plain"
              size="xs"
              color="secondary"
              rightDecorator={ArrowRightIcon}
              onClick={fn()}
            >
              Configure
            </Button>
          }
        >
          Configure your account to keep things running.
        </Banner>
        <Banner
          intent="info"
          title="New: LangSmith Engine"
          dismissible
          action={
            <Button variant="plain" size="xs" color="primary" onClick={fn()}>
              Try it now
            </Button>
          }
        >
          Triage and fix issues found in your traces.
        </Banner>
        <Banner
          intent="success"
          title="Setup complete"
          dismissible
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              View workspace
            </Button>
          }
        >
          Your workspace is ready to go.
        </Banner>
        <Banner
          intent="error"
          title="Build failed"
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              Copy logs
            </Button>
          }
        >
          An error occurred while creating a Docker image from your specified
          GitHub repository.
        </Banner>
        <Banner
          intent="neutral"
          title="Maintenance window"
          dismissible
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              Learn more
            </Button>
          }
        >
          Routine maintenance is scheduled for this Saturday at 2am UTC.
        </Banner>
      </div>
      <div className="flex w-[45rem] flex-col gap-space-3">
        <Banner
          intent="warning"
          title="Action required"
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              Configure account
            </Button>
          }
        >
          Confirm your account to keep things running. This usually takes a
          minute and prevents disruption to your scheduled jobs.
        </Banner>
        <Banner
          intent="info"
          title="New: LangSmith Engine"
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              Learn more
            </Button>
          }
          dismissible
        >
          Triage and fix issues found in your traces. Engine groups related
          failures and suggests fixes you can apply with one click.
        </Banner>
        <Banner intent="success" title="Setup complete" dismissible>
          Your workspace is ready to go. You can start sending traces from your
          application using the LangSmith SDK.
        </Banner>
        <Banner
          intent="error"
          title="Build failed"
          action={
            <Button variant="plain" size="xs" color="secondary" onClick={fn()}>
              Copy logs
            </Button>
          }
        >
          An error occurred while creating a Docker image from your specified
          GitHub repository. See Build Logs for more information and how to
          solve the error.
        </Banner>
        <Banner intent="neutral" title="Maintenance window" dismissible>
          We will be performing routine maintenance this Saturday from 2am to
          4am UTC. Some features may be briefly unavailable.
        </Banner>
      </div>
    </div>
  ),
};
