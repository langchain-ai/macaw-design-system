import { describe, expect, it } from 'vitest';

import { act, render, screen, waitFor } from '../../../test-utils';
import {
  getCategoricalFillChartColor,
  getCategoricalLineChartColor,
} from '../../../utils/chartColors';
import { CHART_DIMMED_OPACITY } from '../../../utils/chartConstants';
import { ChartTooltipHeader, ChartTooltipRow } from '../../ChartTooltip';
import {
  RadarChart,
  type RadarChartMultiSeriesProps,
  type RadarChartSingleSeriesProps,
} from '../RadarChart';

const data = [
  { id: 'top', label: 'Code Review', value: 29 },
  { id: 'right', label: 'Issues', value: 0 },
  { id: 'bottom', label: 'Pull Requests', value: 33 },
  { id: 'left', label: 'Commits', value: 38 },
];

const axes = data.map(({ id, label }) => ({ id, label }));
const series = [
  {
    id: 'a',
    label: 'Baseline',
    values: { top: 4, right: 2, bottom: 3, left: 1 },
  },
  { id: 'b', label: 'Candidate', values: { top: 2, right: 4, bottom: NaN } },
  {
    id: 'c',
    label: 'Rerank',
    values: { top: 1, right: 1, bottom: 1, left: 1 },
  },
];
const renderAxisTooltip: RadarChartMultiSeriesProps['renderAxisTooltip'] = (
  axis
) => (
  <span>
    {`${axis.label}: ${axis.values
      .map(({ label, value, color }) => `${label} ${value} ${color}`)
      .join(', ')}`}
  </span>
);

const renderTooltip: RadarChartSingleSeriesProps['renderTooltip'] = (datum) => (
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

  it('opens tooltips from labels, uses normalized data and color, and closes on pointer exit or click', async () => {
    const customColor = getCategoricalFillChartColor(5);
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
      `Issues: 0; ${getCategoricalFillChartColor(1)}`
    );
    // Clicking focuses the axis; the tooltip must not reopen a frame later.
    await user.click(screen.getByText('Issues'));
    await act(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('summarizes every series per axis, labels axes by name, and needs three axes', () => {
    const { rerender } = render(
      <RadarChart axes={axes} series={series.slice(0, 2)} aria-label="Scores" />
    );
    expect(
      screen.getByRole('img', { name: 'Scores' })
    ).toHaveAccessibleDescription(
      'Baseline: Code Review 4, Issues 2, Pull Requests 3, Commits 1; ' +
        'Candidate: Code Review 2, Issues 4, Pull Requests 0, Commits 0'
    );
    expect(screen.getByText('Commits')).toBeVisible();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    rerender(<RadarChart axes={axes.slice(0, 2)} series={series} />);
    expect(screen.getByRole('status')).toHaveTextContent('At least three axes');
  });

  it('opens one tooltip per axis with every visible series, keeping hues when series are hidden', async () => {
    const { user } = render(
      <RadarChart
        axes={axes}
        series={series}
        selectedIds={new Set(['b', 'c'])}
        renderAxisTooltip={renderAxisTooltip}
      />
    );
    await user.tab();
    expect(
      screen.getByRole('img', { name: 'Code Review: Candidate 2, Rerank 1' })
    ).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `Code Review: Candidate 2 ${getCategoricalLineChartColor(1)}, ` +
        `Rerank 1 ${getCategoricalLineChartColor(2)}`
    );
    await user.keyboard('{Escape}');
    await user.hover(screen.getByText('Commits'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Commits: Candidate 0'
    );
  });

  it('draws the active legend series above the others and dims the rest', () => {
    const { container } = render(
      <RadarChart axes={axes} series={series} activeLegendItemId="a" />
    );
    const areas = [...container.querySelectorAll('svg > polygon')];
    expect(areas.map((area) => area.getAttribute('stroke'))).toEqual([
      getCategoricalLineChartColor(1),
      getCategoricalLineChartColor(2),
      getCategoricalLineChartColor(0),
    ]);
    expect(areas.map((area) => Number(area.getAttribute('opacity')))).toEqual([
      CHART_DIMMED_OPACITY,
      CHART_DIMMED_OPACITY,
      1,
    ]);
  });
});
