import { useMemo, useState } from 'react';

import type {
  ChatThreadDecision,
  ChatThreadModel,
  ChatThreadSelectors,
  ChatThreadStream,
  ToChatThreadOptions,
} from './ChatThread.types';
import { toHumanInTheLoopResponse } from './interrupts';
import { isRecord } from './messages';
import { toChatThread } from './toChatThread';

type AnyFunction = (...args: unknown[]) => unknown;

function invoke(target: object, method: unknown, ...args: unknown[]) {
  return Promise.resolve((method as AnyFunction).apply(target, args));
}

function humanInput(text: string) {
  return { messages: [{ type: 'human', content: text }] };
}

export interface UseChatThreadOptions extends ToChatThreadOptions {
  /**
   * Selector hooks from the app's own `@langchain/react` import. Each one
   * turns on a feature: queued messages, edit and retry, and subagent
   * details. Pass a module-level object so it never changes.
   */
  selectors?: ChatThreadSelectors;
}

export interface ChatThreadActions {
  /** Sends a message, or queues it while a run is active. */
  send: (text: string) => Promise<void>;
  /** Stops the active run; `stopping` is true until it settles. */
  stop: () => Promise<void>;
  /** Answers a human-in-the-loop request: one decision per action. */
  respond: (
    interruptId: string,
    decisions: readonly ChatThreadDecision[]
  ) => Promise<void>;
  /** Resumes interrupts with raw values, together, keyed by interrupt ID. */
  resume: (valuesById: Record<string, unknown>) => Promise<void>;
  /** Removes a queued message before it sends. */
  cancelQueued: (id: string) => Promise<void>;
  /**
   * Sends `text` from an earlier checkpoint, replacing what followed it: an
   * edit, or a retry with the original text. Get the fork point for a message
   * with `useChatThreadForkPoint`.
   */
  fork: (text: string, forkPoint: unknown) => Promise<void>;
}

export interface ChatThreadTiming {
  /**
   * When the turn started working, moved later by any time it spent paused
   * on an interrupt, so `endedAt - startedAt` is the time spent working.
   */
  startedAt: number;
  endedAt?: number;
}

interface TurnTiming extends ChatThreadTiming {
  /** The turn stopped on an interrupt, so it resumes when the run does. */
  paused?: boolean;
}

export interface ChatThreadState {
  model: ChatThreadModel;
  actions: ChatThreadActions;
  stream: ChatThreadStream;
  selectors?: ChatThreadSelectors;
  isThreadLoading: boolean;
  stopping: boolean;
  /** When each turn's work started and ended, measured on this client. */
  timings: Readonly<Record<string, ChatThreadTiming>>;
  /** The message this reader sent most recently, such as one to pin. */
  sentMessageId?: string;
}

/**
 * Connects a LangGraph `useStream` handle to Macaw chat. Reads the handle
 * structurally, so it works with `@langchain/react` 1.x and 2.0 under any
 * package alias, and with the 0.3.x hook (without selectors).
 */
export function useChatThread(
  stream: ChatThreadStream,
  { selectors, hideMessage, subagentTools }: UseChatThreadOptions = {}
): ChatThreadState {
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
        { hideMessage, subagentTools }
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

  function submit(input: unknown, options?: object) {
    return invoke(stream, stream.submit, input, options);
  }

  function resumeOne(id: string, value: unknown) {
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

  const actions: ChatThreadActions = {
    async send(text) {
      setUserTurnsAtSend(userTurns.length);
      try {
        await submit(
          humanInput(text),
          stream.isLoading ? { multitaskStrategy: 'enqueue' } : undefined
        );
      } catch (error) {
        // Don't claim the next message from someone else as this one.
        setUserTurnsAtSend(undefined);
        throw error;
      }
    },
    async stop() {
      setStopping(true);
      try {
        await invoke(stream, stream.stop);
      } finally {
        setStopping(false);
      }
    },
    async respond(interruptId, decisions) {
      const interrupt = model.interrupts.find(
        (item) => item.id === interruptId
      );
      const value =
        interrupt?.kind === 'approval'
          ? toHumanInTheLoopResponse(interrupt, decisions)
          : decisions;
      await resumeOne(interruptId, value);
    },
    async resume(valuesById) {
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
      await queue?.cancel(id);
    },
    async fork(text, forkPoint) {
      // 0.3.x forks from a checkpoint object; 1.x and 2.0 from its ID.
      await submit(
        humanInput(text),
        stream.getMessagesMetadata
          ? { checkpoint: forkPoint }
          : { forkFrom: forkPoint }
      );
    },
  };

  return {
    model,
    actions,
    stream,
    selectors,
    isThreadLoading: stream.isThreadLoading === true,
    stopping,
    timings,
    sentMessageId,
  };
}

/**
 * The checkpoint to fork from to edit or retry a message, or undefined when
 * the stream can't fork. Uses `useMessageMetadata` when the app passes it
 * (1.x and 2.0), or the 0.3.x stream's own metadata.
 */
export function useChatThreadForkPoint(
  thread: Pick<ChatThreadState, 'stream' | 'selectors'>,
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
