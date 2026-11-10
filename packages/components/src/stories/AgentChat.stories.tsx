import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../components/Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../components/ChatComposer';
import { ChatConversation } from '../components/ChatConversation';
import { ChatMessage, type ChatMessageModel } from '../components/ChatMessage';
import { ChatPlan, type ChatPlanItem } from '../components/ChatPlan';
import { formatChatDuration } from '../components/ChatState';
import {
  ChatSubagent,
  ChatSubagentGroup,
  type ChatSubagentModel,
} from '../components/ChatSubagent';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallStatus,
} from '../components/ChatToolCall';
import { Text } from '../components/Text';

const QUESTION =
  'Compare how recent RAG papers evaluate retrieval, and write it up in report.md.';

const ANSWER = [
  'I wrote the comparison to report.md. The short version: most papers still report end-to-end answer accuracy, and only two of the five measure retrieval on its own.',
  'The researcher found that recall@k on Natural Questions is the most common retrieval metric. The critic flagged that one paper tunes on its test split, so I left its numbers out of the summary table.',
  'Want me to add the per-dataset breakdown as a second table?',
];

// Each step of the run, in order. The story advances one step at a time.
const STEPS = 7;
const STEP_MS = 1_400;

const status = (step: number, start: number, end: number): ChatToolCallStatus =>
  step >= end ? 'succeeded' : step >= start ? 'running' : 'pending';

function plan(step: number): ChatPlanItem[] {
  const item = (id: string, label: string, start: number, end: number) => ({
    id,
    label,
    status:
      step >= end
        ? ('completed' as const)
        : step >= start
          ? ('in-progress' as const)
          : ('pending' as const),
  });
  return [
    item('search', 'Find recent RAG papers', 1, 3),
    item('review', 'Compare their evaluation setups', 3, 6),
    item('write', 'Write the comparison to report.md', 6, 7),
  ];
}

function subagent(
  id: string,
  name: string,
  task: string,
  step: number,
  end: number,
  startedAt: number
): ChatSubagentModel {
  const done = step >= end;
  return {
    id,
    name,
    task,
    status: done ? 'succeeded' : 'running',
    startedAt,
    elapsedMs: done ? (end - 3) * STEP_MS : undefined,
  };
}

/**
 * One deep agent turn, start to finish: it plans, searches, hands work to two
 * subagents in parallel, writes a file, then answers. Everything is public
 * Macaw parts with scripted data in place of a stream.
 */
function AgentChatExample() {
  const [run, setRun] = useState(() => ({ id: 0, startedAt: Date.now() }));
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const answerStep = step - STEPS;
  const working = step < STEPS;
  const running = answerStep < ANSWER.length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      working ? STEP_MS : 500
    );
    return () => window.clearTimeout(timer);
  }, [running, working, step]);

  const subagentsStartedAt = run.startedAt + 3 * STEP_MS;
  const work = (
    <ChatToolCallGroup
      key={run.id}
      label={
        working
          ? 'Working'
          : `Worked for ${formatChatDuration(STEPS * STEP_MS)} · 5 actions`
      }
      expanded={working || undefined}
      running={working}
      showElapsed={working}
      startedAt={run.startedAt}
    >
      <ChatToolCallReasoning
        status={step === 0 ? 'streaming' : 'completed'}
        label={step === 0 ? 'Thinking' : 'Thought for 1s'}
        expandWhileStreaming
      >
        Split the work: one subagent gathers papers and another checks their
        methods, then combine the results into one write-up.
      </ChatToolCallReasoning>
      {step >= 1 && (
        <ChatToolCall
          toolCall={{ id: 'todos', name: 'write_todos', status: 'succeeded' }}
          label="Update plan"
          summary="3 tasks"
        />
      )}
      {step >= 2 && (
        <ChatToolCall
          toolCall={{
            id: 'search',
            name: 'web_search',
            status: status(step, 2, 3),
            args: { query: 'retrieval-augmented generation evaluation 2026' },
          }}
          label="Search"
          summary="RAG evaluation 2026"
        />
      )}
      {step >= 3 && (
        <ChatSubagentGroup label="2 subagents">
          <ChatSubagent
            subagent={subagent(
              'task-researcher',
              'researcher',
              'Summarize how five recent RAG papers evaluate retrieval.',
              step,
              5,
              subagentsStartedAt
            )}
            activity={
              step === 3 ? 'Reading the top results' : 'Tabulating metrics'
            }
            result="Recall@k on Natural Questions is the most common retrieval metric."
            onOpen={() => {}}
          />
          <ChatSubagent
            subagent={subagent(
              'task-critic',
              'critic',
              'Check each paper’s evaluation for leakage or tuning on test data.',
              step,
              6,
              subagentsStartedAt
            )}
            activity={
              step < 5 ? 'Checking data splits' : 'Reviewing hyperparameters'
            }
            result="One paper tunes on its test split; exclude its numbers."
            onOpen={() => {}}
          />
        </ChatSubagentGroup>
      )}
      {step >= 6 && (
        <ChatToolCall
          toolCall={{
            id: 'write',
            name: 'write_file',
            status: status(step, 6, 7),
            args: { file_path: 'report.md' },
          }}
          label="Write"
          summary="report.md"
          meta={step >= 7 ? '+42' : undefined}
        />
      )}
    </ChatToolCallGroup>
  );

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
      status: !working && running ? 'streaming' : 'completed',
      content: [
        { id: 'reply-work', type: 'custom', content: work },
        ...ANSWER.slice(0, Math.max(0, answerStep)).map((text, index) => ({
          id: `reply-${index}`,
          type: 'text' as const,
          text,
        })),
      ],
    },
  ];

  const planItems = plan(step);
  const planOpen = planItems.some((item) => item.status !== 'completed');

  return (
    <ChatConversation
      label="Research agent"
      header={
        <div className="flex items-center justify-between gap-space-3 border-b border-primary px-space-4 py-space-3">
          <Text variant="h3">Research agent</Text>
          <Button
            size="sm"
            color="secondary"
            onClick={() => {
              setRun({ id: run.id + 1, startedAt: Date.now() });
              setStep(0);
            }}
          >
            Replay
          </Button>
        </div>
      }
      footer={
        <ChatComposer
          aria-label="Message the agent"
          drawer={
            step >= 1 && planOpen ? (
              <ChatPlan items={planItems} presentation="drawer" />
            ) : undefined
          }
          submitDisabled={!draft.trim()}
          onSubmit={() => setDraft('')}
          {...(running
            ? {
                action: 'stop' as const,
                onStop: () => setStep(STEPS + ANSWER.length),
              }
            : { action: 'send' as const })}
        >
          <ChatComposerInput
            value={draft}
            onChange={setDraft}
            placeholder="Ask a follow-up"
            aria-label="Message"
          />
          <ChatComposerToolbar />
        </ChatComposer>
      }
    >
      <ChatMessage key={`sent-${run.id}`} message={messages[0]} />
      <ChatMessage
        key={`reply-${run.id}`}
        message={messages[1]}
        animateParagraphs
      />
    </ChatConversation>
  );
}

const meta = {
  title: 'Components/Chat/Examples',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Chat components working together on one page. Stories here use scripted data in place of an agent stream.',
      },
    },
  },
  tags: ['a11y-test'],
  decorators: [
    (Story) => (
      <div className="mx-auto h-[min(760px,100dvh)] w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AgentRun: Story = {
  parameters: {
    docs: {
      description: {
        story: `A deep agent turn as it plays out. Tool calls, reasoning, and subagents share one work summary, which collapses to "Worked for …" once the agent answers.
- \`ChatPlan\` sits in the composer's drawer while the plan is unfinished; the \`write_todos\` call that changed it stays a tool row.
- The \`task\` calls render as \`ChatSubagent\` cards in a \`ChatSubagentGroup\`, since each is a whole agent run with its own steps, timer, and result.`,
      },
    },
  },
  render: () => <AgentChatExample />,
};
