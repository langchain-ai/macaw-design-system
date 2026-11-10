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
  type ChatComposerContextValue,
  useChatComposerContext,
} from './ChatComposerContext';

export type ChatComposerDrawerIntent = 'neutral' | 'info' | 'warning' | 'error';

// Dividers match the drawer border, so stacked drawer content reads as one surface.
const DRAWER_INTENT_CLASSES: Record<ChatComposerDrawerIntent, string> = {
  neutral: 'border-subtle divide-subtle bg-surface-level-2',
  info: 'border-brand-subtle divide-brand-subtle bg-brand-subtle',
  warning: 'border-warning divide-warning bg-warning',
  error: 'border-error divide-error bg-error',
};

export type ChatComposerProps = ComponentPropsWithRef<'form'> & {
  /**
   * Supplementary content attached above the editor, inside the composer form.
   * Several items, such as a plan and a question, stack with dividers; put the
   * one the input answers last, next to it.
   */
  drawer?: ReactNode;
  /**
   * Drawer surface color. Color alone doesn't convey severity, so the drawer
   * content should also say it in text or with an icon.
   */
  drawerIntent?: ChatComposerDrawerIntent;
  /**
   * Blocks writing and sending. Stop stays available while `action` is
   * `stop`, so host controls inside the composer must take `disabled`
   * themselves to stay disabled during a response.
   */
  disabled?: boolean;
  submitDisabled?: boolean;
  onFilesSelected?: (files: File[]) => void;
} & (
    | { action?: 'send' | 'sending'; onStop?: never }
    | { action: 'stop'; onStop: () => void }
    /** A stop request is pending; Stop shows progress and sending stays blocked. */
    | { action: 'stopping'; onStop?: never }
  );

// A disabled or read-only part of the composer, such as a read-only message
// input, does not accept input, so files dropped or pasted onto it are not
// attached either.
function isAttachmentTargetBlocked(target: EventTarget) {
  return (
    target instanceof Element &&
    target.closest(
      ':disabled, [readonly], [aria-disabled="true"], [aria-readonly="true"]'
    ) !== null
  );
}

// A fieldset is barred from constraint validation, so its own
// reportValidity() never inspects the controls inside it.
function reportFieldsetValidity(fieldset: HTMLFieldSetElement | null) {
  for (const element of fieldset?.elements ?? []) {
    if (
      (element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement) &&
      !element.reportValidity()
    )
      return false;
  }
  return true;
}

export function ChatComposer({
  children,
  drawer,
  drawerIntent = 'neutral',
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
  noValidate,
  ...props
}: ChatComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const canSubmit =
    !disabled && !submitDisabled && action === 'send' && !!onSubmit;
  const hasDrawer = Boolean(drawer);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const inputFocusRef = useRef<(() => boolean) | null>(null);
  // Inert drawer fields cannot be focused to report errors, so the drawer's
  // host validates them; fields outside the drawer keep native checks.
  const validatesFieldsetOnly = noValidate === undefined && hasDrawer;

  return (
    <ChatComposerContext.Provider
      value={{
        disabled,
        canSubmit,
        action,
        onStop,
        onFilesSelected,
        inputFocusRef,
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
        noValidate={noValidate ?? hasDrawer}
        className={cn('isolate w-full min-w-0 @container/composer', className)}
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          if (
            validatesFieldsetOnly &&
            !reportFieldsetValidity(fieldsetRef.current)
          )
            return;
          onSubmit?.(event);
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
        {hasDrawer && (
          <fieldset
            disabled={disabled}
            className={cn(
              // Extends under the composer's rounded top so the seam stays hidden.
              'mx-space-3 -mb-space-3 max-h-[50dvh] min-w-0 divide-y overflow-y-auto overscroll-contain rounded-t-lg border border-b-0 pb-space-3 duration-normal ease-out animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none',
              DRAWER_INTENT_CLASSES[drawerIntent],
              disabled && 'border-disabled divide-disabled'
            )}
          >
            {drawer}
          </fieldset>
        )}
        <fieldset
          ref={fieldsetRef}
          // A disabled fieldset would also disable Stop; the composer's own
          // parts read `disabled` from context instead.
          disabled={disabled && action !== 'stop'}
          className={cn(
            'relative m-0 flex w-full min-w-0 flex-col gap-space-2 rounded-lg border border-subtle bg-elevated p-space-2 transition-[border-color,box-shadow,background-color] duration-normal motion-reduce:transition-none',
            // Toolbar menus portal out, so focus-within would flash as focus
            // moves from their trigger to the menu; only typing shows focus.
            'has-[:is(textarea,[contenteditable=true]):focus]:border-focus has-[:is(textarea,[contenteditable=true]):focus]:shadow-[0_0_0_1px_var(--border-focus)]',
            disabled && 'border-disabled bg-input-disabled',
            isDropTarget &&
              !disabled &&
              'border-focus bg-surface-level-2 shadow-[0_0_0_1px_var(--border-focus)]'
          )}
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

const ACTION_LABELS = {
  send: 'Send message',
  sending: 'Sending message',
  stop: 'Stop response',
  stopping: 'Stopping response',
} satisfies Record<ChatComposerContextValue['action'], string>;

// Pending sends use the composer's action="sending", which also blocks the
// send shortcuts; a button-level loading state would only block clicks.
export type ChatComposerActionProps = Omit<
  IconButtonProps,
  'icon' | 'type' | 'onClick' | 'asChild' | 'label' | 'loading'
> & { label?: string };

export function ChatComposerAction({
  disabled,
  label,
  ...props
}: ChatComposerActionProps) {
  const composer = useChatComposerContext();
  const isStop = composer.action === 'stop';
  const isStopping = composer.action === 'stopping';
  return (
    <IconButton
      size="sm"
      round
      color="primary"
      iconWeight="regular"
      {...props}
      type={isStop || isStopping ? 'button' : 'submit'}
      icon={isStop || isStopping ? StopIcon : ArrowUpIcon}
      label={label ?? ACTION_LABELS[composer.action]}
      // canSubmit is false while disabled, sending, or stopping, so this also
      // disables Stop once a stop is pending; Stop ignores `disabled` otherwise.
      disabled={disabled || (!isStop && !composer.canSubmit)}
      loading={composer.action === 'sending' || isStopping}
      onClick={isStop ? composer.onStop : undefined}
    />
  );
}
