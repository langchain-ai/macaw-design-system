import { type ReactNode, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatState, type ChatStateProps, type ChatStateStatus } from '.';
import { Button } from '../Button';
import { Text } from '../Text';

const states: ChatStateStatus[] = [
  'pending',
  'streaming',
  'completed',
  'failed',
  'interrupted',
  'canceled',
  'input-required',
];

const variants: NonNullable<ChatStateProps['variant']>[] = [
  'default',
  'simple',
];

function StateVariants({
  children,
}: {
  children: (variant: NonNullable<ChatStateProps['variant']>) => ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-space-5">
      {variants.map((variant) => (
        <section
          key={variant}
          className="flex flex-col items-start gap-space-2"
        >
          <Text variant="xs" color="tertiary">
            {variant === 'simple' ? 'Simple' : 'Default'}
          </Text>
          {children(variant)}
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/Chat/ChatState',
  component: ChatState,
  render: (args) => (
    <StateVariants>
      {(variant) => <ChatState {...args} variant={variant} />}
    </StateVariants>
  ),
  tags: ['autodocs', 'chat', 'status', 'streaming', 'elapsed'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `- Chat status with fixed 12px text.
- Streaming composes \`ThinkingState\`; other states use static icons and labels.
- \`variant="simple"\` shows only the icon and whole elapsed seconds by default; \`label\` is available to screen readers. Parents own tooltips and interactions.
- Optional elapsed time freezes outside streaming. Supply \`elapsedMs\` for host timing; key by operation ID to restart.`,
      },
    },
  },
  args: { status: 'streaming', variant: 'default' },
  argTypes: {
    status: { control: 'select', options: states },
    variant: { control: false },
    label: { control: 'text' },
    showElapsed: { control: 'boolean' },
    elapsedMs: { control: { type: 'number', min: 0, step: 100 } },
    timerPrecision: { control: 'select', options: ['seconds', 'tenths'] },
  },
} satisfies Meta<typeof ChatState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: ({ showElapsed }) => (
    <StateVariants>
      {(variant) => (
        <div className="flex flex-col gap-space-3">
          {states.map((status) => (
            <ChatState
              key={status}
              status={status}
              variant={variant}
              showElapsed={showElapsed}
              elapsedMs={2_400}
            />
          ))}
        </div>
      )}
    </StateVariants>
  ),
};

const outcomes: { status: ChatStateStatus; label: string }[] = [
  { status: 'completed', label: 'Complete' },
  { status: 'failed', label: 'Fail' },
  { status: 'interrupted', label: 'Interrupt' },
  { status: 'canceled', label: 'Cancel' },
  { status: 'input-required', label: 'Request input' },
];

function LifecycleExample() {
  const [operation, setOperation] = useState(0);
  const [status, setStatus] = useState<ChatStateStatus>('streaming');

  return (
    <div className="flex max-w-96 flex-col items-start gap-space-4">
      <StateVariants>
        {(variant) => (
          <ChatState
            key={`${operation}-${variant}`}
            status={status}
            variant={variant}
            showElapsed
          />
        )}
      </StateVariants>
      <div className="flex flex-wrap gap-space-2">
        {outcomes.map((outcome) => (
          <Button
            key={outcome.status}
            size="xs"
            color="secondary"
            disabled={status !== 'streaming'}
            onClick={() => setStatus(outcome.status)}
          >
            {outcome.label}
          </Button>
        ))}
        <Button
          size="xs"
          color="secondary"
          onClick={() => {
            setOperation((value) => value + 1);
            setStatus('streaming');
          }}
        >
          Restart
        </Button>
      </div>
    </div>
  );
}

export const Lifecycle: Story = { render: () => <LifecycleExample /> };
