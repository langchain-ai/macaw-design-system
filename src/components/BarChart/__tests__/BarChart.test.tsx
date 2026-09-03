import { describe, expect, it, vi } from 'vitest';

import type * as MantineHooks from '@mantine/hooks';
import type * as VisxText from '@visx/text';

import { act, fireEvent, render, screen } from '../../../test-utils';
import { Text } from '../../Text';
import { BarChart } from '../BarChart';
import type {
  BarChartInteractionBar,
  BarChartInteractionDatum,
  BarChartSeries,
} from '../BarChart.types';
import { BAR_CHART_VALUE_AXIS_THICKNESS } from '../constants';

vi.mock('@mantine/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof MantineHooks>()),
  useResizeObserver: () => [
    { current: null },
    {
      width: 640,
      height: 320,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 320,
      right: 640,
    },
  ],
}));

vi.mock('@visx/text', async (importOriginal) => ({
  ...(await importOriginal<typeof VisxText>()),
  getStringWidth: (text: string) => text.length * 7,
}));

const series: readonly BarChartSeries[] = [
  {
    id: 'requests',
    label: 'Requests',
    data: [
      { id: 'requests-mon', category: 'Mon', value: 5 },
      { id: 'requests-tue', category: 'Tue', value: 0 },
      { id: 'requests-wed', category: 'Wed', value: -2 },
    ],
  },
  {
    id: 'errors',
    label: 'Errors',
    data: [
      { id: 'errors-mon', category: 'Mon', value: 2 },
      { id: 'errors-tue', category: 'Tue', value: 1 },
      { id: 'errors-wed', category: 'Wed', value: null },
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

describe('BarChart', () => {
  it('renders an accessible chart, series, bars, and derived legend', () => {
    render(
      <>
        <Text id="usage-summary">Requests and errors for three days</Text>
        <BarChart
          aria-label="Daily usage"
          aria-describedby="usage-summary"
          series={series}
          legendProps={{ layout: 'list' }}
          getBarAriaLabel={(bar) =>
            `${bar.seriesLabel} on ${bar.category}: ${bar.value}`
          }
        />
      </>
    );

    expect(screen.getByRole('group', { name: 'Daily usage' })).toHaveAttribute(
      'aria-describedby',
      'usage-summary'
    );
    expect(
      screen.getByRole('group', { name: 'Daily usage legend' })
    ).toBeVisible();
    // The series name comes from the human-readable label, not the series id.
    expect(
      screen.getByRole('group', { name: 'Requests series' })
    ).toBeVisible();
    expect(screen.getByRole('group', { name: 'Errors series' })).toBeVisible();
    expect(screen.getByLabelText('Requests on Mon: 5')).toHaveAttribute(
      'tabindex',
      '0'
    );
  });

  it('stays a plain image when nothing about it is interactive', () => {
    render(<BarChart aria-label="Static usage" series={series} />);

    expect(screen.getByRole('img', { name: 'Static usage' })).toBeVisible();
  });

  it('exposes a labelled value band from a non-interactive chart', () => {
    render(
      <BarChart
        aria-label="Usage with warning range"
        series={series}
        valueBands={[
          {
            id: 'warning',
            from: 8,
            color: 'var(--chart-warning-fill)',
            ariaLabel: 'Warning range',
          },
        ]}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Usage with warning range' })
    ).toBeVisible();
    expect(screen.getByRole('img', { name: 'Warning range' })).toBeVisible();
  });

  it('exposes a selection from a non-interactive chart', () => {
    render(
      <BarChart
        aria-label="Selected usage"
        series={series}
        selectionRange={{ from: 'Mon', to: 'Tue' }}
      />
    );

    expect(screen.getByRole('group', { name: 'Selected usage' })).toBeVisible();
    expect(
      screen.getByRole('img', { name: 'Selected range from Mon to Tue' })
    ).toBeVisible();
  });

  it('places an inline legend before the plot', () => {
    render(<BarChart aria-label="Daily usage" series={series} />);

    const legend = screen.getByRole('group', { name: 'Daily usage legend' });
    const plot = screen.getByRole('img', { name: 'Daily usage' });

    expect(legend.compareDocumentPosition(plot)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('uses controlled legend selection without reflowing categories', () => {
    render(
      <BarChart
        aria-label="Filtered usage"
        series={series}
        selectedIds={new Set(['requests'])}
        legendProps={{ layout: 'list', onItemClick: vi.fn() }}
      />
    );

    expect(screen.getByRole('button', { name: 'Requests' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Errors' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('group', { name: 'Requests series' })
    ).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'Errors series' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeVisible();
  });

  it('exposes signed stacked values to consumer-owned bar labels', () => {
    render(
      <BarChart
        aria-label="Stacked usage"
        showLegend={false}
        mode="stacked"
        series={series}
        slots={{
          barLabel: (bar) => (
            <text>{`${bar.id}: ${bar.startValue} to ${bar.endValue}`}</text>
          ),
        }}
      />
    );

    expect(screen.getByText('errors-mon: 5 to 7')).toBeVisible();
    expect(screen.getByText('requests-wed: 0 to -2')).toBeVisible();
    expect(screen.queryByText(/errors-wed/)).not.toBeInTheDocument();
  });

  it('supports horizontal layout and generic axis, background, and overlay slots', () => {
    render(
      <BarChart
        aria-label="Top models"
        showLegend={false}
        orientation="horizontal"
        series={[series[0]]}
        slots={{
          categoryAxis: ({ orientation, categories }) => (
            <text>{`${orientation} axis: ${categories.join(', ')}`}</text>
          ),
          background: ({ bars }) => (
            <text>{`background: ${bars.length} bars`}</text>
          ),
          overlay: ({ orientation, bars }) => (
            <text>{`${orientation} overlay: ${bars.length} bars`}</text>
          ),
        }}
      />
    );

    expect(screen.getByText('horizontal axis: Mon, Tue, Wed')).toBeVisible();
    expect(screen.getByText('background: 3 bars')).toBeVisible();
    expect(screen.getByText('horizontal overlay: 3 bars')).toBeVisible();
  });

  it('renders multiple value axes, threshold bands, fixed ticks, selection, and label tooltips', () => {
    render(
      <BarChart
        aria-label="Request volume and latency"
        showLegend={false}
        series={[
          { ...series[0], valueAxisId: 'count' },
          { ...series[1], valueAxisId: 'duration' },
        ]}
        valueAxes={[
          {
            id: 'count',
            label: 'Requests',
            domain: [-2, 10],
            tickValues: [-2, 0, 10],
            formatValue: (value) => `${value} req`,
          },
          {
            id: 'duration',
            label: 'Latency',
            domain: [0, 4],
            tickValues: [0, 2, 4],
            formatValue: (value) => `${value} ms`,
          },
        ]}
        valueBands={[
          {
            id: 'warning',
            from: 8,
            color: 'var(--chart-warning-fill)',
            ariaLabel: 'Warning range',
          },
        ]}
        selectionRange={{ from: 'Mon', to: 'Tue' }}
      />
    );

    expect(screen.getByText('Requests')).toBeVisible();
    expect(screen.getByText('10 req')).toBeVisible();
    expect(screen.getByText('4 ms')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Warning range' })).toBeVisible();
    expect(
      screen.getByRole('img', { name: 'Selected range from Mon to Tue' })
    ).toBeVisible();

    vi.useFakeTimers();
    try {
      fireEvent.pointerMove(screen.getByText('Latency'));
      act(() => vi.advanceTimersByTime(300));

      expect(document.querySelector('[role="tooltip"]')).toHaveTextContent(
        'Latency'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('positions outer value axes after the resolved thickness of inner axes', () => {
    const { container } = render(
      <BarChart
        aria-label="Three metrics"
        showLegend={false}
        series={[
          {
            id: 'primary-series',
            label: 'Primary',
            valueAxisId: 'primary',
            data: [{ category: 'Mon', value: 1 }],
          },
          {
            id: 'wide-series',
            label: 'Wide',
            valueAxisId: 'wide',
            data: [{ category: 'Mon', value: 2 }],
          },
          {
            id: 'outer-series',
            label: 'Outer',
            valueAxisId: 'outer',
            data: [{ category: 'Mon', value: 3 }],
          },
        ]}
        valueAxes={[
          { id: 'primary' },
          {
            id: 'wide',
            label: 'Wide axis',
            formatValue: (value) => `${value} very wide units`,
          },
          { id: 'outer' },
        ]}
      />
    );
    const rightAxes = Array.from(
      container.querySelectorAll<SVGGElement>('.visx-axis-right')
    );
    const getLeft = (axis: SVGGElement) => {
      const match = axis.getAttribute('transform')?.match(/translate\(([^,]+)/);
      return Number(match?.[1]);
    };

    expect(rightAxes).toHaveLength(2);
    expect(getLeft(rightAxes[1]) - getLeft(rightAxes[0])).toBeGreaterThan(
      BAR_CHART_VALUE_AXIS_THICKNESS
    );
  });

  it('reserves vertical gutter for explicit value tick labels', () => {
    const customTick = 0.123456;
    const customLabel = 'Custom currency tick';
    render(
      <BarChart
        aria-label="Explicit value ticks"
        showLegend={false}
        series={[
          {
            id: 'requests',
            label: 'Requests',
            data: [{ category: 'Mon', value: 1 }],
          },
        ]}
        valueAxes={[
          {
            id: 'requests',
            domain: [0, 1],
            tickValues: [customTick],
            formatValue: (value) =>
              value === customTick ? customLabel : String(value),
          },
        ]}
      />
    );

    const tickLabel = getSvgTextElement(screen.getByText(customLabel));
    if (tickLabel == null) {
      throw new Error('Expected the explicit value tick to render as SVG text');
    }

    expect(
      getAbsoluteX(tickLabel) - customLabel.length * 7
    ).toBeGreaterThanOrEqual(0);
  });

  it('positions vertical value-axis labels outside wide tick labels', () => {
    render(
      <BarChart
        aria-label="Wide value axes"
        showLegend={false}
        series={[
          {
            id: 'requests-series',
            label: 'Requests series',
            valueAxisId: 'requests',
            data: [{ category: 'Mon', value: 1 }],
          },
          {
            id: 'latency-series',
            label: 'Latency series',
            valueAxisId: 'latency',
            data: [{ category: 'Mon', value: 1 }],
          },
        ]}
        valueAxes={[
          {
            id: 'requests',
            label: 'Requests',
            tickValues: [1],
            formatValue: () => 'Primary value tick',
          },
          {
            id: 'latency',
            label: 'Latency',
            tickValues: [1],
            formatValue: () => 'Secondary value tick',
          },
        ]}
      />
    );

    const requestsLabel = getSvgTextElement(screen.getByText('Requests'));
    const latencyLabel = getSvgTextElement(screen.getByText('Latency'));
    const primaryTick = getSvgTextElement(
      screen.getByText('Primary value tick')
    );
    const secondaryTick = getSvgTextElement(
      screen.getByText('Secondary value tick')
    );
    if (
      requestsLabel == null ||
      latencyLabel == null ||
      primaryTick == null ||
      secondaryTick == null
    ) {
      throw new Error('Expected value-axis labels and ticks to render');
    }

    expect(getAbsoluteX(requestsLabel)).toBeLessThan(
      getAbsoluteX(primaryTick) - 'Primary value tick'.length * 7
    );
    expect(getAbsoluteX(latencyLabel)).toBeGreaterThan(
      getAbsoluteX(secondaryTick) + 'Secondary value tick'.length * 7
    );
  });

  it('positions a horizontal category-axis label outside category ticks', () => {
    render(
      <BarChart
        aria-label="Horizontal categories"
        showLegend={false}
        orientation="horizontal"
        series={[series[0]]}
        categoryAxis={{
          label: 'Day',
          formatValue: () => 'Long Monday',
        }}
      />
    );

    const axisLabel = getSvgTextElement(screen.getByText('Day'));
    const tickLabel = getSvgTextElement(screen.getAllByText('Long Monday')[0]);
    if (axisLabel == null || tickLabel == null) {
      throw new Error('Expected the category-axis label and ticks to render');
    }

    expect(getAbsoluteX(axisLabel)).toBeLessThan(
      getAbsoluteX(tickLabel) - 'Long Monday'.length * 7
    );
  });

  it('draws value guides independently of the value axis ticks', () => {
    const { container } = render(
      <BarChart
        aria-label="Empty spend"
        showLegend={false}
        series={[{ id: 'spend', label: 'Spend', data: [] }]}
        categoryAxis={{ domain: ['Mon', 'Tue'] }}
        valueAxes={[{ id: 'spend', tickValues: [0] }]}
        grid={{ tickValues: [0, 0.25, 0.5, 0.75, 1] }}
      />
    );

    expect(container.querySelectorAll('.visx-rows line')).toHaveLength(5);
  });

  it('uses the LineChart dash pattern for grid guides', () => {
    const { container } = render(
      <BarChart
        aria-label="Dashed guides"
        showLegend={false}
        series={[series[0]]}
      />
    );
    const gridLines = Array.from(container.getElementsByTagName('line'));

    expect(gridLines.length).toBeGreaterThan(0);
    for (const line of gridLines) {
      expect(line).toHaveAttribute('stroke', 'var(--border-subtle)');
      expect(line).toHaveAttribute('stroke-dasharray', '4 2');
    }
  });

  it('draws a subtle guide through the active bar instead of the category center', () => {
    const renderChart = (activeGuideBarId: string) => (
      <BarChart
        aria-label="Active grouped bar"
        showLegend={false}
        series={series}
        activeGuideBarId={activeGuideBarId}
      />
    );
    const { container, rerender } = render(renderChart('requests-mon'));
    const getActiveGuide = () =>
      Array.from(container.getElementsByTagName('line')).find((line) =>
        line.classList.contains('text-quaternary')
      );
    const requestsGuide = getActiveGuide();
    if (requestsGuide == null) throw new Error('Expected an active bar guide');

    expect(requestsGuide).toHaveAttribute('stroke', 'currentColor');
    expect(requestsGuide).toHaveAttribute('stroke-dasharray', '4 2');
    const requestsPosition = requestsGuide.getAttribute('x1');

    rerender(renderChart('errors-mon'));

    const errorsGuide = getActiveGuide();
    if (errorsGuide == null) throw new Error('Expected an active bar guide');
    expect(errorsGuide.getAttribute('x1')).not.toBe(requestsPosition);
  });

  it('keeps centered horizontal endpoint tick labels inside the viewport', () => {
    render(
      <BarChart
        aria-label="Horizontal endpoint labels"
        showLegend={false}
        orientation="horizontal"
        series={[
          {
            id: 'requests',
            label: 'Requests',
            data: [{ category: 'Monday', value: 1_000 }],
          },
        ]}
        categoryAxis={{ thickness: 0 }}
        valueAxes={[
          {
            id: 'requests',
            domain: [-1_000, 1_000],
            tickValues: [-1_000, 1_000],
            formatValue: (value) => `${value} requests`,
          },
        ]}
      />
    );

    const minimumLabelContent = screen.getByText('-1000 requests');
    const maximumLabelContent = screen.getByText('1000 requests');
    const minimumLabel = getSvgTextElement(minimumLabelContent);
    const maximumLabel = getSvgTextElement(maximumLabelContent);
    if (minimumLabel == null || maximumLabel == null) {
      throw new Error('Expected horizontal value ticks to render as SVG text');
    }
    const svgWidth = Number(
      screen
        .getByRole('img', { name: 'Horizontal endpoint labels' })
        .getAttribute('width')
    );
    const minimumHalfWidth = (minimumLabel.textContent?.length ?? 0) * 7 * 0.5;
    const maximumHalfWidth = (maximumLabel.textContent?.length ?? 0) * 7 * 0.5;

    expect(
      getAbsoluteX(minimumLabel) - minimumHalfWidth
    ).toBeGreaterThanOrEqual(0);
    expect(getAbsoluteX(maximumLabel) + maximumHalfWidth).toBeLessThanOrEqual(
      svgWidth
    );
  });

  it('reports the nearest category and every visible series value', async () => {
    const onDatumPointerMove = vi.fn(
      (_datum: BarChartInteractionDatum) => undefined
    );
    const { user } = render(
      <BarChart
        aria-label="Interactive usage"
        showLegend={false}
        series={series}
        onDatumPointerMove={onDatumPointerMove}
      />
    );
    const chart = screen.getByRole('group', { name: 'Interactive usage' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      target: chart,
      coords: { clientX: 350, clientY: 40 },
    });

    expect(onDatumPointerMove).toHaveBeenCalled();
    expect(onDatumPointerMove.mock.calls[0]?.[0]).toMatchObject({
      category: 'Tue',
      bars: [
        expect.objectContaining({ seriesId: 'requests', value: 0 }),
        expect.objectContaining({ seriesId: 'errors', value: 1 }),
      ],
    });
  });

  it('clears the hover when the pointer moves off the plot into an axis gutter', async () => {
    const onDatumPointerMove = vi.fn();
    const onDatumPointerOut = vi.fn();
    const { user } = render(
      <BarChart
        aria-label="Gutter usage"
        showLegend={false}
        series={series}
        onDatumPointerMove={onDatumPointerMove}
        onDatumPointerOut={onDatumPointerOut}
      />
    );
    const chart = screen.getByRole('group', { name: 'Gutter usage' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({ target: chart, coords: { clientX: 8, clientY: 40 } });

    expect(onDatumPointerMove).not.toHaveBeenCalled();
    expect(onDatumPointerOut).toHaveBeenCalled();
  });

  it('supports focus and keyboard activation on individual bars', async () => {
    const onBarActivate = vi.fn((_bar: BarChartInteractionBar) => undefined);
    const onBarFocus = vi.fn((_bar: BarChartInteractionBar) => undefined);
    const { user } = render(
      <BarChart
        aria-label="Keyboard bars"
        showLegend={false}
        series={[series[0]]}
        getBarAriaLabel={(bar) => `${bar.category} requests`}
        onBarActivate={onBarActivate}
        onBarFocus={onBarFocus}
      />
    );
    const mondayBar = screen.getByRole('button', { name: 'Mon requests' });

    mondayBar.focus();
    await user.keyboard('{Enter}');

    expect(onBarFocus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'requests-mon', category: 'Mon' }),
      expect.anything()
    );
    expect(onBarActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'requests-mon', value: 5 }),
      expect.anything()
    );
  });

  it('activates a bar without retaining mouse focus or activating its category', async () => {
    const onBarActivate = vi.fn();
    const onDatumPointerUp = vi.fn();
    const onDatumActivate = vi.fn();
    const { user } = render(
      <BarChart
        aria-label="Clickable bars"
        showLegend={false}
        series={[series[0]]}
        getBarAriaLabel={(bar) => `${bar.category} requests`}
        onBarActivate={onBarActivate}
        onDatumPointerUp={onDatumPointerUp}
        onDatumActivate={onDatumActivate}
      />
    );
    const chart = screen.getByRole('group', { name: 'Clickable bars' });
    const mondayBar = screen.getByRole('button', { name: 'Mon requests' });
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 640, height: 320 })
    );

    await user.pointer({
      keys: '[MouseLeft]',
      target: mondayBar,
      coords: { clientX: 100, clientY: 100 },
    });

    expect(mondayBar).not.toHaveFocus();
    expect(onBarActivate).toHaveBeenCalledOnce();
    expect(onDatumPointerUp).toHaveBeenCalledOnce();
    expect(onDatumActivate).not.toHaveBeenCalled();
  });

  it('never marks a bar as a button without an accessible name', () => {
    const { container } = render(
      <BarChart
        aria-label="Unnamed bars"
        showLegend={false}
        series={[series[0]]}
        onBarActivate={vi.fn()}
      />
    );

    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('provides full-category keyboard targets for horizontal row actions', async () => {
    const onDatumActivate = vi.fn(
      (_datum: BarChartInteractionDatum) => undefined
    );
    const { user } = render(
      <BarChart
        aria-label="Actionable rows"
        showLegend={false}
        orientation="horizontal"
        series={[series[0]]}
        getCategoryAriaLabel={(datum) => `Open ${datum.category}`}
        onDatumActivate={onDatumActivate}
      />
    );
    const mondayRow = screen.getByRole('button', { name: 'Open Mon' });

    mondayRow.focus();
    await user.keyboard(' ');

    expect(onDatumActivate).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Mon' }),
      expect.anything()
    );
  });

  it('keeps the axes while rendering is paused and drops only the marks', () => {
    render(
      <BarChart
        aria-label="Paused usage"
        series={series}
        isRendering={false}
        legendProps={{ layout: 'list' }}
      />
    );

    expect(screen.getByRole('img', { name: 'Paused usage' })).toBeVisible();
    expect(screen.getByText('Requests')).toBeVisible();
    expect(screen.getByText('Mon')).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Requests series' })
    ).toBeEmptyDOMElement();
  });

  it('renders an empty frame rather than failing when there is no data', () => {
    render(<BarChart aria-label="No data" series={[]} />);

    expect(screen.getByRole('img', { name: 'No data' })).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'No data legend' })
    ).not.toBeInTheDocument();
  });

  it('keeps the frame when a legend filter matches no series', () => {
    render(
      <BarChart
        aria-label="Nothing selected"
        series={series}
        selectedIds={new Set(['missing'])}
        legendProps={{ layout: 'list' }}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Requests series' })
    ).not.toBeInTheDocument();
    // The categories stay put so the axis does not reflow while filtering.
    expect(screen.getByText('Mon')).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Nothing selected legend' })
    ).toBeVisible();
  });

  it('draws no bars for a series whose values are all gaps', () => {
    const { container } = render(
      <BarChart
        aria-label="All gaps"
        showLegend={false}
        series={[
          {
            id: 'requests',
            label: 'Requests',
            data: [
              { category: 'Mon', value: null },
              { category: 'Tue', value: null },
            ],
          },
        ]}
      />
    );

    expect(container.querySelectorAll('path[data-bar-id]')).toHaveLength(0);
    expect(screen.getByText('Mon')).toBeVisible();
  });

  it('omits a redundant legend for one series by default', () => {
    render(<BarChart aria-label="Single series" series={[series[0]]} />);

    expect(
      screen.queryByRole('group', { name: 'Single series legend' })
    ).not.toBeInTheDocument();
  });
});
