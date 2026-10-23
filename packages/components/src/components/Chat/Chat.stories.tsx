import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatComposer,
  ChatConversation,
  ChatMessage,
  ChatStatus,
  ChatToolCall,
} from '.';
import { Button } from '../Button';
import { Text } from '../Text';
import {
  createLangChainChatAdapter,
  type LangChainMessageLike,
} from './langchain';

const meta = {
  title: 'Components/AI/Chat',
  component: ChatConversation,
  tags: [
    'autodocs',
    'chat',
    'conversation',
    'message',
    'composer',
    'streaming',
    'tool',
    'langchain',
    'useStream',
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composable conversation, message, composer, tool disclosure, and feedback primitives. Import from @langchain/macaw-components/Chat. The optional Chat/langchain adapter maps structural useStream data without depending on the SDK. See docs/CHAT.md for a real hook integration and ownership boundaries. This demo simulates a stream locally; it does not contact an agent.',
      },
    },
  },
} satisfies Meta<typeof ChatConversation>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialMessages: LangChainMessageLike[] = [
  {
    id: 'question',
    type: 'human',
    content: 'How should we share chat across products?',
  },
  {
    id: 'answer',
    type: 'ai',
    content:
      'Share the conversation UI, not the product workflow. Keep transport, permissions, and persistence in the application.',
    tool_calls: [{ id: 'search', name: 'Search design guidelines', args: {} }],
  },
  {
    id: 'result',
    type: 'tool',
    tool_call_id: 'search',
    content: 'Compose existing primitives and use semantic tokens.',
  },
];

function StreamDemo() {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();
  const response =
    'The same components can power LangSmith, Open SWE, or your own product. Use the message and composer slots for product-specific controls.';
  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setMessages((current) => {
        const last = current[current.length - 1];
        const text = typeof last.content === 'string' ? last.content : '';
        return [
          ...current.slice(0, -1),
          { ...last, content: response.slice(0, text.length + 8) },
        ];
      });
    }, 100);
    const done = setTimeout(() => setLoading(false), 2200);
    return () => {
      clearInterval(timer);
      clearTimeout(done);
    };
  }, [isLoading]);
  const chat = createLangChainChatAdapter({
    messages,
    isLoading,
    error,
    submit(input) {
      setError(undefined);
      setMessages((current) => [
        ...current,
        { ...input.messages[0], id: `user-${current.length}` },
        { id: `ai-${current.length}`, type: 'ai', content: '' },
      ]);
      setLoading(true);
    },
    stop() {
      setLoading(false);
    },
  });
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-4 rounded-lg border border-default bg-surface-level-1 p-space-4">
      <div className="flex flex-wrap items-center justify-between gap-space-2">
        <Text variant="h3">Shared Chat</Text>
        <Button
          color="secondary"
          variant="plain"
          onClick={() => {
            setLoading(false);
            setError('Connection lost. Your draft is preserved.');
          }}
        >
          Simulate error
        </Button>
      </div>
      <ChatConversation className="max-h-96" aria-busy={chat.streaming}>
        {chat.messages
          .filter((message) => message.role !== 'tool')
          .map((message) => (
            <ChatMessage
              key={message.key}
              author={message.role === 'user' ? 'You' : 'Assistant'}
              streaming={message.streaming}
              actions={
                message.role === 'assistant' && !chat.streaming ? (
                  <Button
                    size="xs"
                    variant="plain"
                    color="secondary"
                    onClick={() => setDraft('Tell me more about that.')}
                  >
                    Ask a follow-up
                  </Button>
                ) : undefined
              }
            >
              <div className="flex flex-col gap-space-3">
                <div className="whitespace-pre-wrap">{message.text}</div>
                {message.toolCalls.map((tool, index) => (
                  <ChatToolCall
                    key={tool.id ?? index}
                    title={tool.name}
                    state={tool.state}
                  >
                    <Text>
                      {typeof tool.result?.content === 'string'
                        ? tool.result.content
                        : 'Waiting for a result.'}
                    </Text>
                  </ChatToolCall>
                ))}
              </div>
            </ChatMessage>
          ))}
      </ChatConversation>
      {chat.streaming && <ChatStatus state="streaming" />}
      {error && (
        <ChatStatus
          state="error"
          actions={
            <Button
              color="secondary"
              size="sm"
              onClick={() => setError(undefined)}
            >
              Dismiss
            </Button>
          }
        >
          {error}
        </ChatStatus>
      )}
      <ChatComposer
        value={draft}
        onValueChange={setDraft}
        onSubmit={(text) => {
          chat.submit(text);
          setDraft('');
        }}
        streaming={chat.streaming}
        onStop={chat.stop}
        footer={
          <Text variant="xs" color="secondary">
            Enter to send · Shift+Enter for a new line
          </Text>
        }
      />
    </div>
  );
}

export const StreamingDemo: Story = { render: () => <StreamDemo /> };
export const Empty: Story = {
  render: () => (
    <div className="max-w-lg">
      <ChatConversation>
        <ChatStatus state="empty" />
      </ChatConversation>
      <ChatComposer value="" onValueChange={() => {}} onSubmit={() => {}} />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div className="max-w-lg">
      <ChatComposer
        value="A draft that cannot be sent"
        disabled
        onValueChange={() => {}}
        onSubmit={() => {}}
      />
    </div>
  ),
};
export const ToolStates: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-space-3">
      {(['pending', 'running', 'complete', 'error'] as const).map((state) => (
        <ChatToolCall key={state} title="Search documentation" state={state}>
          <Text>Application-owned tool details</Text>
        </ChatToolCall>
      ))}
    </div>
  ),
};
export const Narrow: Story = {
  render: () => (
    <div className="max-w-xs">
      <StreamDemo />
    </div>
  ),
};
