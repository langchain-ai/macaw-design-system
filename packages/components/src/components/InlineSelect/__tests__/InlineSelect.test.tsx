import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { InlineSelect } from '../InlineSelect';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'viewer', label: 'Viewer' },
] as const;

describe('InlineSelect', () => {
  it('changes its value from the menu', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <InlineSelect
        value="admin"
        onChange={onChange}
        options={ROLES}
        aria-label="Dana's role"
      />
    );

    await user.click(screen.getByRole('combobox', { name: "Dana's role" }));
    await user.click(await screen.findByText('Viewer'));

    expect(onChange).toHaveBeenCalledWith('viewer');
  });

  it('says when the setting is still on its default', () => {
    render(
      <>
        <InlineSelect
          value="viewer"
          defaultValue="viewer"
          onChange={() => {}}
          options={ROLES}
          aria-label="Sam's role"
        />
        <InlineSelect
          value="admin"
          defaultValue="viewer"
          onChange={() => {}}
          options={ROLES}
          aria-label="Dana's role"
        />
      </>
    );

    expect(
      screen.getByRole('combobox', { name: "Sam's role, default" })
    ).toHaveTextContent('Default');
    expect(
      screen.getByRole('combobox', { name: "Dana's role" })
    ).not.toHaveTextContent('Default');
  });

  it('cannot be opened when disabled', () => {
    render(
      <InlineSelect
        value="admin"
        onChange={() => {}}
        options={ROLES}
        aria-label="Owner role"
        disabled
      />
    );

    expect(screen.getByRole('combobox', { name: 'Owner role' })).toBeDisabled();
  });
});
