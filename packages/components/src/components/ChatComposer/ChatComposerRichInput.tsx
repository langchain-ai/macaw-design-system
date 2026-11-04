import { useImperativeHandle } from 'react';

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
}: ChatComposerRichInputProps) {
  'use no memo';

  const composer = useChatComposerContext();
  const isDisabled = composer.disabled || disabled;
  const editable = !isDisabled && !readOnly;
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
      // Read-only text is still the user's message, such as a prefilled draft
      // being typed in, so only disabled input looks unavailable.
      isDisabled && 'text-disabled'
    ),
    editorAttributes: {
      role: 'textbox',
      style: `min-height: ${minHeight}px`,
      'aria-label': ariaLabel,
      'aria-multiline': 'true',
      'aria-disabled': String(isDisabled),
      'aria-readonly': String(readOnly),
      ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (editable) editor?.commands.focus('end');
      },
    }),
    [editor, editable]
  );

  useImperativeHandle(
    composer.inputFocusRef,
    () => () => {
      if (!editable || !editor) return false;
      editor.commands.focus('end');
      return true;
    },
    [editor, editable]
  );

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
