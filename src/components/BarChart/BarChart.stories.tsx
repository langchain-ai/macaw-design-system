import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_SINGLE_FILL_COLOR,
  CHART_STATUS_FILL_COLORS,
  getCategoricalFillChartColor,
} from '../../utils/chartColors';
import {
  BarChart,
  type BarChartCategory,
  type BarChartInteractionDatum,
  type BarChartSelectionRange,
  type BarChartSeries,
} from '../BarChart';
import { ChartCard } from '../ChartCard';
import { ChartLegend, type ChartLegendItem } from '../ChartLegend';
import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../ChartTooltip';

const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const toDailySeries = (
  id: string,
  label: string,
  values: readonly number[]
): BarChartSeries => ({
  id,
  label,
  data: values.map((value, index) => ({ category: categories[index], value })),
});

const requestSeries: readonly BarChartSeries[] = [
  toDailySeries(
    'production',
    'Production',
    [820, 910, 875, 1_040, 1_180, 1_120, 1_340]
  ),
  toDailySeries('staging', 'Staging', [420, 510, 470, 620, 580, 710, 760]),
  toDailySeries(
    'development',
    'Development',
    [180, 240, 220, 310, 290, 360, 410]
  ),
];

const getLegendItems = (
  series: readonly BarChartSeries[],
  selectedIds?: ReadonlySet<string>
): readonly ChartLegendItem[] =>
  series.map((item, index) => ({
    id: item.id,
    label: item.label,
    markerColor:
      item.color ??
      (series.length === 1
        ? CHART_SINGLE_FILL_COLOR
        : getCategoricalFillChartColor(index)),
    selected: selectedIds?.has(item.id) ?? false,
  }));

const toggleId = (
  current: ReadonlySet<string>,
  id: string
): ReadonlySet<string> => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const BarChartStoryTooltip = ({
  datum,
  activeBarId,
}: {
  datum: BarChartInteractionDatum;
  activeBarId?: string | null;
}) => (
  <div
    className="pointer-events-none absolute top-0 mt-space-6 -translate-x-1/2 p-space-2"
    style={{ left: datum.xPosition }}
  >
    <ChartTooltip>
      <ChartTooltipHeader title={datum.category} />
      <ChartTooltipBody>
        {[...datum.bars].reverse().map((bar) => (
          <ChartTooltipRow
            key={bar.id}
            label={bar.seriesLabel}
            markerColor={bar.color}
            value={numberFormatter.format(bar.value)}
            highlighted={bar.id === activeBarId}
          />
        ))}
      </ChartTooltipBody>
      <ChartTooltipRow
        label="Total"
        value={numberFormatter.format(
          datum.bars.reduce((total, bar) => total + bar.value, 0)
        )}
        variant="total"
      />
    </ChartTooltip>
  </div>
);

const meta = {
  title: 'Components/Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive, data-in/rendering-out bar renderer. It supports vertical and horizontal orientation, grouped and signed-stacked modes, multiple value axes, threshold bands, controlled selection and active state, animated marks, keyboard targets, and generic SVG slots. Consumers retain fetching, aggregation, formatting, tooltip content, navigation, frozen interaction state, and the loading and empty states.',
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
    mode: {
      description: 'Places series side by side or stacks them by value axis.',
      table: { defaultValue: { summary: 'grouped' } },
    },
    orientation: {
      description:
        'Uses columns for vertical charts or rows for horizontal charts.',
      table: { defaultValue: { summary: 'vertical' } },
    },
    slots: {
      description:
        'Generic SVG render slots for custom category/value axes, backgrounds drawn beneath the bars, bar labels, and plot overlays.',
    },
    activeGuideBarId: {
      description:
        'Draws the interaction guide through a specific bar instead of the category center.',
    },
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Requests by environment',
    series: requestSeries,
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {
  render: (args) => {
    const [hovered, setHovered] = useState<BarChartInteractionDatum | null>(
      null
    );
    const [activeGuideBarId, setActiveGuideBarId] = useState<string | null>(
      null
    );

    return (
      <div className="mx-auto flex h-80 w-full max-w-3xl flex-col gap-space-2">
        <ChartLegend
          aria-label="Requests by environment legend"
          items={getLegendItems(args.series)}
        />
        <div className="relative min-h-0 flex-1">
          <BarChart
            {...args}
            showLegend={false}
            activeGuideBarId={activeGuideBarId}
            onDatumPointerMove={setHovered}
            onDatumPointerOut={() => {
              setHovered(null);
              setActiveGuideBarId(null);
            }}
            onBarPointerMove={(bar) => setActiveGuideBarId(bar.id)}
            onBarPointerOut={() => setActiveGuideBarId(null)}
          />
          {hovered != null && (
            <BarChartStoryTooltip
              datum={hovered}
              activeBarId={activeGuideBarId}
            />
          )}
        </div>
      </div>
    );
  },
};

export const FilterableLegend: Story = {
  name: 'Legend filtering',
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    );

    return (
      <div className="mx-auto flex h-80 w-full max-w-3xl flex-col gap-space-2">
        <ChartLegend
          aria-label="Requests by environment legend"
          items={getLegendItems(args.series, selectedIds)}
          onItemClick={(item) =>
            setSelectedIds((current) => toggleId(current, item.id))
          }
        />
        <div className="min-h-0 flex-1">
          <BarChart {...args} showLegend={false} selectedIds={selectedIds} />
        </div>
      </div>
    );
  },
};

export const StackedWithConsumerTooltip: Story = {
  name: 'Stacked with consumer tooltip',
  render: () => {
    const [hovered, setHovered] = useState<BarChartInteractionDatum | null>(
      null
    );
    const [activeBarId, setActiveBarId] = useState<string | null>(null);
    const [pinnedCategory, setPinnedCategory] =
      useState<BarChartCategory | null>(null);
    const visibleTooltip =
      pinnedCategory == null || hovered?.category === pinnedCategory
        ? hovered
        : null;

    return (
      <div className="mx-auto w-full max-w-3xl">
        <ChartCard
          title="Requests by environment"
          description="Click a bucket to pin or unpin its tooltip"
          className="h-96"
        >
          <div className="flex size-full min-h-0 min-w-0 flex-col gap-space-2">
            <ChartLegend
              aria-label="Stacked requests by environment legend"
              items={getLegendItems(requestSeries)}
            />
            <div className="relative min-h-0 min-w-0 flex-1">
              <BarChart
                aria-label="Stacked requests by environment"
                series={requestSeries}
                mode="stacked"
                showLegend={false}
                activeCategory={visibleTooltip?.category}
                onDatumPointerMove={(datum) => {
                  if (pinnedCategory == null) setHovered(datum);
                }}
                onDatumPointerOut={() => {
                  if (pinnedCategory == null) setHovered(null);
                  setActiveBarId(null);
                }}
                onBarPointerMove={(bar) => setActiveBarId(bar.id)}
                onBarPointerOut={() => setActiveBarId(null)}
                onDatumActivate={(datum) => {
                  setHovered(datum);
                  setPinnedCategory((current) =>
                    current === datum.category ? null : datum.category
                  );
                }}
                getCategoryAriaLabel={(datum) =>
                  `Show request details for ${datum.category}`
                }
              />
              {visibleTooltip != null && (
                <BarChartStoryTooltip
                  datum={visibleTooltip}
                  activeBarId={activeBarId}
                />
              )}
            </div>
          </div>
        </ChartCard>
      </div>
    );
  },
};

export const SignedValuesAndThreshold: Story = {
  name: 'Signed values with a threshold',
  render: () => (
    <div className="mx-auto h-80 w-full max-w-3xl">
      <BarChart
        aria-label="Daily net spend"
        series={[
          {
            id: 'spend',
            label: 'Net spend',
            valueAxisId: 'currency',
            color: CHART_SINGLE_FILL_COLOR,
            data: [120, 80, -35, 150, 0].map((value, index) => ({
              category: categories[index],
              value,
            })),
          },
        ]}
        valueAxes={[
          {
            id: 'currency',
            label: 'Net spend',
            domain: [-50, 200],
            formatValue: currencyFormatter.format,
          },
        ]}
        valueBands={[
          {
            id: 'high-spend',
            valueAxisId: 'currency',
            from: 150,
            to: 200,
            color: CHART_STATUS_FILL_COLORS.warning,
            opacity: 0.18,
            ariaLabel: 'High spend threshold',
          },
        ]}
      />
    </div>
  ),
};

export const MultipleAxes: Story = {
  name: 'Multiple value axes',
  render: () => {
    const series: readonly BarChartSeries[] = [
      {
        id: 'spend',
        label: 'Spend',
        valueAxisId: 'currency',
        color: CHART_CATEGORICAL_FILL_COLORS[0],
        data: [120, 80, 105, 150, 110].map((value, index) => ({
          category: categories[index],
          value,
        })),
      },
      {
        id: 'requests',
        label: 'Requests',
        valueAxisId: 'count',
        color: CHART_CATEGORICAL_FILL_COLORS[1],
        data: [820, 640, 510, 1_040, 720].map((value, index) => ({
          category: categories[index],
          value,
        })),
      },
    ];

    return (
      <div className="mx-auto flex h-80 w-full max-w-3xl flex-col gap-space-2">
        <ChartLegend
          aria-label="Daily spend and request count legend"
          items={getLegendItems(series)}
        />
        <div className="min-h-0 flex-1">
          <BarChart
            aria-label="Daily spend and request count"
            series={series}
            showLegend={false}
            valueAxes={[
              {
                id: 'currency',
                label: 'Spend',
                domain: [0, 200],
                formatValue: currencyFormatter.format,
              },
              {
                id: 'count',
                label: 'Requests',
                domain: [0, 1_200],
                formatValue: numberFormatter.format,
              },
            ]}
          />
        </div>
      </div>
    );
  },
};

export const CustomCategoryAxisAndSelection: Story = {
  name: 'Custom category axis and controlled selection',
  render: () => {
    const [dragStart, setDragStart] = useState<BarChartCategory | null>(null);
    const [selectionRange, setSelectionRange] =
      useState<BarChartSelectionRange>({ from: 'B', to: 'D' });

    return (
      <div className="mx-auto h-80 w-full max-w-3xl">
        <BarChart
          aria-label="Experiment comparison scores"
          series={[
            {
              id: 'score',
              label: 'Score',
              color: CHART_SINGLE_FILL_COLOR,
              data: [0.72, 0.81, 0.66, 0.92, 0.78].map((value, index) => ({
                category: String.fromCharCode(65 + index),
                value,
              })),
            },
          ]}
          valueAxes={[
            {
              id: 'score',
              domain: [0, 1],
              formatValue: (value) => `${Math.round(value * 100)}%`,
            },
          ]}
          selectionRange={selectionRange}
          onDatumPointerDown={(datum, event) => {
            if (event.button !== 0) return;
            setDragStart(datum.category);
            setSelectionRange({ from: datum.category, to: datum.category });
          }}
          onDatumPointerMove={(datum, event) => {
            if (dragStart == null || event.buttons === 0) return;
            setSelectionRange({ from: dragStart, to: datum.category });
          }}
          onDatumPointerUp={() => setDragStart(null)}
          onDatumPointerOut={() => setDragStart(null)}
          categoryAxis={{ thickness: 40 }}
          slots={{
            categoryAxis: ({
              categories: axisCategories,
              innerHeight,
              getCategoryPosition,
            }) => (
              <g transform={`translate(0, ${innerHeight + 20})`}>
                {axisCategories.map((category, index) => (
                  <g
                    key={category}
                    transform={`translate(${getCategoryPosition(category)}, 0)`}
                  >
                    <circle
                      r="10"
                      fill={CHART_CATEGORICAL_FILL_COLORS[index]}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="var(--chart-on-color)"
                      fontSize="10"
                    >
                      {category}
                    </text>
                  </g>
                ))}
              </g>
            ),
          }}
        />
      </div>
    );
  },
};
