import { useMemo } from 'react';

import { fn } from 'storybook/test';

import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatThread, LangGraphChat, useChatThread } from '.';
import {
  awaitingApprovalState,
  completedState,
  emptyState,
  staticStream,
  useFakeAgentStream,
} from '../../stories/fakeAgentStream';
import { Button } from '../Button';
import { ChatRichContent } from '../ChatRichContent';
import { EmptyState } from '../EmptyState';
import { Text } from '../Text';

const meta = {
  title: 'Components/Chat/LangGraphChat',
  component: LangGraphChat,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `- A complete agent chat for a LangGraph \`useStream\` handle. The app creates the stream, so it keeps the client, auth, and thread selection; Macaw never imports the SDK.
- Pass selector hooks from your own \`@langchain/react\` import to turn on queued messages (\`useSubmissionQueue\`), edit and retry (\`useMessageMetadata\`), and subagent details (\`useMessages\`, \`useToolCalls\`).
- Deep agent tools, todos, subagents, and human-in-the-loop approvals work out of the box. Override tool rows with \`tools\` and requests with \`renderInterrupt\`.
- For your own layout, use \`useChatThread\` with \`ChatThread\`, or \`toChatThread\` for plain data.`,
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
} satisfies Meta<typeof LangGraphChat>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeepAgentRunDemo() {
  const { stream, selectors } = useFakeAgentStream({
    autoStart: 'Research how RAG systems are evaluated and update my notes.',
  });
  return (
    <LangGraphChat
      stream={stream}
      selectors={selectors}
      agentName="Research agent"
      onOpenSubagent={fn()}
    />
  );
}

export const DeepAgentRun: Story = {
  render: () => <DeepAgentRunDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'A scripted deep agent run: reasoning, a plan above the composer, two subagents in parallel, then a file edit that waits for approval before the answer streams in. Send more messages while it works to queue them.',
      },
    },
  },
};

export const AwaitingApproval: Story = {
  render: () => (
    <LangGraphChat
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
    <LangGraphChat
      stream={staticStream(completedState)}
      agentName="Research agent"
    />
  ),
};

export const QueuedFollowUps: Story = {
  render: () => (
    <LangGraphChat
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
    <LangGraphChat
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
    <LangGraphChat
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
    <LangGraphChat
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
          '`useChatThread` returns the model and actions, so the app can read state (turn count, plan) and place `ChatThread` in its own layout.',
      },
    },
  },
};
