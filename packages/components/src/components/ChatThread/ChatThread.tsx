import { Fragment, type ReactNode, useMemo, useState } from 'react';

import { cn } from '../../utils/cn';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerInput,
  ChatComposerToolbar,
  type ChatComposerProps,
} from '../ChatComposer';
import { ChatConversation } from '../ChatConversation';
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageEditor,
  type ChatMessageActionCapabilities,
  type ChatMessageContentBlock,
} from '../ChatMessage';
import { ChatPlan } from '../ChatPlan';
import { copyToClipboard } from '../CopyButton';
import { ErrorMessage } from '../ErrorMessage';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { Skeleton } from '../Skeleton';
import type {
  ChatThreadController,
  ChatThreadInterrupt,
  ChatThreadStream,
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
import {
  ImagePart,
  visibleActionCount,
  WorkParts,
  WorkSummary,
} from './ChatThreadWork';
import { deepAgentTools } from './deepAgentTools';
import {
  useLangGraphChatThread,
  type UseLangGraphChatThreadOptions,
} from './useLangGraphChatThread';

/** Chat answers are bounded, so Markdown renders up to this many characters. */
const MAX_ANSWER_MARKDOWN = 100_000;

function UserMessage({ turn }: { turn: ChatThreadTurn }) {
  const { thread } = useThread();
  const user = turn.user;
  const forkPoint = thread.useForkPoint ? thread.useForkPoint(turn) : undefined;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  if (!user) return null;
  const busy = thread.model.status === 'running';
  const fork = forkPoint === undefined ? undefined : thread.actions.fork;

  const actions: ChatMessageActionCapabilities = {
    copy: { onClick: () => void copyToClipboard(user.text) },
  };
  if (fork) {
    actions.edit = {
      onClick: () => {
        setDraft(user.text);
        setEditing(true);
      },
    };
    actions.retry = {
      onClick: () => void fork(user.text, forkPoint),
    };
  }
  return (
    <ChatMessage
      message={user.message}
      editor={
        editing && fork ? (
          <ChatMessageEditor
            defaultValue={draft}
            onCancel={() => setEditing(false)}
            onSubmit={(text) => {
              setEditing(false);
              fork(text, forkPoint).catch(() => {
                // Reopen the edit so the reader can send it again.
                setDraft(text);
                setEditing(true);
              });
            }}
          />
        ) : undefined
      }
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
  // One progress indicator per message. "Responding" shows only until the
  // agent produces visible output, then the work owns progress (the group header, or
  // the streaming reasoning row when there are no actions). "Responding"
  // never comes back, so gaps between parts and short answers don't flash it.
  const working =
    turn.status === 'streaming' && work.length > 0 && answer.length === 0;
  // Tools a host hides with a null renderer don't count as output.
  const hasVisibleWork =
    hasActions || work.some((part) => part.type !== 'tool-call');
  // A failed turn's error message already says it failed.
  const showStatus = turn.error
    ? false
    : turn.status !== 'streaming' || (!hasVisibleWork && answer.length === 0);
  const showInterrupts = isLast && thread.model.interrupts.length > 0;
  const blocks: ChatMessageContentBlock[] = [];

  if (work.length > 0) {
    blocks.push({
      id: 'work',
      type: 'custom',
      content: hasActions ? (
        <WorkSummary
          turn={turn}
          parts={work}
          count={actionCount}
          working={working}
        />
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
    if (part.type === 'image') {
      blocks.push({
        id: part.id,
        type: 'custom',
        content: <ImagePart url={part.url} />,
      });
      continue;
    }
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
      content: <ErrorMessage message={turn.error} size="md" />,
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
      showStatus={showStatus}
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

type ComposerSlots = Pick<
  ChatThreadProps,
  'placeholder' | 'modelSelector' | 'composerTools' | 'composerActions'
>;

function ThreadComposer({
  placeholder,
  modelSelector,
  composerTools,
  composerActions,
}: ComposerSlots) {
  const { thread } = useThread();
  const { model, actions, stopping } = thread;
  const [draft, setDraft] = useState('');
  const running = model.status === 'running';
  const waiting = model.status === 'interrupted';
  const stop = actions.stop;
  const actionProps: Pick<ChatComposerProps, 'action' | 'onStop'> = stopping
    ? { action: 'stopping' }
    : running && stop && !draft.trim()
      ? { action: 'stop', onStop: () => void stop() }
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
      <ChatComposerToolbar
        modelSelector={modelSelector}
        actions={
          <>
            {composerActions}
            <ChatComposerAction />
          </>
        }
      >
        {composerTools}
      </ChatComposerToolbar>
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

interface ChatThreadViewProps {
  /** Tool presentations by tool name, applied over `deepAgentTools`. */
  tools?: Record<string, ChatThreadToolRenderer>;
  /**
   * Renders an interrupt yourself, such as a sign-in prompt. Return
   * undefined to use the default approval, reply, or response card.
   */
  renderInterrupt?: (
    interrupt: ChatThreadInterrupt,
    thread: ChatThreadController
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
  /** The composer's model picker, such as `ChatComposerModelSelect`. */
  modelSelector?: ReactNode;
  /** Composer tools before the model picker, such as an attachment menu. */
  composerTools?: ReactNode;
  /** Shown before Send/Stop, such as `ChatContextWindowPopover`. */
  composerActions?: ReactNode;
  /** Names the conversation region. */
  label?: string;
  className?: string;
}

/**
 * The default: a LangGraph `useStream` handle, adapted by
 * `useLangGraphChatThread`.
 */
export interface ChatThreadStreamProps
  extends ChatThreadViewProps, UseLangGraphChatThreadOptions {
  /** A `useStream` handle from `@langchain/react` (1.x, 2.0) or the 0.3.x hook. */
  stream: ChatThreadStream;
  thread?: never;
}

/** Bring your own adapter: any stream or data mapped to a controller. */
export interface ChatThreadControllerProps extends ChatThreadViewProps {
  /**
   * The thread to render: from `useLangGraphChatThread`, or your own adapter
   * for another stream or data source.
   */
  thread: ChatThreadController;
  stream?: never;
}

export type ChatThreadProps = ChatThreadStreamProps | ChatThreadControllerProps;

/**
 * An agent conversation view built from Macaw chat parts: messages,
 * reasoning, tool calls, subagents, approvals, the plan, queued messages,
 * and the composer. Pass a LangGraph `stream` to use the built-in
 * `useLangGraphChatThread` adapter, or a `thread` from your own adapter.
 * Pick one for the life of the component.
 */
export function ChatThread(props: ChatThreadProps) {
  if (props.thread) return <ChatThreadView {...props} thread={props.thread} />;
  return <StreamChatThread {...props} />;
}

function StreamChatThread({
  stream,
  selectors,
  hideMessage,
  messagesKey,
  subagentTools,
  ...props
}: ChatThreadStreamProps) {
  const thread = useLangGraphChatThread(stream, {
    selectors,
    hideMessage,
    messagesKey,
    subagentTools,
  });
  return <ChatThreadView {...props} thread={thread} />;
}

function ChatThreadView({
  thread,
  tools,
  renderInterrupt,
  onOpenSubagent,
  agentName,
  header,
  emptyState,
  placeholder,
  modelSelector,
  composerTools,
  composerActions,
  label = 'Agent conversation',
  className,
}: ChatThreadViewProps & { thread: ChatThreadController }) {
  const toolPresentations = useMemo(
    () => ({ ...deepAgentTools, ...tools }),
    [tools]
  );
  const { model, isThreadLoading, actions } = thread;
  const cancelQueued = actions.cancelQueued;
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
        footer={
          <ThreadComposer
            placeholder={placeholder}
            modelSelector={modelSelector}
            composerTools={composerTools}
            composerActions={composerActions}
          />
        }
        pinnedMessageId={thread.sentMessageId}
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
                  cancelQueued ? (
                    <ChatMessageActions
                      status="queued"
                      actions={{
                        cancel: {
                          onClick: () => void cancelQueued(queued.id),
                        },
                      }}
                    />
                  ) : undefined
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
