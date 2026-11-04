import type { NodeViewRenderer } from '@tiptap/core';
import { InputRule } from '@tiptap/core';
import CodeBlock from '@tiptap/extension-code-block';
import { Fragment } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { ComposerCodeBlockAdapter } from './ChatComposerCodeBlockAdapter';
import { ComposerCodeBlockView } from './ChatComposerCodeBlockView';

export const COMPOSER_CODE_FENCE = /^(?:```|~~~)([\w+-]*)$/;

const renderComposerCodeBlock: NodeViewRenderer = (props) => {
  const adapter = new ComposerCodeBlockAdapter(props.editor, props.getPos);
  const render = ReactNodeViewRenderer((nodeProps) => (
    <ComposerCodeBlockView {...nodeProps} adapter={adapter} />
  ));
  const nodeView = render(props);
  return {
    dom: nodeView.dom,
    // CodeMirror owns the editable DOM; Tiptap still owns the document/history.
    contentDOM: null,
    update: (node, decorations, innerDecorations) => {
      const updated =
        nodeView.update?.(node, decorations, innerDecorations) ?? false;
      if (updated) adapter.syncFromComposer();
      return updated;
    },
    setSelection: () => adapter.focus(),
    selectNode: () => nodeView.selectNode?.(),
    deselectNode: () => nodeView.deselectNode?.(),
    stopEvent: () => true,
    ignoreMutation: () => true,
    destroy: () => {
      adapter.destroy();
      nodeView.destroy?.();
    },
  };
};

export const ChatComposerCodeBlock = CodeBlock.extend({
  priority: 110,
  addNodeView() {
    return renderComposerCodeBlock;
  },
  addInputRules() {
    return [
      new InputRule({
        find: /(?:```|~~~)$/,
        handler: ({ state, range }) => {
          const { tr, selection } = state;
          const $from = tr.doc.resolve(range.from);
          const $to = tr.doc.resolve(range.to);
          if (
            !this.editor.isEditable ||
            !selection.empty ||
            $from.parent.type.name !== 'paragraph' ||
            !$from.sameParent($to)
          ) {
            return null;
          }

          const paragraph = $from.parent;
          let before = paragraph.content.cut(0, $from.parentOffset);
          let after = paragraph.content.cut($to.parentOffset);
          // The code block itself supplies the line boundary beside a soft break.
          if (before.lastChild?.type.name === 'hardBreak') {
            before = before.cut(0, before.size - 1);
          }
          if (after.firstChild?.type.name === 'hardBreak') {
            after = after.cut(1);
          }

          const parent = $from.node(-1);
          const index = $from.index(-1);
          // List items must start with a paragraph, even when it is empty.
          const keepBefore =
            before.size > 0 || (parent.type.name === 'listItem' && index === 0);
          const prefix = keepBefore ? [paragraph.copy(before)] : [];
          const replacement = Fragment.fromArray([
            ...prefix,
            this.type.create({ language: '' }),
            ...(after.size > 0 ? [paragraph.copy(after)] : []),
          ]);
          if (!parent.canReplace(index, index + 1, replacement)) return null;

          const start = $from.before();
          tr.replaceWith(start, $from.after(), replacement);
          // A separate trailing-node transaction would clear input-rule undo.
          if (tr.doc.lastChild?.type === this.type) {
            tr.insert(tr.doc.content.size, paragraph.type.create());
          }
          tr.setSelection(
            TextSelection.create(tr.doc, start + (prefix[0]?.nodeSize ?? 0) + 1)
          );
          tr.setStoredMarks([]);
        },
      }),
      ...(this.parent?.() ?? []),
    ];
  },
  addKeyboardShortcuts() {
    const inherited = this.parent?.();
    return {
      ...inherited,
      'Shift-Enter': ({ editor }) => {
        if (!editor.isEditable || editor.view.composing) return false;
        // Call editing commands directly: a synthetic Enter can submit the draft.
        return editor.commands.first(({ commands }) => [
          () => commands.newlineInCode(),
          () => commands.splitListItem('listItem'),
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock(),
        ]);
      },
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        const fence = COMPOSER_CODE_FENCE.exec($from.parent.textContent);
        if (
          empty &&
          $from.parent.type.name === 'paragraph' &&
          $from.parentOffset === $from.parent.content.size &&
          fence
        ) {
          return editor
            .chain()
            .deleteRange({ from: $from.start(), to: $from.end() })
            .setCodeBlock({ language: fence[1] ?? '' })
            .run();
        }
        return inherited?.Enter?.({ editor }) ?? false;
      },
    };
  },
});
