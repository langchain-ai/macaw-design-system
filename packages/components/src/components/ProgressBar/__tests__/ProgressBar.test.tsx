import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { ProgressBar, type ProgressBarColor } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders determinate progress with an accessible name', () => {
    render(<ProgressBar value={45} aria-label="Spend usage" />);

    const progressbar = screen.getByRole('progressbar', {
      name: 'Spend usage',
    });

    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    expect(progressbar.firstElementChild).toHaveStyle({ width: '45%' });
  });

  it('normalizes values between a custom minimum and maximum', () => {
    render(
      <ProgressBar value={75} min={50} max={100} aria-label="Budget used" />
    );

    expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({
      width: '50%',
    });
  });

  it('clamps values outside the provided range', () => {
    render(
      <>
        <ProgressBar value={-10} aria-label="Below range" />
        <ProgressBar value={150} aria-label="Above range" />
      </>
    );

    const belowRange = screen.getByRole('progressbar', {
      name: 'Below range',
    });
    const aboveRange = screen.getByRole('progressbar', {
      name: 'Above range',
    });

    expect(belowRange).toHaveAttribute('aria-valuenow', '0');
    expect(belowRange.firstElementChild).toHaveStyle({ width: '0%' });
    expect(aboveRange).toHaveAttribute('aria-valuenow', '100');
    expect(aboveRange.firstElementChild).toHaveStyle({ width: '100%' });
  });

  it('renders the label beneath the bar by default', () => {
    render(<ProgressBar value={45} label="45%" aria-label="Spend usage" />);

    const progressbar = screen.getByRole('progressbar');
    const label = screen.getByText('45%');

    expect(progressbar.nextElementSibling).toBe(label);
  });

  it('renders the label above the bar', () => {
    render(
      <ProgressBar
        value={45}
        label="45%"
        labelPosition="top"
        aria-label="Spend usage"
      />
    );

    const progressbar = screen.getByRole('progressbar');
    const label = screen.getByText('45%');

    expect(progressbar.previousElementSibling).toBe(label);
  });

  it.each<[ProgressBarColor, string]>([
    [
      'brand',
      'linear-gradient(to left, var(--viz-brand-200), var(--viz-brand-75))',
    ],
    [
      'neutral',
      'linear-gradient(to left, var(--viz-neutral-150), var(--viz-neutral-75))',
    ],
    [
      'success',
      'linear-gradient(to left, var(--viz-green-200), var(--viz-green-100))',
    ],
    [
      'warning',
      'linear-gradient(to left, var(--viz-orange-150), var(--viz-orange-75))',
    ],
    [
      'error',
      'linear-gradient(to left, var(--viz-red-300), var(--viz-red-200))',
    ],
  ])('renders the %s visualization gradient', (color, expectedGradient) => {
    render(
      <ProgressBar value={50} color={color} aria-label={`${color} color`} />
    );

    expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({
      backgroundImage: expectedGradient,
    });
  });
});
