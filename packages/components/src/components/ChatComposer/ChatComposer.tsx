import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { StopIcon } from '@phosphor-icons/react/dist/ssr/Stop';

import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/merge-refs';
import { IconButton } from '../IconButton';
import type { IconButtonProps } from '../IconButton';
import {
  ChatComposerContext,
  useChatComposerContext,
} from './ChatComposerContext';

export type ChatComposerProps = ComponentPropsWithRef<'form'> & {
  disabled?: boolean;
  submitDisabled?: boolean;
  onFilesSelected?: (files: File[]) => void;
} & (
    | { action?: 'send'; onStop?: never }
    | { action: 'stop'; onStop: () => void }
  );

function isAttachmentTargetBlocked(target: EventTarget) {
  return (
    target instanceof Element &&
    target.closest(
      ':disabled, [readonly], [aria-disabled="true"], [aria-readonly="true"]'
    ) !== null
  );
}

export function ChatComposer({
  children,
  className,
  ref,
  disabled = false,
  submitDisabled = false,
  action = 'send',
  onStop,
  onSubmit,
  onFilesSelected,
  onDragOver,
  onDragLeave,
  onDropCapture,
  onPasteCapture,
  ...props
}: ChatComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const canSubmit =
    !disabled && !submitDisabled && action === 'send' && !!onSubmit;

  return (
    <ChatComposerContext.Provider
      value={{
        disabled,
        canSubmit,
        action,
        onStop,
        onFilesSelected,
        submit: onSubmit
          ? () => {
              if (canSubmit) formRef.current?.requestSubmit();
            }
          : undefined,
      }}
    >
      <form
        {...props}
        ref={mergeRefs([formRef, ref])}
        className={cn(
          'w-full min-w-0 rounded-xl border border-subtle bg-elevated p-space-2 transition-colors duration-normal @container/composer focus-within:border-focus motion-reduce:transition-none',
          disabled && 'border-disabled bg-surface-level-2',
          isDropTarget && !disabled && 'border-focus bg-surface-level-2',
          className
        )}
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) onSubmit?.(event);
        }}
        onDragOver={(event) => {
          onDragOver?.(event);
          if (event.defaultPrevented || !onFilesSelected) return;
          if (!event.dataTransfer.types.includes('Files')) return;
          event.preventDefault();
          const canAttach =
            !disabled && !isAttachmentTargetBlocked(event.target);
          event.dataTransfer.dropEffect = canAttach ? 'copy' : 'none';
          setIsDropTarget(canAttach);
        }}
        onDragLeave={(event) => {
          onDragLeave?.(event);
          if (
            !(event.relatedTarget instanceof Node) ||
            !event.currentTarget.contains(event.relatedTarget)
          ) {
            setIsDropTarget(false);
          }
        }}
        onDropCapture={(event) => {
          onDropCapture?.(event);
          setIsDropTarget(false);
          if (event.defaultPrevented || !onFilesSelected) return;
          const files = Array.from(event.dataTransfer.files);
          if (!files.length) return;
          event.preventDefault();
          if (!disabled && !isAttachmentTargetBlocked(event.target)) {
            onFilesSelected(files);
          }
        }}
        onPasteCapture={(event) => {
          onPasteCapture?.(event);
          if (event.defaultPrevented || !onFilesSelected) return;
          const files = Array.from(event.clipboardData.files);
          if (!files.length) return;
          if (disabled || isAttachmentTargetBlocked(event.target)) {
            event.preventDefault();
            return;
          }
          // Let the focused editor preserve mixed-paste text and its selection.
          if (!event.clipboardData.getData('text/plain')) {
            event.preventDefault();
          }
          onFilesSelected(files);
        }}
      >
        <fieldset
          disabled={disabled}
          className="m-0 flex min-w-0 flex-col gap-space-2 border-0 p-0"
        >
          {children}
        </fieldset>
      </form>
    </ChatComposerContext.Provider>
  );
}

export interface ChatComposerToolbarProps extends ComponentPropsWithRef<'div'> {
  modelSelector?: ReactNode;
  actions?: ReactNode;
}

export function ChatComposerToolbar({
  children,
  modelSelector,
  actions = <ChatComposerAction />,
  className,
  ...props
}: ChatComposerToolbarProps) {
  return (
    <div
      {...props}
      className={cn('flex min-w-0 items-center gap-space-2', className)}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-space-1 @[440px]/composer:gap-space-2">
        {children}
        {modelSelector != null && (
          <div className="min-w-0 max-w-full [&>*]:max-w-full">
            {modelSelector}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-space-1">{actions}</div>
    </div>
  );
}

export type ChatComposerActionProps = Omit<
  IconButtonProps,
  'icon' | 'type' | 'onClick' | 'asChild' | 'label'
> & { label?: string };

export function ChatComposerAction({
  disabled,
  label,
  loading,
  ...props
}: ChatComposerActionProps) {
  const composer = useChatComposerContext();
  const isStop = composer.action === 'stop';
  return (
    <IconButton
      size="sm"
      round
      color="primary"
      iconWeight="regular"
      {...props}
      type={isStop ? 'button' : 'submit'}
      icon={isStop ? StopIcon : ArrowUpIcon}
      label={label ?? (isStop ? 'Stop response' : 'Send message')}
      disabled={
        composer.disabled ||
        disabled ||
        loading ||
        (!isStop && !composer.canSubmit)
      }
      loading={loading}
      onClick={isStop ? composer.onStop : undefined}
    />
  );
}
