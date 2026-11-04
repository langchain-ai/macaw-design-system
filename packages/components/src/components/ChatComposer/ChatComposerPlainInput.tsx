import { useImperativeHandle, useRef } from 'react';

import { Textarea } from '../Textarea';
import {
  isComposerSubmitKey,
  useChatComposerContext,
} from './ChatComposerContext';
import type { ChatComposerInputProps } from './ChatComposerInput';

interface ChatComposerPlainInputProps extends ChatComposerInputProps {
  minHeight: number;
  maxHeight: number;
}

/** Keeps the composer usable with plain Markdown text when the rich editor fails. */
export function ChatComposerPlainInput({
  ref,
  value,
  onChange,
  placeholder = 'Write a message…',
  disabled = false,
  readOnly = false,
  autoFocus = false,
  minHeight,
  maxHeight,
  className,
  'aria-label': ariaLabel = 'Message',
  'aria-describedby': ariaDescribedBy,
}: ChatComposerPlainInputProps) {
  const composer = useChatComposerContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = composer.disabled || disabled;
  const editable = !isDisabled && !readOnly;

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (editable) textareaRef.current?.focus();
      },
    }),
    [editable]
  );

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
      ref={textareaRef}
      variant="plain"
      size="md"
      rows={1}
      autoResize
      maxHeight={maxHeight}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={isDisabled}
      readOnly={readOnly}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
      style={{ minHeight }}
      onKeyDown={(event) => {
        if (!composer.submit || !editable) return;
        if (!isComposerSubmitKey(event.nativeEvent)) return;
        event.preventDefault();
        composer.submit();
      }}
    />
  );
}
