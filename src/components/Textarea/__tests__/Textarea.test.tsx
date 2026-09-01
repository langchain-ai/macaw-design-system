import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
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
