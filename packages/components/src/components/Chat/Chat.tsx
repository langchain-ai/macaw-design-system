import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import { ThinkingState } from '../ThinkingState';

export interface ChatConversationProps extends ComponentProps<'div'> {
  label?: string;
}

export function ChatConversation({
  label = 'Conversation',
  className,
  children,
  ...props
}: ChatConversationProps) {
  return (
    <div
      role="log"
      aria-label={label}
      aria-live="polite"
      aria-relevant="additions text"
      tabIndex={0}
      {...props}
      className={cn(
        'flex min-h-0 flex-col gap-space-6 overflow-y-auto p-space-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface ChatMessageProps extends Omit<
  ComponentProps<'article'>,
  'title'
> {
  author: ReactNode;
  avatar?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  streaming?: boolean;
}

export function ChatMessage({
  author,
  avatar,
  metadata,
  actions,
  streaming = false,
  className,
  children,
  ...props
}: ChatMessageProps) {
  const headingId = useId();
  return (
    <article
      aria-labelledby={headingId}
      aria-busy={streaming}
      {...props}
      className={cn('flex min-w-0 gap-space-3 text-primary', className)}
    >
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-space-2">
        <div className="flex flex-wrap items-center gap-space-2">
          <Text id={headingId} as="span" variant="sm" weight="semibold">
            {author}
          </Text>
          {metadata}
        </div>
        <div className="min-w-0 break-words text-sm leading-normal">
          {children}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-space-2">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}

export interface ChatStatusProps extends Omit<
  ComponentProps<'div'>,
  'children'
> {
  state: 'streaming' | 'error' | 'empty';
  children?: ReactNode;
  actions?: ReactNode;
}

export function ChatStatus({
  state,
  children,
  actions,
  className,
  ...props
}: ChatStatusProps) {
  return (
    <div
      {...props}
      className={cn('flex flex-wrap items-center gap-space-3', className)}
    >
      {state === 'streaming' ? (
        <ThinkingState size="xs" label={children ?? 'Generating response'} />
      ) : (
        <Text
          as="div"
          variant="sm"
          color={state === 'error' ? 'error' : 'secondary'}
          role={state === 'error' ? 'alert' : 'status'}
        >
          {children ??
            (state === 'error'
              ? 'The response could not be completed.'
              : 'Start a conversation.')}
        </Text>
      )}
      {actions}
    </div>
  );
}

export interface ChatToolCallProps extends Omit<
  ComponentProps<'details'>,
  'title'
> {
  title: ReactNode;
  state: 'pending' | 'running' | 'complete' | 'error';
  statusLabel?: string;
}

const toolLabels = {
  pending: 'Pending',
  running: 'Running',
  complete: 'Complete',
  error: 'Failed',
};

export function ChatToolCall({
  title,
  state,
  statusLabel = toolLabels[state],
  children,
  className,
  ...props
}: ChatToolCallProps) {
  return (
    <details
      {...props}
      className={cn(
        'min-w-0 rounded-md border border-default bg-surface-level-2 p-space-3',
        className
      )}
    >
      <summary className="cursor-pointer rounded-sm text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <Text as="span" variant="sm" weight="medium">
          {title}
        </Text>
        <Text
          as="span"
          variant="xs"
          className="ml-space-2"
          color={state === 'error' ? 'error' : 'secondary'}
        >
          {statusLabel}
        </Text>
      </summary>
      {children && (
        <div className="mt-space-3 min-w-0 overflow-x-auto text-sm text-secondary">
          {children}
        </div>
      )}
    </details>
  );
}

export interface ChatComposerProps extends Omit<
  ComponentProps<'form'>,
  'onSubmit' | 'children' | 'onChange'
> {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop?: () => void;
  streaming?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  stopLabel?: string;
  accessories?: ReactNode;
  footer?: ReactNode;
  textareaProps?: Omit<
    ComponentProps<typeof Textarea>,
    'value' | 'onChange' | 'disabled' | 'label' | 'placeholder'
  >;
}

export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  streaming = false,
  disabled = false,
  label = 'Message',
  placeholder = 'Write a message…',
  submitLabel = 'Send message',
  stopLabel = 'Stop generating',
  accessories,
  footer,
  textareaProps,
  className,
  ...props
}: ChatComposerProps) {
  const canSubmit = !disabled && !streaming && value.trim().length > 0;
  const submit = () => {
    if (canSubmit) onSubmit(value);
  };
  return (
    <form
      {...props}
      className={cn(
        'flex flex-col gap-space-3 rounded-lg border border-default bg-surface-level-1 p-space-3',
        className
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        size="md"
        rows={2}
        resize="vertical"
        {...textareaProps}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onValueChange}
        disabled={disabled}
        onKeyDown={(event) => {
          textareaProps?.onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.nativeEvent.isComposing &&
            event.nativeEvent.keyCode !== 229
          ) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-space-2">
        <div className="flex min-w-0 flex-wrap items-center gap-space-2">
          {accessories}
        </div>
        {streaming && onStop ? (
          <Button
            type="button"
            size="md"
            color="secondary"
            disabled={disabled}
            onClick={onStop}
          >
            {stopLabel}
          </Button>
        ) : (
          <Button type="submit" size="md" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        )}
      </div>
      {footer}
    </form>
  );
}
