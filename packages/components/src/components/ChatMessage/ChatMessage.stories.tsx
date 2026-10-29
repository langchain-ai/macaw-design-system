import { useState, type ReactNode } from 'react';

import { expect, fn, within } from 'storybook/test';

import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatMessage,
  ChatMessageActions,
  ChatTurnDivider,
  type ChatMessageContentBlock,
  type ChatMessageModel,
  type ChatMessageStatus,
} from '.';
import { Button } from '../Button';
import { CopyIconButton } from '../CopyButton';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

interface DemoMessage extends ChatMessageModel {
  timestamp?: ReactNode;
}

const message: DemoMessage = {
  id: 'answer',
  role: 'assistant',
  status: 'completed',
  identity: {
    name: 'Assistant',
  },
  timestamp: <time dateTime="2026-09-28T09:41:00">9:41 AM</time>,
  content: [
    {
      id: 'answer',
      type: 'text',
      text: 'I found three useful examples. Here is how you can use them in your project.',
    },
  ],
};

const meta = {
  title: 'Components/Chat/ChatMessage',
  component: ChatMessage,
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'message',
    'conversation',
    'icon',
    'role',
    'actions',
    'turn',
    'separator',
  ],
  parameters: {
    a11y: { test: 'error' },
    layout: 'centered',
    docs: {
      description: {
        component: [
          '- Compose header, ordered content, and actions.',
          '- Compose metadata and actions in `footer`; hosts own formatting and navigation.',
          '- Pass `status` and `readOnly` to `ChatMessageActions` to hide edit/retry while pending or read-only.',
          '- The header shows no identity by default; opt in with `avatar` and `showName`, separately and for any role.',
          '- Hosts own parsing, safe custom content, streaming, callbacks, and permission checks.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(640px,calc(100vw-48px))]">
        <Story />
      </div>
    ),
  ],
  args: { message },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const conversationMessages: DemoMessage[] = [
  {
    id: 'question',
    role: 'user',
    status: 'completed',
    timestamp: <time dateTime="2026-09-30T19:06:00">7:06 PM</time>,
    content: [
      {
        id: 'question-text',
        type: 'text',
        appearance: 'bubble',
        text: 'Help me plan a relaxed weekend by the coast.',
      },
    ],
  },
  {
    id: 'history',
    role: 'assistant',
    status: 'completed',
    identity: {
      name: 'Assistant',
    },
    timestamp: <time dateTime="2026-09-30T19:07:00">7:07 PM</time>,
    content: [
      {
        id: 'history-text',
        type: 'text',
        text: 'Choose a walkable coastal town and keep your plans flexible.\n\nSpend Saturday morning on a coastal trail, then leave the afternoon open for the beach or a quiet café.',
      },
    ],
  },
];

const exampleActions = {
  copy: { onClick: fn() },
  edit: { onClick: fn() },
  retry: { onClick: fn() },
};

function ConversationExample() {
  return (
    <div className="flex flex-col items-center gap-space-5">
      {conversationMessages.map((item, index) => (
        <ChatMessage
          key={item.id}
          isLatest={index === conversationMessages.length - 1}
          message={item}
          footer={
            <>
              <ChatMessageActions actions={{ copy: exampleActions.copy }} />
              <Text as="span" variant="xs" color="quaternary">
                {item.timestamp}
              </Text>
            </>
          }
        />
      ))}
    </div>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- 13px body, 12px labels, and relaxed line spacing.\n- Soft user bubbles with full-contrast text.',
      },
    },
  },
  render: () => <ConversationExample />,
  play: async ({ canvas, userEvent }) => {
    // An earlier message reveals its hidden footer, without a fade, when an
    // action takes keyboard focus.
    await userEvent.tab();
    const [firstActions] = canvas.getAllByRole('group', {
      name: 'Message actions',
    });
    await expect(
      within(firstActions).getByRole('button', { name: 'Copy message' })
    ).toHaveFocus();
    await expect(firstActions.parentElement).toHaveStyle({ opacity: '1' });
  },
};

export const TurnDivider: Story = {
  parameters: {
    docs: {
      description: { story: '- Label a boundary between conversation turns.' },
    },
  },
  render: () => (
    <div className="flex flex-col gap-space-5">
      <ChatTurnDivider label="Today" />
      <ConversationExample />
    </div>
  ),
};

function MetadataSeparator() {
  return (
    <span aria-hidden="true" className="text-xxs text-quaternary">
      /
    </span>
  );
}

const metadataMessageText =
  'Stay near the waterfront so you can explore on foot. Plan one outing each day, leave time to unwind, and keep a museum or bookshop in mind if it rains.';

export const WithMetadata: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- A single footer combines timestamp, usage, model, and message actions.',
      },
    },
  },
  args: {
    isLatest: true,
    message: {
      id: 'metadata-example',
      role: 'assistant',
      status: 'completed',
      content: [
        {
          id: 'answer',
          type: 'text',
          text: metadataMessageText,
        },
      ],
    },
    footer: (
      <>
        <Text
          as="span"
          variant="xs"
          color="quaternary"
          className="inline-flex items-center gap-space-1"
        >
          <span className="sr-only">Tokens: </span>16.09K
        </Text>
        <MetadataSeparator />
        <Text as="span" variant="xs" color="quaternary">
          <span className="sr-only">Cost: </span>$0.0033
        </Text>
        <MetadataSeparator />
        <Text
          as="span"
          variant="xs"
          color="quaternary"
          className="inline-flex min-w-0 items-center gap-space-1"
        >
          <span className="sr-only">Model: </span>gpt-5.4-nano
        </Text>
        <ChatMessageActions>
          <CopyIconButton
            copy={metadataMessageText}
            label="Copy message"
            size="xs"
          />
          <IconButton
            size="xs"
            variant="plain"
            color="secondary"
            icon={ArrowRightIcon}
            iconWeight="regular"
            label="View trace"
            onClick={fn()}
          />
        </ChatMessageActions>
      </>
    ),
  },
};

const statuses: ChatMessageStatus[] = ['streaming', 'failed', 'completed'];

const revealParagraphs: ChatMessageContentBlock[] = [
  {
    id: 'summary',
    type: 'text',
    text: 'For a relaxed coastal weekend, choose one home base and leave plenty of room to wander.',
  },
  {
    id: 'details',
    type: 'text',
    text: 'Start Saturday with breakfast and a coastal walk. Pick up lunch nearby, then spend the afternoon at the beach or in a café with a view.',
  },
  {
    id: 'recommendation',
    type: 'text',
    text: 'Keep Sunday simple with a short walk before heading home. Leave an hour to pack so the trip ends as calmly as it began.',
  },
];

function ParagraphRevealExample() {
  const [paragraphCount, setParagraphCount] = useState(0);
  const complete = paragraphCount === revealParagraphs.length;

  return (
    <div className="flex flex-col gap-space-3">
      <ChatMessage
        isLatest
        animateParagraphs
        message={{
          ...message,
          id: 'paragraph-reveal',
          status: complete ? 'completed' : 'streaming',
          content: revealParagraphs.slice(0, paragraphCount),
        }}
        footer={
          <ChatMessageActions
            actions={exampleActions}
            status={complete ? 'completed' : 'streaming'}
          />
        }
      />
      <div className="flex gap-space-2">
        <Button
          color="secondary"
          disabled={complete}
          onClick={() =>
            setParagraphCount((count) =>
              Math.min(count + 1, revealParagraphs.length)
            )
          }
        >
          Add paragraph
        </Button>
        <Button
          color="secondary"
          variant="plain"
          disabled={paragraphCount === 0}
          onClick={() => setParagraphCount(0)}
        >
          Restart
        </Button>
      </div>
    </div>
  );
}

export const ParagraphAnimation: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '- Add complete paragraphs one at a time; existing paragraphs stay still.',
          '- Restart to replay. Reduced-motion preferences disable the fade.',
        ].join('\n'),
      },
    },
  },
  render: () => <ParagraphRevealExample />,
  play: async ({ canvas, userEvent }) => {
    // Finishing the stream must not move the text that's already there.
    const addParagraph = canvas.getByRole('button', { name: 'Add paragraph' });
    await userEvent.click(addParagraph);
    const first = canvas.getByText(/^For a relaxed coastal weekend/);
    const streamingTop = first.getBoundingClientRect().top;
    await userEvent.click(addParagraph);
    await userEvent.click(addParagraph);
    await expect(addParagraph).toBeDisabled();
    await expect(first.getBoundingClientRect().top).toBe(streamingTop);
  },
};

function ActionsExample({
  status = 'completed',
  readOnly = false,
}: {
  status?: ChatMessageStatus;
  readOnly?: boolean;
}) {
  return (
    <ChatMessage
      isLatest
      message={{
        ...message,
        status,
        readOnly,
        identity: undefined,
        content:
          status === 'streaming'
            ? []
            : [
                {
                  id: 'state-description',
                  type: 'text',
                  text: readOnly
                    ? 'This is a read-only message. The readOnly prop is separate from status.'
                    : status === 'failed'
                      ? 'This is a failed message.'
                      : 'This message completed successfully.',
                },
              ],
      }}
      footer={
        <>
          <ChatMessageActions
            actions={exampleActions}
            status={status}
            readOnly={readOnly}
          />
          <Text as="span" variant="xs" color="quaternary">
            {message.timestamp}
          </Text>
        </>
      }
    />
  );
}

export const StatesAndActions: Story = {
  render: () => (
    <div className="flex flex-col gap-space-5">
      {statuses.map((status) => (
        <ActionsExample key={status} status={status} />
      ))}
      <ActionsExample readOnly />
    </div>
  ),
};

export const NarrowWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- Long words, identities, and footers wrap instead of overflowing.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-space-5">
      <ChatMessage
        message={{
          id: 'narrow-question',
          role: 'user',
          status: 'completed',
          content: [
            {
              id: 'narrow-question-text',
              type: 'text',
              appearance: 'bubble',
              text: 'Why does https://example.com/a/really/long/path/without/breaks fail?',
            },
          ],
        }}
      />
      <ChatMessage
        isLatest
        showName
        message={{
          id: 'narrow-answer',
          role: 'assistant',
          status: 'failed',
          identity: { name: 'Research assistant with a long name' },
          content: [
            {
              id: 'narrow-answer-text',
              type: 'text',
              text: 'The request to that path timed out before the server responded.',
            },
          ],
        }}
        footer={<ChatMessageActions actions={exampleActions} />}
      />
    </div>
  ),
};
