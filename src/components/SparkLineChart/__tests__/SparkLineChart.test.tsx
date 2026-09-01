import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { SparkLineChart } from '../SparkLineChart';
import type { SparkLineChartColor } from '../SparkLineChart';

describe('SparkLineChart', () => {
  it('renders an accessible gradient area and line in a stable viewBox', () => {
    render(
      <SparkLineChart
        data={[
          { x: 0, y: 2 },
          { x: 4, y: 8 },
          { x: 10, y: -2 },
        ]}
        className="custom-class"
        aria-label="Revenue trend"
        data-testid="sparkline"
      />
    );

    const sparkline = screen.getByRole('img', { name: 'Revenue trend' });
    expect(sparkline).toHaveAttribute('focusable', 'false');
    expect(sparkline).toHaveAttribute('viewBox', '0 0 100 100');
    expect(sparkline).toHaveAttribute('preserveAspectRatio', 'none');
    expect(sparkline).toHaveClass('h-full', 'w-full', 'custom-class');
    const paths = sparkline.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toHaveAttribute('opacity');
    expect(sparkline.querySelector('clipPath rect')).toBeInTheDocument();
    expect(paths[1]?.getAttribute('clip-path')).toMatch(/^url\(#.+-reveal\)$/);
    expect(paths[1]).not.toHaveAttribute('pathLength');
    expect(paths[1]).not.toHaveAttribute('stroke-dasharray');
    expect(paths[1]).not.toHaveAttribute('stroke-dashoffset');
  });

  it.each<[SparkLineChartColor, string]>([
    ['brand', 'var(--chart-categorical-line-1)'],
    ['neutral', 'var(--chart-other)'],
    ['success', 'var(--chart-positive)'],
    ['warning', 'var(--chart-warning)'],
    ['error', 'var(--chart-negative)'],
  ])('renders the %s semantic color', (color, expectedColor) => {
    render(
      <SparkLineChart
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 4 },
        ]}
        color={color}
      />
    );

    const sparkline = screen.getByRole('img');
    const paths = sparkline.querySelectorAll('path');
    const gradientStops = sparkline.querySelectorAll('linearGradient stop');
    expect(paths[0]?.getAttribute('fill')).toMatch(/^url\(#.+\)$/);
    expect(gradientStops).toHaveLength(2);
    expect(gradientStops[0]).toHaveAttribute('stop-color', expectedColor);
    expect(gradientStops[0]).toHaveAttribute('stop-opacity', '0.18');
    expect(gradientStops[1]).toHaveAttribute('stop-color', expectedColor);
    expect(gradientStops[1]).toHaveAttribute('stop-opacity', '0.02');
    expect(paths[1]).toHaveAttribute('stroke', expectedColor);
  });

  it('filters invalid points before building paths', () => {
    render(
      <SparkLineChart
        data={[
          { x: 0, y: -4 },
          { x: Number.NaN, y: 2 },
          { x: 3, y: Number.POSITIVE_INFINITY },
          { x: 12, y: 6 },
        ]}
      />
    );

    const pathData = Array.from(
      screen.getByRole('img').querySelectorAll('path')
    ).map((path) => path.getAttribute('d'));
    expect(pathData).toHaveLength(2);
    expect(pathData.join(' ')).not.toMatch(/NaN|Infinity/);
  });

  it('handles flat x and y domains without invalid coordinates', () => {
    render(
      <SparkLineChart
        data={[
          { x: 4, y: -3 },
          { x: 4, y: -3 },
          { x: 4, y: -3 },
        ]}
      />
    );

    const line = screen.getByRole('img').querySelectorAll('path')[1];
    expect(line?.getAttribute('d')).toBe('M0,50 L50,50 L100,50');
  });

  it.each([
    { data: [] },
    { data: [{ x: 0, y: 1 }] },
    {
      data: [
        { x: Number.NaN, y: 1 },
        { x: 2, y: Number.NEGATIVE_INFINITY },
      ],
    },
  ])('renders no paths with fewer than two valid points', ({ data }) => {
    render(<SparkLineChart data={data} />);

    expect(screen.getByRole('img', { name: 'Trend sparkline' })).toBeVisible();
    expect(screen.getByRole('img').querySelector('path')).toBeNull();
  });
});
