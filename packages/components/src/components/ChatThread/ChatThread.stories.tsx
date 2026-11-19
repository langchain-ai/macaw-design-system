import { useCallback, useMemo, useRef, useState } from 'react';

import { fn } from 'storybook/test';

import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatThread, useChatThread } from '.';
import type {
  ChatThreadController,
  ChatThreadStreamProps,
  ChatThreadTurn,
} from '.';
import {
  awaitingApprovalState,
  completedState,
  emptyState,
  staticStream,
  useFakeAgentStream,
} from '../../stories/fakeAgentStream';
import { Button } from '../Button';
import { ChatComposerModelSelect } from '../ChatComposer';
import { MODEL_OPTIONS } from '../ChatComposer/stories/modelOptions';
import { ChatContextWindowPopover } from '../ChatContextWindowPopover';
import { ChatRichContent } from '../ChatRichContent';
import { EmptyState } from '../EmptyState';
import { Text } from '../Text';

const meta = {
  title: 'Components/Chat/ChatThread',
  component: ChatThread,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `- An agent conversation view built from Macaw chat parts: messages, reasoning, tool calls, subagents, approvals, the plan, queued messages, and the composer. It's a view, not an app: your app keeps the client, auth, threads, and routing.
- By default, pass a LangGraph \`useStream\` handle as \`stream\`; the built-in \`useChatThread\` adapter maps it. Macaw never imports the SDK. Pass selector hooks from your own \`@langchain/react\` import to turn on queued messages (\`useSubmissionQueue\`), edit and retry (\`useMessageMetadata\`), and subagent details (\`useMessages\`, \`useToolCalls\`).
- \`useChatThread\` is optional. For your own stream logic or data, pass \`thread\` instead: a \`ChatThreadController\` from your own adapter. Only \`model\` and \`actions.send\` are required; controls without an action are hidden.
- Deep agent tools, todos, subagents, and human-in-the-loop approvals work out of the box. Override tool rows with \`tools\` and requests with \`renderInterrupt\`.`,
      },
    },
  },
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'langgraph',
    'useStream',
    'stream',
    'agent',
    'deep agents',
    'integration',
  ],
  args: { stream: staticStream(emptyState) },
  decorators: [
    (Story) => (
      <div className="h-[46rem] max-h-[100dvh] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ChatThreadStreamProps>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeepAgentRunDemo() {
  const { stream, selectors } = useFakeAgentStream({
    autoStart: 'Research how RAG systems are evaluated and update my notes.',
  });
  const [model, setModel] = useState<string | undefined>('claude-sonnet-5-5');
  const modelLabel = MODEL_OPTIONS.find(
    (option) => option.value === model
  )?.label;
  return (
    <ChatThread
      stream={stream}
      selectors={selectors}
      agentName="Research agent"
      onOpenSubagent={fn()}
      modelSelector={
        <ChatComposerModelSelect
          options={MODEL_OPTIONS}
          value={model}
          onChange={setModel}
        />
      }
      composerActions={
        <ChatContextWindowPopover
          tokensUsed={18_400 + stream.messages.length * 6_200}
          contextWindow={200_000}
          model={modelLabel}
        />
      }
    />
  );
}

export const DeepAgentRun: Story = {
  render: () => <DeepAgentRunDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'A scripted deep agent run: reasoning, a plan above the composer, two subagents in parallel, then a file edit that waits for approval before the answer streams in. Send more messages while it works to queue them; a sent message pins to the top while its reply streams in. `modelSelector` and `composerActions` place the app’s `ChatComposerModelSelect` and `ChatContextWindowPopover` in the composer.',
      },
    },
  },
};

export const AwaitingApproval: Story = {
  render: () => (
    <ChatThread
      stream={staticStream(awaitingApprovalState)}
      agentName="Research agent"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A human-in-the-loop request appears below the work it gates, with the edit as a diff. Edit opens the arguments before approving; requests paused together resume together.',
      },
    },
  },
};

export const CompletedConversation: Story = {
  render: () => (
    <ChatThread
      stream={staticStream(completedState)}
      agentName="Research agent"
    />
  ),
};

export const QueuedFollowUps: Story = {
  render: () => (
    <ChatThread
      stream={staticStream({ ...completedState, isLoading: true })}
      selectors={{
        useSubmissionQueue: () => ({
          entries: [
            {
              id: 'queued-1',
              values: {
                messages: [
                  { type: 'human', content: 'Then compare retrievers.' },
                ],
              },
            },
          ],
          cancel: fn(),
        }),
      }}
    />
  ),
};

export const FailedRun: Story = {
  render: () => (
    <ChatThread
      stream={staticStream({
        ...emptyState,
        messages: [
          {
            id: 'h1',
            type: 'human',
            content: 'Summarize the incident report.',
          },
          {
            id: 'a1',
            type: 'ai',
            content: '',
            tool_calls: [
              {
                id: 'read',
                name: 'read_file',
                args: { file_path: 'incident.md' },
              },
            ],
          },
        ],
        error: new Error('The model provider returned an error. Try again.'),
      })}
    />
  ),
};

export const CustomToolsAndRequests: Story = {
  render: () => (
    <ChatThread
      stream={staticStream({
        ...emptyState,
        messages: [
          {
            id: 'h1',
            type: 'human',
            content: 'What changed in the docs this week?',
          },
          {
            id: 'a1',
            type: 'ai',
            content: '',
            tool_calls: [
              {
                id: 'search',
                name: 'web_search',
                args: { query: 'LangGraph release notes' },
              },
            ],
          },
        ],
        interrupts: [
          { id: 'auth', value: { type: 'auth', provider: 'GitHub' } },
        ],
      })}
      tools={{
        web_search: ({ args }) => ({
          label: 'Web search',
          icon: <GlobeIcon size={12} weight="regular" />,
          summary:
            typeof (args as { query?: unknown }).query === 'string'
              ? (args as { query: string }).query
              : undefined,
        }),
      }}
      renderInterrupt={(interrupt) =>
        interrupt.kind === 'other' ? (
          <ChatRichContent
            variant="approval"
            title="Connect GitHub to continue"
            description="The agent needs read access to your repositories."
            approveLabel="Connect"
            onApprove={fn()}
          />
        ) : undefined
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`tools` replaces a tool row’s label, icon, summary, or details by tool name; `renderInterrupt` takes over requests the app understands, such as sign-in.',
      },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <ChatThread
      stream={staticStream(emptyState)}
      emptyState={
        <EmptyState
          title="Start a research task"
          description="The agent plans, delegates to subagents, and asks before it edits files."
        />
      }
    />
  ),
};

function CustomLayoutDemo() {
  const stream = useMemo(() => staticStream(completedState), []);
  const thread = useChatThread(stream);
  return (
    <div className="flex h-full flex-col gap-space-3 p-space-4">
      <Text variant="sm" color="secondary">
        {`${thread.model.turns.length} turns · ${thread.model.plan?.length ?? 0} planned tasks`}
      </Text>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-subtle">
        <ChatThread
          thread={thread}
          header={
            <div className="flex items-center justify-between border-b border-subtle px-space-4 py-space-2">
              <Text variant="sm" weight="medium">
                Research thread
              </Text>
              <Button size="sm" variant="plain" color="secondary">
                New thread
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

export const InCustomLayout: Story = {
  render: () => <CustomLayoutDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Call `useChatThread` yourself to read its state (turn count, plan) and pass the result to `ChatThread` as `thread`, in your own layout.',
      },
    },
  },
};

/** An app's own message format, not LangGraph's. */
interface SupportMessage {
  id: string;
  from: 'customer' | 'bot';
  body: string;
  lookups?: string[];
}

/** A custom adapter: maps the app's own messages to a `ChatThreadController`. */
function useSupportBot(): ChatThreadController {
  const [messages, setMessages] = useState<SupportMessage[]>([
    { id: 'm1', from: 'customer', body: 'Where is my order #4512?' },
    {
      id: 'm2',
      from: 'bot',
      body: 'Order **#4512** shipped yesterday and arrives Friday.',
      lookups: ['#4512'],
    },
  ]);
  const [replying, setReplying] = useState(false);
  const nextId = useRef(3);

  const send = useCallback(async (text: string) => {
    const id = `m${nextId.current++}`;
    setMessages((current) => [
      ...current,
      { id, from: 'customer', body: text },
    ]);
    setReplying(true);
    await new Promise((done) => setTimeout(done, 1200));
    setMessages((current) => [
      ...current,
      {
        id: `m${nextId.current++}`,
        from: 'bot',
        body: 'Thanks! A teammate will follow up by email.',
      },
    ]);
    setReplying(false);
  }, []);

  return useMemo(() => {
    const turns: ChatThreadTurn[] = [];
    for (const message of messages) {
      if (message.from === 'customer') {
        turns.push({
          id: message.id,
          user: {
            message: {
              id: message.id,
              role: 'user',
              status: 'completed',
              content: [
                {
                  id: 'text',
                  type: 'text',
                  text: message.body,
                  appearance: 'bubble',
                },
              ],
            },
            text: message.body,
            raw: message,
          },
          parts: [],
          status: 'completed',
          actionCount: 0,
        });
        continue;
      }
      const turn = turns.at(-1);
      if (!turn) continue;
      for (const order of message.lookups ?? []) {
        turn.parts.push({
          type: 'tool-call',
          id: `${message.id}:${order}`,
          toolCall: {
            id: `${message.id}:${order}`,
            name: 'lookup_order',
            status: 'succeeded',
            args: { order },
          },
          source: { message },
        });
        turn.actionCount += 1;
      }
      turn.parts.push({
        type: 'text',
        id: `${message.id}:text`,
        text: message.body,
        streaming: false,
        source: { message },
      });
    }
    const last = turns.at(-1);
    if (replying && last) last.status = 'streaming';
    return {
      model: {
        turns,
        interrupts: [],
        queued: [],
        status: replying ? 'running' : 'idle',
      },
      actions: { send },
      sentMessageId: messages
        .filter((message) => message.from === 'customer')
        .at(-1)?.id,
    };
  }, [messages, replying, send]);
}

function CustomAdapterDemo() {
  const thread = useSupportBot();
  return (
    <ChatThread
      thread={thread}
      agentName="Support bot"
      tools={{
        lookup_order: ({ args }) => ({
          label: 'Order lookup',
          summary: (args as { order?: string } | undefined)?.order,
        }),
      }}
    />
  );
}

export const CustomAdapter: Story = {
  render: () => <CustomAdapterDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'No `useStream` or `useChatThread`: the app maps its own messages to a `ChatThreadController` and passes it as `thread`. It only provides `send`, so there is no Stop, edit, or retry.',
      },
    },
  },
};
