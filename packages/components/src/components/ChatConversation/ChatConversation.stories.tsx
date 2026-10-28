import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatConversation } from '.';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

// Stand-ins for ChatMessage, which lives outside this component.
interface PlaceholderMessage {
  id: string;
  role: 'user' | 'assistant';
  paragraphs: string[];
}

function PlaceholderMessages({ messages }: { messages: PlaceholderMessage[] }) {
  return messages.map((message) =>
    message.role === 'user' ? (
      <div
        key={message.id}
        className="max-w-[80%] self-end rounded-xl bg-surface-level-2 px-space-3 py-space-2"
      >
        <Text>{message.paragraphs.join(' ')}</Text>
      </div>
    ) : (
      <div key={message.id} className="flex flex-col gap-space-3">
        {message.paragraphs.map((paragraph, index) => (
          <Text key={index}>{paragraph}</Text>
        ))}
      </div>
    )
  );
}

const exchanges = [
  {
    question: 'Help me plan a relaxed weekend by the coast.',
    answer: [
      'Start with one home base and leave room to wander. A small town with a walkable waterfront gives you beaches, cafés, and dinner options without spending the weekend driving.',
    ],
  },
  {
    question:
      'We arrive Friday evening and head home Sunday afternoon. What should we do first?',
    answer: [
      'Keep Friday simple: check in, take a short waterfront walk, and find dinner nearby. Save the longer outings for Saturday so a late arrival does not throw off the plan.',
    ],
  },
  {
    question: 'Can you sketch out Saturday?',
    answer: [
      'Morning: have a slow breakfast, then walk a coastal trail.',
      'Afternoon: pick up lunch and spend a few hours at the beach. Leave a break at your accommodation before dinner.',
      'Evening: choose a restaurant within walking distance and catch the sunset if the weather cooperates.',
    ],
  },
  {
    question:
      'That sounds good, but the forecast might be rainy. I would like a backup that still feels like a break, rather than a packed day of activities.',
    answer: [
      'Swap the trail for a local museum or bookshop, then settle into a café with a view. Keep the afternoon open. A short walk between showers can be enough; you do not need to replace every outdoor activity.',
    ],
  },
  {
    question: 'What should we pack?',
    answer: [
      'Bring comfortable walking shoes, a light rain jacket, a warm layer for the evening, and a reusable water bottle. Add beach gear if the forecast improves. One small bag each should be plenty for two nights.',
    ],
  },
  {
    question: 'And a low-key Sunday before we leave?',
    answer: [
      'Have breakfast, take one last walk, and pick up lunch for the journey home. Aim to finish your plans an hour before departure so there is time to pack and check out without rushing.',
    ],
  },
];

function historyMessages(prefix = 'history'): PlaceholderMessage[] {
  return exchanges.flatMap((exchange, index) => [
    {
      id: `${prefix}-${index}-user`,
      role: 'user',
      paragraphs: [exchange.question],
    },
    {
      id: `${prefix}-${index}-assistant`,
      role: 'assistant',
      paragraphs: exchange.answer,
    },
  ]);
}

function PlaceholderComposer() {
  return (
    <div className="rounded-xl border border-primary bg-surface-level-1 px-space-3 py-space-3">
      <Text color="tertiary">The host provides the composer.</Text>
    </div>
  );
}

const meta = {
  title: 'Components/Chat/ChatConversation',
  component: ChatConversation,
  tags: ['autodocs', 'chat', 'conversation', 'scroll', 'layout'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '- Bounded-height layout: fixed `header`/`footer`, scrolling `children`.',
          '- Messages and footer share a centered column capped at 672px.',
          '- Follows new content while the reader is within 48px of the bottom; scrolling up pauses following and shows **Jump to latest**.',
          '- Remount with a conversation `key` when switching threads.',
          '- Not included: history fetching, pagination, virtualization, or anchoring when older messages are inserted above the viewport. Hosts that load history upward can adjust `scrollTop` through `viewportRef`.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto h-[min(640px,100dvh)] w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    children: { control: false },
    header: { control: false },
    footer: { control: false },
    viewportRef: { control: false },
  },
  args: {
    children: <PlaceholderMessages messages={historyMessages()} />,
  },
} satisfies Meta<typeof ChatConversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LongHistory: Story = { tags: ['a11y-test'] };

export const WithHeaderAndFooter: Story = {
  tags: ['a11y-test'],
  args: {
    header: (
      <div className="border-b border-primary px-space-4 py-space-3">
        <Text variant="h3">Coastal weekend</Text>
      </div>
    ),
    footer: <PlaceholderComposer />,
  },
};

export const Empty: Story = {
  tags: ['a11y-test'],
  args: {
    children: (
      <div className="flex flex-1 flex-col items-center justify-center gap-space-3 text-center">
        <Text variant="h2">Start a conversation</Text>
        <Text color="secondary">The host provides this empty state.</Text>
      </div>
    ),
    footer: <PlaceholderComposer />,
  },
};

export const Loading: Story = {
  args: {
    children: (
      <div role="status">
        <Text className="sr-only">Loading conversation…</Text>
        <div aria-hidden="true" className="flex flex-col gap-space-6">
          <Skeleton className="h-10 w-3/5 self-end rounded-xl motion-reduce:animate-none" />
          <div className="flex flex-col gap-space-2">
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
            <Skeleton className="h-4 w-11/12 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
          </div>
          <Skeleton className="h-10 w-2/5 self-end rounded-xl motion-reduce:animate-none" />
          <div className="flex flex-col gap-space-2">
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
            <Skeleton className="h-4 w-5/6 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-1/2 motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    ),
  },
};

const streamedParagraphs = [
  'Here is a slower-paced version of the plan.',
  'Friday: arrive, unpack, and walk to the waterfront for an early dinner. Skip anything that needs a reservation.',
  'Saturday: sleep in, then pick one outing (the coastal trail if it is dry, the museum if it is not) and leave the rest of the day open.',
  'Sunday: breakfast somewhere with a view, one last walk, and an unhurried checkout.',
  'If you want, I can turn this into a checklist you can share with your travel companion.',
];

function StreamingExample() {
  const [messages, setMessages] = useState(historyMessages);
  const [streamedCount, setStreamedCount] = useState<number>();

  useEffect(() => {
    if (streamedCount === undefined) return;
    if (streamedCount >= streamedParagraphs.length) return;
    const timer = window.setTimeout(() => {
      setMessages((current) => {
        const reply = current.at(-1);
        if (!reply) return current;
        return [
          ...current.slice(0, -1),
          {
            ...reply,
            paragraphs: streamedParagraphs.slice(0, streamedCount + 1),
          },
        ];
      });
      setStreamedCount(streamedCount + 1);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [streamedCount]);

  const isStreaming =
    streamedCount !== undefined && streamedCount < streamedParagraphs.length;

  function send() {
    const id = `stream-${messages.length}`;
    setMessages((current) => [
      ...current,
      {
        id: `${id}-user`,
        role: 'user',
        paragraphs: ['Can you make it even more relaxed?'],
      },
      { id: `${id}-assistant`, role: 'assistant', paragraphs: [] },
    ]);
    setStreamedCount(0);
  }

  return (
    <ChatConversation
      footer={
        <div className="flex items-center justify-between gap-space-3 rounded-xl border border-primary px-space-3 py-space-2">
          <Text color="tertiary">
            {isStreaming ? 'Responding…' : 'Send, then scroll up mid-reply.'}
          </Text>
          <Button size="sm" disabled={isStreaming} onClick={send}>
            Send
          </Button>
        </div>
      }
    >
      <PlaceholderMessages messages={messages} />
    </ChatConversation>
  );
}

export const Streaming: Story = {
  tags: ['a11y-test'],
  parameters: {
    docs: {
      description: {
        story: [
          '- Send a message to stream a reply one paragraph at a time.',
          '- Stay at the bottom and the view follows each paragraph.',
          '- Scroll up mid-reply and the view holds still; **Jump to latest** resumes following and keeps focus in the message log.',
        ].join('\n'),
      },
    },
  },
  render: () => <StreamingExample />,
};

const threads = [
  { id: 'coast', title: 'Coastal weekend', messages: historyMessages('coast') },
  {
    id: 'rain',
    title: 'Rainy-day alternatives',
    messages: historyMessages('rain').slice(6),
  },
];

function SwitchingExample() {
  const [threadId, setThreadId] = useState(threads[0].id);
  const thread = threads.find((item) => item.id === threadId) ?? threads[0];

  return (
    <ChatConversation
      key={thread.id}
      header={
        <div className="flex gap-space-2 border-b border-primary px-space-4 py-space-3">
          {threads.map((item) => (
            <Button
              key={item.id}
              size="sm"
              color={item.id === thread.id ? 'primary' : 'secondary'}
              aria-pressed={item.id === thread.id}
              onClick={() => setThreadId(item.id)}
            >
              {item.title}
            </Button>
          ))}
        </div>
      }
    >
      <PlaceholderMessages messages={thread.messages} />
    </ChatConversation>
  );
}

export const SwitchingConversations: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Keyed by conversation ID, so each thread opens at its latest message with following restored, even after scrolling up in the previous one.',
      },
    },
  },
  render: () => <SwitchingExample />,
};

export const Narrow: Story = {
  tags: ['a11y-test'],
  args: { footer: <PlaceholderComposer /> },
  decorators: [
    (Story) => (
      <div className="h-full w-[360px] border-x border-primary">
        <Story />
      </div>
    ),
  ],
};
