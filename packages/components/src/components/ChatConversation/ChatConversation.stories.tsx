import { useEffect, useRef, useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatConversation, type ChatConversationProps } from '.';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../ChatComposer';
import { ChatMessage, type ChatMessageModel } from '../ChatMessage';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

function ConversationMessages({
  messages,
}: {
  messages: readonly ChatMessageModel[];
}) {
  return messages.map((message) => (
    <ChatMessage key={message.id} message={message} animateParagraphs />
  ));
}

function paragraphBlocks(id: string, paragraphs: readonly string[]) {
  return paragraphs.map((text, index) => ({
    id: `${id}-${index}`,
    type: 'text' as const,
    text,
  }));
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

// Older turns of the same thread, oldest page first, for loading history.
const earlierPages = [
  [
    {
      question: 'We have a free weekend next month. Any ideas?',
      answer: [
        'A short trip you can reach in under three hours is easy to plan on short notice: a coastal town, a lake cabin, or a small city with good food.',
      ],
    },
    {
      question: 'We like being near the water. Coast or lake?',
      answer: [
        'The coast gives you beaches and seafood; a lake is quieter and often cheaper. If you want room to wander, the coast is the safer bet.',
      ],
    },
    {
      question: 'Coast it is. How far ahead should we book?',
      answer: [
        'Two to three weeks is usually enough outside the summer peak. Book somewhere to stay first, then look at restaurants.',
      ],
    },
  ],
  [
    {
      question: 'What should we look for in a place to stay?',
      answer: [
        'For a short trip, walkability matters most. Look for somewhere a few minutes from the waterfront, with parking if you are driving.',
      ],
    },
    {
      question: 'Hotel or rental?',
      answer: [
        'A rental gives you a kitchen and more space; a small hotel saves you cleaning and check-in. For two nights, either works.',
      ],
    },
    {
      question: 'We booked a rental near the harbor.',
      answer: [
        'Great choice. Next, sketch a loose plan so you are not deciding everything on the spot.',
      ],
    },
  ],
];

function historyMessages(
  prefix = 'history',
  turns: readonly { question: string; answer: readonly string[] }[] = exchanges
): ChatMessageModel[] {
  return turns.flatMap((exchange, index) => [
    {
      id: `${prefix}-${index}-user`,
      role: 'user',
      status: 'completed',
      content: [
        {
          id: `${prefix}-${index}-question`,
          type: 'text',
          appearance: 'bubble',
          text: exchange.question,
        },
      ],
    },
    {
      id: `${prefix}-${index}-assistant`,
      role: 'assistant',
      status: 'completed',
      content: paragraphBlocks(`${prefix}-${index}-answer`, exchange.answer),
    },
  ]);
}

function DemoComposer() {
  const [draft, setDraft] = useState('');
  return (
    <ChatComposer
      aria-label="Chat composer"
      submitDisabled={!draft.trim()}
      onSubmit={() => setDraft('')}
    >
      <ChatComposerInput
        value={draft}
        onChange={setDraft}
        placeholder="Ask a follow-up…"
      />
      <ChatComposerToolbar />
    </ChatComposer>
  );
}

const meta = {
  title: 'Components/Chat/ChatConversation',
  component: ChatConversation,
  tags: [
    'autodocs',
    'chat',
    'conversation',
    'scroll',
    'layout',
    'pin',
    'anchor',
    'history',
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '- Bounded-height layout: fixed `header`/`footer`, scrolling `children`.',
          '- Messages and footer share a centered column capped at 768px.',
          '- Follows new content while the reader is within 48px of the bottom; scrolling up pauses following and shows **Jump to latest**. `follow="none"` turns following off; **Jump to latest** still appears.',
          '- `pinnedMessageId` brings a just-sent message to the top and reserves space for the reply beneath it (see Pin Sent Message).',
          '- Content inserted above the reader, such as earlier messages, keeps the first visible message in place (see Load Earlier Messages).',
          '- Messages are found by their `data-chat-message-id` attribute, which `ChatMessage` sets; custom rows set it themselves.',
          '- Remount with a conversation `key` when switching threads.',
          '- The message log does not announce changes; announce completed replies from a polite `role="status"` region in the host (see Streaming).',
          '- Not included: history fetching, pagination, or virtualization.',
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
    children: <ConversationMessages messages={historyMessages()} />,
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
    footer: <DemoComposer />,
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

const packingParagraphs = [
  'Here is a packing list, grouped so you can check things off as you go.',
  'Clothes: two outfits for walking, one for dinner, a warm layer for evenings by the water, and sleepwear. Pack the rain jacket even if the forecast looks clear.',
  'Shoes: comfortable walking shoes for the coastal trail, plus sandals for the beach. Leave heavier boots at home unless rain is certain.',
  'Beach: a towel each, sunscreen, sunglasses, and a hat. A small tote keeps everything together for the afternoon.',
  'Toiletries: travel-size basics, any medication, and lip balm with SPF. Check whether the rental provides shampoo before packing your own.',
  'Tech: phone chargers, a power bank for the trail, and headphones for the drive. A paper map is a good backup where the signal is patchy.',
  'Food: a refillable water bottle, snacks for the drive, and a thermos if you want coffee on the morning walk.',
  'Documents: your booking confirmation, a payment card, and some cash for small cafés and parking meters.',
  'Outdoors: a compact umbrella, a reusable bag for beach finds, and a small first-aid kit with plasters for the long walks.',
  'Evenings: a light sweater or scarf, since coastal towns cool down quickly once the sun sets.',
  'Rainy afternoons: a paperback or a deck of cards for a slow hour in a café.',
  'The drive: a phone mount, a charging cable, and a playlist or podcast downloaded before you leave.',
  'Before you go: check the tide times for the beach walk and the rental’s check-in instructions.',
  'Leave some space for anything you pick up along the way. A bag with room to spare is easier to repack on Sunday.',
];

function StreamingExample({
  follow,
  pinSentMessage = false,
  question = 'Can you make it even more relaxed?',
  paragraphs = streamedParagraphs,
  hint = 'Send, then scroll up mid-reply.',
}: Pick<ChatConversationProps, 'follow'> & {
  /** Pin each sent message to the top while its reply streams in. */
  pinSentMessage?: boolean;
  question?: string;
  paragraphs?: readonly string[];
  hint?: string;
}) {
  const [messages, setMessages] = useState(historyMessages);
  const [reply, setReply] = useState<{ id: string; streamed: number }>();
  const [pinnedMessageId, setPinnedMessageId] = useState<string>();
  const isStreaming = reply !== undefined && reply.streamed < paragraphs.length;

  useEffect(() => {
    if (!reply || reply.streamed >= paragraphs.length) return;
    const timer = window.setTimeout(
      () => setReply({ ...reply, streamed: reply.streamed + 1 }),
      pinSentMessage ? 600 : 900
    );
    return () => window.clearTimeout(timer);
  }, [reply, paragraphs, pinSentMessage]);

  function send() {
    const id = `stream-${messages.length}`;
    setMessages((current) => [
      ...current,
      {
        id: `${id}-user`,
        role: 'user',
        status: 'completed',
        content: [
          {
            id: `${id}-question`,
            type: 'text',
            appearance: 'bubble',
            text: question,
          },
        ],
      },
      {
        id: `${id}-assistant`,
        role: 'assistant',
        status: 'streaming',
        content: [],
      },
    ]);
    setReply({ id: `${id}-assistant`, streamed: 0 });
    if (pinSentMessage) setPinnedMessageId(`${id}-user`);
  }

  const shownMessages = messages.map(
    (message): ChatMessageModel =>
      message.id === reply?.id
        ? {
            ...message,
            status: isStreaming ? 'streaming' : 'completed',
            content: paragraphBlocks(
              reply.id,
              paragraphs.slice(0, reply.streamed)
            ),
          }
        : message
  );

  return (
    <ChatConversation
      follow={follow}
      pinnedMessageId={pinnedMessageId}
      footer={
        <div className="flex items-center justify-between gap-space-3">
          <Text color="tertiary">{isStreaming ? 'Responding…' : hint}</Text>
          <Button size="sm" disabled={isStreaming} onClick={send}>
            Send
          </Button>
          <div role="status" className="sr-only">
            {reply && !isStreaming ? 'Reply complete.' : ''}
          </div>
        </div>
      }
    >
      <ConversationMessages messages={shownMessages} />
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
          '- Set `follow` to `none` and the view never moves on its own; **Jump to latest** appears once the reply passes the bottom.',
        ].join('\n'),
      },
    },
  },
  render: ({ follow }) => <StreamingExample follow={follow} />,
};

export const PinSentMessage: Story = {
  tags: ['a11y-test'],
  parameters: {
    docs: {
      description: {
        story: [
          '- Send a message and it moves to the top of the log, with space reserved below for the reply to stream into.',
          '- The space shrinks as the reply grows and is gone once the reply fills the viewport; the sent message stays put and **Jump to latest** appears.',
          '- Scroll to the bottom or use **Jump to latest** to follow the rest of the reply.',
          '- The host sets `pinnedMessageId` to the sent message’s ID; `ChatMessage` provides the matching `data-chat-message-id`.',
        ].join('\n'),
      },
    },
  },
  render: ({ follow }) => (
    <StreamingExample
      follow={follow}
      pinSentMessage
      question="Can you write us a packing list?"
      paragraphs={packingParagraphs}
      hint="Send to pin your message to the top."
    />
  ),
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
  const [thread, setThread] = useState(threads[0]);

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
              onClick={() => setThread(item)}
            >
              {item.title}
            </Button>
          ))}
        </div>
      }
    >
      <ConversationMessages messages={thread.messages} />
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

function LoadEarlierExample() {
  const [loadedPages, setLoadedPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const loadButtonRef = useRef<HTMLButtonElement>(null);
  const firstLoadedPage = earlierPages.length - loadedPages;

  useEffect(() => {
    if (!loading) return;
    // Stands in for the host's history request.
    const timer = window.setTimeout(() => {
      // The button goes away with the last page; keep focus in the log.
      if (
        firstLoadedPage === 1 &&
        document.activeElement === loadButtonRef.current
      ) {
        viewportRef.current?.focus({ preventScroll: true });
      }
      setLoadedPages((pages) => pages + 1);
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [loading, firstLoadedPage]);

  const messages = [
    ...earlierPages.flatMap((page, index) =>
      index >= firstLoadedPage ? historyMessages(`earlier-${index}`, page) : []
    ),
    ...historyMessages(),
  ];

  return (
    <ChatConversation viewportRef={viewportRef}>
      {firstLoadedPage > 0 ? (
        <Button
          ref={loadButtonRef}
          size="sm"
          color="secondary"
          loading={loading}
          className="self-center"
          onClick={() => setLoading(true)}
        >
          Load earlier messages
        </Button>
      ) : (
        <Text variant="sm" color="tertiary" className="self-center">
          Start of conversation
        </Text>
      )}
      <ConversationMessages messages={messages} />
    </ChatConversation>
  );
}

export const LoadEarlierMessages: Story = {
  tags: ['a11y-test'],
  parameters: {
    docs: {
      description: {
        story: [
          '- Scroll to the top and load earlier messages. They are added above, and the messages you were reading stay where they are.',
          '- The host fetches history and renders the control; `ChatConversation` holds the first visible message in place whenever content is inserted above it and the reader isn’t following the bottom.',
        ].join('\n'),
      },
    },
  },
  render: () => <LoadEarlierExample />,
};

export const CustomBackground: Story = {
  tags: ['a11y-test'],
  parameters: {
    docs: {
      description: {
        story:
          'The top 32px fades into whatever background the host sets, once the reader scrolls away from the top.',
      },
    },
  },
  args: { className: 'bg-brand-subtle' },
};

export const Narrow: Story = {
  tags: ['a11y-test'],
  decorators: [
    (Story) => (
      <div className="h-full w-[360px] border-x border-primary">
        <Story />
      </div>
    ),
  ],
};

function appendBlock(content: Element) {
  const block = document.createElement('div');
  block.style.height = '200px';
  block.style.flexShrink = '0';
  content.append(block);
}

const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

export const FollowsBackToBackGrowth: Story = {
  tags: ['!dev', '!autodocs', 'a11y-test'],
  play: async ({ canvas }) => {
    const log = canvas.getByRole('log');
    const content = log.firstElementChild!;
    const gap = () => log.scrollHeight - log.clientHeight - log.scrollTop;
    await waitFor(() => expect(gap()).toBeLessThanOrEqual(1));

    // Grow again right after the log scrolls to the bottom, before the browser
    // fires the scroll event from that scroll, so the event sees the taller
    // content.
    await new Promise<void>((resolve) => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        setTimeout(() => {
          appendBlock(content);
          resolve();
        });
      });
      appendBlock(content);
      observer.observe(content);
    });
    for (let frame = 0; frame < 3; frame++) await nextFrame();

    expect(gap()).toBeLessThanOrEqual(1);
    expect(
      canvas.queryByRole('button', { name: 'Jump to latest' })
    ).not.toBeInTheDocument();
  },
};

const gapToEnd = (log: HTMLElement) =>
  log.scrollHeight - log.clientHeight - log.scrollTop;

async function settle() {
  // Two frames let resize observers run and the scroll events they cause land.
  await nextFrame();
  await nextFrame();
}

function messageOffset(log: HTMLElement, id: string) {
  const message = log.querySelector(`[data-chat-message-id="${id}"]`);
  if (!message) throw new Error(`No message with ID ${id}`);
  return message.getBoundingClientRect().top - log.getBoundingClientRect().top;
}

/** Viewport offsets of the messages the reader can currently see. */
function visibleMessageOffsets(log: HTMLElement) {
  const viewport = log.getBoundingClientRect();
  const offsets = new Map<string, number>();
  for (const message of log.querySelectorAll('[data-chat-message-id]')) {
    const rect = message.getBoundingClientRect();
    if (rect.bottom > viewport.top && rect.top < viewport.bottom) {
      offsets.set(
        message.getAttribute('data-chat-message-id')!,
        rect.top - viewport.top
      );
    }
  }
  return offsets;
}

function expectWithinPixel(actual: number, expected: number) {
  expect(actual).toBeGreaterThanOrEqual(expected - 1);
  expect(actual).toBeLessThanOrEqual(expected + 1);
}

function PinningHarness() {
  // Paragraph count of the reply to each sent message.
  const [replies, setReplies] = useState<number[]>([]);
  const [pinnedMessageId, setPinnedMessageId] = useState<string>();
  const latest = replies.length - 1;
  const addTurn = () => setReplies((current) => [...current, 0]);
  const messages = [
    ...historyMessages(),
    ...replies.flatMap((paragraphs, turn): ChatMessageModel[] => [
      {
        id: `sent-${turn}`,
        role: 'user',
        status: 'completed',
        content: [
          {
            id: `sent-${turn}-question`,
            type: 'text',
            appearance: 'bubble',
            text: 'Can you write us a packing list?',
          },
        ],
      },
      {
        id: `reply-${turn}`,
        role: 'assistant',
        status: turn === latest ? 'streaming' : 'completed',
        content: paragraphBlocks(
          `reply-${turn}`,
          Array.from(
            { length: paragraphs },
            (_, index) => packingParagraphs[index % packingParagraphs.length]
          )
        ),
      },
    ]),
  ];

  return (
    <ChatConversation
      pinnedMessageId={pinnedMessageId}
      footer={
        <div className="flex gap-space-2">
          <Button
            size="sm"
            onClick={() => {
              setPinnedMessageId(`sent-${replies.length}`);
              addTurn();
            }}
          >
            Send
          </Button>
          <Button
            size="sm"
            color="secondary"
            onClick={() => {
              // The host can know the sent message's ID before it renders.
              setPinnedMessageId(`sent-${replies.length}`);
              window.setTimeout(addTurn, 50);
            }}
          >
            Send, render later
          </Button>
          <Button
            size="sm"
            color="secondary"
            onClick={() =>
              setReplies((current) =>
                current.map((paragraphs, turn) =>
                  turn === current.length - 1 ? paragraphs + 1 : paragraphs
                )
              )
            }
          >
            Stream a paragraph
          </Button>
        </div>
      }
    >
      <ConversationMessages messages={messages} />
    </ChatConversation>
  );
}

export const PinsSentMessageAboveReply: Story = {
  tags: ['!dev', '!autodocs', 'a11y-test'],
  render: () => <PinningHarness />,
  play: async ({ canvas, userEvent }) => {
    const log = canvas.getByRole('log');
    const content = log.firstElementChild as HTMLElement;
    // How far the content runs past the bottom of the viewport.
    const overflow = () =>
      content.getBoundingClientRect().bottom -
      log.getBoundingClientRect().bottom;
    const jumpButton = () =>
      canvas.queryByRole('button', { name: 'Jump to latest' });
    const send = () =>
      userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    const streamParagraph = async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Stream a paragraph' })
      );
      await settle();
    };
    const streamPastViewport = async (id: string, offset: number) => {
      for (let paragraph = 0; overflow() <= 48; paragraph++) {
        expect(paragraph).toBeLessThan(40);
        await streamParagraph();
        expectWithinPixel(messageOffset(log, id), offset);
      }
    };
    await waitFor(() => expect(gapToEnd(log)).toBeLessThanOrEqual(1));

    // The sent message moves to the top, with room below for the reply.
    await send();
    await settle();
    const pinnedOffset = messageOffset(log, 'sent-0');
    expect(pinnedOffset).toBeGreaterThanOrEqual(0);
    expect(pinnedOffset).toBeLessThanOrEqual(48);
    expect(overflow()).toBeLessThan(0);
    expect(jumpButton()).not.toBeInTheDocument();

    // The reply streams in beneath it without moving it, and no reserved
    // space is left once the reply fills the viewport.
    await streamPastViewport('sent-0', pinnedOffset);
    await waitFor(() => expect(jumpButton()).toBeVisible());
    expect(log.scrollHeight).toBeLessThanOrEqual(content.offsetHeight + 1);

    // Jump to latest follows the rest of the reply.
    await userEvent.click(jumpButton()!);
    await streamParagraph();
    expect(gapToEnd(log)).toBeLessThanOrEqual(1);

    // The next message is pinned the same way; scrolling down to the end of
    // its reply also resumes following.
    await send();
    await settle();
    expectWithinPixel(messageOffset(log, 'sent-1'), pinnedOffset);
    await streamPastViewport('sent-1', pinnedOffset);
    log.scrollTop = log.scrollHeight;
    await settle();
    await streamParagraph();
    expect(gapToEnd(log)).toBeLessThanOrEqual(1);
    expect(jumpButton()).not.toBeInTheDocument();

    // A pin whose message renders later lands once the message appears.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send, render later' })
    );
    await waitFor(() => messageOffset(log, 'sent-2'));
    await settle();
    expectWithinPixel(messageOffset(log, 'sent-2'), pinnedOffset);
  },
};

function EarlierPagesHarness() {
  const [pages, setPages] = useState(0);
  const messages = [
    // Page 1 is the most recent earlier page.
    ...Array.from({ length: pages }, (_, index) =>
      historyMessages(`earlier-${pages - index}`)
    ).flat(),
    ...historyMessages(),
  ];

  return (
    <ChatConversation
      footer={
        <Button size="sm" onClick={() => setPages((count) => count + 1)}>
          Load earlier messages
        </Button>
      }
    >
      <ConversationMessages messages={messages} />
    </ChatConversation>
  );
}

export const KeepsPlaceWhenEarlierMessagesLoad: Story = {
  tags: ['!dev', '!autodocs', 'a11y-test'],
  render: () => <EarlierPagesHarness />,
  play: async ({ canvas, userEvent }) => {
    const log = canvas.getByRole('log');
    const loadPage = async (page: number) => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Load earlier messages' })
      );
      await waitFor(() => messageOffset(log, `earlier-${page}-0-user`));
      await settle();
    };
    const expectVisibleMessagesHeld = async (load: () => Promise<void>) => {
      const before = visibleMessageOffsets(log);
      expect(before.size).toBeGreaterThan(0);
      await load();
      for (const [id, offset] of before) {
        expectWithinPixel(messageOffset(log, id), offset);
      }
    };

    // Following the bottom, the latest messages stay in view.
    await waitFor(() => expect(gapToEnd(log)).toBeLessThanOrEqual(1));
    await loadPage(1);
    expect(gapToEnd(log)).toBeLessThanOrEqual(1);

    // Scrolled to the very top, what the reader sees holds still.
    log.scrollTop = 0;
    await settle();
    await expectVisibleMessagesHeld(() => loadPage(2));

    // So it does partway up, with the first visible message cut off.
    log.scrollTop = Math.round(log.scrollTop / 2) + 37;
    await settle();
    await expectVisibleMessagesHeld(() => loadPage(3));
    expect(
      canvas.getByRole('button', { name: 'Jump to latest' })
    ).toBeVisible();
  },
};
