import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  LineChart,
  type LineChartInteractionDatum,
  type LineChartSelectionRange,
  type LineChartSeries,
} from '.';
import { ChartCard } from '../ChartCard';
import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../ChartTooltip';
import { Text } from '../Text';

const DAY = 24 * 60 * 60 * 1_000;
const START = Date.UTC(2026, 7, 10);
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const numberFormatter = new Intl.NumberFormat('en-US');
const durationFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const formatDate = (value: number) => dateFormatter.format(value);

const productionSeries: LineChartSeries = {
  id: 'production',
  label: 'Production',
  points: [820, 910, 875, 1_040, 1_180, 1_120, 1_340].map((value, index) => ({
    x: START + index * DAY,
    y: value,
  })),
};

const requestSeries: readonly LineChartSeries[] = [
  productionSeries,
  {
    id: 'staging',
    label: 'Staging',
    points: [420, 510, 470, 620, 580, 710, 760].map((value, index) => ({
      x: START + index * DAY,
      y: value,
    })),
  },
  {
    id: 'development',
    label: 'Development',
    points: [180, 240, 220, 310, 290, 360, 410].map((value, index) => ({
      x: START + index * DAY,
      y: value,
    })),
  },
];

const toggleId = (
  current: ReadonlySet<string>,
  id: string
): ReadonlySet<string> => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const meta = {
  title: 'Components/Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive line-chart renderer for one or more numeric series. Linear x spacing is the default; use `xScale="band"` for evenly spaced buckets. Grid guides are solid by default, and each series can control width, dashes, opacity, and crosshair-marker visibility. Pointer callbacks expose both the nearest bucket (`x`) and raw domain position (`pointerX`) so consumers can own tooltips and brushing while the chart renders a controlled `selectionRange`. Axis baselines remain hidden, and the consumer owns domain-specific loading and transformations.',
      },
    },
  },
  argTypes: {
    shouldAnimate: {
      control: 'boolean',
      description:
        'Animates chart marks unless disabled or reduced motion is preferred.',
      table: { defaultValue: { summary: 'true' } },
    },
    series: {
      description:
        'Numeric series with optional color, y-axis assignment, stroke width, dash pattern, opacity, and active-marker visibility.',
    },
    xScale: {
      description:
        'Use linear for elapsed-distance spacing or band for evenly spaced buckets.',
      table: {
        type: { summary: "'linear' | 'band'" },
        defaultValue: { summary: 'linear' },
      },
    },
    connectNulls: {
      description:
        'Connect valid observations across null values. Disable to render null values as gaps.',
      table: { defaultValue: { summary: 'true' } },
    },
    selectionRange: {
      description:
        'Controlled x-domain range rendered as a brush-selection overlay. Update it from pointer callbacks using `pointerX`.',
      table: { type: { summary: '{ from: number; to: number }' } },
    },
    yAxes: {
      description:
        'Optional axis definitions with domains, formatters, tick counts, or exact `tickValues`.',
    },
    grid: {
      description: 'Controls dashed grid-guide visibility and direction.',
      table: {
        type: {
          summary: 'false | { rows?: boolean; columns?: boolean }',
        },
        defaultValue: {
          summary: '{ rows: true, columns: true }',
        },
      },
    },
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Requests by environment',
    series: requestSeries,
    formatXValue: formatDate,
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );

    return (
      <div className="mx-auto h-80 w-full max-w-3xl">
        <LineChart
          aria-label="Requests by environment"
          series={requestSeries}
          formatXValue={formatDate}
          selectedIds={selectedIds}
          legendProps={{
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
        />
      </div>
    );
  },
};

export const NarrowWithListLegend: Story = {
  name: 'Narrow with list legend',
  render: () => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );

    return (
      <div className="mx-auto h-[32rem] w-80 max-w-full">
        <LineChart
          aria-label="Requests by environment"
          series={requestSeries}
          formatXValue={formatDate}
          selectedIds={selectedIds}
          legendProps={{
            layout: 'list',
            onItemClick: (item) =>
              setSelectedIds((current) => toggleId(current, item.id)),
          }}
        />
      </div>
    );
  },
};

export const MissingData: Story = {
  name: 'Missing data',
  render: () => (
    <div className="mx-auto h-80 w-full max-w-3xl">
      <LineChart
        aria-label="Requests with collection gaps"
        connectNulls={false}
        series={[
          {
            id: 'requests',
            label: 'Requests',
            points: [820, 910, null, null, 1_180, 1_120, 1_340].map(
              (value, index) => ({
                x: START + index * DAY,
                y: value,
              })
            ),
          },
        ]}
        formatXValue={formatDate}
      />
    </div>
  ),
};

export const MultipleAxes: Story = {
  name: 'Multiple axes and units',
  render: () => (
    <div className="mx-auto h-80 w-full max-w-3xl">
      <LineChart
        aria-label="Request volume and latency"
        series={[
          {
            ...productionSeries,
            yAxisId: 'requests',
          },
          {
            id: 'latency',
            label: 'P50 latency',
            yAxisId: 'duration',
            points: [180, 210, 195, 260, 240, 290, 275].map((value, index) => ({
              x: START + index * DAY,
              y: value,
            })),
          },
        ]}
        yAxes={[
          {
            id: 'requests',
            label: 'Requests',
            formatValue: numberFormatter.format,
          },
          {
            id: 'duration',
            label: 'Latency (ms)',
            formatValue: (value) => `${durationFormatter.format(value)} ms`,
          },
        ]}
        grid={{ columns: false }}
        formatXValue={formatDate}
      />
    </div>
  ),
};

export const ThresholdBand: Story = {
  name: 'Threshold band and fixed ticks',
  render: () => (
    <div className="mx-auto h-80 w-full max-w-3xl">
      <LineChart
        aria-label="Production requests with warning threshold"
        series={[productionSeries]}
        showLegend={false}
        yAxes={[
          {
            id: 'requests',
            label: 'Requests',
            domain: [800, 1_400],
            formatValue: numberFormatter.format,
            tickValues: [800, 1_000, 1_200, 1_400],
          },
        ]}
        yBands={[
          {
            id: 'high-volume',
            from: 1_200,
            color: 'var(--bg-warning)',
            opacity: 0.5,
          },
        ]}
        xTickValues={[0, 2, 4, 6].map((index) => START + index * DAY)}
        formatXValue={formatDate}
      />
    </div>
  ),
};

export const SeriesStyles: Story = {
  name: 'Per-series styles and active markers',
  parameters: {
    docs: {
      description: {
        story:
          'Use per-series styling to distinguish averages, peaks, limits, or projections. `showActiveMarker={false}` keeps reference lines in the tooltip without drawing a crosshair marker.',
      },
    },
  },
  render: () => {
    const [activeX, setActiveX] = useState<number | undefined>();
    const styledSeries: readonly LineChartSeries[] = [
      {
        ...productionSeries,
        label: 'Average',
        strokeWidth: 2.5,
      },
      {
        id: 'peak',
        label: 'Peak',
        strokeWidth: 1.5,
        strokeDasharray: '5 4',
        opacity: 0.8,
        points: [910, 1_020, 980, 1_140, 1_260, 1_210, 1_390].map(
          (value, index) => ({
            x: START + index * DAY,
            y: value,
          })
        ),
      },
      {
        id: 'limit',
        label: 'Configured limit',
        color: 'var(--text-tertiary)',
        strokeWidth: 1.5,
        strokeDasharray: '2 4',
        opacity: 0.75,
        showActiveMarker: false,
        points: Array.from({ length: 7 }, (_, index) => ({
          x: START + index * DAY,
          y: 1_450,
        })),
      },
    ];

    return (
      <div className="mx-auto h-80 w-full max-w-3xl">
        <LineChart
          aria-label="Average, peak, and configured request limit"
          series={styledSeries}
          formatXValue={formatDate}
          activeX={activeX}
          onDatumPointerMove={(datum) => setActiveX(datum.x)}
          onDatumPointerOut={() => setActiveX(undefined)}
        />
      </div>
    );
  },
};

export const BandScaleWithBrushSelection: Story = {
  name: 'Band scale with controlled brush selection',
  parameters: {
    docs: {
      description: {
        story:
          'Band spacing gives every bucket equal room. Drag across the plot to update the controlled selection with the callbacks’ unsnapped `pointerX` values.',
      },
    },
  },
  render: () => {
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [selectionRange, setSelectionRange] =
      useState<LineChartSelectionRange>({
        from: START + DAY,
        to: START + 3 * DAY,
      });

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-2">
        <div className="h-80 min-w-0">
          <LineChart
            aria-label="Production requests with a selected bucket range"
            showLegend={false}
            series={[productionSeries]}
            xScale="band"
            formatXValue={formatDate}
            selectionRange={selectionRange}
            onDatumPointerDown={(datum, event) => {
              if (event.button !== 0) return;
              setDragStart(datum.pointerX);
              setSelectionRange({
                from: datum.pointerX,
                to: datum.pointerX,
              });
            }}
            onDatumPointerMove={(datum, event) => {
              if (dragStart == null || event.buttons === 0) return;
              setSelectionRange({ from: dragStart, to: datum.pointerX });
            }}
            onDatumPointerUp={(datum) => {
              if (dragStart != null) {
                setSelectionRange({ from: dragStart, to: datum.pointerX });
              }
              setDragStart(null);
            }}
            onDatumPointerOut={() => setDragStart(null)}
          />
        </div>
        <Text variant="xs" color="secondary">
          Selected{' '}
          {formatDate(Math.min(selectionRange.from, selectionRange.to))}
          {' – '}
          {formatDate(Math.max(selectionRange.from, selectionRange.to))}
        </Text>
      </div>
    );
  },
};

export const WithoutLegend: Story = {
  name: 'Without legend',
  render: () => (
    <div className="mx-auto h-64 w-full max-w-2xl">
      <LineChart
        aria-label="Production requests"
        showLegend={false}
        series={[productionSeries]}
        formatXValue={formatDate}
      />
    </div>
  ),
};

export const InChartCard: Story = {
  name: 'In ChartCard with consumer tooltip',
  render: () => {
    const [hovered, setHovered] = useState<LineChartInteractionDatum | null>(
      null
    );

    return (
      <div className="mx-auto w-full max-w-3xl">
        <ChartCard
          title="Requests by environment"
          description="Last 7 days"
          className="h-96"
        >
          <div className="relative size-full min-h-0 min-w-0">
            <LineChart
              aria-label="Requests by environment"
              series={requestSeries}
              formatXValue={formatDate}
              activeX={hovered?.x}
              onDatumPointerMove={setHovered}
              onDatumPointerOut={() => setHovered(null)}
            />
            {hovered != null && (
              <div
                className="pointer-events-none absolute top-0 -translate-x-1/2 p-space-2"
                style={{ left: hovered.xPosition }}
              >
                <ChartTooltip>
                  <ChartTooltipHeader title={formatDate(hovered.x)} />
                  <ChartTooltipBody>
                    {hovered.points.map((point) => (
                      <ChartTooltipRow
                        key={point.seriesId}
                        label={point.seriesLabel}
                        markerColor={point.color}
                        value={
                          point.value == null
                            ? 'No data'
                            : numberFormatter.format(point.value)
                        }
                      />
                    ))}
                  </ChartTooltipBody>
                </ChartTooltip>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    );
  },
};
