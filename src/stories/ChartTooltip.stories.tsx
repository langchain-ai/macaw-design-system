import type { PointerEvent, ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';

import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../components/ChartTooltip';
import { Text, textVariantClasses } from '../components/Text';
import zIndices from '../utils/zIndices';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 240;
const PLOT_BOTTOM = 208;

type ComparisonSeries = 'successful' | 'errors';

interface StoryBar {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  series?: ComparisonSeries;
}

interface StoryTooltipData {
  hoveredBarKey?: string;
  hoveredSeries?: ComparisonSeries;
}

const comparisonBars: StoryBar[] = [
  {
    key: 'a-successful',
    x: 154,
    y: 76,
    width: 28,
    height: 132,
    series: 'successful',
  },
  { key: 'a-errors', x: 186, y: 148, width: 28, height: 60, series: 'errors' },
  {
    key: 'b-successful',
    x: 290,
    y: 52,
    width: 28,
    height: 156,
    series: 'successful',
  },
  { key: 'b-errors', x: 322, y: 132, width: 28, height: 76, series: 'errors' },
  {
    key: 'c-successful',
    x: 426,
    y: 92,
    width: 28,
    height: 116,
    series: 'successful',
  },
  { key: 'c-errors', x: 458, y: 120, width: 28, height: 88, series: 'errors' },
];

const dailySpendBars: StoryBar[] = [
  { key: 'jul-8', x: 72, y: 144, width: 32, height: 64 },
  { key: 'jul-9', x: 152, y: 104, width: 32, height: 104 },
  { key: 'jul-10', x: 232, y: 128, width: 32, height: 80 },
  { key: 'jul-11', x: 312, y: 64, width: 32, height: 144 },
  { key: 'jul-12', x: 392, y: 88, width: 32, height: 120 },
  { key: 'jul-13', x: 472, y: 36, width: 32, height: 172 },
  { key: 'jul-14', x: 552, y: 76, width: 32, height: 132 },
];

const comparisonLabels = [
  { x: 184, label: 'Baseline' },
  { x: 320, label: 'Exp A' },
  { x: 456, label: 'Exp B' },
];

const dailySpendLabels = [
  { x: 88, label: 'Jul 8' },
  { x: 248, label: 'Jul 10' },
  { x: 408, label: 'Jul 12' },
  { x: 568, label: 'Jul 14' },
];

function TooltipStoryChart({
  children,
  variant = 'comparison',
}: {
  children: ReactNode | ((tooltipData: StoryTooltipData) => ReactNode);
  variant?: 'comparison' | 'daily-spend' | 'empty';
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip<StoryTooltipData>();

  const bars =
    variant === 'comparison'
      ? comparisonBars
      : variant === 'daily-spend'
        ? dailySpendBars
        : [];
  const labels = variant === 'comparison' ? comparisonLabels : dailySpendLabels;

  const handlePointerMove = (event: PointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const chartX = (x / bounds.width) * CHART_WIDTH;
    const hoveredBar = bars.reduce<StoryBar | undefined>((nearest, bar) => {
      if (!nearest) return bar;
      const nearestDistance = Math.abs(nearest.x + nearest.width / 2 - chartX);
      const barDistance = Math.abs(bar.x + bar.width / 2 - chartX);
      return barDistance < nearestDistance ? bar : nearest;
    }, undefined);

    showTooltip({
      tooltipData: {
        hoveredBarKey: hoveredBar?.key,
        hoveredSeries: hoveredBar?.series,
      },
      tooltipLeft: x + 12,
      tooltipTop: y,
    });
  };

  return (
    <div className="mx-auto w-[32rem] max-w-full rounded-md bg-surface-level-2 px-space-4 py-space-2">
      <Text variant="sm" weight="medium" color="secondary">
        {variant === 'comparison' ? 'Experiment comparison' : 'Daily spend'}
      </Text>
      <div className="relative aspect-[8/3]">
        <svg
          aria-hidden
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="size-full"
        >
          {[48, 88, 128, 168, PLOT_BOTTOM].map((gridY) => (
            <line
              key={gridY}
              x1={80}
              x2={560}
              y1={gridY}
              y2={gridY}
              stroke="var(--border-subtle)"
            />
          ))}

          {bars.map((bar) => (
            <Bar
              key={bar.key}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={
                variant === 'comparison'
                  ? bar.series === 'successful'
                    ? tooltipData?.hoveredBarKey === bar.key
                      ? 'var(--viz-brand-600)'
                      : 'var(--viz-brand-400)'
                    : tooltipData?.hoveredBarKey === bar.key
                      ? 'var(--viz-orange-200)'
                      : 'var(--viz-orange-100)'
                  : 'var(--viz-brand-300)'
              }
              rx={variant === 'daily-spend' ? 3 : 0}
              stroke={
                variant === 'daily-spend' &&
                tooltipData?.hoveredBarKey === bar.key
                  ? 'var(--border-focus)'
                  : undefined
              }
              strokeWidth={2}
            />
          ))}

          {labels.map(({ x: labelX, label }) => (
            <text
              key={label}
              x={labelX}
              y={230}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              className={textVariantClasses.sm}
            >
              {label}
            </text>
          ))}

          <rect
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            fill="transparent"
            className="cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerOut={hideTooltip}
          />
        </svg>
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              position: 'absolute',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: 0,
              pointerEvents: 'none',
              zIndex: zIndices.tooltip,
            }}
          >
            {typeof children === 'function' ? children(tooltipData) : children}
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Charts/ChartTooltip',
  component: ChartTooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ChartTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleValue: Story = {
  render: () => (
    <ChartTooltip>
      <ChartTooltipHeader title="Jul 13, 2026" />
      <ChartTooltipRow label="Total spend" value="$128.42" />
    </ChartTooltip>
  ),
};

export const SecondaryValues: Story = {
  render: () => (
    <TooltipStoryChart>
      <ChartTooltip className="max-w-[22.5rem]">
        <ChartTooltipHeader title="Experiment results" />
        <ChartTooltipBody>
          <ChartTooltipRow
            markerColor="var(--viz-brand-400)"
            label="Correctness"
            value="84%"
            secondaryValue="0.92"
          />
          <ChartTooltipRow
            markerColor="var(--viz-orange-100)"
            label="Helpfulness"
            value="77%"
            secondaryValue="0.81"
          />
        </ChartTooltipBody>
      </ChartTooltip>
    </TooltipStoryChart>
  ),
};

export const LongLabels: Story = {
  render: () => (
    <TooltipStoryChart>
      <ChartTooltip className="w-48">
        <ChartTooltipHeader title="Fleet tool usage" value="1,284" />
        <ChartTooltipBody>
          <ChartTooltipRow
            markerColor="var(--viz-brand-400)"
            label="mcp__fixtures__get_coordinates"
            value="842"
          />
          <ChartTooltipRow
            markerColor="var(--viz-orange-100)"
            label="mcp__weather__get_weather"
            value="442"
          />
        </ChartTooltipBody>
      </ChartTooltip>
    </TooltipStoryChart>
  ),
};

export const HighlightedRow: Story = {
  render: () => (
    <TooltipStoryChart>
      {({ hoveredSeries }) => (
        <ChartTooltip>
          <ChartTooltipHeader
            title="Jul 7–13, 2026"
            value={
              <Text as="span" variant="xs" weight="normal" color="tertiary">
                AVG
              </Text>
            }
          />
          <ChartTooltipBody>
            <ChartTooltipRow
              markerColor="var(--viz-brand-400)"
              label="Successful runs"
              value="1,102"
              highlighted={hoveredSeries === 'successful'}
            />
            <ChartTooltipRow
              markerColor="var(--viz-orange-100)"
              label="Runs with errors"
              value="182"
              highlighted={hoveredSeries === 'errors'}
            />
            <ChartTooltipRow label="Total" value="1,284" variant="total" />
          </ChartTooltipBody>
        </ChartTooltip>
      )}
    </TooltipStoryChart>
  ),
};

export const TotalRow: Story = {
  render: () => (
    <TooltipStoryChart variant="daily-spend">
      <ChartTooltip className="w-60">
        <ChartTooltipHeader title="Jul 13, 2026" />
        <ChartTooltipBody>
          <ChartTooltipRow label="Model usage" value="$84.17" />
          <ChartTooltipRow label="Evaluators" value="$28.25" />
          <ChartTooltipRow label="Other" value="$16.00" />
          <ChartTooltipRow label="Total" value="$128.42" variant="total" />
        </ChartTooltipBody>
      </ChartTooltip>
    </TooltipStoryChart>
  ),
};

export const Empty: Story = {
  render: () => (
    <TooltipStoryChart variant="empty">
      <ChartTooltip>
        <ChartTooltipRow label="No data" className="text-quaternary" />
      </ChartTooltip>
    </TooltipStoryChart>
  ),
};
