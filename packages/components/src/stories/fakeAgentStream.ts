import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  ChatThreadSelectors,
  ChatThreadStream,
} from '../components/ChatThread';

/**
 * A scripted stand-in for a LangGraph `useStream` handle, for stories and
 * tests. It plays a deep agent run: a plan, two parallel subagents, a file
 * edit that needs approval, and a streamed answer.
 */

export interface FakeStreamState {
  messages: unknown[];
  toolCalls: unknown[];
  interrupts: unknown[];
  values: Record<string, unknown>;
  subagents: Map<string, unknown>;
  subagentCalls: Record<string, unknown[]>;
  subagentMessages: Record<string, unknown[]>;
  queue: { id: string; values: unknown }[];
  isLoading: boolean;
  error?: unknown;
}

export const emptyState: FakeStreamState = {
  messages: [],
  toolCalls: [],
  interrupts: [],
  values: {},
  subagents: new Map(),
  subagentCalls: {},
  subagentMessages: {},
  queue: [],
  isLoading: false,
};

type Update = (state: FakeStreamState) => FakeStreamState;

interface ScriptIO {
  set: (update: Update) => void;
  wait: (milliseconds: number) => Promise<void>;
  /** Streams text into a message's content, a few characters at a time. */
  streamText: (
    messageId: string,
    text: string,
    kind?: 'text' | 'reasoning'
  ) => Promise<void>;
  waitForResume: () => Promise<unknown>;
}

const todos = (statuses: string[]) =>
  [
    'Find recent papers on retrieval evaluation',
    'Review the claims in the draft',
    'Update the summary file',
    'Write the final answer',
  ].map((content, index) => ({ content, status: statuses[index] }));

const SUMMARY_BEFORE = '# RAG evaluation\n\nTODO: summarize findings.\n';
const SUMMARY_AFTER =
  '# RAG evaluation\n\n- Natural Questions is the shared benchmark.\n- Two papers add TriviaQA.\n- Long contexts lose the middle.\n';

const ANSWER = `Here's what the research found:

| Paper | Benchmark | Key finding |
| --- | --- | --- |
| Lost in the Middle | Natural Questions | Accuracy drops for facts mid-context |
| RAG at scale | NQ, TriviaQA | Retrieval quality beats model size |

I updated \`notes/summary.md\` with these points. Want me to compare retrievers next?`;

function upsertMessage(
  state: FakeStreamState,
  message: { id: string } & Record<string, unknown>
) {
  const index = state.messages.findIndex(
    (item) => (item as { id: string }).id === message.id
  );
  const messages = [...state.messages];
  if (index === -1) messages.push(message);
  else messages[index] = message;
  return { ...state, messages };
}

function subagentStep(
  state: FakeStreamState,
  id: string,
  calls: unknown[],
  status: 'running' | 'complete'
) {
  const subagents = new Map(state.subagents);
  const current = subagents.get(id) as Record<string, unknown>;
  subagents.set(id, {
    ...current,
    status,
    completedAt: status === 'complete' ? new Date() : null,
  });
  return {
    ...state,
    subagents,
    subagentCalls: { ...state.subagentCalls, [id]: calls },
  };
}

/** The deep agent run the fake stream plays after each message. */
export async function deepAgentScript(io: ScriptIO, prompt: string) {
  const turn = String(Date.now());
  const id = (suffix: string) => `${turn}-${suffix}`;

  await io.wait(300);
  await io.streamText(
    id('reasoning'),
    `The request is about "${prompt}". I'll plan the work, split the research, then update the notes.`
  );

  io.set((state) =>
    upsertMessage(
      {
        ...state,
        values: {
          ...state.values,
          todos: todos(['in_progress', 'pending', 'pending', 'pending']),
        },
      },
      {
        id: id('plan'),
        type: 'ai',
        content: '',
        tool_calls: [
          {
            id: id('todos'),
            name: 'write_todos',
            args: {
              todos: todos(['in_progress', 'pending', 'pending', 'pending']),
            },
          },
        ],
      }
    )
  );
  io.set((state) =>
    upsertMessage(state, {
      id: id('todos-result'),
      type: 'tool',
      tool_call_id: id('todos'),
      content: 'Updated the plan.',
    })
  );
  await io.wait(600);

  const researcher = id('researcher');
  const critic = id('critic');
  io.set((state) => {
    const subagents = new Map(state.subagents);
    for (const [taskId, name, task] of [
      [
        researcher,
        'researcher',
        'Find three recent papers on retrieval-augmented generation evaluation.',
      ],
      [critic, 'critic', 'Check the draft summary for unsupported claims.'],
    ]) {
      subagents.set(taskId, {
        id: taskId,
        name,
        namespace: [`tools:${taskId}`],
        status: 'running',
        taskInput: task,
        startedAt: new Date(),
        completedAt: null,
      });
    }
    return upsertMessage(
      { ...state, subagents },
      {
        id: id('delegate'),
        type: 'ai',
        content: 'I’ll split the research between two subagents.',
        tool_calls: [
          {
            id: researcher,
            name: 'task',
            args: {
              subagent_type: 'researcher',
              description:
                'Find three recent papers on retrieval-augmented generation evaluation.',
            },
          },
          {
            id: critic,
            name: 'task',
            args: {
              subagent_type: 'critic',
              description: 'Check the draft summary for unsupported claims.',
            },
          },
        ],
      }
    );
  });

  const researcherSteps = [
    {
      name: 'grep',
      args: { pattern: 'retrieval evaluation' },
      status: 'running',
    },
    {
      name: 'read_file',
      args: { file_path: '/papers/lost-in-the-middle.md' },
      status: 'running',
    },
    {
      name: 'read_file',
      args: { file_path: '/papers/rag-at-scale.md' },
      status: 'running',
    },
  ];
  for (let step = 0; step < researcherSteps.length; step += 1) {
    io.set((state) => {
      const next = subagentStep(
        state,
        researcher,
        researcherSteps.slice(0, step + 1).map((call, index) => ({
          ...call,
          id: `${researcher}-call-${index}`,
          callId: `${researcher}-call-${index}`,
          status: index === step ? 'running' : 'finished',
        })),
        'running'
      );
      return subagentStep(
        next,
        critic,
        [
          {
            id: `${critic}-call-0`,
            callId: `${critic}-call-0`,
            name: 'read_file',
            args: { file_path: '/notes/summary.md' },
            status: step < 2 ? 'running' : 'finished',
          },
        ],
        'running'
      );
    });
    await io.wait(1_400);
  }

  io.set((state) => {
    let next = subagentStep(
      state,
      researcher,
      state.subagentCalls[researcher] ?? [],
      'complete'
    );
    next = subagentStep(
      next,
      critic,
      next.subagentCalls[critic] ?? [],
      'complete'
    );
    next = upsertMessage(next, {
      id: id('researcher-result'),
      type: 'tool',
      tool_call_id: researcher,
      content:
        '**Found three papers.** All evaluate on Natural Questions; two add TriviaQA.',
    });
    next = upsertMessage(next, {
      id: id('critic-result'),
      type: 'tool',
      tool_call_id: critic,
      content:
        'One claim lacks a source: “retrieval quality beats model size.”',
    });
    return {
      ...next,
      values: {
        ...next.values,
        todos: todos(['completed', 'completed', 'in_progress', 'pending']),
      },
    };
  });
  await io.wait(500);

  const edit = {
    file_path: 'notes/summary.md',
    old_string: SUMMARY_BEFORE,
    new_string: SUMMARY_AFTER,
  };
  io.set((state) =>
    upsertMessage(
      {
        ...state,
        isLoading: false,
        interrupts: [
          {
            id: id('approval'),
            value: {
              actionRequests: [{ name: 'edit_file', args: edit }],
              reviewConfigs: [
                {
                  actionName: 'edit_file',
                  allowedDecisions: ['approve', 'edit', 'reject'],
                },
              ],
            },
          },
        ],
      },
      {
        id: id('edit'),
        type: 'ai',
        content: '',
        tool_calls: [{ id: id('edit-call'), name: 'edit_file', args: edit }],
      }
    )
  );

  const response = (await io.waitForResume()) as {
    decisions?: { type: string }[];
  };
  const rejected = response.decisions?.[0]?.type === 'reject';
  io.set((state) =>
    upsertMessage(
      {
        ...state,
        values: {
          ...state.values,
          todos: todos([
            'completed',
            'completed',
            rejected ? 'pending' : 'completed',
            'in_progress',
          ]),
        },
      },
      {
        id: id('edit-result'),
        type: 'tool',
        tool_call_id: id('edit-call'),
        status: rejected ? 'error' : 'success',
        content: rejected
          ? 'The reviewer rejected this edit.'
          : 'Updated notes/summary.md.',
      }
    )
  );
  await io.wait(400);
  await io.streamText(
    id('answer'),
    rejected ? 'Understood, I left the summary file unchanged.' : ANSWER,
    'text'
  );
  io.set((state) => ({
    ...state,
    isLoading: false,
    values: {
      ...state.values,
      todos: todos([
        'completed',
        'completed',
        rejected ? 'pending' : 'completed',
        'completed',
      ]),
    },
  }));
}

/**
 * Plays `deepAgentScript` for each message sent. Returns a stream handle and
 * selector hooks with the same shapes as `@langchain/react`.
 */
export function useFakeAgentStream({
  initialState = emptyState,
  autoStart,
}: { initialState?: FakeStreamState; autoStart?: string } = {}) {
  const [state, setState] = useState(initialState);
  const resume = useRef<((value: unknown) => void) | null>(null);
  const run = useRef<{ stopped: boolean } | null>(null);
  const started = useRef(false);

  function play(text: string) {
    const token = { stopped: false };
    run.current = token;
    const io: ScriptIO = {
      set: (update) => {
        if (!token.stopped) setState(update);
      },
      wait: (milliseconds) =>
        new Promise((done) => setTimeout(done, milliseconds)),
      async streamText(messageId, text, kind) {
        const field =
          kind ?? (messageId.endsWith('reasoning') ? 'reasoning' : 'text');
        for (let end = 0; end <= text.length; end += 6) {
          if (token.stopped) return;
          const partial = text.slice(0, end);
          setState((current) =>
            upsertMessage(current, {
              id: messageId,
              type: 'ai',
              content:
                field === 'reasoning'
                  ? [{ type: 'reasoning', reasoning: partial }]
                  : partial,
            })
          );
          await new Promise((done) => setTimeout(done, 30));
        }
      },
      waitForResume: () =>
        new Promise((done) => {
          resume.current = done;
        }),
    };
    void deepAgentScript(io, text).then(() => {
      if (token.stopped) return;
      // Queued messages start once the run finishes.
      setState((current) => {
        const [next, ...rest] = current.queue;
        if (!next) return current;
        const message = (next.values as { messages: { content: string }[] })
          .messages[0];
        setTimeout(() => play(message.content), 0);
        return {
          ...current,
          queue: rest,
          isLoading: true,
          messages: [
            ...current.messages,
            { id: next.id, type: 'human', content: message.content },
          ],
        };
      });
    });
  }

  useEffect(() => {
    if (!autoStart || started.current) return;
    started.current = true;
    setState((current) => ({
      ...current,
      isLoading: true,
      messages: [
        ...current.messages,
        { id: 'prompt', type: 'human', content: autoStart },
      ],
    }));
    play(autoStart);
    // Plays once per mount; later messages come through submit.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stream = useMemo<ChatThreadStream>(
    () => ({
      ...state,
      submit(input: unknown, options?: unknown) {
        const text =
          ((input as { messages?: { content?: string }[] })?.messages?.[0]
            ?.content as string) ?? '';
        const enqueue =
          (options as { multitaskStrategy?: string } | undefined)
            ?.multitaskStrategy === 'enqueue';
        if (state.isLoading && enqueue) {
          setState((current) => ({
            ...current,
            queue: [
              ...current.queue,
              {
                id: `queued-${Date.now()}`,
                values: { messages: [{ type: 'human', content: text }] },
              },
            ],
          }));
          return Promise.resolve();
        }
        setState((current) => ({
          ...current,
          isLoading: true,
          error: undefined,
          messages: [
            ...current.messages,
            { id: `human-${Date.now()}`, type: 'human', content: text },
          ],
        }));
        play(text);
        return Promise.resolve();
      },
      stop() {
        if (run.current) run.current.stopped = true;
        return new Promise<void>((done) =>
          setTimeout(() => {
            setState((current) => ({ ...current, isLoading: false }));
            done();
          }, 600)
        );
      },
      respond(value: unknown) {
        setState((current) => ({
          ...current,
          interrupts: [],
          isLoading: true,
        }));
        resume.current?.(value);
        resume.current = null;
        return Promise.resolve();
      },
    }),
    [state]
  );

  const selectors = useMemo<ChatThreadSelectors>(
    () => ({
      useToolCalls: (_stream: never, target?: never) => {
        const handle = target as { id?: string } | undefined;
        return handle?.id
          ? (state.subagentCalls[handle.id] ?? [])
          : state.toolCalls;
      },
      useMessages: (_stream: never, target?: never) => {
        const handle = target as { id?: string } | undefined;
        return handle?.id
          ? (state.subagentMessages[handle.id] ?? [])
          : state.messages;
      },
      useSubmissionQueue: () => ({
        entries: state.queue,
        cancel: (queuedId: string) => {
          setState((current) => ({
            ...current,
            queue: current.queue.filter((entry) => entry.id !== queuedId),
          }));
          return Promise.resolve(true);
        },
      }),
      useMessageMetadata: (_stream: never, messageId: string | undefined) =>
        messageId
          ? { parentCheckpointId: `checkpoint-${messageId}` }
          : undefined,
    }),
    [state]
  );

  return { stream, selectors, state };
}

/** A frozen stream for stories and tests that need a fixed moment. */
export function staticStream(
  state: Partial<FakeStreamState>,
  methods: Partial<
    Pick<ChatThreadStream, 'submit' | 'stop' | 'respond' | 'respondAll'>
  > = {}
): ChatThreadStream {
  return {
    ...emptyState,
    ...state,
    submit: () => Promise.resolve(),
    stop: () => Promise.resolve(),
    respond: () => Promise.resolve(),
    ...methods,
  } as ChatThreadStream;
}

const researchTask =
  'Find three recent papers on retrieval-augmented generation evaluation.';

/** A run paused on a file edit that needs approval. */
export const awaitingApprovalState: FakeStreamState = {
  ...emptyState,
  messages: [
    {
      id: 'h1',
      type: 'human',
      content: 'Research how RAG systems are evaluated and update my notes.',
    },
    {
      id: 'a1',
      type: 'ai',
      content: [
        {
          type: 'reasoning',
          reasoning:
            'Plan the work, split the research, then update the notes.',
        },
      ],
    },
    {
      id: 'a2',
      type: 'ai',
      content: 'I’ll split the research between two subagents.',
      tool_calls: [
        {
          id: 'task-1',
          name: 'task',
          args: { subagent_type: 'researcher', description: researchTask },
        },
        {
          id: 'task-2',
          name: 'task',
          args: {
            subagent_type: 'critic',
            description: 'Check the draft summary for unsupported claims.',
          },
        },
      ],
    },
    {
      id: 't1',
      type: 'tool',
      tool_call_id: 'task-1',
      content:
        '**Found three papers.** All evaluate on Natural Questions; two add TriviaQA.',
    },
    {
      id: 't2',
      type: 'tool',
      tool_call_id: 'task-2',
      content: 'One claim lacks a source.',
    },
    {
      id: 'a3',
      type: 'ai',
      content: '',
      tool_calls: [
        {
          id: 'read-1',
          name: 'read_file',
          args: { file_path: 'notes/summary.md' },
        },
        {
          id: 'edit-1',
          name: 'edit_file',
          args: {
            file_path: 'notes/summary.md',
            old_string: SUMMARY_BEFORE,
            new_string: SUMMARY_AFTER,
          },
        },
      ],
    },
    { id: 't3', type: 'tool', tool_call_id: 'read-1', content: SUMMARY_BEFORE },
  ],
  interrupts: [
    {
      id: 'approval-1',
      value: {
        actionRequests: [
          {
            name: 'edit_file',
            args: {
              file_path: 'notes/summary.md',
              old_string: SUMMARY_BEFORE,
              new_string: SUMMARY_AFTER,
            },
          },
        ],
        reviewConfigs: [
          {
            actionName: 'edit_file',
            allowedDecisions: ['approve', 'edit', 'reject'],
          },
        ],
      },
    },
  ],
  values: {
    todos: todos(['completed', 'completed', 'in_progress', 'pending']),
  },
  subagents: new Map([
    [
      'task-1',
      {
        id: 'task-1',
        name: 'researcher',
        status: 'complete',
        startedAt: new Date(0),
        completedAt: new Date(41_000),
      },
    ],
    [
      'task-2',
      {
        id: 'task-2',
        name: 'critic',
        status: 'complete',
        startedAt: new Date(0),
        completedAt: new Date(12_000),
      },
    ],
  ]),
};

/** A finished conversation with earlier turns. */
export const completedState: FakeStreamState = {
  ...emptyState,
  messages: [
    ...awaitingApprovalState.messages,
    {
      id: 't4',
      type: 'tool',
      tool_call_id: 'edit-1',
      content: 'Updated notes/summary.md.',
    },
    { id: 'a4', type: 'ai', content: ANSWER },
    {
      id: 'h2',
      type: 'human',
      content: 'Which benchmark should I start with?',
    },
    {
      id: 'a5',
      type: 'ai',
      content:
        'Start with **Natural Questions**: every paper reports it, so your numbers compare directly.',
    },
  ],
  values: {
    todos: todos(['completed', 'completed', 'completed', 'completed']),
  },
  subagents: awaitingApprovalState.subagents,
};
