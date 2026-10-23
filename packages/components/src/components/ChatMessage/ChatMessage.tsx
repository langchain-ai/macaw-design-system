import {
  Fragment,
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import { animation } from '../../utils/animation';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/merge-refs';
import { Divider } from '../Divider';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { LoadingIndicator } from '../ThinkingState';
import type {
  ChatMessageActionCapabilities,
  ChatMessageContentBlock,
  ChatMessageIdentity,
  ChatMessageModel,
  ChatMessageRole,
  ChatMessageStatus,
} from './ChatMessage.types';

import styles from './ChatMessage.module.css';

const roleLabels: Record<ChatMessageRole, string> = {
  user: 'User',
  assistant: 'Assistant',
  system: 'System',
  tool: 'Tool',
};

const statusLabels: Record<ChatMessageStatus, string | null> = {
  idle: null,
  queued: 'Queued',
  submitting: 'Sending',
  streaming: 'Responding',
  interrupted: 'Interrupted',
  failed: 'Failed',
  stopped: 'Stopped',
  completed: null,
};

export interface ChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: ChatMessageModel;
  /** Metadata stays visible; actions reveal on hover or focus on pointer devices. */
  footer?: ReactNode;
  /** Visual passed to the default header; custom headers own their leading slot. */
  leading?: ReactNode;
  /** Shows the icon and name for non-user messages. */
  showIdentity?: boolean;
  /** Defaults to end for user messages and start for other roles. */
  align?: 'start' | 'end';
  /** Keeps actions visible; earlier messages reveal them on hover or focus. */
  isLatest?: boolean;
  /** Fade in complete text blocks as they mount; keep their IDs stable. */
  animateParagraphs?: boolean;
  contentClassName?: string;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      message,
      footer,
      leading,
      showIdentity = false,
      align,
      isLatest = false,
      animateParagraphs = false,
      className,
      contentClassName,
      children,
      ...props
    },
    ref
  ) => {
    const alignment = align ?? (message.role === 'user' ? 'end' : 'start');
    const messageRef = useRef<HTMLDivElement>(null);
    const footerHadFocus = useRef(false);

    useLayoutEffect(() => {
      if (message.status === 'streaming' && footerHadFocus.current) {
        footerHadFocus.current = false;
        messageRef.current?.focus({ preventScroll: true });
      }
    }, [message.status]);

    return (
      <div
        ref={mergeRefs([messageRef, ref])}
        role="article"
        tabIndex={-1}
        aria-label={`${message.identity?.name ?? roleLabels[message.role]} message`}
        data-message-id={message.id}
        data-message-role={message.role}
        data-status={message.status}
        data-latest={isLatest}
        data-read-only={message.readOnly || undefined}
        className={cn(
          'group/chat-message flex w-full min-w-0 max-w-full text-primary',
          alignment === 'end' && 'justify-end',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex min-w-0 max-w-full flex-col gap-space-2',
            alignment === 'end' ? 'w-fit max-w-[85%] items-end' : 'w-full',
            contentClassName
          )}
        >
          {children ?? (
            <>
              <ChatMessageHeader
                messageRole={message.role}
                identity={message.identity}
                showIdentity={showIdentity}
                leading={leading}
                status={message.status}
              />
              <ChatMessageBody
                blocks={message.content}
                aria-busy={
                  message.status === 'streaming' ||
                  message.status === 'submitting'
                }
                animateParagraphs={animateParagraphs}
                className={alignment === 'end' ? 'items-end' : undefined}
              />
            </>
          )}
          {footer != null && message.status !== 'streaming' && (
            <div
              onFocusCapture={() => {
                footerHadFocus.current = true;
              }}
              onBlurCapture={() => {
                footerHadFocus.current = false;
              }}
              className="flex min-w-0 max-w-full flex-wrap items-center gap-space-2 [overflow-wrap:anywhere]"
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';

export interface ChatMessageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  messageRole: ChatMessageRole;
  identity?: ChatMessageIdentity;
  showIdentity?: boolean;
  leading?: ReactNode;
  status?: ChatMessageStatus;
}

export function ChatMessageHeader({
  messageRole,
  identity,
  showIdentity = false,
  leading,
  status = 'completed',
  children,
  className,
  ...props
}: ChatMessageHeaderProps) {
  const name = identity?.name ?? roleLabels[messageRole];
  const statusLabel = statusLabels[status];
  const identityVisible = showIdentity && messageRole !== 'user';

  return (
    <>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === 'idle' ? '' : `${name}: ${statusLabel ?? 'Completed'}`}
      </span>
      {(identityVisible || statusLabel || children != null) && (
        <div
          className={cn(
            'flex min-w-0 max-w-full flex-wrap items-center gap-space-2 [overflow-wrap:anywhere]',
            className
          )}
          {...props}
        >
          {identityVisible && leading != null && (
            <div className="inline-flex shrink-0 items-center justify-center">
              {leading}
            </div>
          )}
          {identityVisible && (
            <Text
              as="span"
              variant="xs"
              weight="medium"
              className="leading-snug tracking-normal"
            >
              {name}
            </Text>
          )}
          {statusLabel ? (
            <Text
              as="span"
              variant="xs"
              color={status === 'failed' ? 'error' : 'secondary'}
              aria-hidden="true"
              className="flex items-center gap-space-2 leading-snug tracking-normal"
            >
              {status === 'streaming' && <LoadingIndicator size="xs" />}
              {status === 'failed' && (
                <Icon
                  icon={WarningCircleIcon}
                  size="sm"
                  weight="fill"
                  className="text-icon-error"
                  aria-hidden="true"
                />
              )}
              {statusLabel}
            </Text>
          ) : null}
          {children}
        </div>
      )}
    </>
  );
}

export interface ChatMessageBodyProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  blocks: readonly ChatMessageContentBlock[];
  /** Supply one complete paragraph per text block; existing blocks do not replay. */
  animateParagraphs?: boolean;
}

export function ChatMessageBody({
  blocks,
  animateParagraphs = false,
  className,
  ...props
}: ChatMessageBodyProps) {
  if (blocks.length === 0) return null;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full flex-col gap-space-3 [overflow-wrap:anywhere]',
        '[&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto',
        className
      )}
      {...props}
    >
      {blocks.map((block) => {
        const content =
          block.type === 'text' ? (
            <Text
              as="p"
              variant="sm"
              weight="normal"
              className={cn(
                'min-w-0 whitespace-pre-wrap leading-normal tracking-normal text-inherit',
                animateParagraphs && animation.fadeIn,
                animateParagraphs &&
                  'duration-normal ease-out motion-reduce:animate-none'
              )}
            >
              {block.text}
            </Text>
          ) : (
            block.content
          );

        return block.appearance === 'bubble' ? (
          <div
            key={block.id}
            className="w-fit min-w-0 max-w-full rounded-xl bg-surface-level-2 px-space-3 py-space-2 text-primary"
          >
            {content}
          </div>
        ) : (
          <Fragment key={block.id}>{content}</Fragment>
        );
      })}
    </div>
  );
}

export interface ChatMessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ChatMessageActionCapabilities;
  status?: ChatMessageStatus;
  readOnly?: boolean;
}

const actionDefinitions = [
  { name: 'copy', label: 'Copy message', icon: CopySimpleIcon },
  { name: 'edit', label: 'Edit message', icon: PencilSimpleIcon },
  { name: 'retry', label: 'Retry message', icon: ArrowClockwiseIcon },
] satisfies {
  name: keyof ChatMessageActionCapabilities;
  label: string;
  icon: typeof CopySimpleIcon;
}[];

export function ChatMessageActions({
  actions,
  status = 'completed',
  readOnly = false,
  children,
  className,
  ...props
}: ChatMessageActionsProps) {
  const hasActions = Boolean(
    actions?.copy || actions?.edit || actions?.retry || children
  );
  if (!hasActions) {
    return null;
  }

  const mutationDisabledReason = readOnly
    ? 'This message is read-only.'
    : status === 'queued' || status === 'submitting' || status === 'streaming'
      ? 'Wait until the message has finished.'
      : undefined;

  return (
    <div
      role="group"
      aria-label="Message actions"
      className={cn(
        'flex min-w-0 max-w-full flex-wrap items-center gap-space-1',
        'transition-opacity duration-fast motion-reduce:transition-none',
        styles.actions,
        className
      )}
      {...props}
    >
      {actionDefinitions.map(({ name, label, icon }) => {
        const action = actions?.[name];
        if (!action) return null;
        const disabledReason =
          action.disabledReason ||
          (name === 'copy' ? undefined : mutationDisabledReason);

        return (
          <IconButton
            key={name}
            icon={icon}
            iconWeight="regular"
            label={action.label ?? label}
            color="secondary"
            variant="plain"
            size="xs"
            disabled={Boolean(disabledReason)}
            tooltipProps={{ title: disabledReason ?? action.label ?? label }}
            onClick={action.onClick}
          />
        );
      })}
      {children}
    </div>
  );
}

export interface ChatTurnDividerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  label: string;
}

export function ChatTurnDivider({
  label,
  className,
  ...props
}: ChatTurnDividerProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="horizontal"
      className={cn(
        'flex w-full min-w-0 items-center gap-space-3 py-space-3',
        className
      )}
      {...props}
    >
      <Divider className="min-w-space-4 flex-1" />
      <Text
        variant="xs"
        color="tertiary"
        className="min-w-0 text-center [overflow-wrap:anywhere]"
      >
        {label}
      </Text>
      <Divider className="min-w-space-4 flex-1" />
    </div>
  );
}
