export interface LangChainMessageLike {
  id?: string;
  type?: string;
  role?: string;
  content?: unknown;
  tool_calls?: readonly { id?: string; name: string; args?: unknown }[];
  tool_call_id?: string;
  status?: string;
}

export interface ChatStreamToolCall<
  Message extends LangChainMessageLike = LangChainMessageLike,
> {
  id?: string;
  name: string;
  args: unknown;
  state: 'pending' | 'running' | 'complete' | 'error';
  result?: Message;
}

export interface ChatStreamMessage<
  Message extends LangChainMessageLike = LangChainMessageLike,
> {
  key: string;
  role: string;
  text: string;
  streaming: boolean;
  toolCalls: ChatStreamToolCall<Message>[];
  original: Message;
}

function messageRole(message: LangChainMessageLike): string {
  const role = message.type ?? message.role ?? 'unknown';
  return role === 'human' ? 'user' : role === 'ai' ? 'assistant' : role;
}

function textContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .flatMap((block: unknown) => {
      if (typeof block === 'string') return [block];
      if (
        block &&
        typeof block === 'object' &&
        'type' in block &&
        block.type === 'text' &&
        'text' in block &&
        typeof block.text === 'string'
      )
        return [block.text];
      return [];
    })
    .join('');
}

export function mapLangChainMessages<Message extends LangChainMessageLike>(
  messages: readonly Message[],
  isLoading = false
): ChatStreamMessage<Message>[] {
  const results = new Map<string, Message>();
  for (const message of messages) {
    if (messageRole(message) === 'tool' && message.tool_call_id)
      results.set(message.tool_call_id, message);
  }
  return messages.map((message, index) => ({
    key: message.id ?? `message-${index}`,
    role: messageRole(message),
    text: textContent(message.content),
    streaming:
      isLoading &&
      index === messages.length - 1 &&
      messageRole(message) === 'assistant',
    toolCalls: (message.tool_calls ?? []).map((call) => {
      const result = call.id ? results.get(call.id) : undefined;
      return {
        id: call.id,
        name: call.name,
        args: call.args,
        state: result
          ? result.status === 'error'
            ? 'error'
            : 'complete'
          : isLoading
            ? 'running'
            : 'pending',
        result,
      };
    }),
    original: message,
  }));
}

export interface LangChainChatStream<
  Message extends LangChainMessageLike = LangChainMessageLike,
> {
  messages: readonly Message[];
  isLoading: boolean;
  error?: unknown;
  submit(input: { messages: { type: 'human'; content: string }[] }): unknown;
  stop(): unknown;
}

export function createLangChainChatAdapter<
  Message extends LangChainMessageLike,
>(stream: LangChainChatStream<Message>) {
  return {
    messages: mapLangChainMessages(stream.messages, stream.isLoading),
    streaming: stream.isLoading,
    error: stream.error,
    submit(text: string) {
      if (stream.isLoading || !text.trim()) return;
      return stream.submit({ messages: [{ type: 'human', content: text }] });
    },
    stop() {
      return stream.stop();
    },
  };
}
