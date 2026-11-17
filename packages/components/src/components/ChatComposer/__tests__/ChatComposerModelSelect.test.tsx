import { expect, it, vi } from 'vitest';

import { ChatComposerModelSelect } from '..';
import { render, screen } from '../../../test-utils';

const options = [
  { value: 'fast', label: 'Fast model' },
  { value: 'max', label: 'Max model', disabled: true },
];

it('keeps selection controlled when the parent selects and clears a model', async () => {
  const props = { options, onChange: vi.fn(), allowDeselect: true };
  const { user, rerender } = render(
    <ChatComposerModelSelect {...props} value={undefined} />
  );
  const trigger = screen.getByRole('combobox', { name: 'Model' });
  await user.click(trigger);
  await user.click(screen.getByRole('option', { name: 'Fast model' }));
  expect(props.onChange).toHaveBeenLastCalledWith('fast');
  expect(trigger).toHaveTextContent('Select a model');

  rerender(<ChatComposerModelSelect {...props} value="fast" />);
  expect(trigger).toHaveTextContent('Fast model');
  await user.click(trigger);
  await user.click(screen.getByRole('option', { name: 'Fast model' }));
  expect(props.onChange).toHaveBeenLastCalledWith(undefined);
  rerender(<ChatComposerModelSelect {...props} value={undefined} />);
  expect(trigger).toHaveTextContent('Select a model');
});

it.each(['max', 'missing'])(
  'starts on an enabled option when the selected value is %s',
  async (value) => {
    const onChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect
        options={options}
        value={value}
        onChange={onChange}
      />
    );
    await user.tab();
    await user.keyboard('{Enter}{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fast');
  }
);

it('keeps host-filtered search focused through empty and loading results', async () => {
  const props = {
    onChange: vi.fn(),
    disableFilter: true,
    onSearchChange: vi.fn(),
  };
  const { user, rerender } = render(
    <ChatComposerModelSelect {...props} options={options} />
  );
  const trigger = screen.getByRole('combobox', { name: 'Model' });
  await user.click(trigger);
  const search = screen.getByPlaceholderText('Search models…');
  await user.type(search, 'missing');
  rerender(<ChatComposerModelSelect {...props} options={[]} loading />);
  expect(search).toHaveFocus();
  expect(search).toHaveValue('missing');
  rerender(<ChatComposerModelSelect {...props} options={[]} />);
  expect(screen.getByText('No results found.')).toBeVisible();
  await user.clear(search);
  expect(props.onSearchChange).toHaveBeenLastCalledWith('');
});
