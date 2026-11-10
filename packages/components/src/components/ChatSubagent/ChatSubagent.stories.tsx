import { useEffect, useState } from 'react';

import { fn } from 'storybook/test';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatSubagent, ChatSubagentGroup, type ChatSubagentModel } from '.';
import { ChatToolCall } from '../ChatToolCall';

const researcher: ChatSubagentModel = {
  id: 'task-1',
  name: 'researcher',
  task: 'Find three recent papers on retrieval-augmented generation and summarize their evaluation setups.',
  status: 'running',
};

const steps = [
  'Searching the web for recent papers',
  'Reading “Lost in the Middle”',
  'Comparing evaluation datasets',
];

const meta = {
  title: 'Components/Chat/ChatSubagent',
  component: ChatSubagent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `- One delegated agent run, such as a deep agent's \`task\` tool call. Render it where the agent started the subagent and key it by the call's ID.
- While running it shows the current step through \`activity\`; once finished it shows \`result\`. Status changes are announced; the step line is not.
- \`children\` are details, such as the subagent's own messages and tool calls. They mount only while expanded, so a host can subscribe to the subagent's stream when the reader opens it.
- \`onOpen\` hands navigation to the host, such as a side panel with the full thread.
- \`ChatSubagentGroup\` lays out subagents that run in parallel.`,
      },
    },
  },
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'agent',
    'subagent',
    'deep agents',
    'delegation',
    'task',
  ],
  args: { subagent: researcher },
  decorators: [
    (Story, context) => (
      <div
        className={
          context.parameters.wide
            ? 'w-[min(44rem,calc(100vw-2rem))]'
            : 'w-[min(32rem,calc(100vw-2rem))]'
        }
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatSubagent>;

export default meta;
type Story = StoryObj<typeof meta>;

function LiveSubagent() {
  const [step, setStep] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const done = step >= steps.length;

  useEffect(() => {
    if (done) return;
    const timeout = setTimeout(() => setStep((current) => current + 1), 2_000);
    return () => clearTimeout(timeout);
  }, [done, step]);

  return (
    <ChatSubagent
      subagent={{
        ...researcher,
        status: done ? 'succeeded' : 'running',
        startedAt,
        elapsedMs: done ? 6_000 : undefined,
      }}
      activity={steps[step]}
      result="Found three papers. All evaluate on Natural Questions; two add TriviaQA."
      onOpen={fn()}
    />
  );
}

export const Default: Story = {
  render: () => <LiveSubagent />,
  parameters: {
    docs: {
      description: {
        story:
          'A running subagent with its current step, then its result. Pass `startedAt` so the timer survives remounts.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-space-3">
      {(
        [
          ['pending', undefined],
          ['running', undefined],
          ['input-required', undefined],
          ['succeeded', 41_000],
          ['failed', 9_000],
          ['canceled', 3_000],
        ] as const
      ).map(([status, elapsedMs]) => (
        <ChatSubagent
          key={status}
          subagent={{ ...researcher, id: status, status, elapsedMs }}
          activity={steps[0]}
          result={
            status === 'failed'
              ? 'The search service timed out.'
              : status === 'succeeded'
                ? 'Found three papers that evaluate on Natural Questions.'
                : undefined
          }
        />
      ))}
    </div>
  ),
};

export const WithDetails: Story = {
  render: () => (
    <ChatSubagent
      subagent={{ ...researcher, status: 'succeeded', elapsedMs: 18_000 }}
      result="Found three papers that evaluate on Natural Questions."
      onOpen={fn()}
    >
      <div className="flex flex-col gap-0.5">
        <ChatToolCall
          toolCall={{
            id: 'search',
            name: 'web_search',
            status: 'succeeded',
            args: { query: 'retrieval augmented generation evaluation 2026' },
          }}
          icon={<MagnifyingGlassIcon size={12} weight="regular" />}
          label="Search"
        />
        <ChatToolCall
          toolCall={{
            id: 'read',
            name: 'read_file',
            status: 'succeeded',
            args: { file_path: '/papers/lost-in-the-middle.md' },
          }}
          label="Read"
        />
      </div>
    </ChatSubagent>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Expand to see the subagent’s own work. Details mount only while open.',
      },
    },
  },
};

export const Parallel: Story = {
  parameters: { wide: true },
  render: () => (
    <ChatSubagentGroup label="3 subagents">
      <ChatSubagent
        subagent={researcher}
        activity="Searching the web for recent papers"
      />
      <ChatSubagent
        subagent={{
          id: 'task-2',
          name: 'critic',
          task: 'Review the draft summary for unsupported claims.',
          status: 'input-required',
        }}
      />
      <ChatSubagent
        subagent={{
          id: 'task-3',
          name: 'writer',
          task: 'Draft the final summary in under 200 words.',
          status: 'succeeded',
          elapsedMs: 23_000,
        }}
        result="Drafted a 180-word summary."
      />
    </ChatSubagentGroup>
  ),
};
