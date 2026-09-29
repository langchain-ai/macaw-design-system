import { useState } from 'react';

import { describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils';
import { Dialog, DialogContent } from '../../Dialog';
import { Typeahead } from '../Typeahead';

interface Option {
  id: string;
  name: string;
}

const options: Option[] = [
  { id: 'latency', name: 'Latency' },
  { id: 'runs', name: 'Run count' },
];

function ObservedQuery({ selected }: { selected: Option | null }) {
  // Consumers must not need the React compiler to preserve their search query.
  'use no memo';
  const [query, setQuery] = useState('');
  return (
    <>
      <Typeahead
        aria-label="Metric"
        value={selected}
        onChange={() => {}}
        onInputChange={setQuery}
        options={options}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.name
        }
        getOptionValue={(option) =>
          typeof option === 'string' ? option : option.id
        }
      />
      <output aria-label="Search query">{query}</output>
    </>
  );
}

describe('Typeahead input', () => {
  it('closes the active popup before its dialog when another Typeahead is closed', async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title="Choose metrics">
            <Typeahead
              aria-label="Metric"
              options={['Latency']}
              value={null}
              onChange={() => {}}
            />
            <Typeahead
              aria-label="Comparison"
              hideEmptyList
              options={[]}
              value={null}
              onChange={() => {}}
            />
          </DialogContent>
        </Dialog>
      );
    }
    const { user } = render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Metric' });

    await user.click(input);
    expect(screen.getByRole('option', { name: 'Latency' })).toBeVisible();
    await user.keyboard('{Escape}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Choose metrics' })
    ).toBeVisible();

    await user.click(screen.getByRole('combobox', { name: 'Comparison' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Choose metrics' })
      ).not.toBeInTheDocument()
    );
  });

  it('closes the popup from the popover Escape dismissal while its dialog stays open', async () => {
    function Harness() {
      return (
        <Dialog open onOpenChange={() => {}}>
          <DialogContent title="Choose metrics">
            <Typeahead
              aria-label="Metric"
              options={['Latency']}
              value={null}
              onChange={() => {}}
            />
          </DialogContent>
        </Dialog>
      );
    }
    const { user } = render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Metric' });

    await user.click(input);
    expect(screen.getByRole('option', { name: 'Latency' })).toBeVisible();
    await user.keyboard('{Escape}');

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(
      screen.getByRole('dialog', { name: 'Choose metrics' })
    ).toBeVisible();
  });

  it('preserves typing when a parent observes input changes with inline label callbacks', async () => {
    const { user } = render(<ObservedQuery selected={null} />);
    const input = screen.getByRole('combobox', { name: 'Metric' });

    await user.type(input, 'run');

    expect(input).toHaveValue('run');
    expect(
      screen.getByRole('status', { name: 'Search query' })
    ).toHaveTextContent('run');
    expect(screen.getByRole('option', { name: 'Run count' })).toBeVisible();
    expect(
      screen.queryByRole('option', { name: 'Latency' })
    ).not.toBeInTheDocument();
  });

  it('preserves a query across equivalent selections and follows updated selection labels', async () => {
    const { user, rerender } = render(
      <ObservedQuery selected={{ id: 'latency', name: 'Latency' }} />
    );
    const input = screen.getByRole('combobox', { name: 'Metric' });

    await user.clear(input);
    await user.type(input, 'run');
    rerender(<ObservedQuery selected={{ id: 'latency', name: 'Latency' }} />);
    expect(input).toHaveValue('run');

    rerender(
      <ObservedQuery selected={{ id: 'another-latency', name: 'Latency' }} />
    );
    expect(input).toHaveValue('Latency');
    await user.clear(input);
    await user.type(input, 'run');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('Latency');
    rerender(<ObservedQuery selected={{ id: 'runs', name: 'Run count' }} />);
    expect(input).toHaveValue('Run count');
    rerender(<ObservedQuery selected={null} />);
    expect(input).toHaveValue('');
  });
});
