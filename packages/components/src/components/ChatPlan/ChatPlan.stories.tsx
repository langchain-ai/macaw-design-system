import { useEffect, useState } from 'react';

import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatPlan, type ChatPlanItem } from '.';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
  type ChatComposerProps,
} from '../ChatComposer';
import { ChatRichContent, ChatRichContentChoices } from '../ChatRichContent';
import { Text } from '../Text';

const labels = [
  'Search for recent papers on retrieval',
  'Read the three most cited results',
  'Compare their evaluation setups',
  'Write a 200-word summary',
];

function planAt(step: number): ChatPlanItem[] {
  return labels.map((label, index) => ({
    id: String(index),
    label,
    status:
      index < step ? 'completed' : index === step ? 'in-progress' : 'pending',
  }));
}

const meta = {
  title: 'Components/Chat/ChatPlan',
  component: ChatPlan,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `- An agent's task list, such as the todos a deep agent writes with \`write_todos\`. Map each todo to an item with a stable ID.
- Collapsed, it shows progress ("Task 2 of 4") and the current task; expanded, every task with its status.
- Use \`presentation="drawer"\` in \`ChatComposer\`'s \`drawer\` slot to keep the plan above the message input while the agent works.
- The drawer stacks several items with dividers. Pass the plan first and a question or notice last, next to the input; the plan keeps its neutral surface under any \`drawerIntent\`.`,
      },
    },
  },
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'agent',
    'plan',
    'todo',
    'todos',
    'task list',
    'checklist',
    'deep agents',
    'progress',
  ],
  args: { items: planAt(1) },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: { defaultExpanded: true },
};

function ComposerWithPlan() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (step >= labels.length) return;
    const timeout = setTimeout(() => setStep((current) => current + 1), 2_500);
    return () => clearTimeout(timeout);
  }, [step]);

  return (
    <ChatComposer
      drawer={<ChatPlan items={planAt(step)} presentation="drawer" />}
      submitDisabled={!draft.trim()}
      onSubmit={() => setDraft('')}
    >
      <ChatComposerInput
        value={draft}
        onChange={setDraft}
        placeholder="Ask a follow-up"
        aria-label="Message"
      />
      <ChatComposerToolbar />
    </ChatComposer>
  );
}

export const InComposerDrawer: Story = {
  render: () => <ComposerWithPlan />,
  parameters: {
    docs: {
      description: {
        story:
          'The plan stays above the message input and advances as the agent updates its todos.',
      },
    },
  },
};

const QUESTION = 'One paper tunes on its test split. Include it in the report?';

function SharedDrawerComposer({
  drawer,
  drawerIntent,
  submitLabel,
}: Pick<ChatComposerProps, 'drawer' | 'drawerIntent'> & {
  submitLabel?: string;
}) {
  const [draft, setDraft] = useState('');
  return (
    <ChatComposer
      drawer={drawer}
      drawerIntent={drawerIntent}
      submitDisabled={!submitLabel && !draft.trim()}
      onSubmit={(event) => event.preventDefault()}
    >
      <ChatComposerInput
        value={draft}
        onChange={setDraft}
        placeholder={
          submitLabel ? 'Or write your own answer' : 'Ask a follow-up'
        }
        aria-label="Message"
      />
      <ChatComposerToolbar
        actions={
          submitLabel ? (
            <Button type="submit" size="sm">
              {submitLabel}
            </Button>
          ) : undefined
        }
      />
    </ChatComposer>
  );
}

function QuestionWithPlan() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <SharedDrawerComposer
      submitLabel="Submit answer"
      drawer={
        <>
          <ChatPlan items={planAt(2)} presentation="drawer" />
          <ChatRichContent
            presentation="drawer"
            title={QUESTION}
            state="unanswered"
          >
            {({ disabled, isError, errorId }) => (
              <ChatRichContentChoices
                aria-label={QUESTION}
                aria-describedby={errorId}
                mode="single"
                options={[
                  { value: 'exclude', label: 'Leave it out' },
                  { value: 'include', label: 'Include it with a note' },
                ]}
                value={{ selected }}
                onChange={(next) => setSelected(next.selected)}
                disabled={disabled}
                isError={isError}
              />
            )}
          </ChatRichContent>
        </>
      }
    />
  );
}

export const SharedDrawer: Story = {
  render: () => (
    <div className="flex flex-col gap-space-6">
      <QuestionWithPlan />
      <SharedDrawerComposer
        drawerIntent="warning"
        drawer={
          <>
            <ChatPlan items={planAt(2)} presentation="drawer" />
            <div className="flex items-start gap-space-2 px-space-4 py-space-3">
              <WarningIcon
                size={16}
                weight="regular"
                aria-hidden
                className="shrink-0 text-icon-warning"
              />
              <Text variant="sm">
                <span className="font-medium">Usage limit: </span>
                The agent pauses after this task until your limit resets.
              </Text>
            </div>
          </>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '- A question and a plan share the drawer: the plan stays a single line on top, and the question sits next to the input that answers it.\n- In a `warning` drawer the notice takes the intent color while the plan keeps its neutral surface.',
      },
    },
  },
};
