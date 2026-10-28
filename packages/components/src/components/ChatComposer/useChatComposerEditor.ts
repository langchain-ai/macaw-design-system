import { useEffect, useReducer, useRef } from 'react';

import { Markdown, type MarkdownStorage } from 'tiptap-markdown';

import type { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
  ChatComposerCodeBlock,
  COMPOSER_CODE_FENCE,
} from './ChatComposerCodeBlock';
import { isComposerSubmitKey } from './ChatComposerContext';

declare module '@tiptap/core' {
  interface Storage {
    markdown: MarkdownStorage;
  }
}

interface UseChatComposerEditorOptions {
  value: string;
  onChange: (md: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  editorClassName?: string;
  editorAttributes?: Record<string, string>;
}

export function useChatComposerEditor({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  editable = true,
  autofocus = false,
  editorClassName,
  editorAttributes,
}: UseChatComposerEditorOptions): { editor: Editor | null } {
  'use no memo';

  const valueRef = useRef(value);
  const [editRevision, reconcileEdit] = useReducer(
    (revision: number) => revision + 1,
    0
  );
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({ html: false, transformPastedText: true }),
      Placeholder.configure({ placeholder }),
      ChatComposerCodeBlock,
    ],
    content: value,
    editorProps: {
      attributes: { class: editorClassName ?? '', ...editorAttributes },
      handleKeyDown: (view, event) => {
        if (!onSubmit || !editable || view.composing || event.key !== 'Enter') {
          return false;
        }
        const { $from, empty } = view.state.selection;
        let multiline =
          empty &&
          $from.parent.type.name === 'paragraph' &&
          $from.parentOffset === $from.parent.content.size &&
          COMPOSER_CODE_FENCE.test($from.parent.textContent);
        for (let depth = $from.depth; depth > 0; depth--) {
          if (
            [
              'codeBlock',
              'listItem',
              'blockquote',
              'tableCell',
              'tableHeader',
            ].includes($from.node(depth).type.name)
          ) {
            multiline = true;
            break;
          }
        }
        if (!isComposerSubmitKey(event, multiline)) return false;
        event.preventDefault();
        onSubmit();
        return true;
      },
    },
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      const nextValue = editor.storage.markdown.getMarkdown();
      valueRef.current = nextValue;
      onChange(nextValue);
      // Reconcile even when the parent rejects the edit and keeps the same value.
      reconcileEdit();
    },
  });

  useEffect(() => {
    if (!editor || valueRef.current === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
    valueRef.current = value;
  }, [value, editor, editRevision]);

  useEffect(() => {
    if (!editor || editor.isEditable === editable) return;
    editor.setEditable(editable, false);
  }, [editable, editor]);

  return { editor };
}
