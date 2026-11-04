import { useState } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorReporterContext } from '../../../contexts/ErrorReporterContext';
import { act, fireEvent, render, screen } from '../../../test-utils';
import { ChatComposer } from '../ChatComposer';
import {
  ChatComposerInput,
  type ChatComposerInputHandle,
} from '../ChatComposerInput';

vi.mock('../ChatComposerRichInput', () => ({
  ChatComposerRichInput: () => {
    throw new Error('editor failed');
  },
}));

let input: ChatComposerInputHandle | null = null;

function FallbackHarness({
  reportError = () => {},
  disabled = false,
  readOnly = false,
}: {
  reportError?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState('**Bold** draft');
  const [result, setResult] = useState('Not submitted');
  return (
    <ErrorReporterContext.Provider value={reportError}>
      <ChatComposer disabled={disabled} onSubmit={() => setResult(draft)}>
        <ChatComposerInput
          ref={(handle) => {
            input = handle;
          }}
          value={draft}
          onChange={setDraft}
          readOnly={readOnly}
        />
      </ChatComposer>
      <output aria-label="Draft">{draft}</output>
      <output aria-label="Submission result">{result}</output>
    </ErrorReporterContext.Provider>
  );
}

describe('ChatComposerInput fallback', () => {
  beforeEach(() => {
    // React logs caught render errors in development.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the draft in a plain textarea and reports the editor error', async () => {
    const reportError = vi.fn();
    const { user } = render(<FallbackHarness reportError={reportError} />);
    const textarea = await screen.findByRole('textbox', { name: 'Message' });

    expect(textarea).toHaveValue('**Bold** draft');
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'editor failed' }),
      expect.anything(),
      expect.anything()
    );

    await user.type(textarea, '!');
    expect(screen.getByLabelText('Draft')).toHaveTextContent('**Bold** draft!');
  });

  it('sends with Enter, adds lines with Shift+Enter, and ignores IME confirmation', async () => {
    const { user } = render(<FallbackHarness />);
    const textarea = await screen.findByRole('textbox', { name: 'Message' });
    await user.click(textarea);

    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(textarea).toHaveValue('**Bold** draft\n');
    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Not submitted'
    );

    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      '**Bold** draft'
    );
  });

  it('keeps disabled and read-only behavior', async () => {
    const { rerender } = render(<FallbackHarness disabled />);
    expect(
      await screen.findByRole('textbox', { name: 'Message' })
    ).toBeDisabled();

    rerender(<FallbackHarness readOnly />);
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea).toHaveAttribute('readonly');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Not submitted'
    );
  });

  it('supports focusing the input through its ref', async () => {
    render(<FallbackHarness />);
    const textarea = await screen.findByRole('textbox', { name: 'Message' });

    act(() => input?.focus());
    expect(textarea).toHaveFocus();
  });
});
