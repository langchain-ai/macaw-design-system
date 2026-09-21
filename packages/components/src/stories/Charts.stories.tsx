import type { ReactNode } from 'react';

import { linkTo } from '@storybook/addon-links';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BarChart, type BarChartSeries } from '../components/BarChart';
import { Button } from '../components/Button';
import { ChartCard } from '../components/ChartCard';
import { ChartLegend } from '../components/ChartLegend';
import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../components/ChartTooltip';
import { DonutChart, type DonutChartSegment } from '../components/DonutChart';
import { LineChart, type LineChartSeries } from '../components/LineChart';
import { MetricChart } from '../components/MetricChart';
import { SparkLineChart } from '../components/SparkLineChart';
import { Text } from '../components/Text';
import { TopList, type TopListItem } from '../components/TopList';
import { ArrowRightRegularIcon } from '../icons/WeightedPhosphorIcons';
import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_CATEGORICAL_LINE_COLORS,
  CHART_COMPARISON_COLORS,
  CHART_OTHER_COLOR,
  CHART_STATUS_COLORS,
  CHART_STATUS_FILL_COLORS,
} from '../utils/chartColors';

const meta: Meta = {
  title: 'Components/Charts',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toBarSeries = (
  id: string,
  label: string,
  values: readonly number[]
): BarChartSeries => ({
  id,
  label,
  data: values.map((value, index) => ({ category: categories[index], value })),
});

const barSeries: readonly BarChartSeries[] = [
  toBarSeries('production', 'Production', [42, 54, 48, 68, 76, 72, 88]),
  toBarSeries('staging', 'Staging', [24, 32, 28, 38, 34, 44, 46]),
];

const lineSeries: readonly LineChartSeries[] = [
  {
    id: 'production',
    label: 'Production',
    points: [42, 54, 48, 68, 76, 72, 88].map((y, x) => ({ x, y })),
  },
  {
    id: 'staging',
    label: 'Staging',
    points: [24, 32, 28, 38, 34, 44, 46].map((y, x) => ({ x, y })),
  },
];

const donutSegments: readonly DonutChartSegment[] = [
  {
    id: 'production',
    label: 'Production',
    value: 58,
    color: CHART_CATEGORICAL_FILL_COLORS[0],
  },
  {
    id: 'staging',
    label: 'Staging',
    value: 27,
    color: CHART_CATEGORICAL_FILL_COLORS[1],
  },
  {
    id: 'development',
    label: 'Development',
    value: 15,
    color: CHART_CATEGORICAL_FILL_COLORS[2],
  },
];

const topListItems: readonly TopListItem[] = [
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet',
    value: 2_320,
    color: CHART_CATEGORICAL_FILL_COLORS[3],
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    value: 1_910,
    color: CHART_CATEGORICAL_FILL_COLORS[4],
  },
  {
    id: 'gemini-pro',
    label: 'Gemini Pro',
    value: 1_520,
    color: CHART_CATEGORICAL_FILL_COLORS[5],
  },
  {
    id: 'other',
    label: 'Other',
    value: 820,
    color: CHART_OTHER_COLOR,
  },
];

const sparkLineData = [8, 13, 10, 19, 16, 24].map((y, x) => ({ x, y }));

const ChartOverviewCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <ChartCard
    title={title}
    description={description}
    className="min-h-[22rem]"
    contentClassName="min-h-0"
    headerActions={
      <Button
        size="xs"
        color="secondary"
        variant="outlined"
        rightDecorator={ArrowRightRegularIcon}
        onClick={linkTo(`Components/Charts/${title}`)}
      >
        Component page
      </Button>
    }
  >
    {children}
  </ChartCard>
);

const Swatches = ({ colors }: { colors: readonly string[] }) => (
  <div className="grid grid-cols-2 gap-space-3 sm:grid-cols-4 lg:grid-cols-5">
    {colors.map((color, index) => (
      <div key={color} className="flex items-center gap-space-2">
        <div
          className="size-8 shrink-0 rounded-sm border border-subtle"
          style={{ backgroundColor: color }}
        />
        <Text variant="xs" color="secondary">
          {index + 1}
        </Text>
      </div>
    ))}
  </div>
);

export const Overview: Story = {
  render: () => (
    <div className="flex max-w-7xl flex-col gap-space-6">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <Text variant="h2" weight="semibold">
          Charts overview
        </Text>
        <Text variant="body" color="secondary">
          Shared chart renderers and the supporting components available from
          the design system.
        </Text>
      </div>
      <div className="grid grid-cols-1 gap-space-4 xl:grid-cols-2">
        <ChartOverviewCard
          title="BarChart"
          description="Grouped or stacked categorical values."
        >
          <div className="h-60 min-h-0 w-full">
            <BarChart
              aria-label="Requests by environment"
              series={barSeries}
              showLegend={false}
            />
          </div>
        </ChartOverviewCard>
        <ChartOverviewCard
          title="LineChart"
          description="One or more numeric series over an x-axis."
        >
          <div className="h-60 min-h-0 w-full">
            <LineChart
              aria-label="Requests by environment"
              series={lineSeries}
              showLegend={false}
              xScale="band"
              formatXValue={(value) => categories[value] ?? ''}
            />
          </div>
        </ChartOverviewCard>
        <ChartOverviewCard
          title="DonutChart"
          description="Part-to-whole data with an optional legend."
        >
          <div className="h-60 min-h-0 w-full">
            <DonutChart
              aria-label="Requests by environment"
              segments={donutSegments}
              centerNumber="100"
              centerDescriptor="percent"
            />
          </div>
        </ChartOverviewCard>
        <ChartOverviewCard
          title="TopList"
          description="Ranked categorical values with end labels."
        >
          <div className="h-60 min-h-0 w-full">
            <TopList
              aria-label="Top models by runs"
              items={topListItems}
              valueAxisLabel="Runs"
            />
          </div>
        </ChartOverviewCard>
        <ChartOverviewCard
          title="SparkLineChart"
          description="Compact, non-interactive trend context."
        >
          <SparkLineChart
            data={sparkLineData}
            aria-label="Weekly request trend"
            className="h-40 w-full"
          />
        </ChartOverviewCard>
        <ChartOverviewCard
          title="MetricChart"
          description="A metric value with optional secondary context."
        >
          <MetricChart
            value="1.28M"
            size="xl"
            layout="centered"
            secondaryContent={
              <Text variant="sm" color="secondary">
                traces this week
              </Text>
            }
            className="flex-1"
          />
        </ChartOverviewCard>
        <ChartOverviewCard
          title="ChartCard"
          description="The shared shell for dashboard visualizations."
        >
          <div className="flex flex-1 items-center justify-center rounded-md bg-surface-level-2">
            <Text variant="sm" color="tertiary">
              Feature-owned chart content
            </Text>
          </div>
        </ChartOverviewCard>
        <ChartOverviewCard
          title="ChartLegend"
          description="Inline or list labels with optional filtering."
        >
          <ChartLegend
            items={donutSegments.map((segment) => ({
              id: segment.id,
              label: segment.label,
              markerColor: segment.color,
              value: `${segment.value}%`,
            }))}
          />
        </ChartOverviewCard>
        <ChartOverviewCard
          title="ChartTooltip"
          description="Consistent headers, rows, markers, and totals."
        >
          <ChartTooltip>
            <ChartTooltipHeader title="Aug 25, 2026" />
            <ChartTooltipBody>
              <ChartTooltipRow
                label="Production"
                markerColor={CHART_CATEGORICAL_LINE_COLORS[0]}
                value="1,284"
              />
              <ChartTooltipRow
                label="Staging"
                markerColor={CHART_CATEGORICAL_LINE_COLORS[1]}
                value="442"
              />
              <ChartTooltipRow label="Total" value="1,726" variant="total" />
            </ChartTooltipBody>
          </ChartTooltip>
        </ChartOverviewCard>
      </div>
    </div>
  ),
};

export const LegendHoverAndFocus: Story = {
  name: 'Legend hover and focus',
  parameters: {
    docs: {
      description: {
        story:
          'Hover a legend item or focus it with the keyboard to emphasize its category and dim the other chart marks. Move the pointer away or move focus out of the item to restore every category.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-7xl flex-col gap-space-6">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <Text variant="h2" weight="semibold">
          Legend hover and focus
        </Text>
        <Text variant="body" color="secondary">
          Hover a legend item or use Tab to focus it. The matching category
          stays at full color while the other categories dim.
        </Text>
      </div>
      <div className="grid grid-cols-1 gap-space-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard
          title="Line chart"
          description="Requests by environment"
          className="h-96"
          contentClassName="min-h-0"
        >
          <LineChart
            aria-label="Line chart requests by environment"
            series={lineSeries}
            xScale="band"
            formatXValue={(value) => categories[value] ?? ''}
            showPoints
            shouldAnimate={false}
          />
        </ChartCard>
        <ChartCard
          title="Bar chart"
          description="Requests by environment"
          className="h-96"
          contentClassName="min-h-0"
        >
          <BarChart
            aria-label="Bar chart requests by environment"
            series={barSeries}
            shouldAnimate={false}
          />
        </ChartCard>
        <ChartCard
          title="Donut chart"
          description="Requests by environment"
          className="h-96"
          contentClassName="min-h-0"
        >
          <DonutChart
            aria-label="Donut chart requests by environment"
            segments={donutSegments}
            centerNumber="100"
            centerDescriptor="requests"
            shouldAnimate={false}
          />
        </ChartCard>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-space-6">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <Text variant="h2" weight="semibold">
          Chart colors
        </Text>
        <Text variant="body" color="secondary">
          These semantic palettes update with the active Storybook theme.
        </Text>
      </div>
      <section className="flex flex-col gap-space-3">
        <Text variant="h3" weight="semibold">
          Line categorical
        </Text>
        <Text variant="sm" color="secondary">
          Use for line strokes. Neighboring entries deliberately alternate
          distant hues.
        </Text>
        <Swatches colors={CHART_CATEGORICAL_LINE_COLORS} />
      </section>

      <section className="flex flex-col gap-space-3">
        <Text variant="h3" weight="semibold">
          Filled-mark categorical
        </Text>
        <Text variant="sm" color="secondary">
          Use for bars, areas, donuts, waterfalls, and other filled marks.
        </Text>
        <Swatches colors={CHART_CATEGORICAL_FILL_COLORS} />
      </section>

      <section className="flex flex-col gap-space-3">
        <Text variant="h3" weight="semibold">
          Dataset and Experiment comparison palette
        </Text>
        <Text variant="sm" color="secondary">
          Uses paired shades of blue, orange, magenta, acid, and purple.
        </Text>
        <Swatches colors={CHART_COMPARISON_COLORS} />
      </section>

      <section className="flex flex-col gap-space-3">
        <Text variant="h3" weight="semibold">
          Semantic lines, markers, and Other
        </Text>
        <Text variant="sm" color="secondary">
          Reserve semantic colors for positive, warning, and negative meaning.
          Gray is reserved for aggregated “Other” data.
        </Text>
        <Swatches
          colors={[
            CHART_STATUS_COLORS.positive,
            CHART_STATUS_COLORS.warning,
            CHART_STATUS_COLORS.negative,
            CHART_STATUS_COLORS.negativeSubtle,
            CHART_OTHER_COLOR,
          ]}
        />
      </section>
      <section className="flex flex-col gap-space-3">
        <Text variant="h3" weight="semibold">
          Semantic filled marks
        </Text>
        <Text variant="sm" color="secondary">
          Uses lower-luminance status colors for large bars, areas, and donuts.
        </Text>
        <Swatches colors={Object.values(CHART_STATUS_FILL_COLORS)} />
      </section>
    </div>
  ),
};
