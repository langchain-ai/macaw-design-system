import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { expect, userEvent, waitFor } from 'storybook/test';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
  type ChatRichContentChoicesValue,
  type ChatRichContentState,
} from '.';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerInput,
  type ChatComposerInputHandle,
  ChatComposerToolbar,
} from '../ChatComposer';
import {
  ChatMessage,
  type ChatMessageContentBlock,
  type ChatMessageModel,
} from '../ChatMessage';
import { CodeLite } from '../Code/CodeLite';
import { Input } from '../Input';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import { ThinkingState } from '../ThinkingState';

const withCardWidth: Decorator = (Story, context) => (
  <div
    className={
      context.parameters.comparison
        ? 'w-[58rem] max-w-full'
        : 'w-[28rem] max-w-full'
    }
  >
    <Story />
  </div>
);

const meta = {
  title: 'Components/Chat/ChatRichContent',
  component: ChatRichContent,
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'rich-content',
    'form',
    'choices',
    'radio buttons',
    'validation',
    'approval',
    'rejection',
    'code review',
    'drawer',
  ],
  parameters: {
    a11y: { test: 'error' },
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Forms and approvals in chat. The host supplies controls, values, validation, and persistence.',
          '- Use presentation="drawer" in ChatComposer’s drawer slot; the composer owns submission.',
          '- Set an outcome state only after saving. Throw from the callback when a retry fails with the same error state.',
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

function PresentationComparison({
  block,
  drawer,
}: {
  block: ReactNode;
  drawer: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-space-5 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-space-3">
        <Text variant="sm" weight="semibold">
          Block
        </Text>
        {block}
      </div>
      <div className="flex min-w-0 flex-col gap-space-3">
        <Text variant="sm" weight="semibold">
          Drawer
        </Text>
        {drawer}
      </div>
    </div>
  );
}

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
      title="Review Write File — Retry"
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

function EditableApprovalExample() {
  const [state, setState] = useState<ChatRichContentState>('unanswered');
  const [path, setPath] = useState('/user/memories');
  const [approvedPath, setApprovedPath] = useState<string>();

  return (
    <ChatRichContent
      variant="approval"
      title="Review Tool Call"
      description="List files in a directory."
      state={state}
      message={
        state === 'approved' && approvedPath
          ? `Approved with edits: ${approvedPath}`
          : undefined
      }
      onApprove={() => setState('approved')}
      onReject={() => setState('rejected')}
      onUndo={() => {
        setApprovedPath(undefined);
        setState('unanswered');
      }}
      edit={{
        content: ({ disabled, isError, errorId }) => (
          <Input
            label="Path"
            value={path}
            onChange={setPath}
            debounceMs={0}
            disabled={disabled}
            isError={isError}
            aria-describedby={errorId}
          />
        ),
        onSubmit: () => {
          if (!path.trim().startsWith('/')) {
            setState('validation-error');
            throw new Error('Enter an absolute path.');
          }
          setApprovedPath(path.trim());
          setState('approved');
        },
      }}
    >
      <div className="min-w-0 overflow-auto rounded-md bg-surface-level-2 p-space-2">
        <CodeLite
          language="json"
          value={JSON.stringify(
            { path: approvedPath ?? '/user/memories' },
            null,
            2
          )}
          showGutter={false}
        />
      </div>
    </ChatRichContent>
  );
}

export const ApprovalWithEdit: Story = {
  render: () => <EditableApprovalExample />,
  parameters: {
    docs: {
      description: {
        story:
          "- `edit` adds an Edit step for decisions that allow changing the request, such as a tool call's arguments. The host owns the fields and validation; Approve with edits saves through `edit.onSubmit`.",
      },
    },
  },
};

export const ApprovalStates: Story = {
  render: () => (
    <div className="flex flex-col gap-space-6">
      <section className="flex min-w-0 flex-col gap-space-2">
        <Text as="h3" variant="xs" color="tertiary">
          Optional Rejection Reason
        </Text>
        <ApprovalExample title="Review Write File — Optional Reason" withReason>
          <FileChangePreview />
        </ApprovalExample>
      </section>
      {(
        [
          'approved',
          'rejected',
          'submitting',
          'validation-error',
          'submission-failed',
          'disabled',
          'expired',
        ] satisfies ChatRichContentState[]
      ).map((state) => (
        <section key={state} className="flex min-w-0 flex-col gap-space-2">
          <Text as="h3" variant="xs" color="tertiary" className="capitalize">
            {state}
          </Text>
          <ApprovalExample
            title={`Review Write File — ${state}`}
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
          <ApprovalExample title="Review Write File — Narrow Width" withReason>
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

function ChoicesExample() {
  const [value, setValue] = useState<ChatRichContentChoicesValue>({
    selected: [],
  });
  const [accepted, setAccepted] = useState<ChatRichContentChoicesValue>();
  const [error, setError] = useState(false);
  return (
    <ChatRichContent
      title="What should the agent help with?"
      description="Choose all that apply."
      state={accepted ? 'submitted' : error ? 'validation-error' : 'unanswered'}
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
}

export const Choices: Story = {
  render: () => (
    <PresentationComparison
      block={<ChoicesExample />}
      drawer={
        <DrawerExample
          questions={[
            {
              title: 'What should the agent help with?',
              kind: 'choices',
              mode: 'multiple',
              options: tasks,
            },
          ]}
        />
      }
    />
  ),
  parameters: {
    comparison: true,
    docs: {
      description: {
        story:
          '- Select multiple options or add a custom answer. The drawer uses the composer for custom text.',
      },
    },
  },
};

const reviewOptions = [
  { value: 'each', label: 'Each Change' },
  { value: 'summary', label: 'Final Summary' },
];

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
  return (
    <ChatRichContentChoices
      mode="single"
      aria-label="Review mode"
      options={reviewOptions}
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
  render: () => (
    <PresentationComparison
      block={<ReviewChoiceExample />}
      drawer={
        <DrawerExample
          questions={[
            {
              title: 'How would you like to review changes?',
              kind: 'choices',
              mode: 'single',
              options: reviewOptions,
            },
          ]}
          initialAnswers={{ 1: { selected: ['each'] } }}
        />
      }
    />
  ),
  parameters: {
    comparison: true,
    docs: {
      description: {
        story:
          '- Choose one option or write a custom answer. Something else focuses the composer in the drawer.',
      },
    },
  },
};

function SkipExample() {
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
}

export const WithSkip: Story = {
  render: () => (
    <PresentationComparison
      block={<SkipExample />}
      drawer={
        <DrawerExample
          allowSkip
          questions={[{ title: 'Any additional instructions?', kind: 'text' }]}
        />
      }
    />
  ),
  parameters: {
    comparison: true,
    docs: {
      description: {
        story:
          '- Write an answer or skip. The drawer uses the composer instead of a separate textarea.',
      },
    },
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
  render: () => (
    <PresentationComparison
      block={
        <QuestionsExample
          items={questions.map((question) => ({
            ...question,
            title: `Block: ${question.title}`,
          }))}
        />
      }
      drawer={
        <DrawerExample
          allowSkip
          questions={questions.map<DrawerQuestion>(({ title }) => ({
            title: `Drawer: ${title}`,
            kind: 'text',
          }))}
        />
      }
    />
  ),
  parameters: {
    comparison: true,
    docs: {
      description: {
        story:
          '- Next and Skip move between questions.\n- Questions slide in the direction of navigation.\n- Submit all answers on the final step.',
      },
    },
  },
};

function RetryExample() {
  const [draft, setDraft] = useState(
    'Summarize documents and cite your sources.'
  );
  const [accepted, setAccepted] = useState<string>();
  const [state, setState] = useState<ChatRichContentState>('submission-failed');
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
}

export const Retry: Story = {
  render: () => (
    <PresentationComparison
      block={<RetryExample />}
      drawer={
        <DrawerExample
          questions={[{ title: 'What should the agent do?', kind: 'text' }]}
          initialState="submission-failed"
          initialAnswers={{ 1: 'Summarize documents and cite your sources.' }}
        />
      }
    />
  ),
  parameters: {
    comparison: true,
    docs: {
      description: {
        story: '- Retry a failed submission without losing the draft.',
      },
    },
  },
};

function ConfirmationExample() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <ChatRichContent
      title="Ready to continue?"
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
        <PresentationComparison
          key={state}
          block={
            <ChatRichContent
              title={`Agent Instructions — Block, ${state}`}
              state={state}
            >
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
          }
          drawer={
            <ChatComposer
              disabled
              aria-label={`Agent instructions — ${state}`}
              drawer={
                <ChatRichContent
                  presentation="drawer"
                  title={`Agent Instructions — Drawer, ${state}`}
                  state={state}
                />
              }
            >
              <ChatComposerInput
                aria-label="Agent instructions"
                value="Summarize documents and cite your sources."
                onChange={() => {}}
              />
              <ChatComposerToolbar
                actions={
                  <Button
                    type="submit"
                    size="sm"
                    disabled
                    loading={state === 'submitting'}
                  >
                    Submit answer
                  </Button>
                }
              />
            </ChatComposer>
          }
        />
      ))}
    </div>
  ),
  parameters: { comparison: true },
};

export const UnknownAndInvalid: Story = {
  render: function RecoveryExample() {
    const [recovered, setRecovered] = useState(false);
    const [skipped, setSkipped] = useState(false);
    return (
      <div className="flex flex-col gap-space-4">
        <ChatRichContentFallback />
        {recovered ? (
          <ConfirmationExample />
        ) : skipped ? (
          <ChatRichContent
            title="Optional Question"
            state="read-only"
            message="Question skipped"
          />
        ) : (
          <ChatRichContentFallback
            actions={
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
                  onClick={() => setRecovered(true)}
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
          '- Render for unknown or invalid payloads. Supply recovery actions only when the host supports them.',
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
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [responses, setResponses] = useState<QuestionResponses>();
  const [toolStatus, setToolStatus] = useState<
    'input-required' | 'running' | 'succeeded'
  >('input-required');
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
    />
  );

  const composer = (
    <DrawerExample
      questions={conversationQuestions.map<DrawerQuestion>(({ id, title }) =>
        id === 'reviewMode'
          ? { title, kind: 'choices', mode: 'single', options: reviewOptions }
          : { title, kind: 'text' }
      )}
      initialAnswers={{ 1: { selected: ['each'] } }}
      allowSkip
      disabled={toolStatus === 'running'}
      onSubmit={(answers) => {
        setResponses(
          Object.fromEntries(
            conversationQuestions.map(({ id }, index) => [
              id,
              answers[index + 1] ?? null,
            ])
          )
        );
        setToolStatus('running');
      }}
      onMessage={(text) => {
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
                text,
                appearance: 'bubble',
              },
            ],
          },
        ]);
      }}
    />
  );

  return (
    <section
      aria-label="Example conversation"
      className="flex max-h-[85dvh] min-w-0 flex-col gap-space-5"
    >
      <div className="flex min-w-0 flex-col gap-space-5 overflow-y-auto">
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
      </div>
      <div className="flex shrink-0 flex-col gap-space-3">
        {toolStatus === 'running' && (
          <ThinkingState label="Preparing your plan…" motion="subtle" />
        )}
        {composer}
      </div>
    </section>
  );
}

export const ComposerDrawer: Story = {
  render: () => <ConversationExample />,
  parameters: {
    docs: {
      description: {
        story:
          '- Questions stay attached to the composer; custom and text answers use its editor.\n- Submitted answers move into history. The composer stays visible and resumes messaging when the run finishes.',
      },
    },
  },
};

export const CollapsedDrawer: Story = {
  render: () => (
    <DrawerExample
      defaultOpen={false}
      allowSkip
      questions={[
        {
          title: 'How would you like to review changes?',
          kind: 'choices',
          mode: 'single',
          options: reviewOptions,
        },
        { title: 'What should the plan prioritize?', kind: 'text' },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '- Collapse the drawer to read the conversation while a question waits; the title stays visible and the composer keeps working.\n- Validation and submission errors always expand the drawer.',
      },
    },
  },
  play: async ({ canvas }) => {
    const user = userEvent.setup({ delay: 20 });
    // The rich editor loads lazily; a cold CI browser can take longer than
    // Testing Library's default one-second query timeout.
    const editor = await canvas.findByRole(
      'textbox',
      { name: 'How would you like to review changes?' },
      { timeout: 10_000 }
    );
    await user.click(canvas.getByRole('button', { name: 'Expand question' }));
    await expect(
      canvas.getByRole('button', { name: 'Collapse question' })
    ).toHaveAttribute('aria-expanded', 'true');
    await user.click(canvas.getByRole('radio', { name: 'Something else…' }));
    await expect(editor).toHaveFocus();
    // Synthetic typing must yield for ProseMirror's DOM observer and the
    // controlled value to settle between keystrokes on slower CI browsers.
    await user.type(editor, 'Only security changes');
    await expect(editor).toHaveTextContent('Only security changes');
    await user.keyboard('{Enter}');
    const nextEditor = await canvas.findByRole('textbox', {
      name: 'What should the plan prioritize?',
    });
    await user.type(nextEditor, 'Preserve existing behavior');
    await expect(nextEditor).toHaveTextContent('Preserve existing behavior');
    await user.click(canvas.getByRole('button', { name: 'Submit answer' }));
    await expect(await canvas.findByText('Answers submitted')).toBeVisible();
    await expect(canvas.getByText('Only security changes')).toBeVisible();
    await expect(canvas.getByText('Preserve existing behavior')).toBeVisible();
    await expect(
      await canvas.findByRole('form', { name: 'Message composer' })
    ).toBeVisible();
  },
};

type DrawerQuestion =
  | { title: string; kind: 'text' }
  | {
      title: string;
      kind: 'choices';
      mode: 'single' | 'multiple';
      options: { value: string; label: string }[];
    };

type DrawerAnswers = Record<number, QuestionAnswer | null>;

function DrawerExample({
  questions,
  initialAnswers = {},
  initialState = 'unanswered',
  allowSkip = false,
  defaultOpen,
  disabled = false,
  onSubmit,
  onMessage,
}: {
  questions: DrawerQuestion[];
  initialAnswers?: DrawerAnswers;
  initialState?: ChatRichContentState;
  allowSkip?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onSubmit?: (answers: DrawerAnswers) => void;
  onMessage?: (text: string) => void;
}) {
  const inputRef = useRef<ChatComposerInputHandle>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const inputErrorId = useId();
  const submitting = useRef(false);
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [state, setState] = useState<ChatRichContentState>(initialState);
  const [messageDraft, setMessageDraft] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const question = questions[current - 1];
  useEffect(() => {
    if (state !== 'validation-error') return;
    const answer = answers[current];
    if (
      question?.kind === 'choices' &&
      !(typeof answer === 'object' && answer?.custom?.selected)
    ) {
      choicesRef.current
        ?.querySelector<HTMLElement>('[role="radio"], [role="checkbox"]')
        ?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [state, current, question, answers]);
  if (!question) return null;

  const answering = state !== 'submitted';
  const editable =
    !disabled &&
    (state === 'unanswered' ||
      state === 'validation-error' ||
      state === 'submission-failed');
  const answer = answers[current];
  const choices: ChatRichContentChoicesValue =
    answer != null && typeof answer === 'object' ? answer : { selected: [] };
  const answerText =
    question.kind === 'text'
      ? typeof answer === 'string'
        ? answer
        : ''
      : choices.custom?.selected
        ? choices.custom.text
        : '';
  const hasAnswer =
    answer === null ||
    (question.kind === 'text'
      ? Boolean(answerText.trim())
      : hasChoiceAnswer(choices));
  const errorMessage =
    state === 'submission-failed'
      ? 'Could not submit your answers. Your draft is saved here, try again.'
      : state === 'validation-error'
        ? 'Answer this question before submitting.'
        : undefined;

  function updateAnswer(value: QuestionAnswer) {
    setAnswers((previous) => ({ ...previous, [current]: value }));
    setState('unanswered');
  }

  async function complete(nextAnswers: DrawerAnswers) {
    const missing = questions.findIndex((_, index) => {
      const value = nextAnswers[index + 1];
      return (
        value !== null &&
        (typeof value === 'string'
          ? !value.trim()
          : value === undefined || !hasChoiceAnswer(value))
      );
    });
    if (missing !== -1) {
      setCurrent(missing + 1);
      setState('validation-error');
      return;
    }
    submitting.current = true;
    setState('submitting');
    await new Promise((resolve) => setTimeout(resolve, 700));
    const responses = Object.fromEntries(
      Object.entries(nextAnswers).map(([index, value]) => [
        index,
        value === null || typeof value === 'string'
          ? value
          : getChoiceResponse(value),
      ])
    );
    setState('submitted');
    onSubmit?.(responses);
    submitting.current = false;
  }

  function advance(nextAnswers: DrawerAnswers) {
    if (current < questions.length) {
      setCurrent(current + 1);
      setState('unanswered');
    } else {
      void complete(nextAnswers);
    }
  }

  function submit() {
    if (disabled || submitting.current) return;
    if (!answering) {
      const text = messageDraft.trim();
      if (!text) return;
      if (onMessage) onMessage(text);
      else setLastMessage(text);
      setMessageDraft('');
    } else if (editable && hasAnswer) {
      advance(answers);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-space-4">
      {!answering && !onSubmit && (
        <div className="flex flex-col gap-space-2" role="status">
          <Text variant="sm" weight="semibold">
            Answers submitted
          </Text>
          {questions.map((item, index) => {
            const value = answers[index + 1];
            const response =
              value === null
                ? 'Question skipped'
                : typeof value === 'string'
                  ? value
                  : [
                      ...(value?.selected ?? []).map((selected) =>
                        item.kind === 'choices'
                          ? (item.options.find(
                              (option) => option.value === selected
                            )?.label ?? selected)
                          : selected
                      ),
                      ...(value?.custom?.selected ? [value.custom.text] : []),
                    ].join(', ');
            return (
              <div key={item.title} className="flex flex-col gap-space-1">
                <Text variant="xs" color="tertiary">
                  {item.title}
                </Text>
                <Text variant="sm">{response}</Text>
              </div>
            );
          })}
        </div>
      )}
      <ChatComposer
        aria-label={answering ? 'Question response' : 'Message composer'}
        disabled={disabled || (answering && !editable)}
        action={state === 'submitting' ? 'sending' : 'send'}
        drawerIntent={
          state === 'validation-error' || state === 'submission-failed'
            ? 'error'
            : 'neutral'
        }
        submitDisabled={answering ? !hasAnswer : !messageDraft.trim()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        drawer={
          answering ? (
            <ChatRichContent
              presentation="drawer"
              defaultOpen={defaultOpen}
              title={question.title}
              state={state}
              message={
                errorMessage ??
                (answer === null ? 'Question skipped' : undefined)
              }
              onSkip={
                allowSkip
                  ? () => {
                      if (!editable || submitting.current) return;
                      const nextAnswers = { ...answers, [current]: null };
                      setAnswers(nextAnswers);
                      advance(nextAnswers);
                    }
                  : undefined
              }
              navigation={
                questions.length > 1
                  ? {
                      current,
                      total: questions.length,
                      onChange: (next) => {
                        setCurrent(next);
                        setState('unanswered');
                      },
                    }
                  : undefined
              }
            >
              {question.kind === 'choices'
                ? ({ disabled: drawerDisabled, isError, errorId }) => (
                    <div ref={choicesRef}>
                      <ChatRichContentChoices
                        aria-label={question.title}
                        aria-describedby={errorId}
                        mode={question.mode}
                        options={question.options}
                        value={choices}
                        onChange={updateAnswer}
                        allowCustom
                        customInput="external"
                        onCustomSelect={() => inputRef.current?.focus()}
                        disabled={!editable || drawerDisabled}
                        isError={isError}
                      />
                    </div>
                  )
                : undefined}
            </ChatRichContent>
          ) : undefined
        }
      >
        <ChatComposerInput
          ref={inputRef}
          aria-label={answering ? question.title : 'Message'}
          aria-describedby={errorMessage ? inputErrorId : undefined}
          placeholder="Write a response…"
          value={answering ? answerText : messageDraft}
          onChange={(text) => {
            if (!answering) {
              setMessageDraft(text);
            } else if (editable) {
              updateAnswer(
                question.kind === 'text'
                  ? text
                  : {
                      selected:
                        question.mode === 'single' ? [] : choices.selected,
                      custom: { selected: true, text },
                    }
              );
            }
          }}
        />
        {errorMessage && (
          <span id={inputErrorId} className="sr-only">
            {errorMessage}
          </span>
        )}
        <ChatComposerToolbar
          actions={
            answering ? (
              <Button
                type="submit"
                size="sm"
                disabled={!editable || !hasAnswer}
                loading={state === 'submitting'}
                onClick={(event) => {
                  if (event.detail > 1) event.preventDefault();
                }}
              >
                {current < questions.length
                  ? 'Next'
                  : state === 'submission-failed'
                    ? 'Retry response'
                    : 'Submit answer'}
              </Button>
            ) : (
              <ChatComposerAction />
            )
          }
        />
      </ChatComposer>
      {lastMessage && (
        <Text variant="sm" color="secondary">
          Message sent: {lastMessage}
        </Text>
      )}
    </div>
  );
}

export const NarrowDrawer: Story = {
  render: () => (
    <div className="w-72 max-w-full">
      <DrawerExample
        allowSkip
        questions={[
          {
            title: 'How would you like to review the proposed changes?',
            kind: 'choices',
            mode: 'single',
            options: reviewOptions,
          },
          { title: 'What should the plan prioritize?', kind: 'text' },
        ]}
      />
    </div>
  ),
};

export const DrawerValidation: Story = {
  render: () => (
    <DrawerExample
      defaultOpen={false}
      questions={[
        {
          title: 'How would you like to review changes?',
          kind: 'choices',
          mode: 'single',
          options: reviewOptions,
        },
        { title: 'What should the plan prioritize?', kind: 'text' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    const user = userEvent.setup({ delay: 20 });
    await user.click(canvas.getByRole('button', { name: 'Expand question' }));
    await user.click(canvas.getByRole('button', { name: 'Next question' }));
    await user.click(canvas.getByRole('button', { name: 'Collapse question' }));
    await user.type(
      await canvas.findByRole(
        'textbox',
        { name: 'What should the plan prioritize?' },
        { timeout: 10_000 }
      ),
      'Preserve existing behavior'
    );
    await user.click(canvas.getByRole('button', { name: 'Submit answer' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Answer this question before submitting.'
    );
    await expect(
      canvas.queryByRole('button', { name: 'Expand question' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Collapse question' })
    ).not.toBeInTheDocument();
    await waitFor(async () => {
      await expect(
        canvas.getByRole('radio', { name: 'Each Change' })
      ).toHaveFocus();
      await expect(
        canvas.getByRole('radiogroup', {
          name: 'How would you like to review changes?',
        })
      ).toBeVisible();
    });
    await expect(
      canvas.getByRole('radiogroup', {
        name: 'How would you like to review changes?',
      })
    ).toHaveAccessibleDescription('Answer this question before submitting.');
  },
};
