import { useEffect, useState } from 'react';

import { RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
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
import {
  ChatRichContent,
  ChatRichContentChoices,
} from '../components/ChatRichContent';
import { formatChatDuration } from '../components/ChatState';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallStatus,
} from '../components/ChatToolCall';
import { Text } from '../components/Text';

const QUESTION =
  'Compare how recent RAG papers evaluate retrieval, and write it up in report.md.';

const ASK = 'One paper tunes on its test split. Include it in the report?';
const OPTIONS = [
  { value: 'exclude', label: 'Leave it out' },
  { value: 'include', label: 'Include it with a note' },
];

function answer(choice: string) {
  return [
    'I wrote the comparison to report.md. Most papers still report end-to-end answer accuracy; only two of the five measure retrieval on its own.',
    choice === 'exclude'
      ? 'Recall@k on Natural Questions is the most common retrieval metric. I left out the paper that tunes on its test split.'
      : 'Recall@k on Natural Questions is the most common retrieval metric. The paper that tunes on its test split is in the table with a note.',
    'Want me to add the per-dataset breakdown as a second table?',
  ];
}

// The run advances one step at a time and pauses at ASK_STEP for an answer.
const ASK_STEP = 5;
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
    item('search', 'Find recent RAG papers', 1, 2),
    item('review', 'Compare their evaluation setups', 2, 5),
    item('confirm', 'Confirm which papers to include', 5, 6),
    item('write', 'Write the comparison to report.md', 6, 7),
  ];
}

const robot = <RobotIcon size={12} weight="regular" />;

/**
 * One deep agent turn: it plans, searches, hands work to two subagents, asks
 * a question, writes a file, then answers. Public Macaw parts with scripted
 * data in place of a stream.
 */
function AgentChatExample() {
  const [run, setRun] = useState(() => ({ id: 0, startedAt: Date.now() }));
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [draft, setDraft] = useState('');
  const paragraphs = answer(choice[0] ?? 'exclude');
  const asking = step === ASK_STEP && !answered;
  const answerStep = step - STEPS;
  const working = step < STEPS && !asking;
  const running = answerStep < paragraphs.length;

  useEffect(() => {
    if (!running || asking) return;
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      step < STEPS ? STEP_MS : 500
    );
    return () => window.clearTimeout(timer);
  }, [running, asking, step]);

  function replay() {
    setRun({ id: run.id + 1, startedAt: Date.now() });
    setStep(0);
    setChoice([]);
    setAnswered(false);
  }

  const subagent = (
    id: string,
    name: string,
    task: string,
    current: string,
    start: number,
    end: number
  ) => {
    const callStatus = status(step, start, end);
    return (
      <ChatToolCall
        toolCall={{
          id,
          name: 'task',
          status: callStatus,
          elapsedMs:
            callStatus === 'succeeded' ? (end - start) * STEP_MS : undefined,
        }}
        label={name}
        icon={robot}
        // The current step while it runs, then the task it was given.
        summary={callStatus === 'running' ? current : task}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <ChatToolCall
            toolCall={{
              id: `${id}-search`,
              name: 'web_search',
              status: 'succeeded',
            }}
            label="Search"
            summary="RAG evaluation"
          />
          <ChatToolCall
            toolCall={{
              id: `${id}-read`,
              name: 'read_file',
              status: 'succeeded',
            }}
            label="Read"
            summary="lost-in-the-middle.md"
          />
        </div>
      </ChatToolCall>
    );
  };

  const work = (
    <ChatToolCallGroup
      key={run.id}
      label={
        asking
          ? 'Waiting for you · 5 actions'
          : working
            ? 'Working'
            : `Worked for ${formatChatDuration(STEPS * STEP_MS)} · 6 actions`
      }
      expanded={working || asking || undefined}
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
          summary="4 tasks"
        />
      )}
      {step >= 1 && (
        <ChatToolCall
          toolCall={{
            id: 'search',
            name: 'web_search',
            status: status(step, 1, 2),
            args: { query: 'retrieval-augmented generation evaluation 2026' },
          }}
          label="Search"
          summary="RAG evaluation 2026"
        />
      )}
      {step >= 2 &&
        subagent(
          'researcher',
          'researcher',
          'Summarize how five recent papers evaluate retrieval',
          step < 3 ? 'Reading the top results' : 'Tabulating metrics',
          2,
          4
        )}
      {step >= 2 &&
        subagent(
          'critic',
          'critic',
          'Check each evaluation for test-set leakage',
          step < 4 ? 'Checking data splits' : 'Reviewing hyperparameters',
          2,
          5
        )}
      {step >= ASK_STEP && (
        <ChatToolCall
          toolCall={{
            id: 'ask',
            name: 'ask_user',
            status: asking ? 'input-required' : 'succeeded',
          }}
          label="Ask"
          summary="Include the paper that tunes on its test split?"
        />
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
      status: step >= STEPS && running ? 'streaming' : 'completed',
      content: [
        { id: 'reply-work', type: 'custom', content: work },
        ...paragraphs.slice(0, Math.max(0, answerStep)).map((text, index) => ({
          id: `reply-${index}`,
          type: 'text' as const,
          text,
        })),
      ],
    },
  ];

  const planItems = plan(step);
  const planOpen = planItems.some((item) => item.status !== 'completed');
  // The plan stays on top; the question sits next to the input that answers it.
  const drawer =
    step >= 1 && planOpen ? (
      <>
        <ChatPlan items={planItems} presentation="drawer" />
        {asking && (
          <ChatRichContent presentation="drawer" title={ASK} state="unanswered">
            {({ disabled, isError, errorId }) => (
              <ChatRichContentChoices
                aria-label={ASK}
                aria-describedby={errorId}
                mode="single"
                options={OPTIONS}
                value={{ selected: choice }}
                onChange={(next) => setChoice(next.selected)}
                disabled={disabled}
                isError={isError}
              />
            )}
          </ChatRichContent>
        )}
      </>
    ) : undefined;

  return (
    <ChatConversation
      label="Research agent"
      header={
        <div className="flex items-center justify-between gap-space-3 border-b border-primary px-space-4 py-space-3">
          <Text variant="h3">Research agent</Text>
          <Button size="sm" color="secondary" onClick={replay}>
            Replay
          </Button>
        </div>
      }
      footer={
        <ChatComposer
          aria-label={asking ? 'Answer the agent' : 'Message the agent'}
          drawer={drawer}
          submitDisabled={asking ? choice.length === 0 : !draft.trim()}
          onSubmit={(event) => {
            event.preventDefault();
            if (asking) {
              setAnswered(true);
              setStep(ASK_STEP + 1);
            } else {
              setDraft('');
            }
          }}
          {...(running && !asking
            ? {
                action: 'stop' as const,
                onStop: () => setStep(STEPS + paragraphs.length),
              }
            : { action: 'send' as const })}
        >
          <ChatComposerInput
            value={draft}
            onChange={setDraft}
            placeholder={
              asking ? 'Or write a different answer' : 'Ask a follow-up'
            }
            aria-label="Message"
          />
          <ChatComposerToolbar
            actions={
              asking ? (
                <Button type="submit" size="sm" disabled={choice.length === 0}>
                  Submit answer
                </Button>
              ) : undefined
            }
          />
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
        story: `A deep agent turn as it plays out. Reasoning and tool calls share one work summary, which collapses to "Worked for …" once the agent answers.
- \`ChatPlan\` sits in the composer's drawer while the plan is unfinished; the \`write_todos\` call that changed it stays a tool row.
- Subagent runs (\`task\` calls) are tool rows named for the subagent: the current step shows while they run, and their own calls are in the details.
- Midway the agent asks a question. It stacks under the plan in the drawer, next to the input that answers it; pick an option and submit to continue.`,
      },
    },
  },
  render: () => <AgentChatExample />,
};
