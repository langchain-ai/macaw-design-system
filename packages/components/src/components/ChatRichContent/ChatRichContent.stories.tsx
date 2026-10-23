import { type ReactNode, useEffect, useState } from 'react';

import { z } from 'zod';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
  type ChatRichContentChoicesValue,
  type ChatRichContentState,
} from '.';
import { Button } from '../Button';
import { ChatComposer, ChatComposerInput } from '../ChatComposer';
import { ChatConversation } from '../ChatConversation';
import {
  ChatMessage,
  type ChatMessageContentBlock,
  type ChatMessageModel,
} from '../ChatMessage';
import { ChatToolCall } from '../ChatToolCall';
import { CodeLite } from '../Code/CodeLite';
import { Input } from '../Input';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import { ThinkingState } from '../ThinkingState';

const withCardWidth: Decorator = (Story) => (
  <div className="w-[28rem] max-w-full">
    <Story />
  </div>
);

const meta = {
  title: 'Components/Chat/ChatRichContent',
  component: ChatRichContent,
  tags: [
    'autodocs',
    'chat',
    'rich-content',
    'form',
    'choices',
    'radio buttons',
    'validation',
    'approval',
    'rejection',
    'code review',
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '- Container for interactive chat forms.',
          '- The host supplies controls, values, validation, and submission.',
          '- Compose ChatRichContentChoices for optional custom answers.',
          '- Use variant="approval" with onApprove, onReject, and optional onUndo.',
          '- Compose a code or diff preview as children. Set approved/rejected only after saving the decision.',
          '- Decisions stay pending until state changes to a new outcome or error. Throw from the callback if a retry fails with the same error state.',
          '- Set unanswered after confirmation to reopen; key by request ID for a new request.',
          '- Opt into a controlled rejectionReason field when needed.',
        ].join('\n'),
      },
    },
  },
  args: { title: 'How can the agent help?', state: 'unanswered' },
  argTypes: {
    onSubmit: { control: false },
    onSkip: { control: false },
    onNext: { control: false },
    onApprove: { control: false },
    onReject: { control: false },
    onUndo: { control: false },
    rejectionReason: { control: false },
    navigation: { control: false },
    children: { control: false },
  },
  decorators: [withCardWidth],
} satisfies Meta<typeof ChatRichContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const tasks = [
  'Research a Topic',
  'Summarize Documents',
  'Draft a Response',
].map((label) => ({ value: label, label }));

function FileChangePreview() {
  return (
    <CodeLite
      variant="diff"
      fileName="poem.txt"
      oldString={'roses are blue\nviolets are red\n'}
      newString={'roses are red\nviolets are blue\n'}
      className="rounded-none border-0 bg-transparent px-0"
    />
  );
}

function ApprovalExample({
  title,
  description,
  children,
  withReason = false,
  initialState = 'unanswered',
}: {
  title: string;
  description?: string;
  children: ReactNode;
  withReason?: boolean;
  initialState?: ChatRichContentState;
}) {
  const [state, setState] = useState<ChatRichContentState>(initialState);
  const [reason, setReason] = useState(
    initialState === 'unanswered' ? '' : 'Keep the original wording.'
  );
  return (
    <ChatRichContent
      variant="approval"
      title={title}
      description={description}
      state={state}
      onApprove={() => setState('approved')}
      onReject={() => setState('rejected')}
      onUndo={() => setState('unanswered')}
      rejectionReason={
        withReason ? { value: reason, onChange: setReason } : undefined
      }
    >
      {children}
    </ChatRichContent>
  );
}

export const CodeApproval: Story = {
  render: () => (
    <ApprovalExample
      title="Review Tool Call"
      description="List files in /user/memories."
    >
      <div className="min-w-0 overflow-auto rounded-md bg-surface-level-2 p-space-2">
        <CodeLite
          language="json"
          value={'{\n  "path": "/user/memories"\n}'}
          showGutter={false}
        />
      </div>
    </ApprovalExample>
  ),
  parameters: {
    docs: {
      description: { story: '- Approve or reject a code block in one card.' },
    },
  },
};

export const CodeChangesApproval: Story = {
  render: () => (
    <ApprovalExample title="Review Write File">
      <FileChangePreview />
    </ApprovalExample>
  ),
  parameters: {
    docs: {
      description: {
        story: '- Compose the existing diff viewer with approval actions.',
      },
    },
  },
};

function ApprovalRetryExample() {
  const [state, setState] = useState<ChatRichContentState>('unanswered');
  const [reason, setReason] = useState('');
  const [hasFailed, setHasFailed] = useState(false);

  async function saveDecision(decision: 'approved' | 'rejected') {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (!hasFailed) {
      setHasFailed(true);
      setState('submission-failed');
      throw new Error('Could not save your decision.');
    }
    setState(decision);
  }

  return (
    <ChatRichContent
      variant="approval"
      title="Review Write File"
      state={state}
      message={
        state === 'submission-failed'
          ? 'Could not save your decision. Please try again.'
          : undefined
      }
      onApprove={() => saveDecision('approved')}
      onReject={() => saveDecision('rejected')}
      onUndo={() => setState('unanswered')}
      rejectionReason={{ value: reason, onChange: setReason }}
    >
      <FileChangePreview />
    </ChatRichContent>
  );
}

export const ApprovalStates: Story = {
  render: () => (
    <div className="flex flex-col gap-space-6">
      <section className="flex min-w-0 flex-col gap-space-2">
        <Text as="h3" variant="xs" color="tertiary">
          Optional Rejection Reason
        </Text>
        <ApprovalExample title="Review Write File" withReason>
          <FileChangePreview />
        </ApprovalExample>
      </section>
      {(
        [
          'approved',
          'rejected',
          'submitting',
          'disabled',
          'expired',
        ] satisfies ChatRichContentState[]
      ).map((state) => (
        <section key={state} className="flex min-w-0 flex-col gap-space-2">
          <Text as="h3" variant="xs" color="tertiary" className="capitalize">
            {state}
          </Text>
          <ApprovalExample
            title="Review Write File"
            initialState={state}
            withReason
          >
            <FileChangePreview />
          </ApprovalExample>
        </section>
      ))}
      <section className="flex min-w-0 flex-col gap-space-2">
        <Text as="h3" variant="xs" color="tertiary">
          Retry After Failure
        </Text>
        <Text variant="xs" color="tertiary">
          The first decision fails. Retry either action without losing the
          reason.
        </Text>
        <ApprovalRetryExample />
      </section>
      <section className="flex min-w-0 flex-col gap-space-2">
        <Text as="h3" variant="xs" color="tertiary">
          Narrow Width
        </Text>
        <div className="w-72 max-w-full">
          <ApprovalExample title="Review Write File" withReason>
            <FileChangePreview />
          </ApprovalExample>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '- Optional rejection reason, decision and availability states, retry, and narrow layouts.',
      },
    },
  },
};

function hasChoiceAnswer(value: ChatRichContentChoicesValue) {
  return value.custom?.selected
    ? Boolean(value.custom.text.trim())
    : value.selected.length > 0;
}

function getChoiceResponse(
  value: ChatRichContentChoicesValue
): ChatRichContentChoicesValue {
  return {
    selected: [...value.selected],
    ...(value.custom?.selected && {
      custom: { selected: true, text: value.custom.text.trim() },
    }),
  };
}

export const Choices: Story = {
  render: function ChoicesExample() {
    const [value, setValue] = useState<ChatRichContentChoicesValue>({
      selected: [],
    });
    const [accepted, setAccepted] = useState<ChatRichContentChoicesValue>();
    const [error, setError] = useState(false);
    return (
      <ChatRichContent
        title="What should the agent help with?"
        description="Choose all that apply."
        state={
          accepted ? 'submitted' : error ? 'validation-error' : 'unanswered'
        }
        message={
          error
            ? value.custom?.selected
              ? 'Describe what else the agent should help with.'
              : 'Choose at least one task.'
            : undefined
        }
        submitLabel="Continue"
        onSubmit={() => {
          if (!hasChoiceAnswer(value)) {
            setError(true);
            throw new Error('Choose a task.');
          }
          setAccepted(getChoiceResponse(value));
        }}
      >
        {({ disabled }) => (
          <ChatRichContentChoices
            mode="multiple"
            aria-label="Tasks"
            options={tasks}
            value={accepted ?? value}
            onChange={(next) => {
              setError(false);
              setValue(next);
            }}
            allowCustom
            disabled={disabled}
            isError={error}
          />
        )}
      </ChatRichContent>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '- Select multiple options or add a custom answer.',
      },
    },
  },
};

function ReviewChoices({
  value,
  onChange,
  disabled,
  isError,
}: {
  value: ChatRichContentChoicesValue;
  onChange: (value: ChatRichContentChoicesValue) => void;
  disabled: boolean;
  isError?: boolean;
}) {
  const options = [
    {
      value: 'each',
      label: 'Each Change',
    },
    {
      value: 'summary',
      label: 'Final Summary',
    },
  ];
  return (
    <ChatRichContentChoices
      mode="single"
      aria-label="Review mode"
      options={options}
      value={value}
      onChange={onChange}
      allowCustom
      disabled={disabled}
      isError={isError}
    />
  );
}

function ReviewChoiceExample() {
  const [value, setValue] = useState<ChatRichContentChoicesValue>({
    selected: ['each'],
  });
  const [accepted, setAccepted] = useState<ChatRichContentChoicesValue>();
  const [error, setError] = useState(false);
  return (
    <ChatRichContent
      title="How would you like to review changes?"
      state={accepted ? 'submitted' : error ? 'validation-error' : 'unanswered'}
      message={
        error ? 'Describe how you would like to review changes.' : undefined
      }
      onSubmit={() => {
        if (!hasChoiceAnswer(value)) {
          setError(true);
          throw new Error('Enter a response.');
        }
        setAccepted(getChoiceResponse(value));
      }}
    >
      {({ disabled }) => (
        <ReviewChoices
          value={accepted ?? value}
          onChange={(next) => {
            setError(false);
            setValue(next);
          }}
          disabled={disabled}
          isError={error}
        />
      )}
    </ChatRichContent>
  );
}

export const SingleChoice: Story = {
  render: () => <ReviewChoiceExample />,
  parameters: {
    docs: {
      description: {
        story: '- Choose one option or write a custom answer.',
      },
    },
  },
};

export const WithSkip: Story = {
  render: function SkipExample() {
    const [value, setValue] = useState('');
    const [state, setState] = useState<ChatRichContentState>('unanswered');
    return (
      <ChatRichContent
        title="Any additional instructions?"
        description="You can skip this question."
        state={state}
        message={state === 'read-only' ? 'Question skipped' : undefined}
        onSubmit={() => {
          setState('submitted');
        }}
        onSkip={() => {
          setState('read-only');
        }}
      >
        {({ disabled }) => (
          <Textarea
            size="md"
            resize="none"
            aria-label="Additional instructions"
            value={value}
            onChange={setValue}
            disabled={disabled}
          />
        )}
      </ChatRichContent>
    );
  },
};

const questions = [
  { id: 'name', title: 'What should the agent be called?' },
  { id: 'instructions', title: 'What should the agent do?' },
];

type QuestionAnswer = string | ChatRichContentChoicesValue;
type QuestionResponses = Record<string, QuestionAnswer | null>;

function QuestionsExample({
  items,
  initialValues = {},
  initialAccepted,
  onSubmit,
}: {
  items: { id: string; title: string }[];
  initialValues?: Record<string, QuestionAnswer>;
  initialAccepted?: QuestionResponses;
  onSubmit?: (responses: QuestionResponses) => void;
}) {
  const [current, setCurrent] = useState(1);
  const [drafts, setDrafts] = useState(initialValues);
  const [accepted, setAccepted] = useState(initialAccepted);
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set());
  const [errorId, setErrorId] = useState<string>();
  const question = items[current - 1];
  if (!question) return null;
  const isSkipped = accepted
    ? accepted[question.id] === null
    : skipped.has(question.id);
  const hasError = errorId === question.id;

  function needsAnswer(id: string) {
    if (skipped.has(id)) return false;
    const value = drafts[id];
    return (
      value === undefined ||
      (typeof value === 'string' ? !value.trim() : !hasChoiceAnswer(value))
    );
  }

  function next() {
    if (!question) return;
    if (needsAnswer(question.id)) {
      setErrorId(question.id);
      return;
    }
    setErrorId(undefined);
    setCurrent(current + 1);
  }

  return (
    <ChatRichContent
      title={question.title}
      description={
        accepted
          ? undefined
          : 'Submit all answers on the last step. You can skip any question.'
      }
      state={
        accepted
          ? isSkipped
            ? 'read-only'
            : 'submitted'
          : hasError
            ? 'validation-error'
            : 'unanswered'
      }
      message={
        hasError
          ? 'Enter a response or skip this question.'
          : isSkipped
            ? 'Question skipped'
            : undefined
      }
      navigation={{ current, total: items.length, onChange: setCurrent }}
      onNext={current < items.length ? next : undefined}
      onSubmit={() => {
        const missing = items.findIndex((item) => needsAnswer(item.id));
        const missingQuestion = items[missing];
        if (missingQuestion) {
          setErrorId(missingQuestion.id);
          setCurrent(missing + 1);
          throw new Error('Answer or skip each question before submitting.');
        }
        const responses: QuestionResponses = Object.fromEntries(
          items.map((item) => {
            const value = drafts[item.id] ?? '';
            return [
              item.id,
              skipped.has(item.id)
                ? null
                : typeof value === 'string'
                  ? value
                  : getChoiceResponse(value),
            ];
          })
        );
        setAccepted(responses);
        onSubmit?.(responses);
      }}
      onSkip={() => {
        setSkipped((values) => new Set([...values, question.id]));
        setErrorId(undefined);
        setCurrent(Math.min(current + 1, items.length));
      }}
    >
      {({ disabled }) => {
        const value = accepted
          ? (accepted[question.id] ?? '')
          : (drafts[question.id] ?? '');
        const onChange = (value: QuestionAnswer) => {
          setDrafts((values) => ({ ...values, [question.id]: value }));
          setSkipped((values) => {
            const next = new Set(values);
            next.delete(question.id);
            return next;
          });
          setErrorId(undefined);
        };
        return question.id === 'reviewMode' ? (
          <ReviewChoices
            value={typeof value === 'string' ? { selected: [] } : value}
            onChange={onChange}
            disabled={disabled}
            isError={hasError}
          />
        ) : question.id === 'name' ? (
          <Input
            size="md"
            aria-label={question.title}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            disabled={disabled}
            debounceMs={0}
            isError={hasError}
          />
        ) : (
          <Textarea
            size="md"
            resize="none"
            aria-label={question.title}
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            isError={hasError}
          />
        );
      }}
    </ChatRichContent>
  );
}

export const MultipleQuestions: Story = {
  render: () => <QuestionsExample items={questions} />,
  parameters: {
    docs: {
      description: {
        story:
          '- Next and Skip move between questions.\n- Questions slide in the direction of navigation.\n- Submit all answers on the final step.',
      },
    },
  },
};

export const Retry: Story = {
  render: function RetryExample() {
    const [draft, setDraft] = useState(
      'Summarize documents and cite your sources.'
    );
    const [accepted, setAccepted] = useState<string>();
    const [state, setState] =
      useState<ChatRichContentState>('submission-failed');
    return (
      <ChatRichContent
        title="What should the agent do?"
        state={state}
        onSubmit={async () => {
          setState('submitting');
          await new Promise((resolve) => window.setTimeout(resolve, 600));
          setAccepted(draft);
          setState('submitted');
        }}
      >
        {({ disabled }) => (
          <Textarea
            size="md"
            resize="none"
            aria-label="What should the agent do?"
            value={accepted ?? draft}
            onChange={setDraft}
            disabled={disabled}
          />
        )}
      </ChatRichContent>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '- Retry a failed submission without losing the draft.',
      },
    },
  },
};

function ConfirmationExample({
  title = 'Ready to continue?',
}: {
  title?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <ChatRichContent
      title={title}
      submitLabel="Confirm"
      state={submitted ? 'submitted' : 'unanswered'}
      onSubmit={() => {
        setSubmitted(true);
      }}
    />
  );
}

const responseStates: ChatRichContentState[] = [
  'submitting',
  'submitted',
  'submission-failed',
  'expired',
  'disabled',
  'read-only',
];
export const ResponseStates: Story = {
  render: () => (
    <div className="flex flex-col gap-space-6">
      {responseStates.map((state) => (
        <ChatRichContent key={state} title="Agent Instructions" state={state}>
          {({ disabled }) => (
            <Textarea
              aria-label="Agent instructions"
              size="md"
              resize="none"
              value="Summarize documents and cite your sources."
              onChange={() => {}}
              disabled={disabled}
            />
          )}
        </ChatRichContent>
      ))}
    </div>
  ),
};

// This schema belongs to the example host adapter, not the design-system component.
const hostBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('instructions'),
    text: z.string().max(10_000),
  }),
  z.object({
    id: z.string(),
    type: z.literal('confirmation'),
    title: z.string().max(500),
  }),
]);

function InstructionsExample({ text }: { text: string }) {
  const [draft, setDraft] = useState(text);
  const [accepted, setAccepted] = useState<string>();
  return (
    <ChatRichContent
      title="Update Agent Instructions"
      submitLabel="Save instructions"
      state={accepted === undefined ? 'unanswered' : 'submitted'}
      onSubmit={() => {
        setAccepted(draft);
      }}
    >
      {({ disabled }) => (
        <Textarea
          size="md"
          resize="none"
          aria-label="Agent instructions"
          value={accepted ?? draft}
          disabled={disabled}
          onChange={setDraft}
        />
      )}
    </ChatRichContent>
  );
}

function HostBlockAdapter({
  block,
  fallbackActions,
}: {
  block: unknown;
  fallbackActions?: ReactNode;
}) {
  const parsed = hostBlockSchema.safeParse(block);
  if (!parsed.success)
    return <ChatRichContentFallback actions={fallbackActions} />;
  const model = parsed.data;
  switch (model.type) {
    case 'instructions':
      return <InstructionsExample key={model.id} text={model.text} />;
    case 'confirmation':
      return <ConfirmationExample key={model.id} title={model.title} />;
  }
}

export const UnknownAndInvalid: Story = {
  render: function RecoveryExample() {
    const [block, setBlock] = useState<unknown>({
      id: 'invalid',
      type: 'instructions',
      text: 42,
    });
    const [skipped, setSkipped] = useState(false);
    return (
      <div className="flex flex-col gap-space-4">
        <HostBlockAdapter block={{ id: 'unknown', type: 'unsupported' }} />
        {skipped ? (
          <ChatRichContent
            title="Optional question"
            state="read-only"
            message="Question skipped"
          />
        ) : (
          <HostBlockAdapter
            block={block}
            fallbackActions={
              <>
                <Button
                  type="button"
                  size="sm"
                  color="secondary"
                  variant="plain"
                  onClick={() => setSkipped(true)}
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  onClick={() =>
                    setBlock({
                      id: 'reloaded',
                      type: 'instructions',
                      text: 'Summarize documents and cite your sources.',
                    })
                  }
                >
                  Reload
                </Button>
              </>
            }
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '- The fallback is inactive by default.\n- The host can supply Reload and Skip actions when recovery is available.',
      },
    },
  },
};

const conversationQuestions = [
  {
    id: 'reviewMode',
    title: 'How would you like to review changes?',
  },
  {
    id: 'goal',
    title: 'What should the updates accomplish?',
  },
];

function ConversationExample() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [responses, setResponses] = useState<QuestionResponses>();
  const [toolStatus, setToolStatus] = useState<
    'input-required' | 'running' | 'succeeded'
  >('input-required');
  const composerDisabled = toolStatus !== 'succeeded';
  const reviewMode = responses?.reviewMode;
  const reviewChoice =
    reviewMode && typeof reviewMode !== 'string'
      ? reviewMode.selected[0]
      : undefined;
  const plan =
    reviewChoice === 'each'
      ? 'I’ll propose changes one at a time for your approval.'
      : reviewChoice === 'summary'
        ? 'I’ll gather the suggested changes into a final summary for your review.'
        : 'I’ll prepare a plan using the available details.';

  // Simulate execution separately from accepting the response.
  useEffect(() => {
    if (toolStatus !== 'running') return;
    const timer = window.setTimeout(() => {
      setToolStatus('succeeded');
      setMessages((previous) => [
        ...previous,
        {
          id: 'plan-result',
          role: 'assistant',
          status: 'completed',
          content: [{ id: 'text', type: 'text', text: plan }],
        },
      ]);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [toolStatus, plan]);

  const questionnaire = (
    <QuestionsExample
      items={conversationQuestions}
      initialValues={{ reviewMode: { selected: ['each'] } }}
      initialAccepted={responses}
      onSubmit={(responses) => {
        setResponses(responses);
        setToolStatus('running');
      }}
    />
  );

  const composer = (
    <ChatComposer
      aria-label="Message composer"
      disabled={composerDisabled}
      submitDisabled={!draft.trim()}
      onSubmit={(event) => {
        event.preventDefault();
        if (composerDisabled || !draft.trim()) return;
        setMessages((previous) => [
          ...previous,
          {
            id: `follow-up-${previous.length}`,
            role: 'user',
            status: 'completed',
            content: [
              {
                id: 'text',
                type: 'text',
                text: draft.trim(),
                appearance: 'bubble',
              },
            ],
          },
        ]);
        setDraft('');
      }}
    >
      <ChatComposerInput
        aria-label="Message"
        value={draft}
        onChange={setDraft}
      />
    </ChatComposer>
  );

  return (
    <div className="h-[40rem] max-h-[85dvh]">
      <ChatConversation
        footer={
          !responses ? (
            <div className="max-h-[60dvh] overflow-y-auto overscroll-contain">
              {questionnaire}
            </div>
          ) : toolStatus === 'running' ? (
            <ThinkingState label="Preparing your plan…" motion="subtle" />
          ) : (
            composer
          )
        }
      >
        <ChatMessage
          message={{
            id: 'request',
            role: 'user',
            status: 'completed',
            content: [
              {
                id: 'text',
                type: 'text',
                text: 'Help me plan updates to my agent.',
                appearance: 'bubble',
              },
            ],
          }}
        />
        <ChatMessage
          message={{
            id: 'question',
            role: 'assistant',
            status:
              toolStatus === 'input-required'
                ? 'interrupted'
                : toolStatus === 'running'
                  ? 'streaming'
                  : 'completed',
            content: [
              {
                id: 'intro',
                type: 'text',
                text: 'Before I draft the plan, answer these two questions. You can skip any question.',
              },
              {
                id: 'waiting',
                type: 'custom',
                content: (
                  <ChatToolCall
                    toolCall={{
                      id: 'plan',
                      name: 'Prepare plan',
                      status: toolStatus,
                      args: responses
                        ? {
                            answers: Object.fromEntries(
                              Object.entries(responses).filter(
                                ([, value]) => value !== null
                              )
                            ),
                            skippedQuestions: conversationQuestions
                              .filter((item) => responses[item.id] === null)
                              .map((item) => item.id),
                          }
                        : undefined,
                      result: toolStatus === 'succeeded' ? plan : undefined,
                    }}
                    summary={
                      responses
                        ? 'Responses submitted'
                        : 'Waiting for responses'
                    }
                  />
                ),
              },
              ...(responses
                ? [
                    {
                      id: 'response',
                      type: 'custom',
                      content: questionnaire,
                    } satisfies ChatMessageContentBlock,
                  ]
                : []),
            ],
          }}
        />
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </ChatConversation>
    </div>
  );
}

export const InConversationReplaceComposer: Story = {
  name: 'Replacing ChatComposer',
  render: () => <ConversationExample />,
  parameters: {
    docs: {
      description: {
        story:
          '- Answer questions in the composer area.\n- Custom answers are saved with the tool response.\n- Submitted answers move into history; the composer returns when the run finishes.',
      },
    },
  },
};
