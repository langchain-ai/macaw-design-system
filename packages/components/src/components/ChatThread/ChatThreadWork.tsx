import { type ReactNode, useMemo, useState } from 'react';

import { formatChatDuration } from '../ChatState';
import { ChatSubagent, ChatSubagentGroup } from '../ChatSubagent';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallModel,
} from '../ChatToolCall';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { Text } from '../Text';
import type {
  ChatThreadPart,
  ChatThreadToolRenderer,
  ChatThreadTurn,
} from './ChatThread.types';
import { plainText, present, useThread } from './ChatThreadContext';
import { describeToolCall } from './deepAgentTools';
import { toChatThread } from './toChatThread';

function ToolCallPart({ toolCall }: { toolCall: ChatToolCallModel }) {
  const { tools } = useThread();
  const presentation = present(tools, toolCall);
  if (presentation.kind === 'hidden') return null;
  if (presentation.kind === 'element') return presentation.element;
  return <ChatToolCall toolCall={toolCall} {...presentation.props} />;
}

function SubagentTranscript({
  handle,
  running,
}: {
  handle: unknown;
  running: boolean;
}) {
  const { thread, tools } = useThread();
  const { stream, selectors } = thread;
  const messages = selectors?.useMessages
    ? selectors.useMessages(stream as never, handle as never)
    : [];
  const toolCalls = selectors?.useToolCalls
    ? selectors.useToolCalls(stream as never, handle as never)
    : undefined;
  const model = useMemo(
    () => toChatThread({ messages, toolCalls, isLoading: running }),
    [messages, toolCalls, running]
  );
  const parts = model.turns.flatMap((turn) => turn.parts);
  if (parts.length === 0) {
    return (
      <Text variant="xs" color="tertiary">
        {running ? 'Starting…' : 'No activity recorded.'}
      </Text>
    );
  }
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {parts.map((part) =>
        part.type === 'tool-call' ? (
          <ToolCallPart key={part.id} toolCall={part.toolCall} />
        ) : part.type === 'text' ? (
          <MarkdownDisplay
            key={part.id}
            content={part.text}
            isStreaming={part.streaming}
            textColor="secondary"
            className="py-space-1 text-xs"
          />
        ) : part.type === 'subagent' ? (
          <Text key={part.id} variant="xs" color="secondary">
            {describeToolCall(
              'task',
              { description: part.subagent.task },
              tools
            )}
          </Text>
        ) : null
      )}
    </div>
  );
}

function SubagentPart({
  part,
}: {
  part: Extract<ChatThreadPart, { type: 'subagent' }>;
}) {
  const { thread, tools, onOpenSubagent } = useThread();
  const { stream, selectors } = thread;
  const running = part.subagent.status === 'running';
  // While running, follow the subagent's own tool calls for its current
  // step. Without a target the selector returns the root calls without
  // subscribing, so a finished subagent costs nothing.
  const liveCalls = selectors?.useToolCalls
    ? selectors.useToolCalls(
        stream as never,
        (running && part.handle ? part.handle : undefined) as never
      )
    : undefined;
  let activity: string | undefined;
  if (running && part.handle && liveCalls?.length) {
    const calls = liveCalls as {
      name?: string;
      args?: unknown;
      status?: string;
    }[];
    const current =
      [...calls].reverse().find((call) => call.status === 'running') ??
      calls.at(-1);
    if (current?.name)
      activity = describeToolCall(current.name, current.args, tools);
  }
  const canExpand = Boolean(selectors?.useMessages && part.handle);
  return (
    <ChatSubagent
      subagent={part.subagent}
      activity={activity ?? (running ? 'Working' : undefined)}
      result={part.result ? plainText(part.result) : undefined}
      onOpen={onOpenSubagent ? () => onOpenSubagent(part.subagent) : undefined}
    >
      {canExpand ? (
        <SubagentTranscript handle={part.handle} running={running} />
      ) : undefined}
    </ChatSubagent>
  );
}

export function WorkParts({ parts }: { parts: ChatThreadPart[] }) {
  const nodes: ReactNode[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (part.type === 'subagent') {
      // Subagents started together sit side by side.
      const run: Extract<ChatThreadPart, { type: 'subagent' }>[] = [];
      while (parts[index]?.type === 'subagent') {
        run.push(parts[index] as Extract<ChatThreadPart, { type: 'subagent' }>);
        index += 1;
      }
      index -= 1;
      nodes.push(
        <div key={run[0].id} className="py-space-1">
          {run.length > 1 ? (
            <ChatSubagentGroup label={`${run.length} subagents`}>
              {run.map((item) => (
                <SubagentPart key={item.id} part={item} />
              ))}
            </ChatSubagentGroup>
          ) : (
            <SubagentPart part={run[0]} />
          )}
        </div>
      );
      continue;
    }
    if (part.type === 'tool-call') {
      nodes.push(<ToolCallPart key={part.id} toolCall={part.toolCall} />);
    } else if (part.type === 'reasoning') {
      nodes.push(
        <ChatToolCallReasoning
          key={part.id}
          status={part.streaming ? 'streaming' : 'completed'}
          label={part.streaming ? 'Thinking' : 'Thought process'}
          expandWhileStreaming
        >
          <MarkdownDisplay
            content={part.text}
            isStreaming={part.streaming}
            textColor="tertiary"
            className="text-xs"
          />
        </ChatToolCallReasoning>
      );
    } else if (part.type === 'text') {
      // Narration between steps, such as "Checking the tests next."
      nodes.push(
        <MarkdownDisplay
          key={part.id}
          content={part.text}
          isStreaming={part.streaming}
          textColor="secondary"
          className="px-space-1 py-space-1 text-xs"
        />
      );
    } else if (part.type === 'image') {
      nodes.push(<ImagePart key={part.id} url={part.url} />);
    }
  }
  return <>{nodes}</>;
}

function ImagePart({ url }: { url: string }) {
  // Generated images arrive inline; remote URLs stay links so they aren't
  // fetched without the reader's action.
  if (!url.startsWith('data:image/')) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-brand-primary underline"
      >
        Open image
      </a>
    );
  }
  return (
    <img
      src={url}
      alt="Image from the agent"
      className="max-h-80 w-auto max-w-full rounded-lg border border-subtle"
    />
  );
}

export function visibleActionCount(
  parts: ChatThreadPart[],
  tools: Record<string, ChatThreadToolRenderer>
) {
  return parts.filter(
    (part) =>
      part.type === 'subagent' ||
      (part.type === 'tool-call' &&
        present(tools, part.toolCall).kind !== 'hidden')
  ).length;
}

export function WorkSummary({
  turn,
  parts,
  count,
}: {
  turn: ChatThreadTurn;
  parts: ChatThreadPart[];
  count: number;
}) {
  const { thread } = useThread();
  const timing = thread.timings[turn.id];
  const working = turn.status === 'streaming';
  const waiting = turn.status === 'interrupted';
  const [readerChoice, setReaderChoice] = useState<boolean>();
  const actions = `${count} ${count === 1 ? 'action' : 'actions'}`;
  const duration =
    timing?.endedAt !== undefined
      ? formatChatDuration(timing.endedAt - timing.startedAt)
      : undefined;
  const label = working
    ? 'Working'
    : waiting
      ? `Waiting for you · ${actions}`
      : turn.status === 'failed'
        ? `Stopped · ${actions}`
        : duration
          ? `Worked for ${duration} · ${actions}`
          : actions;

  return (
    <ChatToolCallGroup
      label={label}
      // Open while the agent works or waits, so progress stays in view;
      // closed once it's done, unless the reader chose otherwise.
      expanded={readerChoice ?? (working || waiting)}
      onExpandedChange={setReaderChoice}
      showElapsed={working}
      startedAt={working ? timing?.startedAt : undefined}
    >
      <WorkParts parts={parts} />
    </ChatToolCallGroup>
  );
}
