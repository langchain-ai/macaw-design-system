import { useEffect, useState, type ReactNode } from 'react';

import { expect, userEvent, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatContextWindow, type ChatContextWindowProps } from '.';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerModelSelect,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from '../ChatComposer';
import { Text } from '../Text';
import { ThinkingState } from '../ThinkingState';

function ComposerExample({
  narrow = false,
  streaming = false,
  modelSelector,
  ...props
}: ChatContextWindowProps & {
  narrow?: boolean;
  streaming?: boolean;
  modelSelector?: ReactNode;
}) {
  const [draft, setDraft] = useState('');
  const [running, setRunning] = useState(streaming);
  return (
    <div className={narrow ? 'w-64 max-w-full' : 'w-full max-w-xl'}>
      <ChatComposer
        aria-label="Message"
        {...(running
          ? { action: 'stop', onStop: () => setRunning(false) }
          : { action: 'send' })}
        submitDisabled={!draft.trim()}
        onSubmit={(event) => {
          event.preventDefault();
          setDraft('');
          setRunning(true);
        }}
      >
        <ChatComposerTextarea
          value={draft}
          onChange={setDraft}
          aria-label="Message"
          placeholder="Ask a follow-up…"
        />
        <ChatComposerToolbar
          modelSelector={
            modelSelector ?? (
              <Text
                variant="xs"
                color="secondary"
                className="block max-w-full truncate"
              >
                {props.model ?? 'Agent'}
              </Text>
            )
          }
          actions={
            <>
              <ChatContextWindow {...props} />
              <ChatComposerAction />
            </>
          }
        />
      </ChatComposer>
    </div>
  );
}

const meta = {
  title: 'Components/Chat/ChatContextWindow',
  component: ChatContextWindow,
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'context',
    'window',
    'tokens',
    'usage',
    'capacity',
    'model',
    'cost',
    'compaction',
    'popover',
  ],
  args: {
    tokensUsed: 65_800,
    contextWindow: 200_000,
    model: 'Claude Sonnet 4.5',
    totalCost: '$0.25',
  },
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'Context usage beside Send/Stop. Hover or focus for a summary; click, tap, or Enter for details. Apps supply usage and compose breakdowns/actions with children and footer. Requires TooltipProvider. Examples use simulated data and compaction.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[440px] w-full items-end justify-center p-space-6">
        <Story />
      </div>
    ),
  ],
  render: (args) => <ComposerExample {...args} />,
  play: async ({ canvasElement, args }) => {
    if (args.disabled) return;
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Context window:/ })
    );
    await expect(
      within(document.body).findByRole('dialog', { name: 'Context window' })
    ).resolves.toBeVisible();
  },
} satisfies Meta<typeof ChatContextWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ModelCapacityChange: Story = {
  render: function ModelCapacityChange(args) {
    const [capacity, setCapacity] = useState('200000');
    const options = [
      { value: '200000', label: 'Standard model' },
      { value: '1000000', label: 'Long-context model' },
      { value: '128000', label: 'Smaller model' },
    ];
    return (
      <ComposerExample
        {...args}
        tokensUsed={174_000}
        contextWindow={Number(capacity)}
        model={options.find((option) => option.value === capacity)?.label}
        modelSelector={
          <ChatComposerModelSelect
            options={options}
            value={capacity}
            onChange={(value) => {
              if (value) setCapacity(value);
            }}
          />
        }
      />
    );
  },
};
export const WhileGenerating: Story = {
  render: (args) => <ComposerExample {...args} streaming />,
};

function CompactionExample({
  initial = 'ready',
  ...props
}: ChatContextWindowProps & { initial?: 'ready' | 'compacting' | 'failed' }) {
  const [phase, setPhase] = useState<
    'ready' | 'compacting' | 'failed' | 'done'
  >(initial);
  useEffect(() => {
    if (phase !== 'compacting' || initial === 'compacting') return;
    const timer = setTimeout(() => setPhase('done'), 1800);
    return () => clearTimeout(timer);
  }, [phase, initial]);
  const compacting = phase === 'compacting';
  return (
    <ComposerExample
      {...props}
      tokensUsed={phase === 'done' ? 42_000 : 174_000}
      description={
        phase === 'failed'
          ? 'Compaction failed. Your conversation is unchanged.'
          : phase === 'done'
            ? 'Earlier messages summarized. Ready to continue.'
            : 'Earlier messages can be summarized to free up context.'
      }
      footer={
        compacting ? (
          <ThinkingState
            size="xs"
            motion="subtle"
            label="Compacting conversation…"
          />
        ) : (
          <Button
            type="button"
            color="secondary"
            variant="outlined"
            size="sm"
            onClick={() => setPhase('compacting')}
          >
            {phase === 'failed' ? 'Retry compaction' : 'Compact conversation'}
          </Button>
        )
      }
    />
  );
}

export const CompactConversation: Story = {
  render: (args) => <CompactionExample {...args} />,
};
export const Compacting: Story = {
  render: (args) => <CompactionExample {...args} initial="compacting" />,
};
export const CompactionFailed: Story = {
  render: (args) => <CompactionExample {...args} initial="failed" />,
};
export const AutomaticCompaction: Story = {
  args: {
    tokensUsed: 184_000,
    warningThreshold: 0.9,
    description:
      'Older messages are summarized automatically when context fills up.',
  },
};
export const OverCapacity: Story = {
  args: {
    tokensUsed: 216_000,
    description:
      'Context limit exceeded. Compact the conversation before continuing.',
  },
  render: (args) => (
    <ComposerExample
      {...args}
      footer={
        <Button
          type="button"
          color="secondary"
          variant="outlined"
          size="sm"
          disabled
        >
          Compaction unavailable
        </Button>
      }
    />
  ),
};
export const UnknownLimit: Story = { args: { contextWindow: null } };
export const Unavailable: Story = {
  args: {
    tokensUsed: null,
    contextWindow: null,
    model: 'Custom provider',
    totalCost: undefined,
    description: 'This provider does not report context usage.',
  },
};
export const NewConversation: Story = {
  args: { tokensUsed: 0, totalCost: '$0.00' },
};
export const Narrow: Story = {
  args: {
    model:
      'organization/custom-model-with-an-unusually-long-version-name-2026-11-11',
  },
  render: (args) => <ComposerExample {...args} narrow />,
};
export const Disabled: Story = { args: { disabled: true }, play: undefined };
export const ContextBreakdown: Story = {
  args: {
    description:
      'Estimated from the latest request. Usage updates after each response.',
  },
  render: (args) => (
    <ComposerExample {...args}>
      <dl className="flex flex-col gap-space-2">
        {[
          ['Instructions', '5,000'],
          ['Messages', '40,800'],
          ['Tool Results', '20,000'],
        ].map(([name, value]) => (
          <div key={name} className="flex justify-between gap-space-4">
            <dt>
              <Text variant="xs" color="secondary">
                {name}
              </Text>
            </dt>
            <dd>
              <Text variant="xs" className="tabular-nums">
                {value}
              </Text>
            </dd>
          </div>
        ))}
      </dl>
    </ComposerExample>
  ),
};
