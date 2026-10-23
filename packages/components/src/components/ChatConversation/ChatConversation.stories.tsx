import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatConversation, type ChatConversationHandle } from '.';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../ChatComposer';
import {
  ChatConversationList,
  ChatConversationListItem,
} from '../ChatConversationList';
import {
  ChatMessage,
  ChatMessageActions,
  type ChatMessageModel,
} from '../ChatMessage';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

interface DemoMessage extends ChatMessageModel {
  timestamp: ReactNode;
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
          '- Follows new content near the bottom; scroll up to pause.',
          '- Key by conversation ID; pagination and virtualization are not included.',
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
  args: {
    children: <ConversationMessages />,
  },
} satisfies Meta<typeof ChatConversation>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConversationMessages() {
  return historyMessages.map((message, index) => (
    <ChatMessage
      key={message.id}
      message={message}
      isLatest={index === historyMessages.length - 1}
      footer={
        <Text as="span" variant="xs" color="tertiary">
          {message.timestamp}
        </Text>
      }
    />
  ));
}

export const LongHistory: Story = {};

export const Empty: Story = {
  args: {
    children: (
      <div className="flex flex-1 flex-col items-center justify-center gap-space-3 text-center">
        <Text variant="h2">Start a conversation</Text>
        <Text color="secondary">The host provides this empty state.</Text>
      </div>
    ),
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

const itineraryParagraphs = [
  'Morning: have a slow breakfast, then walk a coastal trail.',
  'Afternoon: pick up lunch and spend a few hours at the beach. Leave a break at your accommodation before dinner.',
  'Evening: choose a restaurant within walking distance and catch the sunset if the weather cooperates.',
];

const longHistoryExchanges = [
  {
    id: 'trip',
    question: 'Help me plan a relaxed weekend by the coast.',
    answer:
      'Start with one home base and leave room to wander. A small town with a walkable waterfront gives you beaches, cafés, and dinner options without spending the weekend driving.',
  },
  {
    id: 'arrival',
    question:
      'We arrive Friday evening and head home Sunday afternoon. What should we do first?',
    answer:
      'Keep Friday simple: check in, take a short waterfront walk, and find dinner nearby. Save the longer outings for Saturday so a late arrival does not throw off the plan.',
  },
  {
    id: 'saturday',
    question: 'Can you sketch out Saturday?',
    answer: itineraryParagraphs.join('\n\n'),
  },
  {
    id: 'rain',
    question:
      'That sounds good, but the forecast might be rainy. I would like a backup that still feels like a break, rather than a packed day of activities.',
    answer:
      'Swap the trail for a local museum or bookshop, then settle into a café with a view. Keep the afternoon open. A short walk between showers can be enough; you do not need to replace every outdoor activity.',
  },
  {
    id: 'packing',
    question: 'What should we pack?',
    answer:
      'Bring comfortable walking shoes, a light rain jacket, a warm layer for the evening, and a reusable water bottle. Add beach gear if the forecast improves. One small bag each should be plenty for two nights.',
  },
  {
    id: 'sunday',
    question: 'And a low-key Sunday before we leave?',
    answer:
      'Have breakfast, take one last walk, and pick up lunch for the journey home. Aim to finish your plans an hour before departure so there is time to pack and check out without rushing.',
  },
];

const historyMessages = longHistoryExchanges.flatMap<DemoMessage>(
  (exchange, exchangeIndex) => [
    {
      id: `${exchange.id}-user`,
      role: 'user',
      status: 'completed',
      timestamp: (
        <time dateTime={`2026-09-30T09:${41 + exchangeIndex * 2}:00`}>
          9:{41 + exchangeIndex * 2} AM
        </time>
      ),
      content: [
        {
          id: `${exchange.id}-question`,
          type: 'text',
          appearance: 'bubble',
          text: exchange.question,
        },
      ],
    },
    {
      id: `${exchange.id}-assistant`,
      role: 'assistant',
      status: 'completed',
      timestamp: (
        <time dateTime={`2026-09-30T09:${42 + exchangeIndex * 2}:00`}>
          9:{42 + exchangeIndex * 2} AM
        </time>
      ),
      content: exchange.answer.split('\n\n').map((text, index) => ({
        id: `${exchange.id}-paragraph-${index}`,
        type: 'text',
        text,
      })),
    },
  ]
);

interface LayoutConversation {
  id: string;
  title: string;
  draft: string;
  messages: DemoMessage[];
}

const layoutConversations: LayoutConversation[] = [
  'Coastal weekend',
  'Rainy-day alternatives',
  'Packing and the final morning before heading home',
].map((title, index) => ({
  id: `conversation-${index}`,
  title,
  draft: '',
  messages: historyMessages.map((message) => ({
    ...message,
    id: `conversation-${index}-${message.id}`,
  })),
}));

function ConversationLayoutExample() {
  const [conversations, setConversations] = useState(layoutConversations);
  const [selectedId, setSelectedId] = useState('conversation-0');
  const [animatedMessageId, setAnimatedMessageId] = useState<string>();
  const responseTimers = useRef(new Map<string, number>());
  const conversationRef = useRef<ChatConversationHandle>(null);

  useEffect(() => {
    const pendingIds = new Set<string>();
    for (const conversation of conversations) {
      for (const message of conversation.messages) {
        if (message.status !== 'streaming') continue;
        pendingIds.add(message.id);
        if (responseTimers.current.has(message.id)) continue;

        const timer = window.setTimeout(
          () => {
            responseTimers.current.delete(message.id);
            setConversations((current) =>
              current.map((item) =>
                item.id === conversation.id
                  ? {
                      ...item,
                      messages: item.messages.map((reply): DemoMessage => {
                        if (
                          reply.id !== message.id ||
                          reply.status !== 'streaming'
                        )
                          return reply;
                        const index = reply.content.length;
                        const paragraph = itineraryParagraphs[index];
                        if (paragraph === undefined) return reply;
                        return {
                          ...reply,
                          status:
                            index + 1 === itineraryParagraphs.length
                              ? 'completed'
                              : 'streaming',
                          content: [
                            ...reply.content,
                            {
                              id: `${reply.id}-paragraph-${index}`,
                              type: 'text',
                              text: paragraph,
                            },
                          ],
                        };
                      }),
                    }
                  : item
              )
            );
          },
          message.content.length === 0 ? 1500 : 900
        );
        responseTimers.current.set(message.id, timer);
      }
    }
    for (const [id, timer] of responseTimers.current) {
      if (!pendingIds.has(id)) {
        window.clearTimeout(timer);
        responseTimers.current.delete(id);
      }
    }
  }, [conversations]);

  useEffect(() => {
    const timers = responseTimers.current;
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const selected = conversations.find(
    (conversation) => conversation.id === selectedId
  );
  if (!selected) return null;
  const latestMessage = selected.messages.at(-1);
  const isResponding = selected.messages.some(
    (message) => message.status === 'streaming'
  );

  function updateResponseStatus(
    messageId: string,
    status: 'failed' | 'streaming'
  ) {
    if (status === 'streaming' && isResponding) return;
    if (status === 'streaming') setAnimatedMessageId(messageId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.id === messageId && message.role === 'assistant'
                  ? {
                      ...message,
                      status,
                      content: status === 'streaming' ? [] : message.content,
                    }
                  : message
              ),
            }
          : conversation
      )
    );
  }

  function updateDraft(draft: string) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? { ...conversation, draft }
          : conversation
      )
    );
  }

  function sendMessage() {
    if (!selected?.draft.trim() || isResponding) return;
    conversationRef.current?.scrollToLatest();
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const sentAt = new Date();
    const timestamp = (
      <time dateTime={sentAt.toISOString()}>
        {sentAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </time>
    );
    setAnimatedMessageId(assistantId);
    const newMessages: DemoMessage[] = [
      {
        id: userId,
        role: 'user',
        status: 'completed',
        timestamp,
        content: [
          {
            id: `${userId}-text`,
            type: 'text',
            text: selected.draft,
            appearance: 'bubble',
          },
        ],
      },
      {
        id: assistantId,
        role: 'assistant',
        status: 'streaming',
        timestamp,
        content: [],
      },
    ];
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              draft: '',
              messages: [...conversation.messages, ...newMessages],
            }
          : conversation
      )
    );
  }

  return (
    <PanelGroup direction="horizontal" className="h-full bg-surface-level-1">
      <Panel defaultSize={30} minSize={20} maxSize={50}>
        <aside
          aria-label="Conversation sidebar"
          className="flex h-full min-w-0 flex-col bg-surface-level-2"
        >
          <div className="flex flex-col gap-space-2 p-space-4">
            <Text variant="h3">Conversations</Text>
            <Text variant="xs" color="tertiary">
              Drag the divider, or focus it and use the arrow keys.
            </Text>
          </div>
          <ChatConversationList
            aria-label="Conversations"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {conversations.map((conversation) => (
              <ChatConversationListItem
                key={conversation.id}
                title={conversation.title}
                selected={conversation.id === selectedId}
                onClick={() => {
                  if (conversation.id === selectedId) return;
                  setSelectedId(conversation.id);
                  setAnimatedMessageId(undefined);
                }}
              />
            ))}
          </ChatConversationList>
        </aside>
      </Panel>
      <PanelResizeHandle
        aria-label="Resize conversation list"
        className="focus-visible:ring-focus flex w-2 items-center justify-center bg-surface-level-2 hover:bg-selected focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset"
      />
      <Panel defaultSize={70} minSize={50}>
        <div className="flex h-full min-w-0 flex-col">
          <ChatConversation
            ref={conversationRef}
            key={selected.id}
            className="flex-1"
            label={selected.title}
            header={
              <header className="flex flex-wrap items-center justify-between gap-space-3 border-b border-subtle px-space-4 py-space-3">
                <div className="flex min-w-0 flex-1 flex-col gap-space-1">
                  <Text variant="h3" className="truncate">
                    {selected.title}
                  </Text>
                </div>
                <Button
                  color="secondary"
                  variant="outlined"
                  disabled={
                    latestMessage?.role !== 'assistant' ||
                    (latestMessage.status !== 'completed' &&
                      latestMessage.status !== 'streaming')
                  }
                  onClick={() => {
                    if (
                      latestMessage?.role === 'assistant' &&
                      (latestMessage.status === 'completed' ||
                        latestMessage.status === 'streaming')
                    ) {
                      updateResponseStatus(latestMessage.id, 'failed');
                    }
                  }}
                >
                  Simulate failure
                </Button>
              </header>
            }
            footer={
              <ChatComposer
                onSubmit={sendMessage}
                submitDisabled={!selected.draft.trim() || isResponding}
              >
                <ChatComposerInput
                  value={selected.draft}
                  onChange={updateDraft}
                  aria-label="Message"
                  placeholder="Write a message…"
                  maxHeight={160}
                />
                <ChatComposerToolbar />
              </ChatComposer>
            }
          >
            {selected.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                footer={
                  <>
                    {message.role === 'assistant' &&
                      message.id === latestMessage?.id && (
                        <ChatMessageActions
                          status={message.status}
                          readOnly={message.readOnly}
                          actions={{
                            retry: {
                              onClick: () =>
                                updateResponseStatus(message.id, 'streaming'),
                              disabledReason: isResponding
                                ? 'Wait until the response has finished.'
                                : undefined,
                            },
                          }}
                        />
                      )}
                    <Text as="span" variant="xs" color="tertiary">
                      {message.timestamp}
                    </Text>
                  </>
                }
                isLatest={message.id === latestMessage?.id}
                animateParagraphs={message.id === animatedMessageId}
              />
            ))}
          </ChatConversation>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {isResponding
              ? ''
              : latestMessage?.status === 'failed'
                ? `${selected.title}: response failed. Retry is available.`
                : `${selected.title}: demo response ${selected.messages.length / 2} complete.`}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
}

export const WithFooter: Story = {
  name: 'With Resizable Conversation List',
  parameters: {
    docs: {
      description: {
        story: [
          '- Resize the sidebar by dragging or using arrow keys on the divider.',
          '- Send a message to see complete paragraphs fade in; drafts persist per conversation.',
          '- Simulate failure, then use the message retry icon to restart the reply.',
        ].join('\n'),
      },
    },
  },
  render: () => <ConversationLayoutExample />,
};
