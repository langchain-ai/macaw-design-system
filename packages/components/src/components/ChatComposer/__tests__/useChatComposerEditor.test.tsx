import { useState } from 'react';

import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useChatComposerEditor } from '../useChatComposerEditor';

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
});
