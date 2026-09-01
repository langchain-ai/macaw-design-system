import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../test-utils';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(
      <Checkbox
        checked={false}
        onCheckedChange={() => {}}
        label="Test Label"
        data-testid="checkbox"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('associates a visible label with a caller-provided ID', () => {
    render(
      <Checkbox
        id="email-updates"
        checked={false}
        onCheckedChange={() => {}}
        label="Email updates"
      />
    );

    expect(
      screen.getByRole('checkbox', { name: 'Email updates' })
    ).toHaveAttribute('id', 'email-updates');
    expect(screen.getByText('Email updates').closest('label')).toHaveAttribute(
      'for',
      'email-updates'
    );
  });

  it('renders with aria-label (no visible label)', () => {
    render(
      <Checkbox
        checked={false}
        onCheckedChange={() => {}}
        aria-label="Toggle option"
        data-testid="checkbox"
      />
    );

    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toHaveAttribute(
      'aria-label',
      'Toggle option'
    );
  });

  it('calls onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onCheckedChange={handleChange}
        label="Test"
        data-testid="checkbox"
      />
    );

    fireEvent.click(screen.getByTestId('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('renders in checked state', () => {
    render(
      <Checkbox
        checked={true}
        onCheckedChange={() => {}}
        label="Test"
        data-testid="checkbox"
      />
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('renders in indeterminate state', () => {
    render(
      <Checkbox
        checked="indeterminate"
        onCheckedChange={() => {}}
        label="Test"
        data-testid="checkbox"
      />
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
  });

  it('renders in disabled state', () => {
    render(
      <Checkbox
        checked={false}
        onCheckedChange={() => {}}
        disabled
        label="Test"
        data-testid="checkbox"
      />
    );

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('does not call onCheckedChange when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onCheckedChange={handleChange}
        disabled
        label="Test"
        data-testid="checkbox"
      />
    );

    fireEvent.click(screen.getByTestId('checkbox'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
