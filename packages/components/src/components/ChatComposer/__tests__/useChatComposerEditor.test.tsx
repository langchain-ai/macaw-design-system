import { useState } from 'react';

import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';
import type { Editor } from '@tiptap/core';

import { useChatComposerEditor } from '../useChatComposerEditor';

function typeText(editor: Editor, text: string) {
  for (const char of text) {
    act(() => {
      const { view } = editor;
      const { from, to } = view.state.selection;
      const handled = view.someProp('handleTextInput', (handle) =>
        handle(view, from, to, char, () =>
          view.state.tr.insertText(char, from, to)
        )
      );
      if (!handled) view.dispatch(view.state.tr.insertText(char, from, to));
    });
  }
}

function renderControlledEditor(initialValue = '') {
  return renderHook(() => {
    const [value, setValue] = useState(initialValue);
    return {
      value,
      ...useChatComposerEditor({ value, onChange: setValue }),
    };
  });
}

describe('useChatComposerEditor', () => {
  it('restores the controlled value after each rejected edit', () => {
    const { result } = renderHook(() =>
      useChatComposerEditor({ value: 'hello', onChange: () => {} })
    );
    const { editor } = result.current;
    if (!editor) throw new Error('Expected the editor to be initialized');

    for (const text of ['!', '?']) {
      act(() => {
        editor.commands.insertContentAt(6, text);
      });

      expect(editor.getText()).toBe('hello');
    }
  });

  it('reconciles edits normalized back to the unchanged controlled value', () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState('HELLO');
      return useChatComposerEditor({
        value,
        onChange: (next) => setValue(next.toUpperCase()),
      });
    });
    const { editor } = result.current;
    if (!editor) throw new Error('Expected the editor to be initialized');

    act(() => {
      editor.commands.insertContentAt({ from: 1, to: 6 }, 'hello');
    });

    expect(editor.getText()).toBe('HELLO');
  });

  it('preserves the cursor for accepted edits in the middle of the draft', () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState('hello');
      return useChatComposerEditor({ value, onChange: setValue });
    });
    const { editor } = result.current;
    if (!editor) throw new Error('Expected the editor to be initialized');

    act(() => {
      editor.commands.setTextSelection(3);
      editor.commands.insertContent('X');
    });

    expect(editor.getText()).toBe('heXllo');
    expect(editor.state.selection.from).toBe(4);

    act(() => {
      editor.commands.insertContent('Y');
    });

    expect(editor.getText()).toBe('heXYllo');
    expect(editor.state.selection.from).toBe(5);
  });

  it('turns a typed Markdown link into a link and keeps it in the draft', () => {
    const { result } = renderControlledEditor();
    const { editor } = result.current;
    if (!editor) throw new Error('Expected the editor to be initialized');

    typeText(editor, 'Read [the docs](https://example.com/docs) now');

    expect(editor.getText()).toBe('Read the docs now');
    expect(editor.getHTML()).toContain('href="https://example.com/docs"');
    expect(result.current.value).toBe(
      'Read [the docs](https://example.com/docs) now'
    );
  });

  it('leaves a typed Markdown link with an unsafe URL as text', () => {
    const { result } = renderControlledEditor();
    const { editor } = result.current;
    if (!editor) throw new Error('Expected the editor to be initialized');

    typeText(editor, '[x](javascript:alert(1))');

    expect(editor.getHTML()).not.toContain('<a');
    expect(editor.getText()).toBe('[x](javascript:alert(1))');
  });
});
