import { describe, expect, it, vi } from 'vitest';

import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import userEvent from '@testing-library/user-event';

import { act, fireEvent, render, screen } from '../../../test-utils';
import { IconButton } from '../../IconButton';
import { Input } from '../Input';

describe('Input', () => {
  it('uses the caller value as the source of truth when controlled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input label="Search" value="fixed" onChange={handleChange} />);

    const input = screen.getByLabelText('Search');
    await user.type(input, 'x');

    expect(input).toHaveValue('fixed');
    expect(handleChange).toHaveBeenCalledWith('fixedx', expect.anything());
  });

  it('lets the native input manage its value when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Input label="Search" onChange={() => {}} />);

    const input = screen.getByLabelText('Search');
    await user.type(input, 'query');

    expect(input).toHaveValue('query');
  });

  it('renders a null value as an empty controlled input', () => {
    render(<Input label="Search" value={null} onChange={() => {}} />);

    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('associates its label with the input', () => {
    render(
      <Input
        id="workspace-name"
        label="Workspace name"
        value="LangSmith"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Workspace name')).toHaveAttribute(
      'for',
      'workspace-name'
    );
    expect(screen.getByLabelText('Workspace name')).toHaveAttribute(
      'id',
      'workspace-name'
    );
  });

  it('describes the input with its hint text', () => {
    render(
      <Input
        id="workspace-name"
        label="Workspace name"
        hintText="Letters, numbers, and dashes only."
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Workspace name')).toHaveAccessibleDescription(
      'Letters, numbers, and dashes only.'
    );
  });

  it('keeps a caller-provided description alongside the hint text', () => {
    render(
      <>
        <span id="external-help">Shared across the workspace.</span>
        <Input
          label="Workspace name"
          hintText="Letters, numbers, and dashes only."
          aria-describedby="external-help"
          value=""
          onChange={() => {}}
        />
      </>
    );

    expect(screen.getByLabelText('Workspace name')).toHaveAccessibleDescription(
      'Letters, numbers, and dashes only. Shared across the workspace.'
    );
  });

  it('marks error fields as invalid', () => {
    render(
      <Input label="Workspace name" isError value="" onChange={() => {}} />
    );

    expect(screen.getByLabelText('Workspace name')).toBeInvalid();
  });

  it('flushes a pending debounced change when unmounted', () => {
    const handleChange = vi.fn();
    const { unmount } = render(
      <Input
        label="Workspace name"
        debounceMs={300}
        value=""
        onChange={handleChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Workspace name'), {
      target: { value: 'LangSmith' },
    });
    expect(handleChange).not.toHaveBeenCalled();

    unmount();
    expect(handleChange).toHaveBeenCalledWith('LangSmith');
  });

  it('masks password values by default and toggles visibility inline', async () => {
    const user = userEvent.setup();

    render(
      <Input
        label="API key"
        type="password"
        value="sk-langsmith-secret"
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText('API key');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveClass('text-security');
    expect(input).not.toHaveClass('font-mono');

    await user.click(
      screen.getByRole('button', { name: 'toggle password visibility' })
    );

    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toHaveClass('text-security');
    expect(input).not.toHaveClass('font-mono');
    expect(
      screen.getByRole('button', { name: 'toggle password visibility' })
    ).toBeInTheDocument();
  });

  it('keeps custom right decorators alongside the password toggle', () => {
    render(
      <Input
        label="API key"
        type="password"
        value="sk-langsmith-secret"
        onChange={() => {}}
        rightDecorator={
          <QuestionIcon
            aria-hidden
            data-testid="right-decorator"
            size={24}
            weight="bold"
          />
        }
      />
    );

    expect(screen.getByTestId('right-decorator')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'toggle password visibility' })
    ).toBeInTheDocument();
  });

  it('disables the password visibility toggle with the input', () => {
    render(
      <Input
        label="API key"
        type="password"
        value="sk-langsmith-secret"
        onChange={() => {}}
        disabled
      />
    );

    expect(screen.getByLabelText('API key')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'toggle password visibility' })
    ).toBeDisabled();
  });

  it('forwards the datetime-local type to the native input and emits the picked value', () => {
    const handleChange = vi.fn();

    render(
      <Input
        label="End time"
        type="datetime-local"
        value="2026-07-16T14:30"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('End time');
    expect(input).toHaveAttribute('type', 'datetime-local');
    expect(input).toHaveValue('2026-07-16T14:30');

    fireEvent.change(input, { target: { value: '2026-08-01T09:15' } });

    expect(handleChange).toHaveBeenCalledWith(
      '2026-08-01T09:15',
      expect.anything()
    );
  });

  it('forwards file input attributes and selected files', () => {
    const handleChange = vi.fn();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    render(
      <Input
        label="Attachments"
        type="file"
        accept=".txt"
        multiple
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText<HTMLInputElement>('Attachments');
    fireEvent.change(input, { target: { files: [file] } });

    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.txt');
    expect(input).toHaveAttribute('multiple');
    expect(input.files?.[0]).toBe(file);
    expect(handleChange).toHaveBeenCalledWith('', expect.anything());
  });

  it('forwards the change event for file inputs even when debounced', () => {
    const handleChange = vi.fn();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    render(
      <Input
        label="Attachments"
        type="file"
        debounceMs={300}
        onChange={handleChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Attachments'), {
      target: { files: [file] },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
    const [, event] = handleChange.mock.calls[0];
    expect(event?.target.files?.[0]).toBe(file);
  });

  it('replaces the native file control with the styled selection row', () => {
    render(<Input label="Attachments" type="file" onChange={() => {}} />);

    expect(screen.getByLabelText('Attachments')).toHaveClass('sr-only');
    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('summarizes the current selection', () => {
    render(
      <Input label="Attachments" type="file" multiple onChange={() => {}} />
    );

    const input = screen.getByLabelText<HTMLInputElement>('Attachments');

    fireEvent.change(input, {
      target: { files: [new File(['a'], 'notes.txt')] },
    });
    expect(screen.getByText('notes.txt')).toBeInTheDocument();

    fireEvent.change(input, {
      target: {
        files: [new File(['a'], 'notes.txt'), new File(['b'], 'rows.csv')],
      },
    });
    expect(screen.getByText('2 files selected')).toBeInTheDocument();
  });

  it('clears the selection summary when onChange clears the input', async () => {
    const user = userEvent.setup();

    render(
      <Input
        label="Attachments"
        type="file"
        onChange={(_, event) => {
          if (event) event.target.value = '';
        }}
      />
    );

    await user.upload(
      screen.getByLabelText('Attachments'),
      new File(['a'], 'notes.txt')
    );

    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  it('clears the selection summary when its form resets', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <Input label="Attachments" type="file" onChange={() => {}} />
      </form>
    );

    const input = screen.getByLabelText<HTMLInputElement>('Attachments');
    await user.upload(input, new File(['a'], 'notes.txt'));
    expect(screen.getByText('notes.txt')).toBeInTheDocument();

    act(() => input.form?.reset());

    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  it('opens the picker when the styled row is clicked', async () => {
    const user = userEvent.setup();

    render(<Input label="Attachments" type="file" onChange={() => {}} />);

    const input = screen.getByLabelText<HTMLInputElement>('Attachments');
    const click = vi.spyOn(input, 'click');

    await user.click(screen.getByText('No file selected'));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it('does not open the picker when a nested control is clicked', async () => {
    const user = userEvent.setup();
    const handleHelp = vi.fn();

    render(
      <Input
        label="Attachments"
        type="file"
        onChange={() => {}}
        rightDecorator={
          <IconButton
            label="Attachment help"
            icon={QuestionIcon}
            onClick={handleHelp}
          />
        }
      />
    );

    const input = screen.getByLabelText<HTMLInputElement>('Attachments');
    const click = vi.spyOn(input, 'click');

    await user.click(screen.getByRole('button', { name: 'Attachment help' }));

    expect(handleHelp).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
  });
});
