import { describe, expect, it, vi } from 'vitest';

import {
  createLangChainChatAdapter,
  mapLangChainMessages,
  type LangChainMessageLike,
} from './langchain';

const messages = [
  { id: 'user', type: 'human', content: 'Question' },
  {
    id: 'assistant',
    type: 'ai',
    content: [
      { type: 'text', text: 'Look' },
      { type: 'image', source: 'private' },
      { type: 'text', text: ' here' },
    ],
    tool_calls: [{ id: 'call-1', name: 'search', args: { query: 'docs' } }],
  },
  {
    id: 'result',
    type: 'tool',
    tool_call_id: 'call-1',
    content: 'Result',
    status: 'success',
  },
] satisfies LangChainMessageLike[];

describe('LangChain chat adapter', () => {
  it('normalizes roles and text without losing original blocks or tool messages', () => {
    const mapped = mapLangChainMessages(messages);
    expect(mapped.map(({ role }) => role)).toEqual([
      'user',
      'assistant',
      'tool',
    ]);
    expect(mapped[1].text).toBe('Look here');
    expect(mapped[1].original).toBe(messages[1]);
    expect(mapped[1].toolCalls[0]).toMatchObject({
      id: 'call-1',
      name: 'search',
      args: { query: 'docs' },
      state: 'complete',
      result: messages[2],
    });
  });

  it('correlates parallel results by ID, not order, and preserves errors', () => {
    const mapped = mapLangChainMessages(
      [
        {
          type: 'ai',
          tool_calls: [
            { id: 'a', name: 'one' },
            { id: 'b', name: 'two' },
            { name: 'partial' },
          ],
        },
        { type: 'tool', tool_call_id: 'b', status: 'error', content: 'Failed' },
        { type: 'tool', tool_call_id: 'a', content: 'OK' },
        { type: 'tool', content: 'Uncorrelated' },
      ],
      true
    );
    expect(mapped[0].toolCalls.map(({ state }) => state)).toEqual([
      'complete',
      'error',
      'running',
    ]);
    expect(mapped[0].toolCalls[2].result).toBeUndefined();
  });

  it('leaves interrupted tools pending and marks only a trailing assistant as streaming', () => {
    expect(
      mapLangChainMessages(messages.slice(0, 2))[1].toolCalls[0].state
    ).toBe('pending');
    expect(mapLangChainMessages(messages.slice(0, 2), true)[1].streaming).toBe(
      true
    );
    expect(
      mapLangChainMessages(messages, true).every(({ streaming }) => !streaming)
    ).toBe(true);
    expect(
      mapLangChainMessages([{ role: 'assistant', content: null }], true)[0]
    ).toMatchObject({
      role: 'assistant',
      text: '',
      streaming: true,
      key: 'message-0',
    });
  });

  it('bridges submit/stop and returns application errors without inventing retry behavior', () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    const error = new Error('Disconnected');
    const stream = { messages, isLoading: false, error, submit, stop };
    const adapter = createLangChainChatAdapter(stream);
    expect(adapter.error).toBe(error);
    expect(adapter.submit('Hello')).toBeInstanceOf(Promise);
    expect(submit).toHaveBeenCalledExactlyOnceWith({
      messages: [{ type: 'human', content: 'Hello' }],
    });
    adapter.submit('  ');
    createLangChainChatAdapter({ ...stream, isLoading: true }).submit(
      'No duplicate'
    );
    expect(submit).toHaveBeenCalledOnce();
    adapter.stop();
    expect(stop).toHaveBeenCalledOnce();
  });
});
