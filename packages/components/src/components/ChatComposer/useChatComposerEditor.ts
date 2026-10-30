import { useEffect, useReducer, useRef } from 'react';

import { Markdown, type MarkdownStorage } from 'tiptap-markdown';

import { Extension, type Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
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

// tiptap-markdown writes any table that is not a simple grid as the literal
// "[table]", so the editor has no table nodes. Pipe rows stay plain text so
// drafts, host values, and pasted tables keep their content.
const PlainTextTables = Extension.create({
  name: 'composerPlainTextTables',
  addStorage() {
    return {
      markdown: {
        parse: {
          setup(markdownit: { disable: (rule: string) => unknown }) {
            markdownit.disable('table');
          },
        },
      },
    };
  },
});

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
  const pastingTableText = useRef(false);
  const [editRevision, reconcileEdit] = useReducer(
    (revision: number) => revision + 1,
    0
  );
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      PlainTextTables,
      Markdown.configure({
        html: false,
        // A single newline in a host value would otherwise collapse to a
        // space the first time the draft is edited.
        breaks: true,
        transformPastedText: true,
      }),
      Placeholder.configure({ placeholder }),
      ChatComposerCodeBlock,
    ],
    content: value,
    editorProps: {
      attributes: { class: editorClassName ?? '', ...editorAttributes },
      handlePaste: (view, event) => {
        if (pastingTableText.current) return false;
        const html = event.clipboardData?.getData('text/html') ?? '';
        const text = event.clipboardData?.getData('text/plain');
        // Without table nodes, pasted HTML cells run together. Spreadsheets and
        // browsers also copy the table as text with tabs and line breaks.
        if (!text || !/<table[\s>]/i.test(html)) return false;
        // pasteText reruns this handler with the same event.
        pastingTableText.current = true;
        try {
          view.pasteText(text, event);
        } finally {
          pastingTableText.current = false;
        }
        return true;
      },
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
            ['codeBlock', 'listItem', 'blockquote'].includes(
              $from.node(depth).type.name
            )
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
