import { afterEach, describe, expect, it } from 'vitest';

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { loadCodeMirror } from '../../../utils/lazy-codemirror-loader';
import {
  moveSelectionOutsideCodeBlock,
  syncCodeToComposer,
} from '../ChatComposerCodeBlockAdapter';

const editors: Editor[] = [];

function createEditor(code = 'one two three') {
  const editor = new Editor({
    extensions: [StarterKit.configure({ link: false })],
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Before' }] },
        {
          type: 'codeBlock',
          attrs: { language: 'python' },
          content: [{ type: 'text', text: code }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'After' }] },
      ],
    },
  });
  editors.push(editor);
  return { editor, position: editor.state.doc.child(0).nodeSize };
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
});

describe('CodeMirror to composer synchronization', () => {
  it('applies multiple edits and cursor offsets while preserving prose and language', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({ doc: 'one two three' });
    const { editor, position } = createEditor();

    syncCodeToComposer(
      editor,
      position,
      state.update({
        changes: [
          { from: 0, to: 3, insert: '1' },
          { from: 8, to: 13, insert: '3' },
        ],
        selection: { anchor: 7 },
      })
    );

    expect(editor.getJSON().content).toMatchObject([
      { type: 'paragraph', content: [{ text: 'Before' }] },
      {
        type: 'codeBlock',
        attrs: { language: 'python' },
        content: [{ text: '1 two 3' }],
      },
      { type: 'paragraph', content: [{ text: 'After' }] },
    ]);
    expect(editor.state.selection.from).toBe(position + 1 + 7);

    editor.commands.undo();
    expect(editor.state.doc.child(1).textContent).toBe('one two three');
    editor.commands.redo();
    expect(editor.state.doc.child(1).textContent).toBe('1 two 3');
  });

  it('maps selection-only updates without changing the draft', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({ doc: 'one two three' });
    const { editor, position } = createEditor();
    const original = editor.getJSON();

    syncCodeToComposer(
      editor,
      position,
      state.update({ selection: { anchor: 4, head: 2 } })
    );

    expect(editor.getJSON()).toEqual(original);
    expect(editor.state.selection.anchor).toBe(position + 1 + 4);
    expect(editor.state.selection.head).toBe(position + 1 + 2);
  });

  it('ignores stale changes after a controlled replacement', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({ doc: 'old draft' });
    const { editor, position } = createEditor('replacement draft');

    syncCodeToComposer(
      editor,
      position,
      state.update({ changes: { from: 0, insert: 'stale ' } })
    );

    expect(editor.state.doc.child(1).textContent).toBe('replacement draft');
  });

  it('ignores code changes while the composer is read-only', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({ doc: 'one two three' });
    const { editor, position } = createEditor();
    editor.setEditable(false);

    syncCodeToComposer(
      editor,
      position,
      state.update({ changes: { from: 0, insert: 'blocked ' } })
    );

    expect(editor.state.doc.child(1).textContent).toBe('one two three');
  });

  it('keeps HTML entered as code literal', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({ doc: 'one two three' });
    const { editor, position } = createEditor();
    const code = '<img src="example" onerror="alert(1)">';

    syncCodeToComposer(
      editor,
      position,
      state.update({ changes: { from: 0, to: state.doc.length, insert: code } })
    );

    expect(editor.state.doc.child(1).textContent).toBe(code);
    expect(editor.getHTML()).not.toContain('<img');
  });
});

describe('Code block boundary navigation', () => {
  it.each([
    { code: 'print(1)\nprint(2)', head: 5, key: 'ArrowUp' },
    { code: 'print(1)\nprint(2)', head: 14, key: 'ArrowDown' },
    { code: 'long code that can wrap '.repeat(40), head: 100, key: 'ArrowUp' },
    {
      code: 'long code that can wrap '.repeat(40),
      head: 100,
      key: 'ArrowDown',
    },
  ])('keeps $key within code at offset $head', async ({ code, head, key }) => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({
      doc: code,
      selection: { anchor: head },
    });
    const { editor, position } = createEditor(code);
    editor.commands.setTextSelection(position + 1 + head);
    const original = editor.getJSON();

    expect(moveSelectionOutsideCodeBlock(editor, position, state, key)).toBe(
      false
    );

    expect(editor.getJSON()).toEqual(original);
    expect(editor.state.selection.head).toBe(position + 1 + head);
  });

  it.each([
    { key: 'ArrowUp', head: 0, paragraph: 'Before' },
    { key: 'ArrowLeft', head: 0, paragraph: 'Before' },
    { key: 'ArrowDown', head: 13, paragraph: 'After' },
    { key: 'ArrowRight', head: 13, paragraph: 'After' },
  ])(
    'moves $key into the adjacent paragraph at the code edge',
    async ({ key, head, paragraph }) => {
      const cm = await loadCodeMirror();
      const state = cm.EditorState.create({
        doc: 'one two three',
        selection: { anchor: head },
      });
      const { editor, position } = createEditor();
      editor.commands.setTextSelection(position + 1 + head);
      const original = editor.getJSON();

      expect(moveSelectionOutsideCodeBlock(editor, position, state, key)).toBe(
        true
      );

      expect(editor.state.selection.$from.parent.type.name).toBe('paragraph');
      expect(editor.state.selection.$from.parent.textContent).toBe(paragraph);
      expect(editor.getJSON()).toEqual(original);
    }
  );

  it('does not exit when text is selected', async () => {
    const cm = await loadCodeMirror();
    const state = cm.EditorState.create({
      doc: 'one two three',
      selection: { anchor: 5, head: 0 },
    });
    const { editor, position } = createEditor();
    editor.commands.setTextSelection({ from: position + 1, to: position + 6 });
    const original = editor.state.selection;

    expect(
      moveSelectionOutsideCodeBlock(editor, position, state, 'ArrowUp')
    ).toBe(false);
    expect(editor.state.selection.eq(original)).toBe(true);
  });

  it('creates a paragraph above a leading code block only at its start', async () => {
    const cm = await loadCodeMirror();
    const { editor } = createEditor();
    editor.commands.setContent('<pre><code>print(1)</code></pre>');
    editor.commands.setTextSelection(6);
    const middle = cm.EditorState.create({
      doc: 'print(1)',
      selection: { anchor: 5 },
    });

    expect(moveSelectionOutsideCodeBlock(editor, 0, middle, 'ArrowUp')).toBe(
      false
    );
    expect(editor.state.doc.firstChild?.type.name).toBe('codeBlock');

    editor.commands.setTextSelection(1);
    const start = cm.EditorState.create({ doc: 'print(1)' });
    expect(moveSelectionOutsideCodeBlock(editor, 0, start, 'ArrowUp')).toBe(
      true
    );
    expect(editor.state.doc.firstChild?.type.name).toBe('paragraph');
    expect(editor.state.selection.head).toBe(1);
    expect(editor.state.doc.child(1).textContent).toBe('print(1)');
  });
});
