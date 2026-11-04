import type { EditorState } from '@codemirror/state';
import type { EditorView, ViewUpdate } from '@codemirror/view';
import type { Editor } from '@tiptap/core';
import { Selection, TextSelection } from '@tiptap/pm/state';

export function moveSelectionOutsideCodeBlock(
  editor: Editor,
  position: number,
  codeState: EditorState,
  key: string
) {
  const { head, empty } = codeState.selection.main;
  if (editor.isDestroyed || !editor.isEditable || !empty) return false;
  const node = editor.state.doc.nodeAt(position);
  if (node?.type.name !== 'codeBlock') return false;
  // Logical lines can wrap; let CodeMirror navigate until the document edge.
  const direction =
    head === 0 && (key === 'ArrowLeft' || key === 'ArrowUp')
      ? -1
      : head === codeState.doc.length &&
          (key === 'ArrowRight' || key === 'ArrowDown')
        ? 1
        : 0;
  if (!direction) return false;
  const target = direction < 0 ? position : position + node.nodeSize;
  const selection = Selection.near(editor.state.doc.resolve(target), direction);
  if (selection.from > position && selection.to < position + node.nodeSize) {
    if (direction < 0) {
      return editor
        .chain()
        .insertContentAt(position, { type: 'paragraph' })
        .setTextSelection(position + 1)
        .run();
    }
    return editor.commands.exitCode();
  }
  editor.view.dispatch(
    editor.state.tr.setSelection(selection).scrollIntoView()
  );
  return true;
}

export function syncCodeToComposer(
  editor: Editor,
  position: number,
  update: Pick<ViewUpdate, 'startState' | 'state' | 'changes'>
) {
  if (editor.isDestroyed || !editor.isEditable) return;
  const node = editor.state.doc.nodeAt(position);
  // Controlled replacements and undo can overtake a CodeMirror update.
  if (
    node?.type.name !== 'codeBlock' ||
    node.textContent !== update.startState.doc.toString()
  ) {
    return;
  }

  const tr = editor.state.tr;
  let offset = position + 1;
  update.changes.iterChanges((from, to, _newFrom, _newTo, inserted) => {
    tr.insertText(inserted.toString(), offset + from, offset + to);
    offset += inserted.length - (to - from);
  });
  const { anchor, head } = update.state.selection.main;
  const selection = TextSelection.create(
    tr.doc,
    position + 1 + anchor,
    position + 1 + head
  );
  if (tr.docChanged || !editor.state.selection.eq(selection)) {
    editor.view.dispatch(tr.setSelection(selection));
  }
}

export class ComposerCodeBlockAdapter {
  view: EditorView | null = null;
  private syncing = false;
  private destroyed = false;
  private pendingFocus = false;

  constructor(
    private editor: Editor,
    private getPos: () => number | undefined
  ) {}

  attach(view: EditorView) {
    if (this.destroyed) return;
    this.view = view;
    this.syncFromComposer(this.pendingFocus && this.editor.view.hasFocus());
    this.pendingFocus = false;
  }

  forwardUpdate = (update: ViewUpdate) => {
    if (this.syncing || this.destroyed || !update.view.hasFocus) return;
    const position = this.getPos();
    if (position === undefined) return;
    this.syncing = true;
    try {
      syncCodeToComposer(this.editor, position, update);
    } finally {
      this.syncing = false;
    }
  };

  focus() {
    if (this.destroyed || this.editor.isDestroyed) return;
    if (!this.view) {
      this.pendingFocus = true;
      return;
    }
    this.syncFromComposer(true);
  }

  syncFromComposer(focus = false) {
    const view = this.view;
    if (!view || this.syncing || this.destroyed || this.editor.isDestroyed) {
      return;
    }
    const position = this.getPos();
    if (position === undefined) return;
    const node = this.editor.state.doc.nodeAt(position);
    if (node?.type.name !== 'codeBlock') return;
    const { from, to, anchor, head } = this.editor.state.selection;
    const inside = from > position && to < position + node.nodeSize;
    const selection = inside
      ? { anchor: anchor - position - 1, head: head - position - 1 }
      : undefined;
    const changed = view.state.doc.toString() !== node.textContent;
    const selectionChanged =
      selection &&
      (selection.anchor !== view.state.selection.main.anchor ||
        selection.head !== view.state.selection.main.head);

    this.syncing = true;
    try {
      if (changed || selectionChanged) {
        view.dispatch({
          changes: changed
            ? { from: 0, to: view.state.doc.length, insert: node.textContent }
            : undefined,
          selection,
        });
      }
      if (focus && inside && this.editor.isEditable) view.focus();
    } finally {
      this.syncing = false;
    }
  }

  destroy() {
    this.destroyed = true;
    this.view = null;
  }
}
