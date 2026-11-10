import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatPlan, type ChatPlanItem } from '.';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../ChatComposer';

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
- Use \`presentation="drawer"\` in \`ChatComposer\`'s \`drawer\` slot to keep the plan above the message input while the agent works.`,
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

export const Finished: Story = {
  args: { items: planAt(labels.length), defaultExpanded: true },
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
