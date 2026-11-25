import { useState } from 'react';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';

import { act, render, screen, within } from '../../../test-utils';
import { ChatComposerFormattingMenu } from '../ChatComposerFormattingMenu';
import { useChatComposerEditor } from '../useChatComposerEditor';

let editor: Editor | null = null;

function Harness({ initialValue }: { initialValue: string }) {
  'use no memo';

  const [value, setValue] = useState(initialValue);
  const result = useChatComposerEditor({ value, onChange: setValue });
  editor = result.editor;
  return (
    <>
      <EditorContent editor={result.editor} />
      {result.editor && <ChatComposerFormattingMenu editor={result.editor} />}
      <output aria-label="Draft">{value}</output>
    </>
  );
}

function renderMenu(initialValue: string) {
  const view = render(<Harness initialValue={initialValue} />);
  if (!editor) throw new Error('Expected the editor to be initialized');
  return { ...view, editor };
}

function select(target: Editor, from: number, to: number) {
  act(() => {
    // The focus command waits a frame; focus the view directly.
    target.view.focus();
    target.commands.setTextSelection({ from, to });
  });
}

describe('ChatComposerFormattingMenu', () => {
  let originalRangeRect: PropertyDescriptor | undefined;
  let originalClientRects: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalRangeRect = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getBoundingClientRect'
    );
    originalClientRects = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getClientRects'
    );
    // jsdom has no layout; give the selection a visible box to anchor to.
    const rect = () => new DOMRect(100, 100, 40, 16);
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: rect,
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [rect()],
    });
    // jsdom reports a 0×0 viewport, which clips every anchor.
    for (const [name, value] of [
      ['clientWidth', 1024],
      ['clientHeight', 768],
    ] as const) {
      Object.defineProperty(document.documentElement, name, {
        configurable: true,
        value,
      });
    }
  });

  afterAll(() => {
    for (const [name, descriptor] of [
      ['getBoundingClientRect', originalRangeRect],
      ['getClientRects', originalClientRects],
    ] as const) {
      if (descriptor) Object.defineProperty(Range.prototype, name, descriptor);
      else Reflect.deleteProperty(Range.prototype, name);
    }
    Reflect.deleteProperty(document.documentElement, 'clientWidth');
    Reflect.deleteProperty(document.documentElement, 'clientHeight');
  });

  it('stays hidden until text is selected', () => {
    const { editor } = renderMenu('Hello world');

    act(() => {
      editor.view.focus();
    });
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    select(editor, 7, 12);
    expect(
      screen.getByRole('toolbar', { name: 'Formatting' })
    ).toBeInTheDocument();
  });

  it('formats the selection and shows the active marks', async () => {
    const { editor, user } = renderMenu('Hello world');
    select(editor, 7, 12);
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });

    await user.click(within(toolbar).getByRole('button', { name: 'Bold' }));

    expect(screen.getByLabelText('Draft')).toHaveTextContent(
      /^Hello \*\*world\*\*$/
    );
    expect(
      within(toolbar).getByRole('button', { name: 'Bold' })
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(toolbar).getByRole('button', { name: 'Italic' }));

    expect(screen.getByLabelText('Draft')).toHaveTextContent(
      /^Hello \*\*\*world\*\*\*$/
    );
  });

  it('links the selection to an entered address', async () => {
    const { editor, user } = renderMenu('Read the docs');
    select(editor, 10, 14);

    await user.click(screen.getByRole('button', { name: 'Add link' }));
    const field = screen.getByRole('textbox', { name: 'Link URL' });
    expect(field).toHaveFocus();
    await user.type(field, 'example.com/docs{Enter}');

    expect(screen.getByLabelText('Draft')).toHaveTextContent(
      /^Read the \[docs\]\(https:\/\/example\.com\/docs\)$/
    );
    expect(screen.getByRole('button', { name: 'Remove link' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('turns the selected text into a list', async () => {
    const { editor, user } = renderMenu('First');
    select(editor, 1, 6);

    await user.click(screen.getByRole('button', { name: 'Block type: Text' }));
    await user.click(screen.getByRole('menuitem', { name: 'Bulleted list' }));

    expect(screen.getByLabelText('Draft')).toHaveTextContent(/^- First$/);
  });
});
