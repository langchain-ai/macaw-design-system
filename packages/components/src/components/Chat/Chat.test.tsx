import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ChatComposer,
  ChatConversation,
  ChatMessage,
  ChatStatus,
  ChatToolCall,
} from '.';

function Composer({
  onSubmit = vi.fn(),
  ...props
}: Partial<React.ComponentProps<typeof ChatComposer>>) {
  const [value, setValue] = useState('');
  return (
    <ChatComposer
      value={value}
      onValueChange={setValue}
      onSubmit={onSubmit}
      {...props}
    />
  );
}

describe('ChatComposer', () => {
  it('submits controlled text with Enter and preserves the draft for the owner', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(input, 'Hello{enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Hello');
    expect(input).toHaveValue('Hello');
  });

  it('keeps Shift+Enter as a newline and ignores composition confirmation', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello{shift>}{enter}{/shift}world');
    expect(input).toHaveValue('Hello\nworld');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects whitespace, streaming submissions, and disabled submissions', async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<Composer onSubmit={onSubmit} value="  " />);
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    rerender(<Composer onSubmit={onSubmit} value="Draft" streaming />);
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    rerender(<Composer onSubmit={onSubmit} value="Draft" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('stops without submitting and lets the consumer override Enter handling', async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(
      <Composer value="Draft" streaming onStop={onStop} onSubmit={onSubmit} />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Stop generating' })
    );
    expect(onStop).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <Composer
        value="Draft"
        onSubmit={onSubmit}
        textareaProps={{ onKeyDown: (event) => event.preventDefault() }}
      />
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Draft');
  });
});

describe('Chat presentation', () => {
  it('labels conversation and messages, with busy state and arbitrary content/actions', () => {
    const { rerender } = render(
      <ChatConversation label="Support">
        <ChatMessage
          author="Assistant"
          streaming
          actions={<button>Copy</button>}
        >
          {'<script>alert(1)</script>'}
        </ChatMessage>
      </ChatConversation>
    );
    expect(screen.getByRole('log', { name: 'Support' })).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(screen.getByRole('article', { name: 'Assistant' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByText('<script>alert(1)</script>')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
    rerender(<ChatMessage author="Assistant">Done</ChatMessage>);
    expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'false');
  });

  it('exposes keyboard-operable tool disclosure and distinct feedback', async () => {
    render(
      <>
        <ChatToolCall title="Search docs" state="error">
          <p>Could not reach the index.</p>
        </ChatToolCall>
        <ChatStatus state="error" actions={<button>Retry</button>}>
          Connection lost.
        </ChatStatus>
      </>
    );
    expect(screen.getByText('Failed')).toBeVisible();
    expect(screen.getByText('Could not reach the index.')).not.toBeVisible();
    await userEvent.click(screen.getByText('Search docs'));
    expect(screen.getByText('Could not reach the index.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Connection lost.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
