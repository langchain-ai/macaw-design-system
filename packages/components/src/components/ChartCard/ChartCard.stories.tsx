import { useState, type ComponentProps } from 'react';

import { fn } from 'storybook/test';

import { useResizeObserver } from '@mantine/hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar } from '@visx/shape';

import { ChartCard, type ChartCardVariant } from '.';
import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_SINGLE_FILL_COLOR,
} from '../../utils/chartColors';
import { cn } from '../../utils/cn';
import { ChartLegend, type ChartLegendItem } from '../ChartLegend';
import { DropdownMenuItem } from '../DropdownMenu';
import { GroupedTabs } from '../GroupedTabs/GroupedTabs';
import { Text, textVariantClasses } from '../Text';

const CHART_WIDTH = 520;
const CHART_HEIGHT = 220;
const PLOT_LEFT = 48;
const PLOT_RIGHT_PADDING = 12;
const PLOT_TOP = 20;
const PLOT_BOTTOM_PADDING = 20;
const MAX_VALUE = 40;
const compactLabels = ['Thu 9', 'Fri 10', 'Sat 11', 'Sun 12'];
const fullWidthLabels = [
  ...compactLabels,
  'Mon 13',
  'Tue 14',
  'Wed 15',
  'Thu 16',
];
const compactStackedValues = [
  [19, 7, 4, 3, 4],
  [14, 6, 5, 3, 4],
  [18, 6, 5, 3, 4],
  [10, 7, 5, 3, 2],
];
const fullWidthStackedValues = [
  ...compactStackedValues,
  [17, 6, 4, 3, 3],
  [12, 5, 4, 2, 3],
  [18, 7, 5, 3, 4],
  [15, 6, 4, 3, 3],
];
const compactSingleValues = [36, 31, 35, 27, 33, 28, 37];
const fullWidthSingleValues = [...compactSingleValues, 32, 29, 34, 30, 36];
const chartLegendItems: readonly ChartLegendItem[] = [
  'gpt-5.6-sol',
  'gpt-5.6-luna',
  'claude-opus-5',
  'claude-opus-4.8',
  'gemini-3.1-flash-lite',
].map((label, index) => ({
  id: label,
  label,
  markerColor: CHART_CATEGORICAL_FILL_COLORS[index],
}));

const ChartCardLegend = ({
  selectedIds,
  onToggle,
}: {
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
}) => {
  const items = chartLegendItems.map((item) => ({
    ...item,
    selected: selectedIds.has(item.id),
  }));

  return (
    <ChartLegend items={items} onItemClick={(item) => onToggle(item.id)} />
  );
};

const ChartMenuItems = () => {
  return (
    <>
      <DropdownMenuItem onSelect={fn()}>
        <Text as="span" variant="sm">
          Edit chart
        </Text>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={fn()}>
        <Text as="span" variant="sm">
          Duplicate chart
        </Text>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={fn()}>
        <Text as="span" variant="sm" color="error">
          Delete chart
        </Text>
      </DropdownMenuItem>
    </>
  );
};

const ChartGrid = ({ width, height }: { width: number; height: number }) => {
  const tickValues = [40, 30, 20, 10, 0];
  const plotRight = width - PLOT_RIGHT_PADDING;
  const plotBottom = height - PLOT_BOTTOM_PADDING;

  return (
    <>
      {tickValues.map((value) => {
        const y = plotBottom - (value / MAX_VALUE) * (plotBottom - PLOT_TOP);
        return (
          <g key={value}>
            <line
              x1={PLOT_LEFT}
              x2={plotRight}
              y1={y}
              y2={y}
              stroke="var(--border-subtle)"
            />
            <line
              x1={PLOT_LEFT - 6}
              x2={PLOT_LEFT}
              y1={y}
              y2={y}
              stroke="var(--text-tertiary)"
            />
            <text
              x={PLOT_LEFT - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--text-tertiary)"
              className={textVariantClasses.xs}
            >
              {value === 0 ? '0' : `${value}k`}
            </text>
          </g>
        );
      })}
      <line
        x1={PLOT_LEFT}
        x2={plotRight}
        y1={plotBottom}
        y2={plotBottom}
        stroke="var(--border-strong)"
      />
      <text
        x={12}
        y={(PLOT_TOP + plotBottom) / 2}
        textAnchor="middle"
        fill="var(--text-secondary)"
        className={textVariantClasses.xs}
        transform={`rotate(-90 12 ${(PLOT_TOP + plotBottom) / 2})`}
      >
        Runs
      </text>
    </>
  );
};

const StackedBarChart = ({
  isFullWidth = false,
  selectedIds,
}: {
  isFullWidth?: boolean;
  selectedIds: ReadonlySet<string>;
}) => {
  const [containerRef, dimensions] = useResizeObserver();
  const width = dimensions.width || CHART_WIDTH;
  const height = dimensions.height || CHART_HEIGHT;
  const plotRight = width - PLOT_RIGHT_PADDING;
  const plotBottom = height - PLOT_BOTTOM_PADDING;
  const plotHeight = plotBottom - PLOT_TOP;
  const labels = isFullWidth ? fullWidthLabels : compactLabels;
  const values = isFullWidth ? fullWidthStackedValues : compactStackedValues;
  const slotWidth = (plotRight - PLOT_LEFT) / values.length;
  const barWidth = Math.min(isFullWidth ? 20 : 24, slotWidth * 0.45);

  return (
    <div ref={containerRef} className="min-h-0 w-full flex-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="size-full overflow-visible"
        role="img"
        aria-label={`Trace count by model across ${values.length} days`}
      >
        <ChartGrid width={width} height={height} />
        {values.map((stack, stackIndex) => {
          const x =
            PLOT_LEFT + stackIndex * slotWidth + (slotWidth - barWidth) / 2;
          let y = plotBottom;
          return (
            <g key={`${labels[stackIndex]}-${stackIndex}`}>
              {stack.map((value, seriesIndex) => {
                const item = chartLegendItems[seriesIndex];
                if (
                  selectedIds.size > 0 &&
                  (item == null || !selectedIds.has(item.id))
                ) {
                  return null;
                }
                const barHeight = (value / MAX_VALUE) * plotHeight;
                y -= barHeight;
                return (
                  <Bar
                    key={seriesIndex}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={CHART_CATEGORICAL_FILL_COLORS[seriesIndex]}
                  />
                );
              })}
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                className={textVariantClasses.sm}
              >
                {labels[stackIndex]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const InteractiveStackedChart = ({
  isFullWidth = false,
}: {
  isFullWidth?: boolean;
}) => {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set()
  );

  return (
    <>
      <StackedBarChart isFullWidth={isFullWidth} selectedIds={selectedIds} />
      <ChartCardLegend
        selectedIds={selectedIds}
        onToggle={(id) => {
          setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          });
        }}
      />
    </>
  );
};

const SingleBarChart = ({ isFullWidth = false }: { isFullWidth?: boolean }) => {
  const [containerRef, dimensions] = useResizeObserver();
  const width = dimensions.width || CHART_WIDTH;
  const height = dimensions.height || CHART_HEIGHT;
  const plotRight = width - PLOT_RIGHT_PADDING;
  const plotBottom = height - PLOT_BOTTOM_PADDING;
  const plotHeight = plotBottom - PLOT_TOP;
  const values = isFullWidth ? fullWidthSingleValues : compactSingleValues;
  const slotWidth = (plotRight - PLOT_LEFT) / values.length;
  const barWidth = Math.min(isFullWidth ? 18 : 22, slotWidth * 0.45);

  return (
    <div ref={containerRef} className="min-h-0 w-full flex-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="size-full overflow-visible"
        role="img"
        aria-label={`Trace count across ${values.length} days`}
      >
        <ChartGrid width={width} height={height} />
        {values.map((value, index) => {
          const barHeight = (value / MAX_VALUE) * plotHeight;
          const x = PLOT_LEFT + index * slotWidth + (slotWidth - barWidth) / 2;
          return (
            <g key={index}>
              <Bar
                x={x}
                y={plotBottom - barHeight}
                width={barWidth}
                height={barHeight}
                fill={CHART_SINGLE_FILL_COLOR}
              />
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                className={textVariantClasses.xs}
              >
                {`D${index + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const onCombinedDragHandle = fn().mockName('combined row drag handle');

const meta = {
  title: 'Components/Charts/ChartCard',
  component: ChartCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs', 'chart', 'shell', 'loading', 'empty', 'actions'],
} satisfies Meta<typeof ChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: '', children: null },
  render: () => {
    const [variant, setVariant] = useState<ChartCardVariant>('default');
    const [groupBy, setGroupBy] = useState<'model' | 'provider'>('model');
    const [lastAction, setLastAction] = useState('No action yet.');
    const isFullWidth = variant === 'full-width';

    return (
      <div
        className={cn(
          'flex flex-col gap-space-2',
          isFullWidth ? 'w-full' : 'mx-auto w-[38rem] max-w-full'
        )}
      >
        <ChartCard
          title="Trace count"
          headerActions={
            <GroupedTabs
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: 'model', display: 'Model' },
                { value: 'provider', display: 'Provider' },
              ]}
              size="sm"
            />
          }
          variant={variant}
          isMovable
          dragHandleProps={{
            onPointerDown: () => setLastAction('Drag handle fired!'),
          }}
          expandButtonProps={{
            onClick: () => {
              const nextVariant = isFullWidth ? 'default' : 'full-width';
              setVariant(nextVariant);
              setLastAction(
                nextVariant === 'full-width'
                  ? 'Expanded to full width.'
                  : 'Restored default width.'
              );
            },
          }}
          menuItems={<ChartMenuItems />}
          className="h-80"
        >
          <InteractiveStackedChart isFullWidth={isFullWidth} />
        </ChartCard>
        <Text as="p" variant="xs" color="secondary" aria-live="polite">
          {lastAction}
        </Text>
      </div>
    );
  },
};

export const CombinedRow: Story = {
  args: { title: '', children: null },
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const actionProps = (cardIndex: number) => ({
      variant:
        expandedCard === cardIndex
          ? ('full-width' as const)
          : ('default' as const),
      isMovable: true,
      dragHandleProps: { onPointerDown: onCombinedDragHandle },
      expandButtonProps: {
        onClick: () =>
          setExpandedCard((current) =>
            current === cardIndex ? null : cardIndex
          ),
      },
      menuItems: <ChartMenuItems />,
    });

    return (
      <section
        aria-label="Combined chart cards"
        className="bg-surface-level-1 p-space-3"
      >
        <div className="grid grid-cols-12">
          {(expandedCard == null || expandedCard === 0) && (
            <ChartCard
              title="Trace count"
              {...actionProps(0)}
              className={cn(
                'h-64',
                expandedCard === 0 ? 'col-span-12' : 'col-span-4'
              )}
            >
              <InteractiveStackedChart isFullWidth={expandedCard === 0} />
            </ChartCard>
          )}
          {(expandedCard == null || expandedCard === 1) && (
            <ChartCard
              title="Trace count"
              {...actionProps(1)}
              className={cn(
                'h-64',
                expandedCard === 1
                  ? 'col-span-12 border-l'
                  : 'col-span-5 border-l-0'
              )}
            >
              <SingleBarChart isFullWidth={expandedCard === 1} />
            </ChartCard>
          )}
          {(expandedCard == null || expandedCard === 2) && (
            <ChartCard
              title="Trace count"
              {...actionProps(2)}
              className={cn(
                'h-64',
                expandedCard === 2
                  ? 'col-span-12 border-l'
                  : 'col-span-3 border-l-0'
              )}
              contentClassName="items-center justify-center"
            >
              <div className="flex flex-col items-center gap-space-1">
                <Text variant="h2" weight="semibold">
                  73
                </Text>
                <Text variant="xs" color="error">
                  ↓ 17.5%
                </Text>
              </div>
            </ChartCard>
          )}
        </div>
      </section>
    );
  },
};

export const FullWidth: Story = {
  args: { title: '', children: null },
  render: () => {
    const [variant, setVariant] = useState<ChartCardVariant>('full-width');
    const [groupBy, setGroupBy] = useState<'model' | 'provider'>('model');
    const [lastAction, setLastAction] = useState('Full-width variant shown.');
    const isFullWidth = variant === 'full-width';

    return (
      <div
        className={cn(
          'flex flex-col gap-space-2',
          isFullWidth ? 'w-full' : 'mx-auto w-[38rem] max-w-full'
        )}
      >
        <ChartCard
          title="Trace count"
          headerActions={
            <GroupedTabs
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: 'model', display: 'Model' },
                { value: 'provider', display: 'Provider' },
              ]}
              size="sm"
            />
          }
          variant={variant}
          isMovable
          dragHandleProps={{
            onPointerDown: () => setLastAction('Drag handle fired!'),
          }}
          expandButtonProps={{
            onClick: () => {
              const nextVariant = isFullWidth ? 'default' : 'full-width';
              setVariant(nextVariant);
              setLastAction(
                nextVariant === 'full-width'
                  ? 'Expanded to full width.'
                  : 'Restored default width.'
              );
            },
          }}
          menuItems={<ChartMenuItems />}
          className="h-80"
        >
          <InteractiveStackedChart isFullWidth={isFullWidth} />
        </ChartCard>
        <Text as="p" variant="xs" color="secondary" aria-live="polite">
          {lastAction}
        </Text>
      </div>
    );
  },
};

export const LoadingAndErrorStates: Story = {
  name: 'Loading and error states',
  args: { title: '', children: null },
  render: () => {
    const actionProps = {
      isMovable: true,
      dragHandleProps: { onPointerDown: fn() },
      expandButtonProps: { onClick: fn() },
      menuItems: <ChartMenuItems />,
    } satisfies Pick<
      ComponentProps<typeof ChartCard>,
      'isMovable' | 'dragHandleProps' | 'expandButtonProps' | 'menuItems'
    >;

    return (
      <div className="grid grid-cols-1 gap-space-4 lg:grid-cols-2">
        <ChartCard title="Trace count" state="loading" {...actionProps} />
        <ChartCard title="Trace count" state="error" {...actionProps} />
      </div>
    );
  },
};
