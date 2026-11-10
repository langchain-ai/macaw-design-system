import type { ReactElement } from 'react';

import type { ChatMessageModel, ChatMessageStatus } from '../ChatMessage';
import type { ChatPlanItem } from '../ChatPlan';
import type { ChatSubagentModel } from '../ChatSubagent';
import type { ChatToolCallModel, ChatToolCallProps } from '../ChatToolCall';

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
  /** Hide internal messages, such as ones with a reserved ID prefix. */
  hideMessage?: (message: unknown) => boolean;
  /** Tool calls that start a subagent. Defaults to deep agents' `task`. */
  subagentTools?: readonly string[];
}

export type ChatThreadPart =
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
      subagent: ChatSubagentModel;
      /** The subagent's final answer, once it returns. */
      result?: string;
      /** The stream's subagent handle; selectors scope to it. */
      handle?: unknown;
      interruptId?: string;
    }
  | { type: 'image'; id: string; url: string };

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
  'label' | 'icon' | 'summary' | 'meta' | 'children' | 'keepMounted'
>;

/**
 * Presents one tool by name. Return row props to keep the shared tool row,
 * your own element to replace it, or null to hide the call.
 */
export type ChatThreadToolRenderer = (
  toolCall: ChatToolCallModel
) => ChatThreadToolPresentation | ReactElement | null;
