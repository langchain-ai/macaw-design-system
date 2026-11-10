import { parseInterrupt, toHumanInTheLoopResponse } from '../interrupts';
import { toChatThread } from '../toChatThread';

const human = (id: string, content: string) => ({ id, type: 'human', content });
const ai = (id: string, content: unknown, toolCalls?: unknown[]) => ({
  id,
  type: 'ai',
  content,
  ...(toolCalls ? { tool_calls: toolCalls } : {}),
});
const toolResult = (
  toolCallId: string,
  content: string,
  status?: 'success' | 'error'
) => ({
  id: `result-${toolCallId}`,
  type: 'tool',
  tool_call_id: toolCallId,
  content,
  ...(status ? { status } : {}),
});

describe('toChatThread', () => {
  it('groups a human message and the agent work that follows into one turn', () => {
    const { turns } = toChatThread({
      messages: [
        human('h1', 'Find the docs'),
        ai('a1', 'Searching.', [
          { id: 'call-1', name: 'search', args: { query: 'docs' } },
        ]),
        toolResult('call-1', '3 results'),
        ai('a2', 'Here are the docs.'),
        human('h2', 'Thanks'),
      ],
    });

    expect(turns.map((turn) => turn.id)).toEqual(['h1', 'h2']);
    expect(turns[0].user?.text).toBe('Find the docs');
    expect(turns[0].parts.map((part) => part.type)).toEqual([
      'text',
      'tool-call',
      'text',
    ]);
    expect(turns[0].actionCount).toBe(1);
    // Parts keep the messages they came from for custom renderers.
    expect(turns[0].parts[1].source).toEqual({
      message: expect.objectContaining({ id: 'a1' }),
      result: expect.objectContaining({ id: 'result-call-1' }),
    });
  });

  it('settles a call from its result, then the live stream, then the run', () => {
    const messages = [
      human('h1', 'Go'),
      ai('a1', '', [
        { id: 'done', name: 'read', args: {} },
        { id: 'broken', name: 'read', args: {} },
        { id: 'live-done', name: 'read', args: {} },
        { id: 'live-error', name: 'read', args: {} },
        { id: 'open', name: 'read', args: {} },
      ]),
      toolResult('done', 'ok'),
      toolResult('broken', 'not found', 'error'),
    ];
    const toolCalls = [
      { callId: 'live-done', status: 'finished', output: 'streamed' },
      { callId: 'live-error', status: 'error', error: 'boom' },
      // A result message outranks the live status.
      { callId: 'done', status: 'running' },
    ];
    const statuses = (isLoading: boolean) =>
      Object.fromEntries(
        toChatThread({ messages, toolCalls, isLoading }).turns[0].parts.map(
          (part) => [
            part.id,
            part.type === 'tool-call' ? part.toolCall.status : part.type,
          ]
        )
      );

    expect(statuses(true)).toEqual({
      done: 'succeeded',
      broken: 'failed',
      'live-done': 'succeeded',
      'live-error': 'failed',
      open: 'running',
    });
    expect(statuses(false).open).toBe('canceled');
  });

  it('gives id-less tool calls stable ids', () => {
    const snapshot = {
      messages: [ai('a1', '', [{ name: 'search', args: {} }])],
    };
    const first = toChatThread(snapshot).turns[0].parts[0];
    const second = toChatThread(snapshot).turns[0].parts[0];
    expect(first.id).toBe('a1:tool:0');
    expect(second.id).toBe(first.id);
  });

  it('reads text, reasoning, and tool calls from content blocks', () => {
    const { turns } = toChatThread({
      messages: [
        ai('a1', [
          { type: 'thinking', thinking: 'Weighing options.' },
          { type: 'text', text: 'Done.' },
          { type: 'tool_use', id: 'call-1', name: 'ls', input: { path: '/' } },
        ]),
      ],
    });
    expect(turns[0].parts).toMatchObject([
      { type: 'reasoning', text: 'Weighing options.' },
      { type: 'text', text: 'Done.' },
      { type: 'tool-call', toolCall: { name: 'ls', args: { path: '/' } } },
    ]);
  });

  it('streams only the newest text while the run is active', () => {
    const snapshot = {
      messages: [human('h1', 'Hi'), ai('a1', 'First'), ai('a2', 'Second')],
      isLoading: true,
    };
    const parts = toChatThread(snapshot).turns[0].parts;
    expect(parts.map((part) => part.type === 'text' && part.streaming)).toEqual(
      [false, true]
    );
    expect(toChatThread(snapshot).turns[0].status).toBe('streaming');
  });

  it('starts a turn for an agent that speaks first and hides internal messages', () => {
    const { turns } = toChatThread(
      {
        messages: [
          ai('greeting', 'Hello!'),
          human('do-not-show-1', 'internal context'),
          human('h1', 'Hi'),
        ],
      },
      {
        hideMessage: (message) =>
          String((message as { id: string }).id).startsWith('do-not-show-'),
      }
    );
    expect(turns.map((turn) => [turn.id, turn.user?.text])).toEqual([
      ['greeting', undefined],
      ['h1', 'Hi'],
    ]);
  });

  it('turns task calls into subagents matched to their stream handles', () => {
    const { turns } = toChatThread({
      messages: [
        human('h1', 'Research'),
        ai('a1', '', [
          {
            id: 'task-1',
            name: 'task',
            args: { subagent_type: 'researcher', description: 'Find papers' },
          },
        ]),
        toolResult('task-1', 'Found three papers.'),
      ],
      subagents: new Map([
        [
          'task-1',
          {
            id: 'task-1',
            status: 'complete',
            startedAt: new Date('2026-01-01T00:00:00Z'),
            completedAt: new Date('2026-01-01T00:00:42Z'),
          },
        ],
      ]),
    });

    expect(turns[0].parts[0]).toMatchObject({
      type: 'subagent',
      result: 'Found three papers.',
      subagent: {
        id: 'task-1',
        name: 'researcher',
        task: 'Find papers',
        status: 'succeeded',
        elapsedMs: 42_000,
      },
    });
  });

  it.each([
    {
      casing: 'snake',
      value: {
        action_requests: [
          { name: 'edit_file', args: { file_path: 'a.ts' } },
          { name: 'edit_file', args: { file_path: 'b.ts' } },
        ],
        review_configs: [
          {
            action_name: 'edit_file',
            allowed_decisions: ['approve', 'edit', 'reject'],
          },
        ],
      },
    },
    {
      casing: 'camel',
      value: {
        actionRequests: [
          { name: 'edit_file', args: { file_path: 'a.ts' } },
          { name: 'edit_file', args: { file_path: 'b.ts' } },
        ],
        reviewConfigs: [
          {
            actionName: 'edit_file',
            allowedDecisions: ['approve', 'edit', 'reject'],
          },
        ],
      },
    },
  ])(
    'anchors $casing approval requests to the calls they gate',
    ({ casing, value }) => {
      const thread = toChatThread({
        messages: [
          human('h1', 'Fix both'),
          ai('a1', '', [
            { id: 'b', name: 'edit_file', args: { file_path: 'b.ts' } },
            { id: 'a', name: 'edit_file', args: { file_path: 'a.ts' } },
          ]),
        ],
        interrupts: [{ id: 'interrupt-1', value }],
      });
      const [interrupt] = thread.interrupts;

      expect(interrupt).toMatchObject({ kind: 'approval', casing });
      if (interrupt.kind !== 'approval') throw new Error('Expected approval');
      expect(interrupt.requests.map((request) => request.toolCallId)).toEqual([
        'a',
        'b',
      ]);
      expect(interrupt.requests[0].allowedDecisions).toEqual([
        'approve',
        'edit',
        'reject',
      ]);
      expect(
        thread.turns[0].parts.map(
          (part) => part.type === 'tool-call' && part.toolCall.status
        )
      ).toEqual(['input-required', 'input-required']);
      expect(thread.status).toBe('interrupted');
    }
  );

  it('maps deep agent todos, files, the queue, and run errors', () => {
    const thread = toChatThread({
      messages: [human('h1', 'Plan it')],
      values: {
        todos: [
          { content: 'Research', status: 'completed' },
          { content: 'Draft', status: 'in_progress' },
          { content: 'Review', status: 'pending' },
        ],
        files: {
          '/notes.md': { content: ['# Notes'], modified_at: '2026-01-01' },
        },
      },
      queue: [
        {
          id: 'queued-1',
          values: { messages: [{ type: 'human', content: 'And then?' }] },
        },
      ],
      error: new Error('Model unavailable'),
    });

    expect(thread.plan?.map((item) => item.status)).toEqual([
      'completed',
      'in-progress',
      'pending',
    ]);
    expect(thread.files).toEqual([
      { path: '/notes.md', modifiedAt: '2026-01-01' },
    ]);
    expect(thread.queued).toEqual([{ id: 'queued-1', text: 'And then?' }]);
    expect(thread.turns[0]).toMatchObject({
      status: 'failed',
      error: 'Model unavailable',
    });
  });
});

describe('human-in-the-loop decisions', () => {
  const request = (casing: 'snake' | 'camel') =>
    parseInterrupt(
      {
        id: 'i1',
        value:
          casing === 'snake'
            ? { action_requests: [{ name: 'run', args: { cmd: 'ls' } }] }
            : { actionRequests: [{ name: 'run', args: { cmd: 'ls' } }] },
      },
      0
    );

  it.each([
    [
      'snake',
      { type: 'edit', edited_action: { name: 'run', args: { cmd: 'pwd' } } },
    ],
    [
      'camel',
      { type: 'edit', editedAction: { name: 'run', args: { cmd: 'pwd' } } },
    ],
  ] as const)('answers %s graphs in their own casing', (casing, expected) => {
    const interrupt = request(casing);
    if (interrupt.kind !== 'approval') throw new Error('Expected approval');
    expect(
      toHumanInTheLoopResponse(interrupt, [
        { type: 'edit', args: { cmd: 'pwd' } },
      ])
    ).toEqual({ decisions: [expected] });
  });

  it('keeps an optional rejection message and defaults to approve and reject', () => {
    const interrupt = request('camel');
    if (interrupt.kind !== 'approval') throw new Error('Expected approval');
    expect(interrupt.requests[0].allowedDecisions).toEqual([
      'approve',
      'reject',
    ]);
    expect(
      toHumanInTheLoopResponse(interrupt, [{ type: 'reject', message: 'No' }])
    ).toEqual({ decisions: [{ type: 'reject', message: 'No' }] });
  });

  it('leaves other interrupts for the host', () => {
    expect(parseInterrupt({ value: { question: 'Which env?' } }, 2)).toEqual({
      kind: 'other',
      id: 'interrupt-2',
      value: { question: 'Which env?' },
      raw: { value: { question: 'Which env?' } },
    });
  });
});
