import { type ReactNode, useMemo, useState } from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';

import { formatChatDuration } from '../ChatState';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallModel,
} from '../ChatToolCall';
import { IconButton } from '../IconButton';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { Text } from '../Text';
import type {
  ChatThreadPart,
  ChatThreadPartSource,
  ChatThreadToolRenderer,
  ChatThreadTurn,
} from './ChatThread.types';
import { plainText, present, useThread } from './ChatThreadContext';
import { describeToolCall } from './deepAgentTools';
import { toChatThread } from './toChatThread';

function ToolCallPart({
  toolCall,
  source,
}: {
  toolCall: ChatToolCallModel;
  source?: ChatThreadPartSource;
}) {
  const { tools } = useThread();
  const presentation = present(tools, toolCall, source);
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
          <ToolCallPart
            key={part.id}
            toolCall={part.toolCall}
            source={part.source}
          />
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

const SUBAGENT_ICON = <RobotIcon size={12} weight="regular" />;

/**
 * A subagent run as a tool row named for the subagent. It shows the current
 * step while it runs, and its own transcript in the details.
 */
function SubagentPart({
  part,
}: {
  part: Extract<ChatThreadPart, { type: 'subagent' }>;
}) {
  const { thread, tools, onOpenSubagent } = useThread();
  const { stream, selectors } = thread;
  const { subagent } = part;
  const running = subagent.status === 'running';
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
  const result = part.result ? plainText(part.result) : undefined;
  const canExpand = Boolean(selectors?.useMessages && part.handle);
  return (
    <ChatToolCall
      toolCall={{
        id: subagent.id,
        name: 'task',
        status: subagent.status,
        args: subagent.task ? { description: subagent.task } : undefined,
        result,
        elapsedMs: subagent.elapsedMs,
      }}
      label={subagent.name}
      icon={SUBAGENT_ICON}
      summary={(running && activity) || subagent.task || null}
      meta={
        onOpenSubagent ? (
          <IconButton
            type="button"
            icon={ArrowSquareOutIcon}
            iconWeight="regular"
            size="xs"
            variant="plain"
            color="secondary"
            label={`Open ${subagent.name}`}
            onClick={() => onOpenSubagent(subagent)}
          />
        ) : undefined
      }
    >
      {canExpand ? (
        <div className="flex min-w-0 flex-col gap-space-1">
          <SubagentTranscript handle={part.handle} running={running} />
          {result && (
            <Text variant="xs" color="secondary" className="line-clamp-3">
              {result}
            </Text>
          )}
        </div>
      ) : undefined}
    </ChatToolCall>
  );
}

export function WorkParts({ parts }: { parts: ChatThreadPart[] }) {
  const nodes: ReactNode[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (part.type === 'subagent') {
      nodes.push(<SubagentPart key={part.id} part={part} />);
    } else if (part.type === 'tool-call') {
      nodes.push(
        <ToolCallPart
          key={part.id}
          toolCall={part.toolCall}
          source={part.source}
        />
      );
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

export function ImagePart({ url }: { url: string }) {
  // Generated images arrive inline; remote URLs stay links so they aren't
  // fetched without the reader's action. Other schemes come from model
  // output and aren't safe to link.
  if (!url.startsWith('data:image/')) {
    if (!/^https?:\/\//i.test(url)) return null;
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
        present(tools, part.toolCall, part.source).kind !== 'hidden')
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
      // Keeps the header working while the agent decides its next call.
      running={working}
      showElapsed={working}
      startedAt={working ? timing?.startedAt : undefined}
    >
      <WorkParts parts={parts} />
    </ChatToolCallGroup>
  );
}
