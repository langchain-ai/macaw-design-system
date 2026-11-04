import { afterEach, describe, expect, it } from 'vitest';

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { ChatComposerCodeBlock } from '../ChatComposerCodeBlock';

const editors: Editor[] = [];

function createEditor(content: string) {
  const editor = new Editor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      ChatComposerCodeBlock,
    ],
    content,
  });
  editors.push(editor);
  return editor;
}

// jsdom does not implement contenteditable typing, so supply the browser's
// text-input transaction through ProseMirror's input-handler contract.
function typeText(editor: Editor, text: string) {
  for (const character of text) {
    const { view } = editor;
    const { from, to } = view.state.selection;
    const insert = () => view.state.tr.insertText(character, from, to);
    const handled = view.someProp('handleTextInput', (handler) =>
      handler(view, from, to, character, insert)
    );
    if (!handled) view.dispatch(insert());
  }
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
});

describe('ChatComposer rich shortcuts', () => {
  it('starts a new paragraph on Shift+Enter without triggering Enter submission', () => {
    const editor = createEditor('<p>Before</p>');
    let submissions = 0;
    editor.setOptions({
      editorProps: {
        handleKeyDown: (_view, event) => {
          if (event.key !== 'Enter' || event.shiftKey) return false;
          submissions += 1;
          return true;
        },
      },
    });
    editor.commands.setTextSelection(7);

    editor.commands.keyboardShortcut('Shift-Enter');
    typeText(editor, 'After');

    expect(editor.getHTML()).toContain('<p>Before</p><p>After</p>');
    expect(submissions).toBe(0);
  });

  it.each([
    { marker: '- ', expected: '<ul><li><p>Next</p></li></ul>' },
    { marker: '1. ', expected: '<ol><li><p>Next</p></li></ol>' },
    { marker: '# ', expected: '<h1>Next</h1>' },
  ])('recognizes $marker after Shift+Enter', ({ marker, expected }) => {
    const editor = createEditor('<p>Before</p>');
    editor.commands.setTextSelection(7);

    editor.commands.keyboardShortcut('Shift-Enter');
    typeText(editor, `${marker}Next`);

    expect(editor.getHTML()).toContain(`<p>Before</p>${expected}`);
  });

  it('keeps Shift+Enter inside the current code block', () => {
    const editor = createEditor('<pre><code>Before</code></pre>');
    editor.commands.setTextSelection(7);

    editor.commands.keyboardShortcut('Shift-Enter');
    typeText(editor, 'After');

    expect(editor.getHTML()).toContain('<pre><code>Before\nAfter</code></pre>');
  });

  it.each(['```', '~~~'])('opens a code block immediately for %s', (fence) => {
    const editor = createEditor('<p></p>');

    typeText(editor, fence);
    typeText(editor, 'print(1)');

    expect(editor.getHTML()).toContain('<pre><code>print(1)</code></pre>');
  });

  it('preserves formatted text on both sides of an inline fence', () => {
    const editor = createEditor('<p><strong>Before</strong>After</p>');
    editor.commands.setTextSelection(7);

    typeText(editor, '```');
    typeText(editor, 'code');

    expect(editor.getHTML()).toContain(
      '<p><strong>Before</strong></p><pre><code>code</code></pre><p>After</p>'
    );
  });

  it('opens a code block after Shift+Enter without leaving a soft break', () => {
    const editor = createEditor('<p>Before</p>');
    editor.commands.setTextSelection(7);
    editor.commands.keyboardShortcut('Shift-Enter');

    typeText(editor, '```');
    typeText(editor, 'code');

    expect(editor.getHTML()).toContain(
      '<p>Before</p><pre><code>code</code></pre>'
    );
  });

  it('can undo a fence conversion back to literal text', () => {
    const editor = createEditor('<p>Before</p>');
    editor.commands.setTextSelection(7);
    typeText(editor, '```');

    expect(editor.commands.undoInputRule()).toBe(true);

    expect(editor.getHTML()).toBe('<p>Before```</p>');
  });

  it.each(['ul', 'ol'])('continues a %s list on Shift+Enter', (tag) => {
    const editor = createEditor(`<${tag}><li><p>First</p></li></${tag}>`);
    editor.commands.setTextSelection(8);

    editor.commands.keyboardShortcut('Shift-Enter');
    typeText(editor, 'Second');

    expect(editor.getHTML()).toContain(
      '<li><p>First</p></li><li><p>Second</p></li>'
    );
  });

  it('leaves an empty list item on Shift+Enter', () => {
    const editor = createEditor('<ul><li><p>First</p></li></ul>');
    editor.commands.setTextSelection(8);
    editor.commands.keyboardShortcut('Shift-Enter');
    editor.commands.keyboardShortcut('Shift-Enter');
    typeText(editor, 'After');

    expect(editor.getHTML()).toContain('</ul><p>After</p>');
  });

  it('keeps fences literal inside an existing code block', () => {
    const editor = createEditor('<pre><code>existing</code></pre>');
    editor.commands.setTextSelection(9);

    typeText(editor, '```');

    expect(editor.getHTML()).toContain('<pre><code>existing```</code></pre>');
  });
});
