import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { RadarChart } from '../RadarChart';

const data = [
  { id: 'top', label: 'Code Review', value: 29 },
  { id: 'right', label: 'Issues', value: 0 },
  { id: 'bottom', label: 'Pull Requests', value: 33 },
  { id: 'left', label: 'Commits', value: 38 },
];

describe('RadarChart', () => {
  it('names the chart and exposes every formatted value, including zero', () => {
    render(
      <RadarChart
        data={data}
        aria-label="Token usage"
        formatValue={(value) => `${value}%`}
      />
    );
    expect(
      screen.getByRole('img', { name: 'Token usage' })
    ).toHaveAccessibleDescription(
      'Code Review: 29%; Issues: 0%; Pull Requests: 33%; Commits: 38%'
    );
    expect(screen.getByText('0%')).toBeVisible();
  });

  it('places axes clockwise from the top and scales all points equally', () => {
    const { container } = render(<RadarChart data={data} maxValue={40} />);
    const points = Array.from(container.querySelectorAll('circle'));
    expect(points[0]).toHaveAttribute('cx', '220');
    expect(Number(points[0].getAttribute('cy'))).toBeCloseTo(100.4);
    expect(points[1]).toHaveAttribute('cx', '220');
    expect(points[1]).toHaveAttribute('cy', '170');
    expect(Number(points[2].getAttribute('cy'))).toBeCloseTo(249.2);
    expect(Number(points[3].getAttribute('cx'))).toBeCloseTo(128.8);
    expect(container.querySelectorAll('line')).toHaveLength(4);
  });

  it('clamps negative, nonfinite, and over-domain values without invalid SVG coordinates', () => {
    const { container } = render(
      <RadarChart
        data={data.map((datum, index) => ({
          ...datum,
          value: [-10, NaN, Infinity, 80][index],
        }))}
        maxValue={40}
      />
    );
    const polygon = container.querySelector('polygon');
    expect(polygon).toHaveAttribute(
      'points',
      '220,170 220,170 220,170 124,170'
    );
    expect(screen.getByRole('img')).toHaveAccessibleDescription(
      'Code Review: 0; Issues: 0; Pull Requests: 0; Commits: 80'
    );
  });

  it('handles zero data and invalid maximum without division by zero', () => {
    const { container } = render(
      <RadarChart
        data={data.map((datum) => ({ ...datum, value: 0 }))}
        maxValue={0}
      />
    );
    expect(container.querySelector('polygon')).toHaveAttribute(
      'points',
      '220,170 220,170 220,170 220,170'
    );
  });

  it.each([0, 1, 2])('shows an empty state for %i axes', (count) => {
    render(<RadarChart data={data.slice(0, count)} />);
    expect(screen.getByRole('status')).toHaveTextContent('At least three axes');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('gives separate charts unique description IDs', () => {
    render(
      <>
        <RadarChart data={data} />
        <RadarChart data={data} />
      </>
    );
    const charts = screen.getAllByRole('img');
    expect(charts[0].getAttribute('aria-describedby')).not.toEqual(
      charts[1].getAttribute('aria-describedby')
    );
  });
});
