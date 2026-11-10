import { type ComponentPropsWithRef, useImperativeHandle, useRef } from 'react';

import { mergeRefs } from '../../utils/merge-refs';
import { Textarea } from '../Textarea';
import {
  isComposerSubmitKey,
  useChatComposerContext,
} from './ChatComposerContext';

export type ChatComposerTextareaProps = Omit<
  ComponentPropsWithRef<typeof Textarea>,
  | 'variant'
  | 'rows'
  | 'resize'
  | 'autoResize'
  | 'label'
  | 'hintText'
  | 'isError'
  | 'leftDecorator'
  | 'rightDecorator'
> & {
  /** Height in px before the text grows. */
  minHeight?: number;
  /** Height in px the field grows to before it scrolls. */
  maxHeight?: number;
};

/**
 * A plain-text message field for hosts that need the native textarea: its
 * ref and selection, a `name` for form data, or their own key handling. Enter
 * sends through the composer unless the host's `onKeyDown` prevents it;
 * Shift+Enter adds a line.
 */
export function ChatComposerTextarea({
  ref,
  disabled = false,
  readOnly = false,
  size = 'md',
  minHeight = 40,
  maxHeight = 240,
  placeholder = 'Write a message…',
  'aria-label': ariaLabel = 'Message',
  style,
  onKeyDown,
  ...props
}: ChatComposerTextareaProps) {
  const composer = useChatComposerContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = composer.disabled || disabled;
  const editable = !isDisabled && !readOnly;

  useImperativeHandle(
    composer.inputFocusRef,
    () => () => {
      if (!editable || !textareaRef.current) return false;
      textareaRef.current.focus();
      return true;
    },
    [editable]
  );

  return (
    <Textarea
      {...props}
      ref={mergeRefs([textareaRef, ref])}
      variant="plain"
      size={size}
      rows={1}
      autoResize
      maxHeight={maxHeight}
      placeholder={placeholder}
      disabled={isDisabled}
      readOnly={readOnly}
      aria-label={ariaLabel}
      style={{ minHeight, ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !composer.submit || !editable) return;
        if (!isComposerSubmitKey(event.nativeEvent)) return;
        event.preventDefault();
        composer.submit();
      }}
    />
  );
}
