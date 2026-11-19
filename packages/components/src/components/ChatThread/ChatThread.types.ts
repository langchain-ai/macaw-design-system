import type { ReactElement } from 'react';

import type { ChatMessageModel, ChatMessageStatus } from '../ChatMessage';
import type { ChatPlanItem } from '../ChatPlan';
import type {
  ChatToolCallModel,
  ChatToolCallProps,
  ChatToolCallStatus,
} from '../ChatToolCall';

/**
 * The parts of a LangGraph `useStream` handle the chat reads. Every
 * `@langchain/react` 1.x and 2.0 handle fits, and so does the 0.3.x handle
 * from `@langchain/langgraph-sdk/react`. Macaw never imports the SDK, so the
 * same code works whichever version or package alias an app installs.
 */
export interface ChatThreadStream {
  readonly messages: readonly unknown[];
  readonly values?: unknown;
  /** 1.x: live tool calls with `running`, `finished`, or `error` status. */
  readonly toolCalls?: readonly unknown[];
  readonly interrupts?: readonly unknown[];
  readonly interrupt?: unknown;
  /** 1.x: subagents keyed by the ID of the tool call that started them. */
  readonly subagents?: ReadonlyMap<string, unknown>;
  readonly isLoading: boolean;
  readonly isThreadLoading?: boolean;
  readonly error?: unknown;
  // Methods, so handles whose parameters are narrower still fit.
  submit(input: unknown, options?: never): unknown;
  stop(options?: never): unknown;
  /** 1.x: resumes an interrupt by ID. 0.3.x resumes through `submit`. */
  respond?(response: unknown, options?: never): unknown;
  respondAll?(responsesById: Record<string, unknown>, options?: never): unknown;
  /** 0.3.x: checkpoint metadata used to edit and retry. */
  getMessagesMetadata?(message: never, index?: number): unknown;
}

/**
 * Selector hooks from `@langchain/react` 1.x or 2.0, passed in from the app's
 * own import so Macaw never depends on a version or alias. Each is optional
 * and turns on one feature. Pass a module-level object; it must not change
 * between renders.
 */
export interface ChatThreadSelectors {
  /** Queued messages and cancel. */
  useSubmissionQueue?: (stream: never) => {
    readonly entries: readonly unknown[];
    cancel(id: string): Promise<boolean> | unknown;
  };
  /** Edit and retry, by forking from a message's checkpoint. */
  useMessageMetadata?: (
    stream: never,
    messageId: string | undefined
  ) => { readonly parentCheckpointId?: string } | undefined;
  /** A subagent's own messages, shown when its card is expanded. */
  useMessages?: (stream: never, target?: never) => readonly unknown[];
  /** A subagent's current step and tool calls. */
  useToolCalls?: (stream: never, target?: never) => readonly unknown[];
}

/** What `toChatThread` reads; the field names match `useStream`. */
export interface ChatThreadSnapshot {
  messages: readonly unknown[];
  toolCalls?: readonly unknown[];
  interrupts?: readonly unknown[];
  values?: unknown;
  subagents?: ReadonlyMap<string, unknown>;
  /** Submission queue entries, such as `useSubmissionQueue(stream).entries`. */
  queue?: readonly unknown[];
  isLoading?: boolean;
  error?: unknown;
}

export interface ToChatThreadOptions {
  /** Message state key, matching `useStream`. Defaults to `messages`. */
  messagesKey?: string;
  /** Hide internal messages, such as ones with a reserved ID prefix. */
  hideMessage?: (message: unknown) => boolean;
  /** Tool calls that start a subagent. Defaults to deep agents' `task`. */
  subagentTools?: readonly string[];
}

/**
 * The original messages behind a part, for renderers that need fields Macaw
 * doesn't map, such as provider-specific content blocks or artifacts.
 */
export interface ChatThreadPartSource {
  /** The AI message the part came from. */
  message: unknown;
  /** The tool result message, once the call returns. */
  result?: unknown;
}

/** A delegated subagent run, such as a deep agent's `task` call. */
export interface ChatThreadSubagent {
  /** The ID of the tool call that started it. */
  id: string;
  /** The subagent's type or name, such as "researcher". */
  name: string;
  /** The task it was given. */
  task?: string;
  status: ChatToolCallStatus;
  elapsedMs?: number;
  /** Wall-clock start, when the stream reports one. */
  startedAt?: Date | number;
}

export type ChatThreadPart = (
  | { type: 'text'; id: string; text: string; streaming: boolean }
  | { type: 'reasoning'; id: string; text: string; streaming: boolean }
  | {
      type: 'tool-call';
      id: string;
      toolCall: ChatToolCallModel;
      /** The pending interrupt that gates this call. */
      interruptId?: string;
    }
  | {
      type: 'subagent';
      id: string;
      subagent: ChatThreadSubagent;
      /** The subagent's final answer, once it returns. */
      result?: string;
      /**
       * The adapter's handle for the run, passed to the controller's subagent
       * hooks; `useLangGraphChatThread` uses the stream's subagent handle.
       */
      handle?: unknown;
      interruptId?: string;
    }
  | { type: 'image'; id: string; url: string }
) & { source: ChatThreadPartSource };

/** A human message and everything the agent did in response. */
export interface ChatThreadTurn {
  id: string;
  /** Missing when the agent spoke first. */
  user?: {
    message: ChatMessageModel;
    text: string;
    /** The original message, for checkpoint metadata. */
    raw: unknown;
  };
  /** The agent's reasoning, tool calls, subagents, and text, in order. */
  parts: ChatThreadPart[];
  status: ChatMessageStatus;
  /** Tool calls and subagents in the turn. */
  actionCount: number;
  /** Set on a failed turn. */
  error?: string;
}

export type ChatThreadDecisionType = 'approve' | 'edit' | 'reject' | 'respond';

export interface ChatThreadActionRequest {
  name: string;
  args: Record<string, unknown>;
  description?: string;
  allowedDecisions: readonly ChatThreadDecisionType[];
  /** The tool call this request gates, when it is in the thread. */
  toolCallId?: string;
}

export type ChatThreadInterrupt =
  | {
      /** A human-in-the-loop middleware request: one decision per action. */
      kind: 'approval';
      id: string;
      requests: ChatThreadActionRequest[];
      /** Python graphs use snake_case payloads; JavaScript, camelCase. */
      casing: 'snake' | 'camel';
      raw: unknown;
    }
  | { kind: 'other'; id: string; value: unknown; raw: unknown };

export type ChatThreadDecision =
  | { type: 'approve' }
  | { type: 'edit'; args: Record<string, unknown> }
  | { type: 'reject'; message?: string }
  | { type: 'respond'; message: string };

export interface ChatThreadQueuedMessage {
  id: string;
  text: string;
}

export interface ChatThreadFile {
  path: string;
  modifiedAt?: string;
}

export interface ChatThreadModel {
  turns: ChatThreadTurn[];
  /** Pending interrupts, oldest first. */
  interrupts: ChatThreadInterrupt[];
  queued: ChatThreadQueuedMessage[];
  /** A deep agent's todos, from `values.todos`. */
  plan?: ChatPlanItem[];
  /** A deep agent's files, from `values.files`. */
  files?: ChatThreadFile[];
  status: 'idle' | 'running' | 'interrupted' | 'failed';
  error?: string;
}

export type ChatThreadToolPresentation = Pick<
  ChatToolCallProps,
  'label' | 'icon' | 'summary' | 'meta' | 'children'
>;

/**
 * Presents one tool by name. Return row props to keep the shared tool row,
 * your own element to replace it, or null to hide the call. `source` holds
 * the original messages for calls in the thread; approval cards and live
 * status lines render before a call has one.
 */
export type ChatThreadToolRenderer = (
  toolCall: ChatToolCallModel,
  source?: ChatThreadPartSource
) => ChatThreadToolPresentation | ReactElement | null;

/** What `ChatThread` can do on the reader's behalf; `useLangGraphChatThread` provides all of them. */
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
   * edit, or a retry with the original text.
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

/**
 * Everything `ChatThread` renders from and calls. `useLangGraphChatThread` builds one
 * from a LangGraph `useStream` handle; an app with its own stream or data
 * builds one itself. Only `model` and `actions.send` are required: leave out
 * an action or hook and the control or detail that needs it is hidden.
 */
export interface ChatThreadController {
  /** Render-ready turns, interrupts, queue, plan, and run status. */
  model: ChatThreadModel;
  /**
   * `send` is required. Without `stop` there's no Stop button, without
   * `cancelQueued` queued messages can't be cancelled, and without `fork`
   * there's no edit or retry. The built-in request cards answer through
   * `resume`.
   */
  actions: Pick<ChatThreadActions, 'send'> & Partial<ChatThreadActions>;
  /** Shows a loading placeholder in place of the conversation. */
  isThreadLoading?: boolean;
  /** A stop is pending. */
  stopping?: boolean;
  /** When each turn's work started and ended, for "Worked for 12s". */
  timings?: Readonly<Record<string, ChatThreadTiming>>;
  /** The message the reader sent most recently; it pins to the top. */
  sentMessageId?: string;
  /**
   * Hook returning the fork point for a turn's user message, or undefined
   * when it can't be edited or retried. Called once per user message, so
   * keep it present or absent for the life of the thread.
   */
  useForkPoint?: (turn: ChatThreadTurn) => unknown;
  /**
   * Hook returning a subagent's own parts, shown when its row is expanded.
   * Without it, subagent rows don't expand.
   */
  useSubagentTranscript?: (
    handle: unknown,
    running: boolean
  ) => ChatThreadPart[];
  /**
   * Hook returning the tool call a running subagent is on, for its row's
   * summary. Receives undefined once the subagent stops.
   */
  useSubagentStep?: (
    handle: unknown
  ) => { name: string; args?: unknown } | undefined;
}
