import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
  ChatThreadActions,
  ChatThreadController,
  ChatThreadModel,
  ChatThreadPart,
  ChatThreadSelectors,
  ChatThreadStream,
  ChatThreadTiming,
  ChatThreadTurn,
  ToChatThreadOptions,
} from './ChatThread.types';
import { toHumanInTheLoopResponse } from './interrupts';
import { isRecord } from './messages';
import { toChatThread } from './toChatThread';

type AnyFunction = (...args: unknown[]) => unknown;

function invoke(target: object, method: unknown, ...args: unknown[]) {
  return Promise.resolve((method as AnyFunction).apply(target, args));
}

function humanInput(text: string, messagesKey: string) {
  return { [messagesKey]: [{ type: 'human', content: text }] };
}

export interface UseLangGraphChatThreadOptions extends ToChatThreadOptions {
  /**
   * Selector hooks from the app's own `@langchain/react` import. Each one
   * turns on a feature: queued messages, edit and retry, and subagent
   * details. Pass a module-level object so it never changes.
   */
  selectors?: ChatThreadSelectors;
}

interface TurnTiming extends ChatThreadTiming {
  /** The turn stopped on an interrupt, so it resumes when the run does. */
  paused?: boolean;
}

/** A `ChatThreadController` for a LangGraph stream, with every action. */
export interface LangGraphChatThreadState extends ChatThreadController {
  model: ChatThreadModel;
  actions: ChatThreadActions;
  stream: ChatThreadStream;
  selectors?: ChatThreadSelectors;
  isThreadLoading: boolean;
  stopping: boolean;
  /** When each turn's work started and ended, measured on this client. */
  timings: Readonly<Record<string, ChatThreadTiming>>;
  useForkPoint: (turn: ChatThreadTurn) => unknown;
}

/**
 * The default adapter behind `ChatThread`'s `stream` prop: connects a
 * LangGraph `useStream` handle to Macaw chat. Reads the handle structurally, so it works with `@langchain/react` 1.x and 2.0 under any
 * package alias, and with the 0.3.x hook (without selectors).
 */
export function useLangGraphChatThread(
  stream: ChatThreadStream,
  {
    selectors,
    hideMessage,
    messagesKey = 'messages',
    subagentTools,
  }: UseLangGraphChatThreadOptions = {}
): LangGraphChatThreadState {
  // Selectors come from a stable module-level object, so these calls never
  // change between renders.
  const queue = selectors?.useSubmissionQueue
    ? selectors.useSubmissionQueue(stream as never)
    : undefined;
  const interrupts = useMemo(
    () =>
      stream.interrupts ?? (stream.interrupt ? [stream.interrupt] : undefined),
    [stream.interrupts, stream.interrupt]
  );
  const model = useMemo(
    () =>
      toChatThread(
        {
          messages: stream.messages,
          toolCalls: stream.toolCalls,
          interrupts,
          values: stream.values,
          subagents: stream.subagents,
          queue: queue?.entries,
          isLoading: stream.isLoading,
          error: stream.error,
        },
        { hideMessage, messagesKey, subagentTools }
      ),
    [
      stream.messages,
      stream.toolCalls,
      interrupts,
      stream.values,
      stream.subagents,
      queue?.entries,
      stream.isLoading,
      stream.error,
      hideMessage,
      messagesKey,
      subagentTools,
    ]
  );

  const [stopping, setStopping] = useState(false);
  const [timings, setTimings] = useState<Record<string, TurnTiming>>({});
  // How many user turns existed when the reader last sent a message.
  const [userTurnsAtSend, setUserTurnsAtSend] = useState<number>();
  const [sentMessageId, setSentMessageId] = useState<string>();

  // Record when the newest turn starts and stops working.
  const lastTurn = model.turns.at(-1);
  const lastTiming = lastTurn ? timings[lastTurn.id] : undefined;
  if (lastTurn && stream.isLoading && !lastTiming) {
    setTimings({ ...timings, [lastTurn.id]: { startedAt: Date.now() } });
  } else if (
    lastTurn &&
    stream.isLoading &&
    lastTiming?.paused &&
    lastTiming.endedAt !== undefined
  ) {
    // Resuming after an interrupt: leave the wait out of the working time.
    setTimings({
      ...timings,
      [lastTurn.id]: {
        startedAt: lastTiming.startedAt + Date.now() - lastTiming.endedAt,
      },
    });
  } else if (
    lastTurn &&
    !stream.isLoading &&
    lastTiming &&
    lastTiming.endedAt === undefined
  ) {
    setTimings({
      ...timings,
      [lastTurn.id]: {
        startedAt: lastTiming.startedAt,
        endedAt: Date.now(),
        paused: model.interrupts.length > 0,
      },
    });
  } else if (
    lastTurn &&
    !stream.isLoading &&
    lastTiming &&
    !lastTiming.paused &&
    model.interrupts.length > 0
  ) {
    // The interrupt can arrive after the run reports it stopped.
    setTimings({ ...timings, [lastTurn.id]: { ...lastTiming, paused: true } });
  }
  // The first user turn to appear after a send is the reader's message.
  const userTurns = model.turns.filter((turn) => turn.user);
  if (userTurnsAtSend !== undefined && userTurns.length > userTurnsAtSend) {
    setSentMessageId(userTurns[userTurnsAtSend].id);
    setUserTurnsAtSend(undefined);
  }

  // Actions read the latest render through a ref, so they keep one identity
  // and hosts can list them as effect dependencies.
  const latest = useRef({
    stream,
    model,
    queue,
    messagesKey,
    userTurnCount: 0,
  });
  useLayoutEffect(() => {
    latest.current = {
      stream,
      model,
      queue,
      messagesKey,
      userTurnCount: userTurns.length,
    };
  });
  const actions = useMemo<ChatThreadActions>(() => {
    function submit(input: unknown, options?: object) {
      const { stream } = latest.current;
      return invoke(stream, stream.submit, input, options);
    }

    function resumeOne(id: string, value: unknown) {
      const { stream, model } = latest.current;
      const interrupt = model.interrupts.find((item) => item.id === id);
      // Generated IDs stand in for interrupts the server sent without one.
      const serverId =
        interrupt && isRecord(interrupt.raw) && interrupt.raw.id === id
          ? id
          : undefined;
      if (stream.respond) {
        return invoke(
          stream,
          stream.respond,
          value,
          serverId ? { interruptId: serverId } : undefined
        );
      }
      return submit(null, { command: { resume: value } });
    }

    return {
      async send(text) {
        const { stream, messagesKey, userTurnCount } = latest.current;
        setUserTurnsAtSend(userTurnCount);
        try {
          await submit(
            humanInput(text, messagesKey),
            stream.isLoading ? { multitaskStrategy: 'enqueue' } : undefined
          );
        } catch (error) {
          // Don't claim the next message from someone else as this one.
          setUserTurnsAtSend(undefined);
          throw error;
        }
      },
      async stop() {
        const { stream } = latest.current;
        setStopping(true);
        try {
          await invoke(stream, stream.stop);
        } finally {
          setStopping(false);
        }
      },
      async respond(interruptId, decisions) {
        const interrupt = latest.current.model.interrupts.find(
          (item) => item.id === interruptId
        );
        const value =
          interrupt?.kind === 'approval'
            ? toHumanInTheLoopResponse(interrupt, decisions)
            : decisions;
        await resumeOne(interruptId, value);
      },
      async resume(valuesById) {
        const { stream } = latest.current;
        const ids = Object.keys(valuesById);
        if (ids.length === 1) {
          await resumeOne(ids[0], valuesById[ids[0]]);
          return;
        }
        // Interrupts paused at one checkpoint must resume in one command.
        if (stream.respondAll) {
          await invoke(stream, stream.respondAll, valuesById);
          return;
        }
        await submit(null, { command: { resume: valuesById } });
      },
      async cancelQueued(id) {
        await latest.current.queue?.cancel(id);
      },
      async fork(text, forkPoint) {
        // 0.3.x forks from a checkpoint object; 1.x and 2.0 from its ID.
        await submit(
          humanInput(text, latest.current.messagesKey),
          latest.current.stream.getMessagesMetadata
            ? { checkpoint: forkPoint }
            : { forkFrom: forkPoint }
        );
      },
    };
  }, []);

  const hooks = useMemo(
    () => streamHooks(stream, selectors),
    [stream, selectors]
  );

  return useMemo(
    () => ({
      model,
      actions,
      stream,
      selectors,
      isThreadLoading: stream.isThreadLoading === true,
      stopping,
      timings,
      sentMessageId,
      ...hooks,
    }),
    [model, actions, stream, selectors, stopping, timings, sentMessageId, hooks]
  );
}

const EMPTY: readonly unknown[] = [];

/**
 * The controller's hooks for a stream. Which ones exist depends only on the
 * selectors, a module-level object, so it never changes between renders.
 */
function streamHooks(
  stream: ChatThreadStream,
  selectors: ChatThreadSelectors | undefined
): Pick<
  LangGraphChatThreadState,
  'useForkPoint' | 'useSubagentTranscript' | 'useSubagentStep'
> {
  const useMessages = selectors?.useMessages;
  const useToolCalls = selectors?.useToolCalls;

  function useForkPoint(turn: ChatThreadTurn) {
    return useLangGraphForkPoint(
      { stream, selectors },
      turn.user ? { id: turn.user.message.id, raw: turn.user.raw } : undefined
    );
  }

  function useSubagentTranscript(
    handle: unknown,
    running: boolean
  ): ChatThreadPart[] {
    const messages = useMessages
      ? useMessages(stream as never, handle as never)
      : EMPTY;
    const toolCalls = useToolCalls
      ? useToolCalls(stream as never, handle as never)
      : undefined;
    return useMemo(
      () =>
        toChatThread({ messages, toolCalls, isLoading: running }).turns.flatMap(
          (turn) => turn.parts
        ),
      [messages, toolCalls, running]
    );
  }

  function useSubagentStep(handle: unknown) {
    // Without a target the selector returns the root calls without
    // subscribing, so a finished subagent costs nothing.
    const calls = useToolCalls?.(stream as never, handle as never) as
      | { name?: string; args?: unknown; status?: string }[]
      | undefined;
    if (!handle || !calls?.length) return undefined;
    const current =
      [...calls].reverse().find((call) => call.status === 'running') ??
      calls.at(-1);
    return current?.name
      ? { name: current.name, args: current.args }
      : undefined;
  }

  return {
    useForkPoint,
    useSubagentTranscript: useMessages ? useSubagentTranscript : undefined,
    useSubagentStep: useToolCalls ? useSubagentStep : undefined,
  };
}

/**
 * The checkpoint to fork from to edit or retry a message, or undefined when
 * the stream can't fork. Uses `useMessageMetadata` when the app passes it
 * (1.x and 2.0), or the 0.3.x stream's own metadata.
 */
export function useLangGraphForkPoint(
  thread: Pick<LangGraphChatThreadState, 'stream' | 'selectors'>,
  message: { id: string; raw: unknown } | undefined
): unknown {
  const { stream, selectors } = thread;
  const metadata = selectors?.useMessageMetadata
    ? selectors.useMessageMetadata(stream as never, message?.id)
    : undefined;
  if (metadata?.parentCheckpointId) return metadata.parentCheckpointId;
  if (message && stream.getMessagesMetadata) {
    const legacy = (stream.getMessagesMetadata as AnyFunction).call(
      stream,
      message.raw
    );
    if (isRecord(legacy) && isRecord(legacy.firstSeenState)) {
      return legacy.firstSeenState.parent_checkpoint ?? undefined;
    }
  }
  return undefined;
}
