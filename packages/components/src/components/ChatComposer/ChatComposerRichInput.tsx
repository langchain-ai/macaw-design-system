import { EditorContent } from '@tiptap/react';

import { cn } from '../../utils/cn';
import {
  ChatComposerInputEditableContext,
  useChatComposerContext,
} from './ChatComposerContext';
import type { ChatComposerInputProps } from './ChatComposerInput';
import { useChatComposerEditor } from './useChatComposerEditor';

import styles from './ChatComposerRichInput.module.css';

interface ChatComposerRichInputProps extends ChatComposerInputProps {
  minHeight: number;
  maxHeight: number;
}

export function ChatComposerRichInput({
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
}: ChatComposerRichInputProps) {
  const composer = useChatComposerContext();
  const editable = !composer.disabled && !disabled && !readOnly;
  const { editor } = useChatComposerEditor({
    value,
    onChange,
    onSubmit: composer.submit,
    placeholder,
    editable,
    autofocus: autoFocus,
    editorClassName: cn(
      styles.editor,
      'min-w-0 break-words px-space-1 text-sm leading-relaxed text-primary outline-hidden',
      !editable && 'text-disabled'
    ),
    editorAttributes: {
      role: 'textbox',
      style: `min-height: ${minHeight}px`,
      'aria-label': ariaLabel,
      'aria-multiline': 'true',
      'aria-disabled': String(composer.disabled || disabled),
      'aria-readonly': String(readOnly),
      ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
    },
  });

  return (
    <div
      className={cn('min-w-0 overflow-y-auto overscroll-contain', className)}
      style={{ maxHeight }}
    >
      <ChatComposerInputEditableContext.Provider value={editable}>
        <EditorContent editor={editor} />
      </ChatComposerInputEditableContext.Provider>
    </div>
  );
}
