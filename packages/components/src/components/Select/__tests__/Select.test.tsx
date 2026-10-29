import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils';
import { Button } from '../../Button';
import { Select } from '../Select';

const options = [
  { value: 'staging', label: 'Staging' },
  { value: 'archived', label: 'Archived', disabled: true },
  { value: 'production', label: 'Production' },
];

function SelectHarness({ hideSearch }: { hideSearch?: boolean }) {
  const [value, setValue] = useState<string>();
  return (
    <Select
      aria-label="Environment"
      value={value}
      onChange={setValue}
      options={options}
      hideSearch={hideSearch}
    />
  );
}

describe.each([
  { mode: 'default', hideSearch: undefined },
  { mode: 'searchable', hideSearch: false },
])('Select in $mode mode', ({ hideSearch }) => {
  it('selects an enabled option with the keyboard and restores trigger focus', async () => {
    const { user } = render(<SelectHarness hideSearch={hideSearch} />);
    const trigger = screen.getByRole('combobox', { name: 'Environment' });

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('option', { name: 'Staging' })).toBeVisible();
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('option', { name: 'Production', selected: true })
    ).toBeVisible();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveTextContent('Production');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('returns focus to the trigger when Escape closes the popup', async () => {
    const { user } = render(<SelectHarness hideSearch={hideSearch} />);
    const trigger = screen.getByRole('combobox', { name: 'Environment' });

    await user.tab();
    await user.keyboard('{Enter}{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

it('keeps focus on an outside control clicked to dismiss Select', async () => {
  const { user } = render(
    <>
      <SelectHarness hideSearch={false} />
      <Button>Next field</Button>
    </>
  );

  await user.click(screen.getByRole('combobox', { name: 'Environment' }));
  const nextField = screen.getByRole('button', { name: 'Next field' });
  await user.click(nextField);

  await waitFor(() =>
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  );
  expect(nextField).toHaveFocus();
});

it('forwards data attributes to the trigger', () => {
  render(
    <Select
      aria-label="Environment"
      onChange={() => {}}
      options={options}
      data-analytics-id="environment-select"
    />
  );

  expect(screen.getByRole('combobox', { name: 'Environment' })).toHaveAttribute(
    'data-analytics-id',
    'environment-select'
  );
});

describe('Select variant', () => {
  it('is an outlined, full-width field by default', () => {
    render(
      <Select aria-label="Environment" onChange={() => {}} options={options} />
    );

    const trigger = screen.getByRole('combobox', { name: 'Environment' });
    expect(trigger).toHaveClass('w-full', 'bg-input', 'border-input');
    expect(trigger).toHaveClass('shadow-none');
    expect(trigger).not.toHaveClass(
      'shadow-[0px_1px_2px_0px_var(--shadow-color-subtle)]'
    );
  });

  it('drops the field border and fill when plain', () => {
    render(
      <Select
        variant="plain"
        aria-label="Environment"
        value="staging"
        onChange={() => {}}
        options={options}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Environment' });
    expect(trigger).toHaveTextContent('Staging');
    expect(trigger).toHaveClass(
      'w-auto',
      'bg-transparent',
      'border-transparent'
    );
    for (const fieldClass of ['w-full', 'bg-input', 'border-input']) {
      expect(trigger).not.toHaveClass(fieldClass);
    }
  });

  it('uses the disabled fill when plain and disabled', () => {
    render(
      <Select
        variant="plain"
        disabled
        aria-label="Environment"
        value="staging"
        onChange={() => {}}
        options={options}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Environment' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass('bg-disabled', 'text-disabled');
    for (const fieldClass of ['bg-input-disabled', 'border-muted']) {
      expect(trigger).not.toHaveClass(fieldClass);
    }
  });

  it('opens a plain select and shows option descriptions', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <Select
        variant="plain"
        aria-label="Role"
        value="viewer"
        onChange={onChange}
        options={[
          { value: 'admin', label: 'Admin', description: 'Manages members' },
          { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
        ]}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Role' }));
    expect(await screen.findByText('Manages members')).toBeVisible();
    await user.click(screen.getByText('Admin'));

    expect(onChange).toHaveBeenCalledWith('admin');
  });
});
