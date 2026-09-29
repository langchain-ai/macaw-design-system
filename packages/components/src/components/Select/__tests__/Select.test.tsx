import { useState } from 'react';

import { describe, expect, it } from 'vitest';

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
