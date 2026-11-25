import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { cn } from '../../utils/cn';
import type { IconComponent } from '../../utils/icon-types';
import { mergeRefs } from '../../utils/merge-refs';
import { Avatar, type AvatarProps } from '../Avatar';
import { Button } from '../Button';
import { Divider } from '../Divider';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import { ThinkingState } from '../ThinkingState';
import type {
  ChatMessageActionCapabilities,
  ChatMessageContentBlock,
  ChatMessageModel,
  ChatMessageRole,
  ChatMessageStatus,
} from './ChatMessage.types';

/**
 * The message's alignment, so a host-supplied `ChatMessageBody` lines up its
 * blocks the same way the default body does.
 */
const ChatMessageAlignmentContext = createContext<'start' | 'end'>('start');

/** A rectangle relative to the message's root. */
interface MessageBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Where the editor grows from: the message content it replaced. */
const ChatMessageEditContext = createContext<{
  rootRef: RefObject<HTMLDivElement | null>;
  contentBox: RefObject<MessageBox | null>;
} | null>(null);

/**
 * The editor grows out of the message on the curve chat uses for things
 * entering. Leaving fades the message back in, faster than it opened.
 */
const editMotion = {
  enterMs: 250,
  exitMs: 150,
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
};

function canAnimate(element: HTMLElement) {
  return (
    typeof element.animate === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** The union of the body's blocks, since the body itself spans the column. */
function measureContent(root: HTMLElement, body: Element): MessageBox | null {
  const rects = Array.from(body.children, (child) =>
    child.getBoundingClientRect()
  );
  if (rects.length === 0) return null;
  const origin = root.getBoundingClientRect();
  return {
    top: Math.min(...rects.map((rect) => rect.top)) - origin.top,
    right: Math.max(...rects.map((rect) => rect.right)) - origin.left,
    bottom: Math.max(...rects.map((rect) => rect.bottom)) - origin.top,
    left: Math.min(...rects.map((rect) => rect.left)) - origin.left,
  };
}

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

const settledStatuses = new Set<ChatMessageStatus>([
  'completed',
  'failed',
  'stopped',
  'interrupted',
]);

export interface ChatMessageProps extends ComponentPropsWithRef<'div'> {
  message: ChatMessageModel;
  /** Metadata and actions share the message's footer layout and visibility. */
  footer?: ReactNode;
  /** `Avatar` shown before the name in the default header, sized to match it. */
  avatar?: Omit<AvatarProps, 'size'>;
  /**
   * Name shown after the avatar in the default header. A string name also
   * labels the message for screen readers; otherwise the avatar's label or
   * the role label does.
   */
  name?: ReactNode;
  /** Defaults to end for user messages and start for other roles. */
  align?: 'start' | 'end';
  /** Keeps the footer visible; earlier messages reveal it on hover or focus. */
  isLatest?: boolean;
  /**
   * Fade in complete text blocks as they mount; keep their IDs stable. A
   * message that mounts already settled, such as history, doesn't fade in.
   */
  animateParagraphs?: boolean;
  /**
   * Shows the status line, such as "Responding", in the default header. Set
   * false while a part of the message shows its own progress, such as a
   * running tool group, so the message shows one indicator at a time.
   */
  showStatus?: boolean;
  /**
   * Puts the message in its edit state: a `ChatMessageEditor` replaces the
   * body and footer. When editing ends, focus returns to the Edit action.
   */
  editor?: ReactNode;
  contentClassName?: string;
}

/**
 * One message in a conversation. Renders a header and the message's content
 * blocks, or `children` in their place for custom layouts. The footer is
 * hidden, but keeps its space, while the message streams. The root carries
 * `data-chat-message-id`, which `ChatConversation` uses to pin a message and
 * to hold the reader's place when earlier messages load.
 */
export function ChatMessage({
  message,
  footer,
  avatar,
  name,
  align,
  isLatest = false,
  animateParagraphs = false,
  showStatus = true,
  editor,
  className,
  contentClassName,
  children,
  ref,
  ...props
}: ChatMessageProps) {
  const alignment = align ?? (message.role === 'user' ? 'end' : 'start');
  const isStreaming = message.status === 'streaming';
  const isSettled = settledStatuses.has(message.status);
  const [isHistory, setIsHistory] = useState(isSettled);
  if (isHistory && !isSettled) setIsHistory(false);
  const isEditing = editor != null;
  const rootRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const contentBox = useRef<MessageBox | null>(null);
  const wasEditing = useRef(isEditing);
  const editContext = useMemo(() => ({ rootRef, contentBox }), []);

  // Track the content's box so an editor opened later can grow out of it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const body = root?.querySelector('[data-chat-message-body]');
    if (isEditing || !root || !body) return;
    const measure = () => {
      contentBox.current = measureContent(root, body);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    for (const child of body.children) observer.observe(child);
    return () => observer.disconnect();
  }, [isEditing, message.content, children]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const column = columnRef.current;
    if (wasEditing.current && !isEditing && root && column) {
      if (canAnimate(column)) {
        column.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: editMotion.exitMs,
          easing: 'ease-out',
        });
      }
      // The editor took focus with it when it unmounted; hand it back to Edit.
      const focused = document.activeElement;
      if (
        focused == null ||
        focused === document.body ||
        root.contains(focused)
      ) {
        root
          .querySelector<HTMLElement>('[data-chat-message-action="edit"]')
          ?.focus();
      }
    }
    wasEditing.current = isEditing;
  }, [isEditing]);

  return (
    <div
      ref={mergeRefs([rootRef, ref])}
      role="article"
      aria-label={`${typeof name === 'string' ? name : avatar?.label || roleLabels[message.role]} message`}
      aria-busy={isStreaming || message.status === 'submitting'}
      data-chat-message-id={message.id}
      className={cn(
        'group/chat-message flex w-full min-w-0 text-primary',
        alignment === 'end' && 'justify-end',
        className
      )}
      {...props}
    >
      <div
        ref={columnRef}
        className={cn(
          'flex min-w-0 max-w-full flex-col gap-space-2',
          alignment === 'end'
            ? cn('max-w-[85%] items-end', isEditing ? 'w-full' : 'w-fit')
            : 'w-full',
          contentClassName
        )}
      >
        <ChatMessageAlignmentContext.Provider value={alignment}>
          {isEditing ? (
            <ChatMessageEditContext.Provider value={editContext}>
              <ChatMessageHeader avatar={avatar} name={name} />
              {editor}
            </ChatMessageEditContext.Provider>
          ) : (
            (children ?? (
              <>
                <ChatMessageHeader
                  avatar={avatar}
                  name={name}
                  status={message.status}
                  showStatus={showStatus}
                />
                <ChatMessageBody
                  blocks={message.content}
                  animateParagraphs={animateParagraphs && !isHistory}
                />
              </>
            ))
          )}
        </ChatMessageAlignmentContext.Provider>
        {footer != null && !isEditing && (
          <div
            // Reserve the footer's space while streaming so it doesn't pop in.
            inert={isStreaming}
            className={cn(
              'flex min-w-0 max-w-full flex-wrap items-center gap-space-2 [overflow-wrap:anywhere]',
              isStreaming && 'invisible',
              // Earlier messages hide their footer until hovered or focused,
              // except on touch screens, which have no hover to reveal it.
              // Keyboard focus reveals it without a fade.
              !isLatest &&
                'transition-opacity duration-fast focus-within:transition-none motion-reduce:transition-none pointer-fine:opacity-0 pointer-fine:focus-within:opacity-100 pointer-fine:group-hover/chat-message:opacity-100 pointer-fine:has-[[data-state=open]]:opacity-100'
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ChatMessageHeaderProps extends ComponentPropsWithRef<'div'> {
  avatar?: Omit<AvatarProps, 'size'>;
  name?: ReactNode;
  status?: ChatMessageStatus;
  /**
   * Shows the status label. When false, a streaming message still keeps the
   * status line's height so the content below doesn't move.
   */
  showStatus?: boolean;
}

/**
 * Avatar, name, and status line. Renders nothing without any of them or
 * children, unless it has shown a streaming status.
 */
export function ChatMessageHeader({
  avatar,
  name,
  status = 'completed',
  showStatus = true,
  children,
  className,
  ...props
}: ChatMessageHeaderProps) {
  const [hasStreamed, setHasStreamed] = useState(status === 'streaming');
  if (status === 'streaming' && !hasStreamed) setHasStreamed(true);

  const statusLabel = showStatus ? statusLabels[status] : null;
  const isEmpty =
    avatar == null && name == null && !statusLabel && children == null;

  if (isEmpty && !hasStreamed) return null;

  return (
    <div
      className={cn(
        'flex min-w-0 max-w-full flex-wrap items-center gap-space-2 [overflow-wrap:anywhere]',
        // Keep the line the streaming status used so the text below doesn't
        // jump up when it ends.
        isEmpty && 'min-h-lh text-xxs leading-snug',
        className
      )}
      {...props}
    >
      {avatar && (
        // The name and the message label already identify the speaker; this
        // keeps the avatar's initial from being read out before the name.
        <span aria-hidden="true" className="inline-flex shrink-0">
          <Avatar size="xs" {...avatar} />
        </span>
      )}
      {name != null && (
        <Text as="span" variant="xs" weight="medium" className="leading-snug">
          {name}
        </Text>
      )}
      {status === 'streaming' && statusLabel ? (
        <ThinkingState size="xs" label={statusLabel} motion="subtle" />
      ) : statusLabel ? (
        <Text
          as="span"
          variant="xs"
          color={status === 'failed' ? 'error' : 'secondary'}
          className="flex items-center gap-space-2 leading-snug"
        >
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
  );
}

export interface ChatMessageBodyProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  blocks: readonly ChatMessageContentBlock[];
  /** Supply one complete paragraph per text block; existing blocks do not replay. */
  animateParagraphs?: boolean;
}

/** Content blocks in order. Text blocks render as escaped plain text. */
export function ChatMessageBody({
  blocks,
  animateParagraphs = false,
  className,
  ...props
}: ChatMessageBodyProps) {
  const alignment = useContext(ChatMessageAlignmentContext);
  if (blocks.length === 0) return null;

  return (
    <div
      data-chat-message-body=""
      className={cn(
        'flex w-full min-w-0 max-w-full flex-col gap-space-3 [overflow-wrap:anywhere]',
        alignment === 'end' && 'items-end',
        // Keep wide host content from stretching the message. Tables that
        // already sit in a scrolling region, such as MarkdownDisplay's, keep
        // table layout so they can fill the message width.
        '[&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table:not([role=region]>table)]:block [&_table:not([role=region]>table)]:max-w-full [&_table:not([role=region]>table)]:overflow-x-auto',
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
                animateParagraphs &&
                  'animate-in fade-in duration-normal ease-out motion-reduce:animate-none'
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
            className="w-fit min-w-0 max-w-full rounded-lg bg-surface-level-2 px-space-3 py-space-2"
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

export interface ChatMessageEditorProps extends Omit<
  ComponentPropsWithRef<'form'>,
  'onSubmit' | 'children' | 'defaultValue'
> {
  /** The message's current text. The editor owns the draft from here. */
  defaultValue: string;
  /** Receives the trimmed draft. Send stays disabled while the draft is blank. */
  onSubmit: (value: string) => void;
  onCancel: () => void;
  /** Defaults to "Send". */
  submitLabel?: string;
  /** Labels the text field. Defaults to "Edit message". */
  label?: string;
  placeholder?: string;
  /** Host-owned extras below the text, such as attachments the edit keeps. */
  children?: ReactNode;
}

/**
 * The edit state of a message, passed to `ChatMessage` as `editor`. The text
 * stays in the message's bubble, which grows out of the message it replaces;
 * Cancel and Send take the footer's place. Enter sends, Shift+Enter adds a
 * line, and Escape cancels.
 */
export function ChatMessageEditor({
  defaultValue,
  onSubmit,
  onCancel,
  submitLabel = 'Send',
  label = 'Edit message',
  placeholder,
  children,
  className,
  ...props
}: ChatMessageEditorProps) {
  const [draft, setDraft] = useState(defaultValue);
  const alignment = useContext(ChatMessageAlignmentContext);
  const edit = useContext(ChatMessageEditContext);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBlank = draft.trim() === '';

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || !canAnimate(surface)) return;
    const fadeIn = [{ opacity: 0 }, { opacity: 1 }];
    const fadeTiming: KeyframeAnimationOptions = {
      duration: editMotion.enterMs - 50,
      delay: 50,
      easing: 'ease-out',
      fill: 'backwards',
    };
    contentRef.current?.animate(fadeIn, fadeTiming);
    actionsRef.current?.animate(fadeIn, fadeTiming);

    const root = edit?.rootRef.current;
    const from = edit?.contentBox.current;
    if (!root || !from) {
      surface.animate(fadeIn, {
        duration: editMotion.enterMs,
        easing: editMotion.easing,
      });
      return;
    }
    // Start clipped to the message's old box, then open to the full field.
    const origin = root.getBoundingClientRect();
    const rect = surface.getBoundingClientRect();
    const top = rect.top - origin.top;
    const left = rect.left - origin.left;
    const inset = [
      from.top - top,
      left + rect.width - from.right,
      top + rect.height - from.bottom,
      from.left - left,
    ]
      .map((value) => `${Math.max(0, value)}px`)
      .join(' ');
    const radius = getComputedStyle(surface).borderRadius;
    surface.animate(
      [
        { clipPath: `inset(${inset} round ${radius})` },
        { clipPath: `inset(0 round ${radius})` },
      ],
      { duration: editMotion.enterMs, easing: editMotion.easing }
    );
  }, [edit]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  const submit = () => {
    if (!isBlank) onSubmit(draft.trim());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape') {
      // Keep Escape from also closing a dialog or panel around the chat.
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <form
      className={cn('flex w-full min-w-0 flex-col gap-space-2', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      {/* Same surface, padding, and type as a bubble, so the text stays put. */}
      <div
        ref={surfaceRef}
        className="w-full min-w-0 rounded-lg bg-surface-level-2 px-space-3 py-space-2 shadow-[inset_0_0_0_1px_var(--border-subtle)]"
      >
        <div ref={contentRef} className="flex min-w-0 flex-col gap-space-2">
          <Textarea
            ref={textareaRef}
            variant="plain"
            aria-label={label}
            placeholder={placeholder}
            value={draft}
            onChange={setDraft}
            onKeyDown={handleKeyDown}
            rows={1}
            autoResize
            maxHeight={320}
            inputClassName="text-xs leading-normal tracking-normal"
          />
          {children}
        </div>
      </div>
      <div
        ref={actionsRef}
        className={cn(
          'flex gap-space-2',
          alignment === 'end' ? 'justify-end' : 'justify-start'
        )}
      >
        <Button
          type="button"
          size="sm"
          variant="plain"
          color="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isBlank}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

const actionDefinitions: {
  name: keyof ChatMessageActionCapabilities;
  label: string;
  icon: IconComponent;
}[] = [
  { name: 'copy', label: 'Copy message', icon: CopySimpleIcon },
  { name: 'edit', label: 'Edit message', icon: PencilSimpleIcon },
  { name: 'retry', label: 'Retry message', icon: ArrowClockwiseIcon },
  { name: 'cancel', label: 'Cancel queued message', icon: XIcon },
];

function canChangeMessage(status: ChatMessageStatus, readOnly: boolean) {
  return (
    !readOnly &&
    status !== 'queued' &&
    status !== 'submitting' &&
    status !== 'streaming'
  );
}

function isActionAvailable(
  name: keyof ChatMessageActionCapabilities,
  status: ChatMessageStatus,
  readOnly: boolean
) {
  if (name === 'copy') return true;
  if (name === 'cancel') return !readOnly && status === 'queued';
  return canChangeMessage(status, readOnly);
}

export interface ChatMessageActionsProps extends ComponentPropsWithRef<'div'> {
  actions?: ChatMessageActionCapabilities;
  status?: ChatMessageStatus;
  readOnly?: boolean;
}

/**
 * Copy, edit, retry, and cancel buttons, plus any host actions in `children`.
 * Edit and retry are hidden while the message is pending or read-only; cancel
 * appears only on a queued message; copy stays available. Renders nothing
 * when no actions remain.
 */
export function ChatMessageActions({
  actions,
  status = 'completed',
  readOnly = false,
  children,
  className,
  ...props
}: ChatMessageActionsProps) {
  const visibleActions = actionDefinitions.flatMap((definition) => {
    const action = actions?.[definition.name];
    return action && isActionAvailable(definition.name, status, readOnly)
      ? [{ ...definition, action }]
      : [];
  });
  if (visibleActions.length === 0 && children == null) return null;

  return (
    <div
      role="group"
      aria-label="Message actions"
      className={cn(
        'flex min-w-0 max-w-full flex-wrap items-center gap-space-1',
        className
      )}
      {...props}
    >
      {visibleActions.map(({ name, label, icon, action }) => (
        <IconButton
          key={name}
          data-chat-message-action={name}
          icon={icon}
          iconWeight="regular"
          label={action.label ?? label}
          color="secondary"
          variant="plain"
          size="xs"
          onClick={action.onClick}
        />
      ))}
      {children}
    </div>
  );
}

export interface ChatTurnDividerProps extends Omit<
  ComponentPropsWithRef<'div'>,
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
