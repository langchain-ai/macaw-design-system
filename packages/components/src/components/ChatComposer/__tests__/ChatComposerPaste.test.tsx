import { useState } from 'react';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '../../../test-utils';
import { Textarea } from '../../Textarea';
import { ChatComposer } from '../ChatComposer';
import { ChatComposerInput } from '../ChatComposerInput';

function PasteHarness({
  rich = false,
  initialDraft = 'Before after',
  disabled = false,
  inputDisabled = false,
  readOnly = false,
  intercept = false,
}: {
  rich?: boolean;
  initialDraft?: string;
  disabled?: boolean;
  inputDisabled?: boolean;
  readOnly?: boolean;
  intercept?: boolean;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [files, setFiles] = useState<File[]>([]);
  return (
    <ChatComposer
      aria-label="Composer"
      tabIndex={disabled ? 0 : undefined}
      disabled={disabled}
      onFilesSelected={(selected) =>
        setFiles((current) => [...current, ...selected])
      }
      onPasteCapture={intercept ? (event) => event.preventDefault() : undefined}
    >
      {rich ? (
        <ChatComposerInput
          value={draft}
          onChange={setDraft}
          disabled={inputDisabled}
          readOnly={readOnly}
        />
      ) : (
        <Textarea
          aria-label="Message"
          value={draft}
          onChange={setDraft}
          disabled={inputDisabled}
          readOnly={readOnly}
        />
      )}
      <output aria-label="Draft">{draft}</output>
      <output aria-label="Attached files">
        {files.map((file) => file.name).join(', ') || 'None'}
      </output>
    </ChatComposer>
  );
}

function clipboard(text: string, withFile = true, html?: string) {
  const data = new DataTransfer();
  data.setData('text/plain', text);
  if (html) data.setData('text/html', html);
  // The jsdom DataTransfer stub does not normalize the browser's "text" alias.
  data.setData('text', text);
  Object.defineProperty(data, 'files', {
    value: withFile
      ? [new File(['image'], 'image.png', { type: 'image/png' })]
      : [],
  });
  return data;
}

describe('ChatComposer paste and drop', () => {
  let originalRangeRect: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalRangeRect = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getBoundingClientRect'
    );
    // jsdom has no DataTransfer; the composer reads `types`, `files`, and `getData`.
    vi.stubGlobal(
      'DataTransfer',
      class {
        private data: Record<string, string> = {};
        dropEffect = 'none';
        files: File[] = [];
        types: string[] = [];

        setData(format: string, value: string) {
          this.data[format] = value;
          this.types.push(format);
        }

        getData(format: string) {
          return this.data[format] ?? '';
        }
      }
    );
    // jsdom lacks the range measurement ProseMirror uses to scroll after paste.
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
    vi.unstubAllGlobals();
  });

  it('attaches a mixed-paste file once and replaces selected text with its caption', async () => {
    const { user } = render(<PasteHarness />);
    const input = screen.getByRole('textbox', { name: 'Message' });
    await user.pointer([
      { target: input, offset: 7, keys: '[MouseLeft>]' },
      { target: input, offset: 12 },
      { keys: '[/MouseLeft]' },
    ]);

    await user.paste(clipboard('caption'));

    expect(input).toHaveValue('Before caption');
    expect(screen.getByLabelText('Attached files')).toHaveTextContent(
      /^image.png$/
    );
  });

  // textContent, not toHaveTextContent, so collapsed line breaks would fail.
  it.each([
    [
      'Markdown',
      '| Name | Qty |\n| --- | --- |\n| Apple | 2 |',
      undefined,
      '| Name | Qty |\\\n| --- | --- |\\\n| Apple | 2 |',
    ],
    [
      'spreadsheet',
      'Name\tQty\nApple\t2',
      '<table><tr><td>Name</td><td>Qty</td></tr><tr><td>Apple</td><td>2</td></tr></table>',
      'Name\tQty\n\nApple\t2',
    ],
  ])(
    'keeps the rows of a pasted %s table in the draft',
    async (_source, text, html, draft) => {
      const { user } = render(<PasteHarness rich initialDraft="" />);
      await screen.findByRole('textbox', { name: 'Message' });
      await user.tab();

      await user.paste(clipboard(text, false, html));

      expect(screen.getByLabelText('Draft').textContent).toBe(draft);
    }
  );

  it('keeps line breaks from the host value when the draft is edited', async () => {
    const { user } = render(
      <PasteHarness rich initialDraft={'first\nsecond'} />
    );
    await screen.findByRole('textbox', { name: 'Message' });
    await user.tab();

    await user.paste(clipboard('!', false));

    expect(screen.getByLabelText('Draft').textContent).toMatch(
      /first\\\nsecond/
    );
  });

  it('lets the rich editor insert mixed-paste text into its Markdown draft', async () => {
    const { user } = render(<PasteHarness rich initialDraft="" />);
    const input = await screen.findByRole('textbox', { name: 'Message' });
    await user.tab();
    expect(input).toHaveFocus();

    await user.paste(clipboard('caption'));

    expect(input).toHaveTextContent('caption');
    expect(screen.getByLabelText('Draft')).toHaveTextContent(/^caption$/);
    expect(screen.getByLabelText('Attached files')).toHaveTextContent(
      /^image.png$/
    );
  });

  it.each(['read-only', 'disabled'])(
    'does not attach files pasted into a %s rich input',
    async (state) => {
      render(
        <PasteHarness
          rich
          readOnly={state === 'read-only'}
          inputDisabled={state === 'disabled'}
        />
      );
      const input = await screen.findByRole('textbox', { name: 'Message' });

      // Non-editable rich content is not focusable; dispatch paste at its content.
      fireEvent.paste(within(input).getByText('Before after'), {
        clipboardData: clipboard('caption'),
      });

      expect(input).toHaveTextContent('Before after');
      expect(screen.getByLabelText('Draft')).toHaveTextContent('Before after');
      expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');
    }
  );

  it.each(['read-only', 'disabled'])(
    'rejects drops inside a %s rich input while allowing drops on the form',
    async (state) => {
      render(
        <PasteHarness
          rich
          readOnly={state === 'read-only'}
          inputDisabled={state === 'disabled'}
        />
      );
      const input = await screen.findByRole('textbox', { name: 'Message' });
      const content = within(input).getByText('Before after');
      const dataTransfer = {
        types: ['Files'],
        files: [new File(['image'], 'image.png', { type: 'image/png' })],
        dropEffect: 'copy',
      };

      // user-event does not support drag-and-drop events.
      const inputDragOver = createEvent.dragOver(content, { dataTransfer });
      fireEvent(content, inputDragOver);
      // Testing Library copies dataTransfer onto the dispatched event.
      expect(inputDragOver).toHaveProperty('dataTransfer.dropEffect', 'none');
      fireEvent.drop(content, { dataTransfer });

      expect(screen.getByLabelText('Draft')).toHaveTextContent('Before after');
      expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');

      const form = screen.getByRole('form', { name: 'Composer' });
      const formDragOver = createEvent.dragOver(form, { dataTransfer });
      fireEvent(form, formDragOver);
      expect(formDragOver).toHaveProperty('dataTransfer.dropEffect', 'copy');
      fireEvent.drop(form, { dataTransfer });

      expect(screen.getByLabelText('Attached files')).toHaveTextContent(
        /^image.png$/
      );
    }
  );

  it('does not attach files pasted into a read-only textarea', async () => {
    const { user } = render(<PasteHarness readOnly />);
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();

    await user.paste(clipboard('caption'));

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Before after'
    );
    expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');
  });

  it('attaches file-only pastes without inserting alternate clipboard content', async () => {
    const { user } = render(<PasteHarness />);
    await user.tab();
    const data = clipboard('');
    data.setData('text/html', '<img src="clipboard-image">');
    data.setData('text/uri-list', 'https://example.com/image.png');

    await user.paste(data);

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Before after'
    );
    expect(screen.getByLabelText('Attached files')).toHaveTextContent(
      /^image.png$/
    );
  });

  it('leaves ordinary text pastes to the editor', async () => {
    const { user } = render(<PasteHarness initialDraft="" />);
    await user.tab();

    await user.paste(clipboard('text only', false));

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'text only'
    );
    expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');
  });

  it('honors a consumer that intercepts a mixed paste', async () => {
    const { user } = render(<PasteHarness intercept />);
    await user.tab();

    await user.paste(clipboard('caption'));

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Before after'
    );
    expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');
  });

  it('does not attach pasted files while disabled', async () => {
    const { user } = render(<PasteHarness disabled />);
    await user.tab();
    expect(screen.getByRole('form', { name: 'Composer' })).toHaveFocus();

    await user.paste(clipboard('caption'));

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Before after'
    );
    expect(screen.getByLabelText('Attached files')).toHaveTextContent('None');
  });
});
