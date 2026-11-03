import { StrictMode, useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../test-utils';
import { Button } from '../../Button';
import { Typeahead } from '../Typeahead';

function VisibilityHarness({
  disabled = false,
  onOpenChange,
}: {
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null | undefined>(null);
  return (
    <>
      <Typeahead
        aria-label="Workspace"
        options={['Main', 'Research']}
        value={value}
        onChange={setValue}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
        disabled={disabled}
      />
      <p role="status">{open ? 'Dropdown open' : 'Dropdown closed'}</p>
      <Button>Outside</Button>
    </>
  );
}

describe('Typeahead visibility notifications', () => {
  it.each(['selection', 'Escape', 'outside click'])(
    'reports opening and closing on %s',
    async (dismissal) => {
      const onOpenChange = vi.fn();
      const { user } = render(
        <VisibilityHarness onOpenChange={onOpenChange} />
      );
      const input = screen.getByRole('combobox', { name: 'Workspace' });
      expect(screen.getByRole('status')).toHaveTextContent('Dropdown closed');
      await user.type(input, 'Research');
      expect(screen.getByRole('status')).toHaveTextContent('Dropdown open');

      if (dismissal === 'selection') {
        await user.click(screen.getByRole('option', { name: 'Research' }));
        expect(input).toHaveValue('Research');
      } else if (dismissal === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        await user.click(screen.getByRole('button', { name: 'Outside' }));
      }

      expect(screen.getByRole('status')).toHaveTextContent('Dropdown closed');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    }
  );

  it('does not repeat opening notifications for clicks or search edits', async () => {
    const onOpenChange = vi.fn();
    const { user } = render(
      <StrictMode>
        <VisibilityHarness onOpenChange={onOpenChange} />
      </StrictMode>
    );
    const input = screen.getByRole('combobox', { name: 'Workspace' });
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.type(input, 'Main');
    await user.click(input);
    await user.clear(input);
    await user.paste('Research');

    expect(screen.getByRole('option', { name: 'Research' })).toBeVisible();
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    await user.keyboard('{Escape}{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('reports one opening when focus and click are batched before a render', () => {
    const onOpenChange = vi.fn();
    render(<VisibilityHarness onOpenChange={onOpenChange} />);
    const input = screen.getByRole('combobox', { name: 'Workspace' });

    // Batch the browser events explicitly; user interactions allow React to
    // rerender between events and would not exercise this callback contract.
    act(() => {
      fireEvent.focus(input);
      fireEvent.click(input);
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange.mock.calls).toEqual([[true]]);
  });

  it('reports closing when disabled while open', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = render(
      <VisibilityHarness onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByRole('combobox', { name: 'Workspace' }));
    expect(screen.getByRole('status')).toHaveTextContent('Dropdown open');
    rerender(<VisibilityHarness disabled onOpenChange={onOpenChange} />);
    expect(screen.getByRole('status')).toHaveTextContent('Dropdown closed');
    expect(screen.getByRole('combobox', { name: 'Workspace' })).toBeDisabled();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);

    rerender(<VisibilityHarness disabled onOpenChange={onOpenChange} />);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    rerender(<VisibilityHarness onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Workspace' }));
    expect(screen.getByRole('status')).toHaveTextContent('Dropdown open');
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });
});
