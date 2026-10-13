import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  it.each([
    { name: 'accepts', transform: (next: string) => next, expected: 'validx' },
    {
      name: 'normalizes',
      transform: (next: string) => next.toUpperCase(),
      expected: 'VALIDX',
    },
    { name: 'rejects', transform: () => 'valid', expected: 'valid' },
  ])(
    'immediately reflects the parent value when it $name an edit',
    async ({ transform, expected }) => {
      function Harness() {
        const [value, setValue] = useState('valid');
        return (
          <Textarea
            label="Description"
            value={value}
            onChange={(next) => setValue(transform(next))}
          />
        );
      }
      const { user } = render(<Harness />);
      const textarea = screen.getByRole('textbox', { name: 'Description' });
      await user.type(textarea, 'x');
      expect(textarea).toHaveValue(expected);
    }
  );

  it('preserves uncontrolled defaults and immediately notifies the owner', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <Textarea label="Description" defaultValue="Hello" onChange={onChange} />
    );
    const textarea = screen.getByRole('textbox', { name: 'Description' });
    expect(textarea).toHaveValue('Hello');
    await user.type(textarea, '!');
    expect(textarea).toHaveValue('Hello!');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('Hello!');
  });

  it('reflects external controlled value updates', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Textarea label="Description" value="old" onChange={onChange} />
    );
    rerender(
      <Textarea label="Description" value="server" onChange={onChange} />
    );
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'server'
    );
  });

  it('associates its label with a generated textarea ID', () => {
    render(<Textarea label="Description" value="" onChange={() => {}} />);

    const textarea = screen.getByLabelText('Description');
    const label = screen.getByText('Description');

    expect(textarea).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', textarea.getAttribute('id'));
  });

  it('describes the textarea with hint and caller-provided text', () => {
    render(
      <>
        <span id="external-help">Shared across the workspace.</span>
        <Textarea
          label="Description"
          hintText="Summarize this workspace."
          aria-describedby="external-help"
          value=""
          onChange={() => {}}
        />
      </>
    );

    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription(
      'Summarize this workspace. Shared across the workspace.'
    );
  });

  it('marks error fields as invalid', () => {
    render(
      <Textarea label="Description" isError value="" onChange={() => {}} />
    );

    expect(screen.getByLabelText('Description')).toBeInvalid();
  });

  it('associates its label with a caller-provided textarea ID', () => {
    render(
      <Textarea
        id="workspace-description"
        label="Description"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Description')).toHaveAttribute(
      'for',
      'workspace-description'
    );
    expect(screen.getByLabelText('Description')).toHaveAttribute(
      'id',
      'workspace-description'
    );
  });
});
