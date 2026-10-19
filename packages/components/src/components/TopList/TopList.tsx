import { animated, useReducedMotion, useSpring } from '@react-spring/web';
import { getStringWidth } from '@visx/text';

import { getFillChartColorForKey } from '../../utils/chartColors';
import {
  BarChart,
  type BarChartCategory,
  type BarChartInteractionDatum,
  type BarChartPlotSlotProps,
  type BarChartRenderedBar,
  type BarChartSeries,
} from '../BarChart';
import { Text } from '../Text';
import type { TopListItem, TopListProps } from './TopList.types';
import { limitTopListItems, sortTopListItems } from './TopList.utils';

const TOP_LIST_SERIES_ID = 'top-list-values';
const TOP_LIST_DEFAULT_CATEGORY_LABEL_WIDTH = 112;
const TOP_LIST_VALUE_LABEL_GAP = 8;
const TOP_LIST_VALUE_LABEL_FONT_SIZE = 12;
const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const defaultFormatValue = (value: number) => numberFormatter.format(value);

const TopListValueLabel = ({
  bar,
  label,
  shouldAnimate,
}: {
  bar: BarChartRenderedBar;
  label: string;
  shouldAnimate: boolean;
}) => {
  const isNegative = bar.value < 0;
  const isReducedMotion = (useReducedMotion() ?? false) || !shouldAnimate;
  const targetX = isNegative
    ? bar.x - TOP_LIST_VALUE_LABEL_GAP
    : bar.x + bar.width + TOP_LIST_VALUE_LABEL_GAP;
  const targetY = bar.y + bar.height / 2;
  const { x, y } = useSpring({
    from: {
      x:
        bar.baselinePosition +
        (isNegative ? -TOP_LIST_VALUE_LABEL_GAP : TOP_LIST_VALUE_LABEL_GAP),
      y: targetY,
    },
    to: { x: targetX, y: targetY },
    immediate: isReducedMotion,
  });

  return (
    <animated.text
      x={x}
      y={y}
      dominantBaseline="middle"
      textAnchor={isNegative ? 'end' : 'start'}
      className="fill-current font-mono text-xs text-secondary"
    >
      {label}
    </animated.text>
  );
};

type TopListOverlayProps<Item extends TopListItem> = BarChartPlotSlotProps &
  Pick<
    TopListProps<Item>,
    'onItemActivate' | 'onItemPointerMove' | 'onItemPointerOut'
  > & {
    getItem: (category: BarChartCategory) => Item | undefined;
    categoryLabelWidth: number;
    valueLabelPadding: number;
    hasNegativeValues: boolean;
  };

const TopListOverlay = <Item extends TopListItem>({
  categories,
  bandwidth,
  innerWidth,
  innerHeight,
  getCategoryPosition,
  getItem,
  categoryLabelWidth,
  valueLabelPadding,
  hasNegativeValues,
  onItemPointerMove,
  onItemPointerOut,
  onItemActivate,
}: TopListOverlayProps<Item>) =>
  categories.map((category, index) => {
    const item = getItem(category);
    const position = getCategoryPosition(category);
    if (item == null || position == null) return null;

    const previousPosition =
      index === 0 ? undefined : getCategoryPosition(categories[index - 1]);
    const nextPosition =
      index === categories.length - 1
        ? undefined
        : getCategoryPosition(categories[index + 1]);
    const top =
      previousPosition == null ? 0 : (previousPosition + position) / 2;
    const bottom =
      nextPosition == null ? innerHeight : (position + nextPosition) / 2;
    const leftPadding = hasNegativeValues ? valueLabelPadding : 0;
    const isInteractive = onItemPointerMove != null || onItemActivate != null;

    let cursorClassName: string | undefined;
    if (onItemActivate != null) {
      cursorClassName = 'cursor-pointer';
    } else if (onItemPointerMove != null) {
      cursorClassName = 'cursor-crosshair';
    }

    return (
      <g
        key={`hitbox:${item.id}`}
        className={cursorClassName}
        onPointerMove={
          onItemPointerMove == null
            ? undefined
            : (event) => {
                event.stopPropagation();
                onItemPointerMove(item, event);
              }
        }
        onPointerLeave={onItemPointerOut}
        onPointerUp={
          onItemActivate == null
            ? undefined
            : (event) => {
                if (event.button !== 0) return;
                event.stopPropagation();
                onItemActivate(item, event);
              }
        }
      >
        {isInteractive && (
          <rect
            x={-categoryLabelWidth - leftPadding}
            y={top}
            width={
              categoryLabelWidth + leftPadding + innerWidth + valueLabelPadding
            }
            height={Math.max(0, bottom - top)}
            fill="transparent"
            pointerEvents="all"
            aria-hidden="true"
          />
        )}
        <foreignObject
          x={-categoryLabelWidth - leftPadding}
          y={position - bandwidth / 2}
          width={categoryLabelWidth}
          height={bandwidth}
        >
          <div className="flex size-full min-w-0 items-center justify-end overflow-hidden pr-space-3">
            <Text
              as="span"
              variant="xs"
              color="primary"
              className="block max-w-full truncate"
              title={item.label}
            >
              {item.label}
            </Text>
          </div>
        </foreignObject>
      </g>
    );
  });

/** Use for ranked top-K data; adapters own data shaping, tooltips, and navigation. */
export const TopList = <Item extends TopListItem>({
  items,
  sort = 'descending',
  limit,
  formatValue = defaultFormatValue,
  valueAxisLabel,
  categoryLabelWidth = TOP_LIST_DEFAULT_CATEGORY_LABEL_WIDTH,
  activeItemId,
  getItemAriaLabel,
  isRendering = true,
  shouldAnimate = true,
  onItemPointerMove,
  onItemPointerOut,
  onItemActivate,
  onItemFocus,
  onItemBlur,
  className,
  'aria-label': ariaLabel,
  ...rest
}: TopListProps<Item>) => {
  const sortedItems = sortTopListItems(
    items.filter((item) => Number.isFinite(item.value)),
    sort
  );
  const visibleItems = limitTopListItems(sortedItems, limit);
  const itemById = new Map(visibleItems.map((item) => [item.id, item]));
  const formattedValueById = new Map(
    visibleItems.map((item) => [item.id, formatValue(item.value)])
  );
  const resolvedCategoryLabelWidth = Number.isFinite(categoryLabelWidth)
    ? Math.max(0, categoryLabelWidth)
    : TOP_LIST_DEFAULT_CATEGORY_LABEL_WIDTH;
  const valueLabelPadding = Math.ceil(
    TOP_LIST_VALUE_LABEL_GAP +
      Math.max(
        0,
        ...Array.from(formattedValueById.values(), (value) =>
          Math.max(
            getStringWidth(value, {
              fontSize: `${TOP_LIST_VALUE_LABEL_FONT_SIZE}px`,
            }) ?? 0,
            value.length * 7
          )
        )
      )
  );
  const values = sortedItems.map((item) => item.value);
  const valueDomain: readonly [number, number] | undefined =
    values.length === 0
      ? undefined
      : [Math.min(0, ...values), Math.max(0, ...values)];
  const hasNegativeValues = (valueDomain?.[0] ?? 0) < 0;
  const series: readonly BarChartSeries[] = [
    {
      id: TOP_LIST_SERIES_ID,
      label: valueAxisLabel ?? 'Value',
      ariaLabel: valueAxisLabel ?? 'Values',
      data: visibleItems.map((item) => ({
        id: item.id,
        category: item.id,
        value: item.value,
        color: item.color ?? getFillChartColorForKey(item.id),
      })),
    },
  ];
  const getItem = (category: BarChartCategory) =>
    itemById.get(String(category));
  const getDatumItem = (datum: BarChartInteractionDatum) =>
    getItem(datum.category);
  const mapDatumHandlerToItem = <Event,>(
    handler: ((item: Item, event: Event) => void) | undefined
  ) => {
    if (!isRendering || handler == null) return undefined;

    return (datum: BarChartInteractionDatum, event: Event) => {
      const item = getDatumItem(datum);
      if (item != null) handler(item, event);
    };
  };

  return (
    <BarChart
      {...rest}
      aria-label={ariaLabel}
      className={className}
      orientation="horizontal"
      mode="grouped"
      series={series}
      showLegend={false}
      activeBarId={activeItemId}
      isRendering={isRendering}
      shouldAnimate={shouldAnimate}
      minimumPlotWidth={0}
      categoryPadding={{ inner: 0.24, outer: 0.24 }}
      categoryAxis={{
        domain: visibleItems.map((item) => item.id),
        thickness: resolvedCategoryLabelWidth,
      }}
      valueAxes={[
        {
          id: TOP_LIST_SERIES_ID,
          label: valueAxisLabel,
          domain: valueDomain,
          nice: true,
          formatValue,
        },
      ]}
      grid={{ value: true }}
      plotPadding={{
        left: hasNegativeValues ? valueLabelPadding : 0,
        right: valueLabelPadding,
      }}
      slots={{
        categoryAxis: () => null,
        barLabel: (bar) => (
          <TopListValueLabel
            key={`${bar.id}:${bar.startValue}:${bar.endValue}`}
            bar={bar}
            label={formattedValueById.get(bar.id) ?? formatValue(bar.value)}
            shouldAnimate={shouldAnimate}
          />
        ),
        overlay: (slotProps) =>
          isRendering ? (
            <TopListOverlay
              {...slotProps}
              getItem={getItem}
              categoryLabelWidth={resolvedCategoryLabelWidth}
              valueLabelPadding={valueLabelPadding}
              hasNegativeValues={hasNegativeValues}
              onItemPointerMove={onItemPointerMove}
              onItemPointerOut={onItemPointerOut}
              onItemActivate={onItemActivate}
            />
          ) : null,
      }}
      getCategoryAriaLabel={
        !isRendering
          ? undefined
          : (datum) => {
              const item = getDatumItem(datum);
              if (item == null) return undefined;
              return (
                getItemAriaLabel?.(item) ??
                `${item.label}: ${formattedValueById.get(item.id) ?? formatValue(item.value)}`
              );
            }
      }
      onDatumActivate={mapDatumHandlerToItem(onItemActivate)}
      onDatumFocus={mapDatumHandlerToItem(onItemFocus)}
      onDatumBlur={mapDatumHandlerToItem(onItemBlur)}
    />
  );
};
