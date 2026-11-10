import { Fragment, type ReactNode, useMemo, useState } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
  type ChatComposerProps,
} from '../ChatComposer';
import { ChatConversation } from '../ChatConversation';
import {
  ChatMessage,
  ChatMessageActions,
  type ChatMessageActionCapabilities,
  type ChatMessageContentBlock,
} from '../ChatMessage';
import { ChatPlan } from '../ChatPlan';
import { ChatState } from '../ChatState';
import { copyToClipboard } from '../CopyButton';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import type {
  ChatThreadInterrupt,
  ChatThreadSubagent,
  ChatThreadToolRenderer,
  ChatThreadTurn,
} from './ChatThread.types';
import {
  splitParts,
  ThreadContext,
  type ThreadContextValue,
  useThread,
} from './ChatThreadContext';
import { InterruptRequests } from './ChatThreadRequests';
import { visibleActionCount, WorkParts, WorkSummary } from './ChatThreadWork';
import { deepAgentTools } from './deepAgentTools';
import {
  type ChatThreadState,
  useChatThread,
  useChatThreadForkPoint,
  type UseChatThreadOptions,
} from './useChatThread';

/** Chat answers are bounded, so Markdown renders up to this many characters. */
const MAX_ANSWER_MARKDOWN = 100_000;

function UserMessage({ turn }: { turn: ChatThreadTurn }) {
  const { thread } = useThread();
  const user = turn.user;
  const forkPoint = useChatThreadForkPoint(
    thread,
    user ? { id: user.message.id, raw: user.raw } : undefined
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  if (!user) return null;
  const busy = thread.model.status === 'running';

  if (editing) {
    const save = () => {
      const text = draft.trim();
      if (!text) return;
      setEditing(false);
      void thread.actions.fork(text, forkPoint);
    };
    return (
      <div
        data-chat-message-id={user.message.id}
        className="ml-auto flex w-full max-w-[85%] flex-col gap-space-2 rounded-lg border border-focus bg-elevated p-space-2 duration-normal ease-out animate-in fade-in zoom-in-95 motion-reduce:animate-none"
      >
        <Textarea
          variant="plain"
          aria-label="Edit message"
          value={draft}
          onChange={setDraft}
          rows={3}
          resize="vertical"
          autoFocus
        />
        <div className="flex justify-end gap-space-2">
          <Button
            size="sm"
            variant="plain"
            color="secondary"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button size="sm" disabled={!draft.trim()} onClick={save}>
            Send
          </Button>
        </div>
      </div>
    );
  }

  const actions: ChatMessageActionCapabilities = {
    copy: { onClick: () => void copyToClipboard(user.text) },
  };
  if (forkPoint !== undefined) {
    actions.edit = {
      onClick: () => {
        setDraft(user.text);
        setEditing(true);
      },
    };
    actions.retry = {
      onClick: () => void thread.actions.fork(user.text, forkPoint),
    };
  }
  return (
    <ChatMessage
      message={user.message}
      footer={<ChatMessageActions actions={actions} readOnly={busy} />}
    />
  );
}

function AgentMessage({
  turn,
  isLast,
}: {
  turn: ChatThreadTurn;
  isLast: boolean;
}) {
  const { thread, agentName, tools } = useThread();
  const { work, answer } = splitParts(turn.parts);
  const actionCount = visibleActionCount(work, tools);
  const hasActions = actionCount > 0;
  const showInterrupts = isLast && thread.model.interrupts.length > 0;
  const blocks: ChatMessageContentBlock[] = [];

  if (work.length > 0) {
    blocks.push({
      id: 'work',
      type: 'custom',
      content: hasActions ? (
        <WorkSummary turn={turn} parts={work} count={actionCount} />
      ) : (
        <div className="flex min-w-0 flex-col gap-0.5">
          <WorkParts parts={work} />
        </div>
      ),
    });
  }
  if (showInterrupts) {
    blocks.push({
      id: 'interrupts',
      type: 'custom',
      content: <InterruptRequests />,
    });
  }
  for (const part of answer) {
    if (part.type !== 'text') continue;
    blocks.push({
      id: part.id,
      type: 'custom',
      content: (
        <MarkdownDisplay
          content={part.text}
          isStreaming={part.streaming}
          maxMarkdownLength={MAX_ANSWER_MARKDOWN}
        />
      ),
    });
  }
  if (turn.error) {
    blocks.push({
      id: 'error',
      type: 'custom',
      content: (
        <div className="flex min-w-0 items-start gap-space-2 rounded-lg bg-error-subtle px-space-3 py-space-2">
          <ChatState
            status="failed"
            variant="simple"
            showElapsed={false}
            announce={false}
          />
          <Text
            variant="sm"
            color="error"
            className="min-w-0 [overflow-wrap:anywhere]"
          >
            {turn.error}
          </Text>
        </div>
      ),
    });
  }

  const answerText = answer
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('\n\n')
    .trim();
  return (
    <ChatMessage
      message={{
        id: `${turn.id}:agent`,
        role: 'assistant',
        // A paused turn is waiting on the reader, not broken; the work
        // summary and the request below it say so.
        status: turn.status === 'interrupted' ? 'idle' : turn.status,
        content: blocks,
      }}
      name={agentName}
      isLatest={isLast}
      footer={
        answerText ? (
          <ChatMessageActions
            status={turn.status}
            actions={{
              copy: { onClick: () => void copyToClipboard(answerText) },
            }}
          />
        ) : undefined
      }
    />
  );
}

function ThreadComposer({ placeholder }: { placeholder?: string }) {
  const { thread } = useThread();
  const { model, actions, stopping } = thread;
  const [draft, setDraft] = useState('');
  const running = model.status === 'running';
  const waiting = model.status === 'interrupted';
  const actionProps: Pick<ChatComposerProps, 'action' | 'onStop'> = stopping
    ? { action: 'stopping' }
    : running && !draft.trim()
      ? { action: 'stop', onStop: () => void actions.stop() }
      : { action: 'send' };
  const plan = model.plan;
  const showPlan =
    plan !== undefined &&
    (running || plan.some((item) => item.status !== 'completed'));

  return (
    <ChatComposer
      {...(actionProps as ChatComposerProps)}
      drawer={
        showPlan ? <ChatPlan items={plan} presentation="drawer" /> : undefined
      }
      // A pending request has to be answered before the agent can continue.
      submitDisabled={!draft.trim() || waiting}
      onSubmit={() => {
        const text = draft.trim();
        if (!text) return;
        setDraft('');
        actions.send(text).catch(() => {
          // Keep the message if it couldn't be sent.
          setDraft((current) => current || text);
        });
      }}
    >
      <ChatComposerInput
        value={draft}
        onChange={setDraft}
        aria-label="Message"
        placeholder={
          placeholder ??
          (waiting
            ? 'Answer the request above to continue'
            : running
              ? 'Queue a follow-up'
              : 'Message the agent')
        }
      />
      <ChatComposerToolbar />
    </ChatComposer>
  );
}

const ANNOUNCEMENTS = {
  idle: 'Response complete',
  failed: 'Response failed',
  interrupted: 'The agent is waiting for your input',
  running: '',
} as const;

function useStatusAnnouncement(status: keyof typeof ANNOUNCEMENTS) {
  const [previous, setPrevious] = useState(status);
  const [announcement, setAnnouncement] = useState('');
  if (status !== previous) {
    setPrevious(status);
    setAnnouncement(previous === 'running' ? ANNOUNCEMENTS[status] : '');
  }
  return announcement;
}

export interface ChatThreadProps {
  /** The state from `useChatThread`. */
  thread: ChatThreadState;
  /** Tool presentations by tool name, applied over `deepAgentTools`. */
  tools?: Record<string, ChatThreadToolRenderer>;
  /**
   * Renders an interrupt yourself, such as a sign-in prompt. Return
   * undefined to use the default approval, reply, or response card.
   */
  renderInterrupt?: (
    interrupt: ChatThreadInterrupt,
    thread: ChatThreadState
  ) => ReactNode | undefined;
  /** Opens a subagent's full thread, such as in a side pane. */
  onOpenSubagent?: (subagent: ChatThreadSubagent) => void;
  /** Names the agent in its message headers. */
  agentName?: string;
  /** Fixed content above the conversation. */
  header?: ReactNode;
  /** Shown before the first message. */
  emptyState?: ReactNode;
  /** Composer placeholder; defaults follow the run's state. */
  placeholder?: string;
  /** Names the conversation region. */
  label?: string;
  className?: string;
}

/**
 * A complete agent conversation built from Macaw chat parts: messages,
 * reasoning, tool calls, subagents, approvals, the plan, queued messages,
 * and the composer, all driven by `useChatThread`.
 */
export function ChatThread({
  thread,
  tools,
  renderInterrupt,
  onOpenSubagent,
  agentName,
  header,
  emptyState,
  placeholder,
  label = 'Agent conversation',
  className,
}: ChatThreadProps) {
  const toolPresentations = useMemo(
    () => ({ ...deepAgentTools, ...tools }),
    [tools]
  );
  const { model, isThreadLoading, actions } = thread;
  const announcement = useStatusAnnouncement(model.status);
  const context = useMemo<ThreadContextValue>(
    () => ({
      thread,
      tools: toolPresentations,
      agentName,
      renderInterrupt,
      onOpenSubagent,
    }),
    [thread, toolPresentations, agentName, renderInterrupt, onOpenSubagent]
  );
  const lastTurn = model.turns.at(-1);
  // A run that has started but not produced output yet still shows the
  // agent's message, so its status reads "Responding".
  const needsAgentMessage = (turn: ChatThreadTurn, isLast: boolean) =>
    turn.parts.length > 0 ||
    Boolean(turn.error) ||
    (isLast && (turn.status === 'streaming' || model.interrupts.length > 0));

  return (
    <ThreadContext.Provider value={context}>
      <ChatConversation
        label={label}
        header={header}
        footer={<ThreadComposer placeholder={placeholder} />}
        className={className}
      >
        {isThreadLoading ? (
          <div
            role="status"
            aria-label="Loading conversation"
            className="flex flex-col gap-space-4"
          >
            <Skeleton className="ml-auto h-9 w-1/3 rounded-lg" />
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/2" />
          </div>
        ) : model.turns.length === 0 &&
          model.queued.length === 0 &&
          model.interrupts.length === 0 ? (
          emptyState
        ) : (
          <>
            {model.turns.length === 0 && model.interrupts.length > 0 && (
              // A request can arrive before any message, such as one the
              // graph raises at its first step.
              <AgentMessage
                turn={{
                  id: 'request',
                  parts: [],
                  status: 'interrupted',
                  actionCount: 0,
                }}
                isLast
              />
            )}
            {model.turns.map((turn) => {
              const isLast = turn === lastTurn;
              return (
                <Fragment key={turn.id}>
                  <UserMessage turn={turn} />
                  {needsAgentMessage(turn, isLast) && (
                    <AgentMessage turn={turn} isLast={isLast} />
                  )}
                </Fragment>
              );
            })}
            {model.queued.map((queued) => (
              <ChatMessage
                key={queued.id}
                className={cn(
                  'duration-normal ease-out animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none'
                )}
                message={{
                  id: queued.id,
                  role: 'user',
                  status: 'queued',
                  content: [
                    {
                      id: 'text',
                      type: 'text',
                      text: queued.text,
                      appearance: 'bubble',
                    },
                  ],
                }}
                footer={
                  <ChatMessageActions
                    status="queued"
                    actions={{
                      cancel: {
                        onClick: () => void actions.cancelQueued(queued.id),
                      },
                    }}
                  />
                }
              />
            ))}
          </>
        )}
      </ChatConversation>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </ThreadContext.Provider>
  );
}

export interface LangGraphChatProps
  extends Omit<ChatThreadProps, 'thread'>, UseChatThreadOptions {
  /** A `useStream` handle from `@langchain/react` (1.x, 2.0) or the 0.3.x hook. */
  stream: Parameters<typeof useChatThread>[0];
}

/**
 * A drop-in agent chat for a LangGraph `useStream` handle: `useChatThread`
 * and `ChatThread` together. The app creates the stream, so it keeps
 * ownership of the client, auth, and thread selection.
 */
export function LangGraphChat({
  stream,
  selectors,
  hideMessage,
  subagentTools,
  ...props
}: LangGraphChatProps) {
  const thread = useChatThread(stream, {
    selectors,
    hideMessage,
    subagentTools,
  });
  return <ChatThread thread={thread} {...props} />;
}
