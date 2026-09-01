import type { ReactNode } from 'react';

import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import type * as VisxText from '@visx/text';

import {
  act,
  fireEvent,
  render as renderWithProviders,
  screen,
} from '../../../test-utils';
import { Text } from '../../Text';
import {
  LineChart,
  type LineChartInteractionDatum,
  type LineChartProps,
  type LineChartSeries,
} from '../LineChart';

const resizeObserverDimensions = vi.hoisted(() => ({
  width: 640,
  height: 320,
}));

vi.mock('@mantine/hooks', () => ({
  useMediaQuery: () => false,
  useResizeObserver: () => [vi.fn(), resizeObserverDimensions],
}));

vi.mock('@visx/text', async (importOriginal) => ({
  ...(await importOriginal<typeof VisxText>()),
  getStringWidth: (text: string) => text.length * 7,
}));

const render = (ui: ReactNode) => renderWithProviders(ui);

const series: readonly LineChartSeries[] = [
  {
    id: 'requests',
    label: 'Requests',
    points: [
      { x: 20, y: 9 },
      { x: 0, y: 5 },
      { x: 10, y: 7 },
    ],
  },
  {
    id: 'latency',
    label: 'Latency',
    points: [
      { x: 0, y: 8 },
      { x: 10, y: null },
      { x: 20, y: 12 },
    ],
  },
];

const isSvgTextElement = (element: Element): element is SVGTextElement =>
  element.namespaceURI === 'http://www.w3.org/2000/svg' &&
  element.localName === 'text';

const getSvgTextElement = (element: Element): SVGTextElement | null => {
  let candidate: Element | null = element;
  while (candidate != null && !isSvgTextElement(candidate)) {
    candidate = candidate.parentElement;
  }
  return candidate != null && isSvgTextElement(candidate) ? candidate : null;
};

const getAbsoluteX = (element: SVGTextElement) => {
  let x = Number(element.getAttribute('x') ?? 0);
  let ancestor = element.parentElement;
  while (ancestor != null) {
    const translateX = ancestor
      .getAttribute('transform')
      ?.match(/translate\(([-\d.]+)/)?.[1];
    if (translateX != null) x += Number(translateX);
    ancestor = ancestor.parentElement;
  }
  return x;
};

describe('LineChart', () => {
  it('requires a text accessible name', () => {
    expectTypeOf<LineChartProps['aria-label']>().toEqualTypeOf<string>();
  });

  beforeEach(() => {
    resizeObserverDimensions.width = 640;
    resizeObserverDimensions.height = 320;
  });

  it('renders accessible series and a derived legend', () => {
    render(
      <>
        <Text id="request-health-summary">
          Requests and latency over three time buckets
        </Text>
        <LineChart
          aria-label="Request health"
          aria-describedby="request-health-summary"
          series={series}
          legendProps={{ layout: 'list' }}
        />
      </>
    );

    expect(screen.getByRole('img', { name: 'Request health' })).toHaveAttribute(
      'aria-describedby',
      'request-health-summary'
    );
    expect(
      screen.getByRole('group', { name: 'Request health legend' })
    ).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'requests series' })
    ).toBeVisible();
    expect(screen.getByRole('group', { name: 'latency series' })).toBeVisible();
    expect(screen.getByText('Requests')).toBeVisible();
    expect(screen.getByText('Latency')).toBeVisible();
  });

  it('uses the kebab-case series aria-label as its accessible name', () => {
    render(
      <LineChart
        aria-label="Request chart"
        showLegend={false}
        series={[
          {
            id: 'requests',
            label: 'Requests',
            'aria-label': 'Request volume',
            points: [{ x: 0, y: 5 }],
          },
        ]}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Request volume series' })
    ).toBeVisible();
  });

  it('uses controlled selection for legend state and series visibility', () => {
    render(
      <LineChart
        aria-label="Selected request health"
        series={series}
        selectedIds={new Set(['requests'])}
        legendProps={{ layout: 'list', onItemClick: vi.fn() }}
      />
    );

    expect(screen.getByRole('button', { name: 'Requests' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Latency' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('group', { name: 'requests series' })
    ).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'latency series' })
    ).not.toBeInTheDocument();
  });

  it('renders multiple labeled and formatted y axes with label tooltips', () => {
    render(
      <LineChart
        aria-label="Request metrics"
        showLegend={false}
        series={[
          { ...series[0], yAxisId: 'count' },
          { ...series[1], yAxisId: 'duration' },
        ]}
        yAxes={[
          {
            id: 'count',
            label: 'Requests',
            formatValue: (value) => `${value} req`,
          },
          {
            id: 'duration',
            label: 'Latency (ms)',
            formatValue: (value) => `${value} ms`,
          },
        ]}
      />
    );

    expect(screen.getByText('Requests')).toBeVisible();
    expect(screen.getByText('Latency (ms)')).toBeVisible();
    expect(screen.getAllByText(/req$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ms$/).length).toBeGreaterThan(0);

    vi.useFakeTimers();
    try {
      fireEvent.pointerMove(screen.getByText('Latency (ms)'));
      act(() => vi.advanceTimersByTime(300));

      expect(document.querySelector('[role="tooltip"]')).toHaveTextContent(
        'Latency (ms)'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('reserves measured gutters for wide value-axis tick labels', () => {
    render(
      <LineChart
        aria-label="Wide line-chart axes"
        showLegend={false}
        series={[
          { ...series[0], yAxisId: 'primary' },
          { ...series[1], yAxisId: 'secondary' },
        ]}
        yAxes={[
          {
            id: 'primary',
            tickValues: [1],
            formatValue: () => 'Primary $123,456.78',
          },
          {
            id: 'secondary',
            tickValues: [1],
            formatValue: () => 'Secondary $123,456.78',
          },
        ]}
      />
    );

    const primaryTick = getSvgTextElement(
      screen.getByText('Primary $123,456.78')
    );
    const secondaryTick = getSvgTextElement(
      screen.getByText('Secondary $123,456.78')
    );
    if (primaryTick == null || secondaryTick == null) {
      throw new Error('Expected wide value-axis ticks to render');
    }
    const svgWidth = Number(
      screen
        .getByRole('img', { name: 'Wide line-chart axes' })
        .getAttribute('width')
    );

    expect(
      getAbsoluteX(primaryTick) - 'Primary $123,456.78'.length * 7
    ).toBeGreaterThanOrEqual(0);
    expect(
      getAbsoluteX(secondaryTick) + 'Secondary $123,456.78'.length * 7
    ).toBeLessThanOrEqual(svgWidth);
  });

  it('keeps the accessible chart and legend while rendering is paused', () => {
    render(
      <LineChart
        aria-label="Paused chart"
        series={series}
        isRendering={false}
        legendProps={{ layout: 'list' }}
      />
    );

    expect(screen.getByRole('img', { name: 'Paused chart' })).toBeVisible();
    expect(screen.getByText('Requests')).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'requests series' })
    ).not.toBeInTheDocument();
  });

  it('renders at the measured width in narrow containers', () => {
    resizeObserverDimensions.width = 200;

    render(
      <LineChart
        aria-label="Narrow responsive chart"
        showLegend={false}
        series={[series[0]]}
      />
    );

    expect(
      screen.getByRole('img', { name: 'Narrow responsive chart' })
    ).toHaveAttribute('width', '200');
  });

  it('keeps null-only and non-finite input accessible', () => {
    render(
      <LineChart
        aria-label="Empty metrics"
        showLegend={false}
        series={[
          {
            id: 'empty',
            label: 'Empty',
            points: [
              { x: 0, y: null },
              { x: Number.NaN, y: 4 },
              { x: 2, y: Number.POSITIVE_INFINITY },
            ],
          },
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Empty metrics' })).toBeVisible();
  });

  it('connects valid observations without rendering points for null values', () => {
    render(
      <LineChart
        aria-label="Connected null observations"
        showLegend={false}
        series={[
          {
            id: 'connected',
            label: 'Connected',
            points: [
              { x: 0, y: 2 },
              { x: 1, y: null },
              { x: 2, y: 8 },
            ],
          },
        ]}
      />
    );

    const renderedSeries = screen.getByRole('group', {
      name: 'connected series',
    });
    expect(renderedSeries.getElementsByTagName('path')).toHaveLength(1);
    expect(renderedSeries.getElementsByTagName('circle')).toHaveLength(0);
  });

  it('does not add point markers for isolated observations around gaps', () => {
    render(
      <LineChart
        aria-label="Disconnected null observations"
        connectNulls={false}
        showLegend={false}
        series={[
          {
            id: 'leading-and-trailing-gaps',
            label: 'Leading and trailing gaps',
            points: [
              { x: 0, y: null },
              { x: 1, y: 2 },
              { x: 2, y: 4 },
              { x: 3, y: null },
            ],
          },
          {
            id: 'isolated',
            label: 'Isolated',
            points: [
              { x: 0, y: null },
              { x: 1, y: 3 },
              { x: 2, y: null },
            ],
          },
          {
            id: 'separated',
            label: 'Separated',
            points: [
              { x: 0, y: 1 },
              { x: 1, y: null },
              { x: 2, y: 5 },
            ],
          },
        ]}
      />
    );

    const chart = screen.getByRole('img', {
      name: 'Disconnected null observations',
    });
    expect(chart.getElementsByTagName('circle')).toHaveLength(0);
    expect(
      screen
        .getByRole('group', { name: 'leading-and-trailing-gaps series' })
        .getElementsByTagName('path')
    ).toHaveLength(1);
    expect(
      screen
        .getByRole('group', { name: 'isolated series' })
        .getElementsByTagName('path')
    ).toHaveLength(1);
    expect(
      screen
        .getByRole('group', { name: 'separated series' })
        .getElementsByTagName('path')
    ).toHaveLength(2);
  });

  it('reports the nearest x bucket with visible values and semantic colors', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: LineChartInteractionDatum) => undefined
    );
    const { user } = render(
      <LineChart
        aria-label="Interactive chart"
        showLegend={false}
        series={series}
        onDatumPointerMove={onDatumPointerMove}
      />
    );

    const chart = screen.getByRole('img', { name: 'Interactive chart' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 348, clientY: 40 },
    });

    expect(onDatumPointerMove).toHaveBeenCalled();
    expect(onDatumPointerMove.mock.calls[0]?.[0]).toEqual({
      x: 10,
      pointerX: 10,
      xPosition: 348,
      points: [
        {
          seriesId: 'requests',
          seriesLabel: 'Requests',
          color: 'var(--chart-categorical-line-1)',
          value: 7,
        },
        {
          seriesId: 'latency',
          seriesLabel: 'Latency',
          color: 'var(--chart-categorical-line-2)',
          value: null,
        },
      ],
    });
  });

  it('reports the raw unsnapped x-domain value for consumer brushing', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: LineChartInteractionDatum) => undefined
    );
    const { user } = render(
      <LineChart
        aria-label="Brushable chart"
        showLegend={false}
        xDomain={[0, 20]}
        series={[series[0]]}
        onDatumPointerMove={onDatumPointerMove}
      />
    );
    const chart = screen.getByRole('img', { name: 'Brushable chart' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 206, clientY: 40 },
    });

    expect(onDatumPointerMove.mock.calls[0]?.[0].x).toBe(0);
    expect(onDatumPointerMove.mock.calls[0]?.[0].pointerX).toBeCloseTo(5);
  });

  it('supports evenly spaced band buckets', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: LineChartInteractionDatum) => undefined
    );
    const { user } = render(
      <LineChart
        aria-label="Band bucket chart"
        showLegend={false}
        xScale="band"
        series={[
          {
            id: 'buckets',
            label: 'Buckets',
            points: [
              { x: 0, y: 1 },
              { x: 10, y: 2 },
              { x: 30, y: 3 },
            ],
          },
        ]}
        onDatumPointerMove={onDatumPointerMove}
      />
    );
    const chart = screen.getByRole('img', { name: 'Band bucket chart' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 348, clientY: 40 },
    });

    expect(onDatumPointerMove.mock.calls[0]?.[0]).toMatchObject({
      x: 10,
      pointerX: 10,
      xPosition: 348,
    });
  });

  it('limits pointer interactions to the visible x domain', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: LineChartInteractionDatum) => undefined
    );
    const { user } = render(
      <LineChart
        aria-label="Clipped interaction chart"
        showLegend={false}
        xDomain={[5, 9]}
        series={[
          {
            id: 'visible',
            label: 'Visible',
            points: [
              { x: 0, y: 1 },
              { x: 7, y: 2 },
              { x: 9.5, y: 3 },
            ],
          },
        ]}
        onDatumPointerMove={onDatumPointerMove}
      />
    );
    const chart = screen.getByRole('img', {
      name: 'Clipped interaction chart',
    });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 632, clientY: 40 },
    });

    expect(onDatumPointerMove.mock.calls[0]?.[0].x).toBe(7);
  });

  it('does not render band points outside the visible x domain', () => {
    render(
      <LineChart
        aria-label="Clipped band chart"
        activeX={0}
        grid={false}
        showLegend={false}
        showPoints
        xScale="band"
        xDomain={[5, 25]}
        yAxes={[
          {
            id: 'values',
            formatValue: (value) => `Y ${value}`,
          },
        ]}
        series={[
          {
            id: 'buckets',
            label: 'Buckets',
            yAxisId: 'values',
            points: [
              { x: 0, y: 100 },
              { x: 10, y: 2 },
              { x: 20, y: 3 },
              { x: 30, y: -100 },
            ],
          },
        ]}
      />
    );

    const renderedSeries = screen.getByRole('group', {
      name: 'buckets series',
    });
    const chart = screen.getByRole('img', { name: 'Clipped band chart' });
    expect(renderedSeries.getElementsByTagName('path')).toHaveLength(1);
    expect(chart.getElementsByTagName('circle')).toHaveLength(2);
    expect(chart.getElementsByTagName('line')).toHaveLength(0);
    expect(screen.getByText('Y 3')).toBeVisible();
    expect(screen.queryByText('Y 100')).not.toBeInTheDocument();
  });

  it('scales a linear y axis to the visible x domain', () => {
    render(
      <LineChart
        aria-label="Clipped linear chart"
        showLegend={false}
        xDomain={[10, 20]}
        yAxes={[
          {
            id: 'values',
            formatValue: (value) => `Y ${value}`,
          },
        ]}
        series={[
          {
            id: 'values',
            label: 'Values',
            yAxisId: 'values',
            points: [
              { x: 0, y: 100 },
              { x: 10, y: 2 },
              { x: 20, y: 3 },
              { x: 30, y: -100 },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText('Y 3')).toBeVisible();
    expect(screen.queryByText('Y 100')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'values series' })).toBeVisible();
  });

  it('does not report data while the pointer is over an axis', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: LineChartInteractionDatum) => undefined
    );
    const { user } = render(
      <LineChart
        aria-label="Plot-bounded interaction chart"
        showLegend={false}
        series={series}
        onDatumPointerMove={onDatumPointerMove}
      />
    );
    const chart = screen.getByRole('img', {
      name: 'Plot-bounded interaction chart',
    });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 348, clientY: 319 },
    });

    expect(onDatumPointerMove).not.toHaveBeenCalled();
  });

  it('omits a redundant legend for a single series by default', () => {
    render(
      <LineChart aria-label="Single request series" series={[series[0]]} />
    );

    expect(
      screen.queryByRole('group', { name: 'Single request series legend' })
    ).not.toBeInTheDocument();
  });

  it('aligns generated x-axis labels to actual data buckets', () => {
    render(
      <LineChart
        aria-label="Bucket-aligned chart"
        showLegend={false}
        series={[series[0]]}
        xTickCount={2}
        formatXValue={(value) => `Bucket ${value}`}
      />
    );

    expect(screen.getByText('Bucket 0')).toBeVisible();
    expect(screen.getByText('Bucket 20')).toBeVisible();
    expect(screen.queryByText('Bucket 10')).not.toBeInTheDocument();
  });

  it('renders fixed y ticks and an accessible controlled selection range', () => {
    render(
      <LineChart
        aria-label="Fixed-axis chart"
        showLegend={false}
        series={[{ ...series[0], yAxisId: 'requests' }]}
        formatXValue={(value) => `Bucket ${value}`}
        selectionRange={{ from: 0, to: 10 }}
        yAxes={[
          {
            id: 'requests',
            domain: [0, 12],
            tickValues: [0, 6, 12],
            formatValue: (value) => `Tick ${value}`,
          },
        ]}
      />
    );

    expect(screen.getByText('Tick 0')).toBeVisible();
    expect(screen.getByText('Tick 6')).toBeVisible();
    expect(screen.getByText('Tick 12')).toBeVisible();
    expect(
      screen.getByRole('group', {
        name: 'Selected range from Bucket 0 to Bucket 10',
      })
    ).toBeVisible();
  });

  it('applies per-series line styles and active-marker visibility', () => {
    render(
      <LineChart
        aria-label="Styled metrics"
        showLegend={false}
        activeX={10}
        series={[
          {
            ...series[0],
            strokeWidth: 3,
            strokeDasharray: '5 4',
            opacity: 0.4,
          },
          {
            ...series[0],
            id: 'limit',
            label: 'Limit',
            showActiveMarker: false,
          },
        ]}
      />
    );

    const styledSeries = screen.getByRole('group', {
      name: 'requests series',
    });
    const styledLine = styledSeries.getElementsByTagName('path')[0];
    expect(styledLine).toHaveAttribute('stroke-width', '3');
    expect(styledLine).toHaveAttribute('stroke-dasharray', '5 4');
    expect(styledLine).toHaveAttribute('opacity', '0.4');
    expect(
      screen
        .getByRole('img', { name: 'Styled metrics' })
        .getElementsByTagName('circle')
    ).toHaveLength(1);
  });
});
