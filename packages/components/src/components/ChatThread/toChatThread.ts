import type { ChatMessageStatus } from '../ChatMessage';
import type { ChatPlanItem, ChatPlanItemStatus } from '../ChatPlan';
import type { ChatSubagentModel } from '../ChatSubagent';
import type { ChatToolCallStatus } from '../ChatToolCall';
import type {
  ChatThreadFile,
  ChatThreadInterrupt,
  ChatThreadModel,
  ChatThreadPart,
  ChatThreadQueuedMessage,
  ChatThreadSnapshot,
  ChatThreadTurn,
  ToChatThreadOptions,
} from './ChatThread.types';
import { parseInterrupt } from './interrupts';
import {
  isRecord,
  normalizeMessage,
  type MessageToolCall,
  type NormalizedMessage,
} from './messages';

const DEFAULT_SUBAGENT_TOOLS = ['task'];

interface LiveToolCall {
  status?: string;
  output?: unknown;
  error?: unknown;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function errorMessage(error: unknown) {
  if (error == null) return undefined;
  if (error instanceof Error) return error.message || 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (isRecord(error) && typeof error.message === 'string')
    return error.message;
  return 'Something went wrong.';
}

function toTime(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const time = Date.parse(value);
    return Number.isNaN(time) ? undefined : time;
  }
  return undefined;
}

function liveToolCalls(toolCalls: readonly unknown[] | undefined) {
  const byId = new Map<string, LiveToolCall>();
  for (const call of toolCalls ?? []) {
    if (!isRecord(call)) continue;
    const id = readString(call.callId) ?? readString(call.id);
    if (id) byId.set(id, call);
  }
  return byId;
}

function textFromValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const text = value
      .map((item) =>
        typeof item === 'string'
          ? item
          : isRecord(item) && typeof item.text === 'string'
            ? item.text
            : ''
      )
      .join('');
    return text || undefined;
  }
  return undefined;
}

function resultValue(
  message: NormalizedMessage | undefined,
  live?: LiveToolCall
) {
  if (message) {
    const content = isRecord(message.raw) ? message.raw.content : undefined;
    return textFromValue(content) ?? content;
  }
  return live?.output ?? undefined;
}

/**
 * Merges what the thread knows about a call: a tool result message settles
 * it, then the live tool stream, then whether a pending interrupt or an
 * active run is holding it. A call left without an outcome after the run
 * ends was canceled.
 */
function toolCallStatus({
  result,
  live,
  gated,
  runActive,
  paused,
}: {
  result?: NormalizedMessage;
  live?: LiveToolCall;
  gated: boolean;
  runActive: boolean;
  /** The run is waiting on an interrupt, so open calls haven't ended. */
  paused: boolean;
}): ChatToolCallStatus {
  if (result) return result.toolStatus === 'error' ? 'failed' : 'succeeded';
  if (live?.status === 'finished') return 'succeeded';
  if (live?.status === 'error') return 'failed';
  if (gated) return 'input-required';
  if (live?.status === 'running' || runActive) return 'running';
  return paused ? 'pending' : 'canceled';
}

function planFromValues(values: unknown): ChatPlanItem[] | undefined {
  if (!isRecord(values) || !Array.isArray(values.todos)) return undefined;
  const items = values.todos.flatMap((todo, index): ChatPlanItem[] => {
    if (!isRecord(todo) || typeof todo.content !== 'string') return [];
    const status: ChatPlanItemStatus =
      todo.status === 'completed'
        ? 'completed'
        : todo.status === 'in_progress' || todo.status === 'in-progress'
          ? 'in-progress'
          : 'pending';
    // Deep agents rewrite the whole list, so position is the stable identity.
    return [{ id: `todo-${index}`, label: todo.content, status }];
  });
  return items.length ? items : undefined;
}

function filesFromValues(values: unknown): ChatThreadFile[] | undefined {
  if (!isRecord(values) || !isRecord(values.files)) return undefined;
  const files = Object.entries(values.files).map(([path, data]) => ({
    path,
    modifiedAt: isRecord(data) ? readString(data.modified_at) : undefined,
  }));
  return files.length ? files : undefined;
}

function queuedFromEntries(queue: readonly unknown[] | undefined) {
  return (queue ?? []).flatMap((entry): ChatThreadQueuedMessage[] => {
    if (!isRecord(entry) || typeof entry.id !== 'string') return [];
    const values = isRecord(entry.values) ? entry.values : undefined;
    const messages = Array.isArray(values?.messages) ? values.messages : [];
    const last = messages.at(-1);
    const text = last === undefined ? '' : normalizeMessage(last, 0).text;
    return [{ id: entry.id, text }];
  });
}

/** Matches each approval request to the call it gates, newest calls first. */
function anchorInterrupts(
  interrupts: ChatThreadInterrupt[],
  calls: { call: MessageToolCall; settled: boolean }[]
) {
  const gates = new Map<string, string>();
  for (const interrupt of interrupts) {
    if (interrupt.kind !== 'approval') continue;
    for (const request of interrupt.requests) {
      const open = calls.filter(
        ({ call, settled }) =>
          !settled && call.name === request.name && !gates.has(call.id)
      );
      const exact = open.find(
        ({ call }) => JSON.stringify(call.args) === JSON.stringify(request.args)
      );
      const match = exact ?? open[0];
      if (match) {
        gates.set(match.call.id, interrupt.id);
        request.toolCallId = match.call.id;
      }
    }
  }
  return gates;
}

function subagentModel({
  call,
  status,
  handle,
}: {
  call: MessageToolCall;
  status: ChatToolCallStatus;
  handle: unknown;
}): ChatSubagentModel {
  const args = isRecord(call.args) ? call.args : {};
  const snapshot = isRecord(handle) ? handle : {};
  const startedAt = toTime(snapshot.startedAt);
  const completedAt = toTime(snapshot.completedAt);
  const subagentStatus =
    snapshot.status === 'error'
      ? 'failed'
      : snapshot.status === 'complete' && status === 'running'
        ? 'succeeded'
        : status;
  return {
    id: call.id,
    name:
      readString(args.subagent_type) ??
      readString(args.subagentType) ??
      readString(snapshot.name) ??
      'subagent',
    task:
      readString(args.description) ??
      readString(snapshot.taskInput) ??
      undefined,
    status: subagentStatus,
    startedAt,
    elapsedMs:
      startedAt !== undefined && completedAt !== undefined
        ? completedAt - startedAt
        : undefined,
  };
}

/**
 * Turns LangGraph stream state into render-ready chat turns. Pure: it reads
 * plain values, so it works with `@langchain/react` 1.x and 2.0, the 0.3.x
 * hook, recorded fixtures, and tests alike.
 */
export function toChatThread(
  snapshot: ChatThreadSnapshot,
  {
    hideMessage,
    subagentTools = DEFAULT_SUBAGENT_TOOLS,
  }: ToChatThreadOptions = {}
): ChatThreadModel {
  const runActive = snapshot.isLoading === true;
  const messages = snapshot.messages
    .filter((message) => !hideMessage?.(message))
    .map(normalizeMessage);
  const results = new Map<string, NormalizedMessage>();
  for (const message of messages) {
    if (message.kind === 'tool' && message.toolCallId) {
      results.set(message.toolCallId, message);
    }
  }
  const live = liveToolCalls(snapshot.toolCalls);
  const interrupts = (snapshot.interrupts ?? []).map(parseInterrupt);
  const gates = anchorInterrupts(
    interrupts,
    messages.flatMap((message) =>
      message.toolCalls.map((call) => ({
        call,
        settled: results.has(call.id),
      }))
    )
  );
  const subagentNames = new Set(subagentTools);
  const error = errorMessage(snapshot.error);

  const turns: ChatThreadTurn[] = [];
  let lastAiIndex = -1;
  messages.forEach((message, index) => {
    if (message.kind === 'ai') lastAiIndex = index;
  });
  messages.forEach((message, index) => {
    if (message.kind === 'human') {
      turns.push({
        id: message.id,
        user: {
          message: {
            id: message.id,
            role: 'user',
            status: 'completed',
            content: [
              {
                id: `${message.id}:text`,
                type: 'text',
                text: message.text,
                appearance: 'bubble',
              },
            ],
          },
          text: message.text,
          raw: message.raw,
        },
        parts: [],
        status: 'completed',
        actionCount: 0,
      });
      return;
    }
    if (message.kind !== 'ai') return;
    if (turns.length === 0) {
      turns.push({
        id: message.id,
        parts: [],
        status: 'completed',
        actionCount: 0,
      });
    }
    const turn = turns[turns.length - 1];
    const latest = runActive && index === lastAiIndex;
    if (message.reasoning) {
      turn.parts.push({
        type: 'reasoning',
        id: `${message.id}:reasoning`,
        text: message.reasoning,
        streaming: latest && !message.text && message.toolCalls.length === 0,
      });
    }
    if (message.text) {
      turn.parts.push({
        type: 'text',
        id: `${message.id}:text`,
        text: message.text,
        streaming: latest && message.toolCalls.length === 0,
      });
    }
    for (const url of message.images) {
      turn.parts.push({
        type: 'image',
        id: `${message.id}:image:${url.length}`,
        url,
      });
    }
    for (const call of message.toolCalls) {
      const result = results.get(call.id);
      const liveCall = live.get(call.id);
      const interruptId = gates.get(call.id);
      const status = toolCallStatus({
        result,
        live: liveCall,
        gated: interruptId !== undefined,
        runActive,
        paused: interrupts.length > 0,
      });
      const value = resultValue(result, liveCall);
      turn.actionCount += 1;
      if (subagentNames.has(call.name)) {
        const handle = snapshot.subagents?.get(call.id);
        turn.parts.push({
          type: 'subagent',
          id: call.id,
          subagent: subagentModel({ call, status, handle }),
          result: textFromValue(value),
          handle,
          interruptId,
        } satisfies ChatThreadPart);
        continue;
      }
      turn.parts.push({
        type: 'tool-call',
        id: call.id,
        interruptId,
        toolCall: {
          id: call.id,
          name: call.name,
          status,
          args: call.args,
          result: status === 'failed' ? undefined : value,
          error:
            status === 'failed'
              ? (value ?? errorMessage(liveCall?.error))
              : undefined,
        },
      });
    }
  });

  const pendingInterrupts = interrupts.length > 0;
  const lastTurn = turns.at(-1);
  if (lastTurn) {
    lastTurn.status = runActive
      ? 'streaming'
      : pendingInterrupts
        ? 'interrupted'
        : error
          ? 'failed'
          : 'completed';
    if (!runActive && error) lastTurn.error = error;
  }

  return {
    turns,
    interrupts,
    queued: queuedFromEntries(snapshot.queue),
    plan: planFromValues(snapshot.values),
    files: filesFromValues(snapshot.values),
    status: runActive
      ? 'running'
      : pendingInterrupts
        ? 'interrupted'
        : error
          ? 'failed'
          : 'idle',
    error,
  };
}

export type { ChatMessageStatus };
