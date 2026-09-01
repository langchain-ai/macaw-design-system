import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { CircularProgress, type ProgressSegment } from '../CircularProgress';

describe('CircularProgress', () => {
  it('renders the component with segments', () => {
    const segments: ProgressSegment[] = [
      { variant: 'error', percentage: 0.3 },
      { variant: 'success', percentage: 0.2 },
      { variant: 'brand', percentage: 0.1 },
    ];

    render(<CircularProgress segments={segments} testId="progress-circle" />);

    const container = screen.getByTestId('progress-circle');
    expect(container).toBeInTheDocument();

    // Should have 3 segment circles + 1 background circle = 4 circles
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(4);
  });

  it('uses custom size and stroke width', () => {
    const segments: ProgressSegment[] = [{ variant: 'error', percentage: 0.5 }];

    render(
      <CircularProgress
        segments={segments}
        size={200}
        strokeWidth={20}
        testId="custom-circle"
      />
    );

    const container = screen.getByTestId('custom-circle');
    expect(container).toBeInTheDocument();

    // Check if SVG has correct dimensions
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');

    // Check if circle has correct stroke width
    const segmentCircle = container.querySelectorAll('circle')[1]; // 0 is background, 1 is our segment
    expect(segmentCircle).toHaveAttribute('stroke-width', '20');
  });

  it('exposes determinate values to assistive technology', () => {
    render(
      <CircularProgress
        value={1.5}
        aria-label="Sampling rate"
        testId="determinate-circle"
      />
    );

    expect(
      screen.getByRole('progressbar', { name: 'Sampling rate' })
    ).toHaveAttribute('aria-valuenow', '100');
  });

  it('uses an image role for a labelled segment breakdown', () => {
    render(
      <CircularProgress
        segments={[{ variant: 'success', percentage: 0.5 }]}
        aria-label="Experiment results"
      />
    );

    expect(
      screen.getByRole('img', { name: 'Experiment results' })
    ).toBeInTheDocument();
  });
});
