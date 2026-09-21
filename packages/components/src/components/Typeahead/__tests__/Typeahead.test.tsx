import { useState } from 'react';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '../../Button';
import { Dialog, DialogContent } from '../../Dialog';
import { Pane } from '../../Pane';
import { Text } from '../../Text';
import { Typeahead } from '../Typeahead';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function SingleTypeaheadHarness({
  onChange,
}: {
  onChange?: (value: string | null | undefined) => void;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  return (
    <>
      <Typeahead
        data-testid="typeahead"
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue ?? null);
          onChange?.(nextValue);
        }}
        onInputChange={setQuery}
        options={['Latency', 'Run count', 'Error rate']}
        placeholder="Select metric"
      />
      <div data-testid="value">{value ?? ''}</div>
      <div data-testid="query">{query}</div>
    </>
  );
}

function MultipleTypeaheadHarness() {
  const [value, setValue] = useState<string[]>(['base']);

  return (
    <>
      <Typeahead
        multiple
        freeSolo
        disableCloseOnSelect
        value={value}
        onChange={setValue}
        options={['base', 'production']}
        placeholder="Choose splits"
      />
      <div data-testid="value">{value.join(',')}</div>
    </>
  );
}

describe('Typeahead', () => {
  it('filters and selects a single option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleTypeaheadHarness onChange={onChange} />);

    const input = screen.getByRole('combobox', { name: 'Select metric' });
    await user.click(input);
    await user.type(input, 'lat');

    expect(screen.getByTestId('query')).toHaveTextContent('lat');
    expect(screen.getByText('Latency')).toBeInTheDocument();
    expect(screen.queryByText('Run count')).not.toBeInTheDocument();

    await user.click(screen.getByText('Latency'));

    expect(onChange).toHaveBeenCalledWith('Latency');
    expect(screen.getByTestId('value')).toHaveTextContent('Latency');
    expect(input).toHaveValue('Latency');
  });

  it('supports custom option filtering', async () => {
    const user = userEvent.setup();
    const options = ['server-ranked-first', 'server-ranked-second'];
    const filterOptions = vi.fn((availableOptions: string[]) =>
      [...availableOptions].reverse()
    );

    render(
      <Typeahead
        value={null}
        onChange={() => {}}
        options={options}
        filterOptions={filterOptions}
        placeholder="Search server results"
      />
    );

    const input = screen.getByRole('combobox', {
      name: 'Search server results',
    });
    await user.type(input, 'query-not-in-labels');

    expect(filterOptions).toHaveBeenLastCalledWith(
      options,
      expect.objectContaining({
        inputValue: 'query-not-in-labels',
        getOptionLabel: expect.any(Function),
      })
    );
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['server-ranked-second', 'server-ranked-first']);
  });

  it('uses semantic Tailwind token classes for the control shell', () => {
    render(<SingleTypeaheadHarness />);

    expect(screen.getByTestId('typeahead')).toHaveClass(
      'border-default',
      'bg-elevated',
      'text-primary',
      'gap-space-1'
    );
  });

  it('can keep the placeholder visible after multiple values are selected', () => {
    render(
      <Typeahead
        multiple
        value={['408 (Request Timeout)']}
        onChange={() => {}}
        options={[]}
        placeholder="Add status code"
        showPlaceholderWithValues
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Add status code' })
    ).toHaveAttribute('placeholder', 'Add status code');
  });

  it('keeps the multiple input and actions together when they wrap', () => {
    render(
      <Typeahead
        multiple
        value={['production', 'staging']}
        onChange={() => {}}
        options={[]}
        placeholder="Add environment"
        data-testid="wrapped-typeahead"
      />
    );

    const input = screen.getByRole('combobox', { name: 'Add environment' });
    expect(screen.getByTestId('wrapped-typeahead')).toHaveClass(
      'flex',
      'flex-wrap'
    );
    const inputActions = input.parentElement?.parentElement;
    expect(input.parentElement).toHaveClass('min-w-0', 'flex-1');
    expect(inputActions).toHaveClass('min-w-16', 'flex-1');
    expect(
      screen.getByRole('button', { name: 'Clear selections' }).parentElement
        ?.parentElement
    ).toBe(inputActions);
    expect(input).toHaveClass('w-full');
    expect(input).not.toHaveClass('[field-sizing:content]');
  });

  it('exposes combobox and listbox semantics', async () => {
    const user = userEvent.setup();

    render(<SingleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Select metric' });
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);

    const listbox = screen.getByRole('listbox', {
      name: 'Select metric options',
    });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(screen.getByRole('option', { name: 'Latency' })).toBeInTheDocument();
  });

  it('exposes invalid state to assistive technology', () => {
    render(
      <Typeahead
        isError
        value={null}
        onChange={() => {}}
        options={['Latency']}
        placeholder="Select metric"
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Select metric' })
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects an external label when inputId is provided', () => {
    render(
      <>
        <Text as="label" htmlFor="metric-typeahead">
          Metric label
        </Text>
        <Typeahead
          inputId="metric-typeahead"
          value={null}
          onChange={() => {}}
          options={['Latency']}
          placeholder="Pick metric"
        />
      </>
    );

    const input = screen.getByRole('combobox', { name: 'Metric label' });

    expect(input).toHaveAttribute('id', 'metric-typeahead');
    expect(input).not.toHaveAttribute('aria-label');
    expect(input).not.toHaveAttribute('aria-labelledby');
  });

  it('uses the 20/24/32/40px single-select size contract', () => {
    render(
      <>
        <Typeahead
          data-testid="xs-typeahead"
          size="xs"
          value={null}
          onChange={() => {}}
          options={['Latency']}
          placeholder="Extra small metric"
        />
        <Typeahead
          data-testid="sm-typeahead"
          size="sm"
          value={null}
          onChange={() => {}}
          options={['Latency']}
          placeholder="Small metric"
        />
        <Typeahead
          data-testid="md-typeahead"
          size="md"
          value={null}
          onChange={() => {}}
          options={['Latency']}
          placeholder="Medium metric"
        />
        <Typeahead
          data-testid="lg-typeahead"
          size="lg"
          value={null}
          onChange={() => {}}
          options={['Latency']}
          placeholder="Large metric"
        />
      </>
    );

    expect(screen.getByTestId('xs-typeahead')).toHaveClass('h-5', 'rounded-xs');
    expect(screen.getByTestId('sm-typeahead')).toHaveClass('h-6', 'rounded-sm');
    expect(screen.getByTestId('md-typeahead')).toHaveClass('h-8', 'rounded-md');
    expect(screen.getByTestId('lg-typeahead')).toHaveClass(
      'h-10',
      'rounded-md',
      'px-space-3'
    );
    expect(screen.getByTestId('md-typeahead')).not.toHaveClass('min-h-8');
  });

  it('uses a 24px minimum height for small multiple selections so chips can wrap', () => {
    render(
      <Typeahead
        data-testid="multiple-typeahead"
        multiple
        size="sm"
        value={['base']}
        onChange={() => {}}
        options={['base', 'production']}
        placeholder="Choose splits"
      />
    );

    expect(screen.getByTestId('multiple-typeahead')).toHaveClass(
      'min-h-6',
      'rounded-sm',
      'flex',
      'flex-wrap',
      'px-space-1',
      'py-px'
    );
    expect(screen.getByTestId('multiple-typeahead')).not.toHaveClass('h-6');
  });

  it('uses a 40px minimum height and 12px horizontal padding at large size', () => {
    render(
      <Typeahead
        data-testid="large-multiple-typeahead"
        multiple
        size="lg"
        value={[]}
        onChange={() => {}}
        options={['base', 'production']}
        placeholder="Choose splits"
      />
    );

    expect(screen.getByTestId('large-multiple-typeahead')).toHaveClass(
      'min-h-10',
      'rounded-md',
      'px-space-3',
      'py-space-1'
    );
    expect(screen.getByTestId('large-multiple-typeahead')).not.toHaveClass(
      'h-10'
    );
  });

  it('closes the dropdown when focus leaves the control', async () => {
    const user = userEvent.setup();

    render(
      <>
        <SingleTypeaheadHarness />
        <Button type="button" variant="outlined" color="secondary">
          Next field
        </Button>
      </>
    );

    const input = screen.getByRole('combobox', { name: 'Select metric' });
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Latency')).toBeInTheDocument();

    const nextField = screen.getByRole('button', { name: 'Next field' });
    fireEvent.blur(input, { relatedTarget: nextField });

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
    expect(screen.queryByText('Latency')).not.toBeInTheDocument();
  });

  it('closes the dropdown when disabled while open', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Typeahead
        value={null}
        onChange={() => {}}
        options={['Latency', 'Run count']}
        placeholder="Select metric"
      />
    );

    const input = screen.getByRole('combobox', { name: 'Select metric' });
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Latency' })).toBeInTheDocument();

    rerender(
      <Typeahead
        disabled
        value={null}
        onChange={() => {}}
        options={['Latency', 'Run count']}
        placeholder="Select metric"
      />
    );

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
    expect(
      screen.queryByRole('option', { name: 'Latency' })
    ).not.toBeInTheDocument();
  });

  it('supports keyboard selection and Escape close behavior', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleTypeaheadHarness onChange={onChange} />);

    const input = screen.getByRole('combobox', { name: 'Select metric' });
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('Latency');
    expect(input).toHaveValue('Latency');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('option', { name: 'Latency' })
    ).not.toBeInTheDocument();
  });

  it('supports multiple selection, toggling, and free-solo creation', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.click(screen.getByText('production'));

    expect(screen.getByTestId('value')).toHaveTextContent('base,production');

    await user.clear(input);
    await user.type(input, 'canary{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent(
      'base,production,canary'
    );

    await user.keyboard('{Escape}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('listbox', { name: 'Choose splits options' })
    ).not.toBeInTheDocument();

    await user.click(input);

    await user.clear(input);
    await user.keyboard('{Backspace}');

    expect(screen.getByTestId('value')).toHaveTextContent('base,production');
  });

  it('selects the active suggestion before a partial free-solo value', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.type(input, 'pro');

    expect(
      screen.getByRole('option', { name: 'production' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Add pro' })).toBeInTheDocument();

    await user.keyboard('{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent(/^base,production$/);
  });

  it('prefers an active suggestion in single-select free-solo mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Typeahead
        freeSolo
        value={null}
        onChange={onChange}
        options={['Python']}
        placeholder="Choose language"
      />
    );

    const input = screen.getByRole('combobox', { name: 'Choose language' });
    await user.click(input);
    await user.type(input, 'py{Enter}');

    expect(onChange).toHaveBeenCalledWith('Python');
  });

  it('creates a free-solo value that only prefixes an existing tag', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>(['admin*']);
      const [query, setQuery] = useState('');
      return (
        <>
          <Typeahead
            multiple
            freeSolo
            hideEmptyList
            disableClearable
            value={value}
            onChange={setValue}
            inputValue={query}
            onInputChange={setQuery}
            options={[]}
            placeholder="Type glob"
          />
          <div data-testid="value">{value.join('|')}</div>
        </>
      );
    }

    render(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Type glob' });
    await user.click(input);
    await user.type(input, 'admin');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent('admin*|admin');
  });

  it('clears the query when it exactly matches an existing tag', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.type(input, 'base');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent(/^base$/);
    expect(input).toHaveValue('');
  });

  it('deselects with the keyboard when free-form creation is off', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>(['production']);
      const [query, setQuery] = useState('');
      return (
        <>
          <Typeahead
            multiple
            disableClearable
            hideEmptyList
            value={value}
            onChange={setValue}
            inputValue={query}
            onInputChange={setQuery}
            options={['staging'].filter((option) => !value.includes(option))}
            placeholder="Pick environments"
          />
          <div data-testid="value">{value.join('|')}</div>
        </>
      );
    }

    render(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Pick environments' });
    await user.click(input);
    await user.type(input, 'prod');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
  });

  it('deselects an already-selected first option on Enter with no query', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>(['staging']);
      return (
        <>
          <Typeahead
            multiple
            disableClearable
            value={value}
            onChange={setValue}
            options={['staging', 'production']}
            placeholder="Pick environments"
          />
          <div data-testid="value">{value.join('|')}</div>
        </>
      );
    }

    render(<Harness />);

    await user.click(
      screen.getByRole('combobox', { name: 'Pick environments' })
    );
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
  });

  it('still toggles a selected option off when it is clicked', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'base' }));

    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
  });

  it('creates a partial free-solo value when the create row is active', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.type(input, 'pro');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent('base,pro');
  });

  it('stays mouse-interactive when rendered inside a modal Dialog', async () => {
    const user = userEvent.setup();

    function DialogHarness() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Dialog open onOpenChange={() => {}}>
          <DialogContent title="Copy examples" showClose={false}>
            <Typeahead
              multiple
              freeSolo
              disableCloseOnSelect
              aria-label="Splits"
              value={value}
              onChange={setValue}
              options={['train', 'test']}
              placeholder="Choose splits"
            />
            <div data-testid="value">{value.join(',')}</div>
          </DialogContent>
        </Dialog>
      );
    }

    render(<DialogHarness />);

    const input = screen.getByRole('combobox', { name: 'Splits' });
    await user.click(input);

    // A modal Dialog sets `pointer-events: none` outside its content. If the
    // dropdown portals there, userEvent (which honors pointer-events) cannot
    // click the option. Portaling into the dialog keeps it interactive.
    await user.click(screen.getByRole('option', { name: 'train' }));

    expect(screen.getByTestId('value')).toHaveTextContent('train');
  });

  it('stays mouse-interactive when rendered inside a modal Pane', async () => {
    const user = userEvent.setup();

    function PaneHarness() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Pane
          open
          animation={false}
          noBackArrow
          onClose={() => {}}
          title="Configure previews"
        >
          <Typeahead
            value={value}
            onChange={(nextValue) => setValue(nextValue ?? null)}
            options={['main', 'worker']}
            placeholder="Choose a run name"
          />
          <div data-testid="value">{value}</div>
        </Pane>
      );
    }

    render(<PaneHarness />);

    const input = screen.getByRole('combobox', {
      name: 'Choose a run name',
    });
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'main' }));

    expect(screen.getByTestId('value')).toHaveTextContent('main');
  });

  it('renders default multiple-selection tags as clickable badges', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>(['base', 'production']);

      return (
        <>
          <Typeahead
            multiple
            value={value}
            onChange={setValue}
            options={['base', 'production']}
            placeholder="Choose splits"
          />
          <div data-testid="value">{value.join(',')}</div>
        </>
      );
    }

    render(<Harness />);

    await user.click(screen.getByRole('combobox', { name: 'Choose splits' }));
    expect(
      screen.getByRole('listbox', { name: 'Choose splits options' })
    ).toBeInTheDocument();

    const removeBase = screen.getByLabelText('Remove base');
    expect(removeBase).toHaveClass('cursor-pointer');

    await user.click(removeBase);

    expect(screen.getByTestId('value')).toHaveTextContent('production');
  });

  it('shows selected free-solo values as selected options when typed again', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.type(input, 'canary{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent('base,canary');

    await user.type(input, 'canary');

    const selectedOption = screen.getByRole('option', { name: 'canary' });
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.queryByRole('option', { name: 'Add canary' })
    ).not.toBeInTheDocument();

    await user.click(selectedOption);

    expect(screen.getByTestId('value')).toHaveTextContent('base');
  });

  it('renders concise free-solo create rows', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    await user.click(input);
    await user.type(input, 'canary');

    const createOption = screen.getByRole('option', { name: 'Add canary' });
    expect(createOption).toHaveTextContent('canary');
    expect(createOption).not.toHaveTextContent('Add "canary"');
  });

  it('announces multi-select state through the listbox and selected summary', async () => {
    const user = userEvent.setup();
    render(<MultipleTypeaheadHarness />);

    const input = screen.getByRole('combobox', { name: 'Choose splits' });
    expect(input).toHaveAccessibleDescription('Selected values: base.');

    await user.click(input);

    expect(
      screen.getByRole('listbox', { name: 'Choose splits options' })
    ).toHaveAttribute('aria-multiselectable', 'true');
    expect(screen.getByRole('option', { name: 'base' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('option', { name: 'production' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'production' }));

    expect(input).toHaveAccessibleDescription(
      'Selected values: base, production.'
    );
  });

  it('uses custom tag rendering with removable tag props', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>(['input']);
      return (
        <>
          <Typeahead
            multiple
            value={value}
            onChange={setValue}
            options={['input', 'output']}
            placeholder="Fields"
            renderTags={(values, getTagProps) =>
              values.map((tag, index) => {
                const tagProps = getTagProps({ index });
                return (
                  <Button
                    key={tagProps.key}
                    type="button"
                    variant="plain"
                    color="secondary"
                    aria-label={`Remove ${tag}`}
                    onClick={tagProps.onDelete}
                    data-tag-index={tagProps['data-tag-index']}
                  >
                    Remove {tag}
                  </Button>
                );
              })
            }
          />
          <div data-testid="value">{value.join(',')}</div>
        </>
      );
    }

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Remove input' }));

    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
  });

  it('does not select disabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Typeahead
        value={null}
        onChange={onChange}
        options={[{ value: 'archived', label: 'Archived', disabled: true }]}
        placeholder="Status"
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByText('Archived'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports option limits, custom create rows, and list footers', async () => {
    const user = userEvent.setup();
    const onCreateNew = vi.fn();

    function Harness() {
      const [value, setValue] = useState<string[]>([]);
      const [query, setQuery] = useState('');

      return (
        <Typeahead
          multiple
          value={value}
          onChange={setValue}
          inputValue={query}
          onInputChange={setQuery}
          options={['alpha', 'beta', 'gamma']}
          maxVisibleOptions={2}
          onCreateNew={onCreateNew}
          createNewLabel={(inputValue) => (
            <span>{inputValue ? `Create ${inputValue}` : 'Create new'}</span>
          )}
          listFooter={<div>Footer content</div>}
          placeholder="Choose tags"
        />
      );
    }

    render(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Choose tags' });
    await user.click(input);

    expect(screen.getByRole('option', { name: 'alpha' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByRole('option', { name: 'beta' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(
      screen.queryByRole('option', { name: 'gamma' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Create new')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();

    await user.type(input, 'delta');
    await user.click(screen.getByRole('option', { name: 'Add delta' }));

    expect(onCreateNew).toHaveBeenCalledWith('delta');
  });

  it('can hide an empty dropdown or render a custom empty state', async () => {
    const user = userEvent.setup();
    const escapeDefaultPrevented: boolean[] = [];
    const { rerender } = render(
      <div
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            escapeDefaultPrevented.push(event.defaultPrevented);
          }
        }}
      >
        <Typeahead
          multiple
          hideEmptyList
          value={[]}
          onChange={() => {}}
          options={[]}
          placeholder="Choose tags"
        />
      </div>
    );

    const input = screen.getByRole('combobox', { name: 'Choose tags' });
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('listbox', { name: 'Choose tags options' })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(escapeDefaultPrevented).toEqual([true]);

    rerender(
      <div
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            escapeDefaultPrevented.push(event.defaultPrevented);
          }
        }}
      >
        <Typeahead
          multiple
          hideEmptyList
          value={[]}
          onChange={() => {}}
          options={[]}
          emptyState={<span>No tags found</span>}
          placeholder="Choose tags"
        />
      </div>
    );

    await user.click(screen.getByRole('combobox', { name: 'Choose tags' }));

    expect(
      screen.getByRole('listbox', { name: 'Choose tags options' })
    ).toBeInTheDocument();
    expect(screen.getByText('No tags found')).toBeInTheDocument();
  });

  it('supports single-select display and clear-on-empty behavior', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string | null>('Dataset A');
      const [query, setQuery] = useState('');

      return (
        <>
          <Typeahead
            value={value}
            onChange={(nextValue) => setValue(nextValue ?? null)}
            inputValue={query}
            onInputChange={setQuery}
            options={['Dataset A', 'Dataset B']}
            displaySelectedValueWhenInputEmpty
            clearValueOnInputClear
            autoComplete="one-time-code"
            placeholder="Choose dataset"
          />
          <div data-testid="value">{value ?? ''}</div>
          <div data-testid="query">{query}</div>
        </>
      );
    }

    render(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Choose dataset' });

    expect(input).toHaveValue('Dataset A');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');

    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Dataset B' }));

    expect(screen.getByTestId('value')).toHaveTextContent('Dataset B');
    expect(screen.getByTestId('query')).toBeEmptyDOMElement();
    expect(input).toHaveValue('Dataset B');

    await user.clear(input);

    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
    expect(input).toHaveValue('');
  });
});
