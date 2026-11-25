import { type ReactNode, useState } from 'react';

import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../components/Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../../components/ChatComposer';
import { ChatConversation } from '../../components/ChatConversation';
import {
  ChatMessage,
  type ChatMessageModel,
} from '../../components/ChatMessage';
import { Text } from '../../components/Text';
import { cn } from '../../utils/cn';
import {
  ChatBrowserUseCard,
  ChatBrowserUseFloating,
  ChatBrowserUsePanel,
  ChatBrowserUseRow,
  type ChatBrowserUseStep,
} from './ChatBrowserUse';
import {
  ANSWER,
  INTRO,
  QUESTION,
  type Stage,
  useSkylineSession,
} from './skylineAir';

function Chat({
  inline,
  aside,
  overlay,
  done,
  narrow = false,
}: {
  inline: ReactNode;
  aside?: ReactNode;
  overlay?: ReactNode;
  done: boolean;
  narrow?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const messages: ChatMessageModel[] = [
    {
      id: 'sent',
      role: 'user',
      status: 'completed',
      content: [
        { id: 'sent-text', type: 'text', appearance: 'bubble', text: QUESTION },
      ],
    },
    {
      id: 'reply',
      role: 'assistant',
      status: done ? 'completed' : 'streaming',
      content: [
        { id: 'intro', type: 'text', text: INTRO },
        { id: 'browser', type: 'custom', content: inline },
        ...(done
          ? ANSWER.map((text, i) => ({
              id: `answer-${i}`,
              type: 'text' as const,
              text,
            }))
          : []),
      ],
    },
  ];

  return (
    <div
      className={cn(
        'flex min-h-0 bg-surface-level-1',
        narrow ? 'mx-auto h-screen w-[390px]' : 'h-screen'
      )}
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatConversation
          label="Travel agent"
          className="min-h-0 flex-1"
          footer={
            <ChatComposer
              aria-label="Message the agent"
              submitDisabled={!draft.trim()}
              onSubmit={(event) => {
                event.preventDefault();
                setDraft('');
              }}
            >
              <ChatComposerInput
                value={draft}
                onChange={setDraft}
                placeholder="Ask a follow-up"
                aria-label="Message"
              />
              <ChatComposerToolbar
                actions={
                  <Button type="submit" size="sm" disabled={!draft.trim()}>
                    Send
                  </Button>
                }
              />
            </ChatComposer>
          }
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ChatConversation>
        {overlay && (
          // The host places the floating window and keeps a 16px gutter.
          <div className="pointer-events-none absolute inset-x-[16px] bottom-[132px] z-10 flex justify-end">
            {overlay}
          </div>
        )}
      </div>
      {aside && (
        <aside className="h-full w-[min(48%,680px)] shrink-0 border-l border-primary">
          {aside}
        </aside>
      )}
    </div>
  );
}

/** Stands in for the host's new-tab target. */
const openInNewTab = fn().mockName('onOpenInNewTab');

function CardExample({
  stage,
  minimized,
  narrow,
}: {
  stage: Stage;
  minimized: boolean;
  narrow?: boolean;
}) {
  const { session, ...actions } = useSkylineSession(stage);
  return (
    <Chat
      narrow={narrow}
      done={session.state === 'ended'}
      inline={
        <ChatBrowserUseCard
          session={session}
          defaultMinimized={minimized}
          onOpenInNewTab={openInNewTab}
          {...actions}
        />
      }
    />
  );
}

function PanelExample({ stage, open }: { stage: Stage; open: boolean }) {
  const { session, ...actions } = useSkylineSession(stage);
  const [isOpen, setOpen] = useState(open);
  const [inspected, setInspected] = useState<ChatBrowserUseStep | null>(null);
  // You drive in the panel, so it can't be hidden while you do.
  const shown = isOpen || session.state === 'user';
  const inspectedStep =
    session.steps.find((step) => step.id === inspected?.id) ?? null;

  return (
    <Chat
      done={session.state === 'ended'}
      inline={
        <ChatBrowserUseRow
          session={session}
          open={shown}
          homeLabel="browser panel"
          onOpenChange={(next) => {
            if (session.state === 'user') return;
            setInspected(null);
            setOpen(next);
          }}
          onTakeControl={() => {
            setOpen(true);
            actions.onTakeControl?.();
          }}
          onInspectStep={(step) => {
            setOpen(true);
            const latest = session.steps[session.steps.length - 1];
            setInspected(step.id === latest?.id ? null : step);
          }}
        />
      }
      aside={
        shown ? (
          <ChatBrowserUsePanel
            session={session}
            inspectedStep={inspectedStep}
            onInspectedStepChange={setInspected}
            onClose={() => setOpen(false)}
            onOpenInNewTab={openInNewTab}
            {...actions}
          />
        ) : undefined
      }
    />
  );
}

function FloatingExample({
  stage,
  open,
  narrow,
}: {
  stage: Stage;
  open: boolean;
  narrow?: boolean;
}) {
  const { session, ...actions } = useSkylineSession(stage);
  const [isOpen, setOpen] = useState(open);
  const shown = isOpen || session.state === 'user';

  return (
    <Chat
      narrow={narrow}
      done={session.state === 'ended'}
      inline={
        <ChatBrowserUseRow
          session={session}
          open={shown}
          homeLabel="browser window"
          onOpenChange={(next) => {
            if (session.state === 'user') return;
            setOpen(next);
          }}
          onTakeControl={() => {
            setOpen(true);
            actions.onTakeControl?.();
          }}
        />
      }
      overlay={
        <ChatBrowserUseFloating
          session={session}
          open={shown}
          onClose={() => setOpen(false)}
          onOpenInNewTab={openInNewTab}
          {...actions}
        />
      }
    />
  );
}

const STAGES: Stage[] = [
  'live',
  'connecting',
  'agent',
  'needs-you',
  'user',
  'handed-back',
  'reconnecting',
  'closed',
  'ended',
];

interface StoryArgs {
  /** `live` plays the whole session; the others hold one state until you act. */
  stage: Stage;
  /** Card: start as the row. Panel and Floating: start with the page shown. */
  open: boolean;
}

const meta: Meta<StoryArgs> = {
  title: 'POC/ChatBrowserUse',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Shows an agent using a browser inside a chat turn. Storybook only, not exported.',
          '',
          'The live page has exactly one home, chosen by the host, and that home is either showing or hidden:',
          '',
          '- **Card**: the page lives inline. For hosts with no side panel, and for small screens.',
          '- **Panel**: the chat shows the row, and the page lives in the host side panel. Wide screens only.',
          '- **Floating**: the chat shows the row, and the page floats over the chat at 400px.',
          '',
          'The row is the same everywhere. Clicking it shows or hides the home. When the agent needs you, its status becomes Take control. Taking control while the agent works is always available as a quiet button; a click on the page never takes control.',
          '',
          'The host owns the transport (`frame` can be an image, a streamed canvas or an iframe), the open state of the panel or floating window, and the new-tab target.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    stage: { control: 'select', options: STAGES },
    open: { control: 'boolean' },
  },
  args: { stage: 'live', open: true },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Card: Story = {
  render: (args) => (
    <CardExample
      key={`${args.stage}-${args.open}`}
      stage={args.stage}
      minimized={!args.open}
    />
  ),
};

export const Panel: Story = {
  render: (args) => (
    <PanelExample
      key={`${args.stage}-${args.open}`}
      stage={args.stage}
      open={args.open}
    />
  ),
};

export const Floating: Story = {
  render: (args) => (
    <FloatingExample
      key={`${args.stage}-${args.open}`}
      stage={args.stage}
      open={args.open}
    />
  ),
};

/** Taking control from the ask hands the page to the reader; Esc hands it back. */
export const Handoff: Story = {
  args: { stage: 'needs-you' },
  render: (args) => (
    <CardExample key={args.stage} stage={args.stage} minimized={false} />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Take control' })
    );
    await expect(
      await canvas.findByRole('button', { name: 'Hand back to agent' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByRole('button', { name: 'Hand back to agent' })
    ).toBeNull();
  },
};

function RowState({ stage }: { stage: Stage }) {
  const { session, ...actions } = useSkylineSession(stage);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-space-2">
      <Text variant="xs" color="tertiary">
        {stage}
      </Text>
      <ChatBrowserUseRow
        session={session}
        open={open}
        onOpenChange={setOpen}
        onTakeControl={actions.onTakeControl}
      />
    </div>
  );
}

/** The row in every state, as the chat shows it while the page is hidden. */
export const RowStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-space-5 bg-surface-level-1 p-space-6">
      {STAGES.filter((stage) => stage !== 'live').map((stage) => (
        <RowState key={stage} stage={stage} />
      ))}
    </div>
  ),
};

function WithoutLabelsExample({ stage }: { stage: Stage }) {
  const { session, ...actions } = useSkylineSession(stage, { labels: 'none' });
  return (
    <Chat
      done={session.state === 'ended'}
      inline={
        <ChatBrowserUseCard
          session={session}
          onOpenInNewTab={openInNewTab}
          {...actions}
        />
      }
    />
  );
}

/**
 * A host that only knows the tool calls. Steps fall back to a verb for the
 * action, or to "Ran browser code" when even that is unknown.
 */
export const WithoutLabels: Story = {
  args: { stage: 'ended' },
  render: (args) => (
    <WithoutLabelsExample key={args.stage} stage={args.stage} />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Show steps' })
    );
    await expect(
      (await canvas.findAllByText('Ran browser code')).length
    ).toBeGreaterThan(0);
  },
};

function TwoSessionsExample() {
  const first = useSkylineSession('ended');
  const second = useSkylineSession('agent');
  return (
    <Chat
      done={false}
      inline={
        // Each session gets its own row or card, in the order they ran.
        <div className="flex min-w-0 flex-col gap-space-3">
          <ChatBrowserUseCard
            session={first.session}
            defaultMinimized
            onOpenInNewTab={openInNewTab}
          />
          <ChatBrowserUseCard
            session={second.session}
            onOpenInNewTab={openInNewTab}
            onTakeControl={second.onTakeControl}
            onHandBack={second.onHandBack}
          />
        </div>
      }
    />
  );
}

/** Two browser sessions in one turn: one finished, one running. */
export const TwoSessions: Story = {
  parameters: { controls: { disable: true } },
  render: () => <TwoSessionsExample />,
};

/**
 * Small screens use the card or the floating window. There's no room for a
 * side panel, so Panel isn't offered here.
 */
export const SmallScreen: StoryObj<
  StoryArgs & { placement: 'card' | 'floating' }
> = {
  argTypes: {
    placement: { control: 'inline-radio', options: ['card', 'floating'] },
  },
  args: { stage: 'agent', open: true, placement: 'card' },
  render: (args) =>
    args.placement === 'card' ? (
      <CardExample
        key={`${args.stage}-${args.open}`}
        stage={args.stage}
        minimized={!args.open}
        narrow
      />
    ) : (
      <FloatingExample
        key={`${args.stage}-${args.open}`}
        stage={args.stage}
        open={args.open}
        narrow
      />
    ),
};
