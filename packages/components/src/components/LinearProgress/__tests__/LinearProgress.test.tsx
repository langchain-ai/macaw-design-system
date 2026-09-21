import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { LinearProgress } from '../LinearProgress';

describe('LinearProgress', () => {
  it('renders an indeterminate progressbar by default', () => {
    render(<LinearProgress aria-label="Loading runs" />);

    const progressbar = screen.getByRole('progressbar', {
      name: 'Loading runs',
    });

    expect(progressbar).toHaveClass('h-0.5');
    expect(progressbar).toHaveClass('bg-brand-subtle');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
  });

  it('renders determinate progress when a value is provided', () => {
    render(<LinearProgress aria-label="Usage" value={45} />);

    const progressbar = screen.getByRole('progressbar', { name: 'Usage' });
    const indicator = progressbar.firstElementChild;
    if (!(indicator instanceof HTMLElement)) {
      throw new Error('Expected progress indicator to render');
    }

    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    expect(indicator).toHaveStyle({ width: '45%' });
  });

  it('normalizes determinate progress between min and max', () => {
    render(
      <LinearProgress aria-label="Budget" value={75} min={50} max={100} />
    );

    const indicator = screen.getByRole('progressbar').firstElementChild;
    if (!(indicator instanceof HTMLElement)) {
      throw new Error('Expected progress indicator to render');
    }

    expect(indicator).toHaveStyle({ width: '50%' });
  });

  it('clamps values outside the provided range', () => {
    render(<LinearProgress aria-label="Budget" value={150} />);

    const progressbar = screen.getByRole('progressbar');
    const indicator = progressbar.firstElementChild;
    if (!(indicator instanceof HTMLElement)) {
      throw new Error('Expected progress indicator to render');
    }

    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(indicator).toHaveStyle({ width: '100%' });
  });

  it('supports custom thickness', () => {
    render(
      <LinearProgress aria-label="Commitment" value={80} thicknessPx={12} />
    );

    const progressbar = screen.getByRole('progressbar');
    const indicator = progressbar.firstElementChild;
    if (!(indicator instanceof HTMLElement)) {
      throw new Error('Expected progress indicator to render');
    }

    expect(progressbar).toHaveClass('h-[var(--linear-progress-thickness)]');
    expect(progressbar).toHaveClass('bg-brand-subtle');
    expect(progressbar).toHaveStyle({ '--linear-progress-thickness': '12px' });
    expect(indicator).toHaveClass('bg-brand');
    expect(progressbar).toHaveClass('rounded-none');
    expect(indicator).toHaveClass('rounded-none');
  });
});
