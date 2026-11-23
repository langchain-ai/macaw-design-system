import { useImperativeHandle, useRef } from 'react';

import { useChatComposerContext } from './ChatComposerContext';
import type { ChatComposerInputProps } from './ChatComposerInput';
import { ChatComposerTextarea } from './ChatComposerTextarea';

interface ChatComposerPlainInputProps extends ChatComposerInputProps {
  minHeight: number;
  maxHeight: number;
}

/** Keeps the composer usable with plain Markdown text when the rich editor fails. */
export function ChatComposerPlainInput({
  ref,
  ...props
}: ChatComposerPlainInputProps) {
  const composer = useChatComposerContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editable =
    !composer.disabled && !props.disabled && !(props.readOnly ?? false);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (editable) textareaRef.current?.focus();
      },
    }),
    [editable]
  );

  return <ChatComposerTextarea {...props} ref={textareaRef} />;
}
