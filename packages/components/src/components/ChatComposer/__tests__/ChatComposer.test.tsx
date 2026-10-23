import { useState } from 'react';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  ChatComposer,
  ChatComposerAttachment,
  ChatComposerAttachmentMenu,
  ChatComposerAttachments,
  ChatComposerInput,
  ChatComposerModelSelect,
  ChatComposerToolbar,
} from '..';
import type { ChatComposerProps } from '..';
import { act, render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import { isComposerSubmitKey } from '../ChatComposerContext';

function ComposerHarness({
  initialDraft = 'A useful draft',
  disabled = false,
  submitDisabled = false,
  streaming = false,
  withSubmitHandler = true,
}: {
  initialDraft?: string;
  disabled?: boolean;
  submitDisabled?: boolean;
  streaming?: boolean;
  withSubmitHandler?: boolean;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState('Not submitted');
  const [model, setModel] = useState('balanced');
  const actionProps: ChatComposerProps = streaming
    ? { action: 'stop', onStop: () => setResult('Stopped') }
    : { action: 'send' };

  return (
    <>
      <ChatComposer
        {...actionProps}
        disabled={disabled}
        submitDisabled={submitDisabled || (!draft.trim() && files.length === 0)}
        onSubmit={
          withSubmitHandler
            ? () => setResult(draft || 'Attachments submitted')
            : undefined
        }
        onFilesSelected={setFiles}
      >
        {files.length > 0 && (
          <ChatComposerAttachments>
            {files.map((file) => (
              <ChatComposerAttachment
                key={file.name}
                name={file.name}
                onRemove={() =>
                  setFiles((current) => current.filter((item) => item !== file))
                }
              />
            ))}
          </ChatComposerAttachments>
        )}
        <ChatComposerInput value={draft} onChange={setDraft} />
        <ChatComposerToolbar
          modelSelector={
            <ChatComposerModelSelect
              value={model}
              onChange={(value) => value && setModel(value)}
              options={[
                { value: 'balanced', label: 'Balanced' },
                { value: 'reasoning', label: 'Reasoning' },
              ]}
            />
          }
        >
          <ChatComposerAttachmentMenu />
        </ChatComposerToolbar>
      </ChatComposer>
      <output aria-label="Submission result">{result}</output>
    </>
  );
}

function AttachmentActionsHarness({
  composerDisabled = false,
  attachmentDisabled = false,
}: {
  composerDisabled?: boolean;
  attachmentDisabled?: boolean;
}) {
  const [result, setResult] = useState('No action');
  return (
    <>
      <ChatComposer disabled={composerDisabled}>
        <ChatComposerAttachments>
          <ChatComposerAttachment
            name="report.pdf"
            contentType="application/pdf"
            disabled={attachmentDisabled}
            onOpen={() => setResult('Preview opened')}
            onRemove={() => setResult('Removed')}
            actions={
              <Button type="button" onClick={() => setResult('Downloaded')}>
                Download
              </Button>
            }
          />
        </ChatComposerAttachments>
      </ChatComposer>
      <output aria-label="Attachment action">{result}</output>
    </>
  );
}

describe('ChatComposer', () => {
  let originalRangeRect: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalRangeRect = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getBoundingClientRect'
    );
    // jsdom lacks the range measurement ProseMirror uses on selection changes.
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(),
    });
  });

  afterAll(() => {
    if (originalRangeRect) {
      Object.defineProperty(
        Range.prototype,
        'getBoundingClientRect',
        originalRangeRect
      );
    } else {
      Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
    }
  });

  it.each([
    { composerDisabled: true, attachmentDisabled: false },
    { composerDisabled: false, attachmentDisabled: true },
  ])(
    'blocks attachment actions when disabled by $composerDisabled composer / $attachmentDisabled attachment',
    async (disabledProps) => {
      const { user, rerender } = render(
        <AttachmentActionsHarness {...disabledProps} />
      );

      expect(
        screen.getByRole('button', { name: 'View report.pdf' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Remove report.pdf' })
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'View report.pdf' }));
      await user.click(
        screen.getByRole('button', { name: 'Remove report.pdf' })
      );
      expect(screen.getByLabelText('Attachment action')).toHaveTextContent(
        'No action'
      );

      rerender(<AttachmentActionsHarness />);
      await user.click(screen.getByRole('button', { name: 'View report.pdf' }));
      expect(screen.getByLabelText('Attachment action')).toHaveTextContent(
        'Preview opened'
      );
      await user.click(screen.getByRole('button', { name: 'Download' }));
      expect(screen.getByLabelText('Attachment action')).toHaveTextContent(
        'Downloaded'
      );
      await user.click(
        screen.getByRole('button', { name: 'Remove report.pdf' })
      );
      expect(screen.getByLabelText('Attachment action')).toHaveTextContent(
        'Removed'
      );
    }
  );

  it('submits the controlled draft without clearing it', async () => {
    const { user } = render(<ComposerHarness />);
    await act(() => vi.dynamicImportSettled());
    const input = await screen.findByRole('textbox', { name: 'Message' });

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'A useful draft'
    );
    expect(input).toHaveTextContent('A useful draft');
  });

  it('blocks submission when the consumer marks it unavailable', async () => {
    const { user } = render(<ComposerHarness submitDisabled />);
    await screen.findByRole('textbox', { name: 'Message' });
    const send = screen.getByRole('button', { name: 'Send message' });

    expect(send).toBeDisabled();
    await user.click(send);
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Not submitted'
    );
  });

  it('submits a paragraph using Enter', async () => {
    const { user } = render(<ComposerHarness />);
    const input = await screen.findByRole('textbox', { name: 'Message' });

    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'A useful draft'
    );
  });

  it('inserts a paragraph with Enter when no submit handler is configured', async () => {
    const { user, rerender } = render(
      <ComposerHarness withSubmitHandler={false} />
    );
    const input = await screen.findByRole('textbox', { name: 'Message' });

    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(within(input).getAllByRole('paragraph')).toHaveLength(2);
    expect(input).toHaveTextContent('A useful draft');
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Not submitted'
    );

    rerender(<ComposerHarness />);
    await user.keyboard('{Enter}');

    expect(within(input).getAllByRole('paragraph')).toHaveLength(2);
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'A useful draft'
    );
  });

  it.each([
    { state: 'submission is disabled', submitDisabled: true },
    { state: 'a response is streaming', streaming: true },
  ])('keeps Enter reserved for sending when $state', async (props) => {
    const { user } = render(<ComposerHarness {...props} />);
    const input = await screen.findByRole('textbox', { name: 'Message' });

    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}{Control>}{Enter}{/Control}');

    expect(within(input).getAllByRole('paragraph')).toHaveLength(1);
    expect(input).toHaveTextContent('A useful draft');
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Not submitted'
    );

    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(within(input).getAllByRole('paragraph')).toHaveLength(2);
  });

  it.each(['Control', 'Meta'])(
    'submits from a code block using %s+Enter',
    async (modifier) => {
      const draft = '```python\nprint("hello")\n```';
      const { user } = render(<ComposerHarness initialDraft={draft} />);
      const input = await screen.findByRole('textbox', {
        name: 'Python code block',
      });

      await user.click(input);
      expect(input).toHaveFocus();
      await user.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);

      expect(screen.getByLabelText('Submission result')).toHaveTextContent(
        draft.replaceAll('\n', ' ')
      );
    }
  );

  it('keeps Stop available with an empty draft and submission disabled', async () => {
    const { user } = render(
      <ComposerHarness streaming submitDisabled initialDraft="" />
    );
    const input = await screen.findByRole('textbox', { name: 'Message' });
    const stop = screen.getByRole('button', { name: 'Stop response' });

    expect(stop).toBeEnabled();
    expect(input).toHaveAttribute('contenteditable', 'true');
    await user.click(stop);
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Stopped'
    );
  });

  it('disables editing, attachment selection and submission together', async () => {
    render(<ComposerHarness disabled />);

    expect(
      await screen.findByRole('textbox', { name: 'Message' })
    ).toHaveAttribute('contenteditable', 'false');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Add attachments' })
    ).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Model' })).toBeDisabled();
  });

  it('supports attachment-only messages and selecting the same file again after removal', async () => {
    const { user } = render(<ComposerHarness initialDraft="" />);
    await screen.findByRole('textbox', { name: 'Message' });
    const file = new File(['context'], 'context.txt', { type: 'text/plain' });
    const picker = screen.getByLabelText('Upload files');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    await user.upload(picker, file);
    expect(
      within(screen.getByRole('list', { name: 'Attachments' })).getByText(
        'context.txt'
      )
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByLabelText('Submission result')).toHaveTextContent(
      'Attachments submitted'
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove context.txt' })
    );
    expect(
      screen.queryByRole('list', { name: 'Attachments' })
    ).not.toBeInTheDocument();
    await user.upload(picker, file);
    expect(
      within(screen.getByRole('list', { name: 'Attachments' })).getByText(
        'context.txt'
      )
    ).toBeVisible();
  });

  it('presents uploading and attachment error states', () => {
    render(
      <ChatComposer>
        <ChatComposerAttachments>
          <ChatComposerAttachment name="trace.json" status="uploading" />
          <ChatComposerAttachment name="archive.zip" status="error" />
        </ChatComposerAttachments>
      </ChatComposer>
    );

    expect(screen.getByText('Uploading…')).toBeVisible();
    expect(screen.getByText('Upload failed.')).toBeVisible();
  });

  it('changes the selected model through the supplied options', async () => {
    const { user } = render(<ComposerHarness />);
    await screen.findByRole('textbox', { name: 'Message' });

    await user.click(screen.getByRole('combobox', { name: 'Model' }));
    await user.click(await screen.findByRole('option', { name: 'Reasoning' }));

    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveTextContent(
      'Reasoning'
    );
  });

  it('renders editable code inside the same rich input', async () => {
    render(
      <ComposerHarness
        initialDraft={'Please review:\n\n```python\nprint("hello")\n```'}
      />
    );
    const input = await screen.findByRole('textbox', { name: 'Message' });

    expect(input).toBeVisible();
    expect(input).toHaveTextContent('print("hello")');
    expect(
      await within(input).findByRole('combobox', {
        name: 'Code language',
      })
    ).toHaveTextContent('Python');
    expect(input).toHaveAttribute('contenteditable', 'true');
  });

  it('does not submit from the code language picker', async () => {
    const { user } = render(
      <ComposerHarness initialDraft={'```python\nprint("hello")\n```'} />
    );
    await screen.findByRole('textbox', { name: 'Python code block' });

    await user.click(screen.getByRole('combobox', { name: 'Code language' }));
    await user.keyboard('{Escape}');
    expect(
      screen.getByRole('combobox', { name: 'Code language' })
    ).toHaveFocus();
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(
      screen.getByRole('status', { name: 'Submission result' })
    ).toHaveTextContent('Not submitted');
  });

  it('keeps raw HTML literal in the rich draft', async () => {
    render(
      <ComposerHarness
        initialDraft={
          '<img src="https://example.invalid/file.png" onerror="alert(1)">'
        }
      />
    );
    const input = await screen.findByRole('textbox', { name: 'Message' });

    expect(input).toHaveTextContent(
      '<img src="https://example.invalid/file.png" onerror="alert(1)">'
    );
    expect(within(input).queryByRole('img')).not.toBeInTheDocument();
  });

  it('disables inline code controls when the input becomes read-only', async () => {
    const draft = '```python\nprint("hello")\n```';
    const { rerender } = render(
      <ChatComposer>
        <ChatComposerInput value={draft} onChange={() => {}} />
      </ChatComposer>
    );
    expect(
      await screen.findByRole('combobox', { name: 'Code language' })
    ).toBeEnabled();

    rerender(
      <ChatComposer>
        <ChatComposerInput value={draft} onChange={() => {}} readOnly />
      </ChatComposer>
    );

    expect(
      screen.getByRole('combobox', { name: 'Code language' })
    ).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveAttribute(
      'contenteditable',
      'false'
    );
  });

  it('follows controlled replacements and draft resets', async () => {
    const { rerender } = render(
      <ChatComposer>
        <ChatComposerInput value="First draft" onChange={() => {}} />
      </ChatComposer>
    );
    expect(
      await screen.findByRole('textbox', { name: 'Message' })
    ).toHaveTextContent('First draft');

    rerender(
      <ChatComposer>
        <ChatComposerInput value="Replacement draft" onChange={() => {}} />
      </ChatComposer>
    );
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveTextContent(
      'Replacement draft'
    );

    rerender(
      <ChatComposer>
        <ChatComposerInput value="" onChange={() => {}} />
      </ChatComposer>
    );
    expect(
      screen.getByRole('textbox', { name: 'Message' })
    ).not.toHaveTextContent(/\S/);
  });
});

describe('composer submit keys', () => {
  it('reserves unmodified Enter for sending and Shift+Enter for newlines', () => {
    expect(
      isComposerSubmitKey(new KeyboardEvent('keydown', { key: 'Enter' }))
    ).toBe(true);
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
      )
    ).toBe(false);
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', altKey: true })
      )
    ).toBe(false);
  });

  it('never sends an IME confirmation key', () => {
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', isComposing: true })
      )
    ).toBe(false);
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229 })
      )
    ).toBe(false);
  });

  it('requires Ctrl or Meta to send from a multiline block', () => {
    expect(
      isComposerSubmitKey(new KeyboardEvent('keydown', { key: 'Enter' }), true)
    ).toBe(false);
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }),
        true
      )
    ).toBe(true);
    expect(
      isComposerSubmitKey(
        new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }),
        true
      )
    ).toBe(true);
  });
});
