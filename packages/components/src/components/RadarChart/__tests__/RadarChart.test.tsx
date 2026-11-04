import { describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils';
import { getCategoricalLineChartColor } from '../../../utils/chartColors';
import { ChartTooltipHeader, ChartTooltipRow } from '../../ChartTooltip';
import { RadarChart, type RadarChartProps } from '../RadarChart';

const data = [
  { id: 'top', label: 'Code Review', value: 29 },
  { id: 'right', label: 'Issues', value: 0 },
  { id: 'bottom', label: 'Pull Requests', value: 33 },
  { id: 'left', label: 'Commits', value: 38 },
];

const renderTooltip: RadarChartProps['renderTooltip'] = (datum) => (
  <>
    <ChartTooltipHeader title={datum.label} />
    <ChartTooltipRow
      label="Share"
      value={`${datum.value}%`}
      markerColor={datum.color}
    />
  </>
);

// Select the data polygon, excluding the grid polygons.
const dataPolygon = (container: HTMLElement) =>
  container.querySelector('svg > polygon');

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

  it('scales fractional values to their maximum, just like equivalent whole numbers', () => {
    const { container, rerender } = render(<RadarChart data={data} />);
    const expectedPoints = dataPolygon(container)?.getAttribute('points');
    rerender(
      <RadarChart
        data={data.map((datum) => ({ ...datum, value: datum.value / 100 }))}
      />
    );
    const points = (dataPolygon(container)?.getAttribute('points') ?? '')
      .split(/[ ,]/)
      .map(Number);
    const expected = (expectedPoints ?? '').split(/[ ,]/).map(Number);
    points.forEach((point, index) =>
      expect(point).toBeCloseTo(expected[index])
    );
  });

  it('clamps invalid and over-domain geometry while retaining the actual positive value in labels', () => {
    const { container, rerender } = render(
      <RadarChart
        data={data.map((datum, index) => ({
          ...datum,
          value: [-10, NaN, Infinity, 80][index],
        }))}
        maxValue={40}
      />
    );
    const clampedPoints = dataPolygon(container)?.getAttribute('points');
    expect(screen.getByRole('img')).toHaveAccessibleDescription(
      'Code Review: 0; Issues: 0; Pull Requests: 0; Commits: 80'
    );
    rerender(
      <RadarChart
        data={data.map((datum, index) => ({
          ...datum,
          value: [0, 0, 0, 40][index],
        }))}
        maxValue={40}
      />
    );
    expect(dataPolygon(container)).toHaveAttribute('points', clampedPoints);
  });

  it('keeps all-zero geometry finite with an invalid maximum', () => {
    const { container } = render(
      <RadarChart
        data={data.map((datum) => ({ ...datum, value: 0 }))}
        maxValue={0}
      />
    );
    const points = (dataPolygon(container)?.getAttribute('points') ?? '').split(
      ' '
    );
    expect(new Set(points).size).toBe(1);
    expect(
      points
        .flatMap((point) => point.split(','))
        .every((value) => Number.isFinite(Number(value)))
    ).toBe(true);
  });

  it('aligns mirrored labels at the 30-degree boundary', () => {
    const { container } = render(
      <RadarChart
        data={Array.from({ length: 6 }, (_, index) => ({
          id: String(index),
          label: `Axis ${index}`,
          value: index + 1,
        }))}
      />
    );
    const labels = container.querySelectorAll('foreignObject');
    expect(Number(labels[1].getAttribute('y'))).toBeCloseTo(
      Number(labels[5].getAttribute('y'))
    );
    expect(Number(labels[2].getAttribute('y'))).toBeCloseTo(
      Number(labels[4].getAttribute('y'))
    );
  });

  it.each([0, 1, 2])('shows an empty state for %i axes', (count) => {
    render(<RadarChart data={data.slice(0, count)} />);
    expect(screen.getByRole('status')).toHaveTextContent('At least three axes');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps external naming and descriptions on the chart alongside its data summary', () => {
    render(
      <>
        <h2 id="title">Usage</h2>
        <p id="note">Last seven days</p>
        <RadarChart
          data={data}
          aria-labelledby="title"
          aria-describedby="note"
        />
      </>
    );
    expect(
      screen.getByRole('img', { name: 'Usage' })
    ).toHaveAccessibleDescription(
      'Code Review: 29; Issues: 0; Pull Requests: 33; Commits: 38 Last seven days'
    );
  });

  it('shows composed tooltips on focus, dismisses with Escape, and reaches zero-valued axes', async () => {
    const { user } = render(
      <RadarChart data={data} renderTooltip={renderTooltip} />
    );
    expect(
      screen.getByRole('group', { name: 'Radar chart' })
    ).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('img', { name: 'Code Review: 29' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Code ReviewShare29%'
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    await user.tab();
    expect(screen.getByRole('img', { name: 'Issues: 0' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'IssuesShare0%'
    );
  });

  it('opens tooltips from labels, uses normalized data and color, and closes on pointer exit', async () => {
    const customColor = getCategoricalLineChartColor(5);
    const { user } = render(
      <RadarChart
        data={data.map((datum, index) =>
          index === 0 ? { ...datum, value: -1, color: customColor } : datum
        )}
        renderTooltip={(datum) => (
          <span>{`${datum.label}: ${datum.value}; ${datum.color}`}</span>
        )}
      />
    );
    const label = screen.getByText('Code Review');
    await user.hover(label);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `Code Review: 0; ${customColor}`
    );
    await user.unhover(label);
    await user.pointer({ target: document.body, coords: { x: 1000, y: 1000 } });
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    await user.hover(screen.getByText('Issues'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `Issues: 0; ${getCategoricalLineChartColor(1)}`
    );
  });
});
