import { AxisBottom, AxisLeft, AxisRight, AxisTop } from '@visx/axis';
import type { scaleBand } from '@visx/scale';

import {
  getChartAxisLabelOffset,
  getSecondaryChartAxisOffset,
} from '../../utils/chartAxisLayout';
import {
  CHART_TICK_FONT_SIZE,
  CHART_VALUE_AXIS_TICK_LENGTH,
} from '../../utils/chartConstants';
import { Tooltip } from '../Tooltip';
import type {
  BarChartCategory,
  BarChartCategoryAxis,
  BarChartDisplayAxis,
  BarChartOrientation,
  BarChartSlots,
} from './BarChart.types';
import { formatBarChartValue } from './BarChart.utils';
import { BAR_CHART_DEFAULT_TICK_COUNT } from './constants';

const tickLabelStyle = {
  fill: 'var(--text-tertiary)',
  fontSize: CHART_TICK_FONT_SIZE,
};
const axisLabelProps = {
  fill: 'var(--text-secondary)',
  fontSize: CHART_TICK_FONT_SIZE,
  textAnchor: 'middle',
} as const;

const AxisLabel = ({
  label,
  x,
  y,
  rotation,
}: {
  label: string;
  x: number;
  y: number;
  rotation?: number;
}) => (
  <Tooltip title={label}>
    <text
      {...axisLabelProps}
      x={x}
      y={y}
      transform={
        rotation == null ? undefined : `rotate(${rotation}, ${x}, ${y})`
      }
    >
      {label}
    </text>
  </Tooltip>
);

type BarChartAxesProps = {
  orientation: BarChartOrientation;
  categories: readonly BarChartCategory[];
  categoryAxis?: BarChartCategoryAxis;
  categoryAxisThickness: number;
  categoryScale: ReturnType<typeof scaleBand<BarChartCategory>>;
  categoryTickValues: readonly BarChartCategory[];
  axes: readonly BarChartDisplayAxis[];
  slots?: BarChartSlots;
  innerWidth: number;
  innerHeight: number;
  getCategoryPosition: (category: BarChartCategory) => number | undefined;
  formatCategory: (category: BarChartCategory) => string;
};

/**
 * Secondary value axes stack outward from the plot edge, each offset by the
 * thickness the chart margin already reserved for the ones before it.
 */
export const BarChartAxes = ({
  orientation,
  categories,
  categoryAxis,
  categoryAxisThickness,
  categoryScale,
  categoryTickValues,
  axes,
  slots,
  innerWidth,
  innerHeight,
  getCategoryPosition,
  formatCategory,
}: BarChartAxesProps) => (
  <>
    {slots?.categoryAxis != null ? (
      slots.categoryAxis({
        orientation,
        categories,
        innerWidth,
        innerHeight,
        bandwidth: categoryScale.bandwidth(),
        getCategoryPosition,
        formatValue: formatCategory,
      })
    ) : orientation === 'vertical' ? (
      <AxisBottom
        top={innerHeight}
        scale={categoryScale}
        tickValues={Array.from(categoryTickValues)}
        tickFormat={formatCategory}
        hideAxisLine
        hideTicks
        tickLabelProps={() => ({ ...tickLabelStyle, textAnchor: 'middle' })}
      />
    ) : (
      <AxisLeft
        scale={categoryScale}
        tickValues={Array.from(categoryTickValues)}
        tickFormat={formatCategory}
        hideAxisLine
        hideTicks
        tickLabelProps={() => ({
          ...tickLabelStyle,
          textAnchor: 'end',
          dx: '-0.25em',
          dy: '0.25em',
        })}
      />
    )}
    {axes.map((axis, index) => {
      if (slots?.valueAxis != null) {
        return (
          <g key={axis.id}>
            {slots.valueAxis({
              orientation,
              axis,
              index,
              innerWidth,
              innerHeight,
              getValuePosition: axis.scale,
            })}
          </g>
        );
      }
      const commonProps = {
        scale: axis.scale,
        numTicks: axis.tickCount ?? BAR_CHART_DEFAULT_TICK_COUNT,
        tickValues:
          axis.tickValues == null ? undefined : Array.from(axis.tickValues),
        tickFormat: (value: { valueOf(): number }) =>
          (axis.formatValue ?? formatBarChartValue)(value.valueOf()),
        tickLength: CHART_VALUE_AXIS_TICK_LENGTH,
        hideAxisLine: true,
        hideTicks: true,
      };

      if (orientation === 'vertical') {
        const sideTickLabelProps = () => ({
          ...tickLabelStyle,
          textAnchor: index === 0 ? ('end' as const) : ('start' as const),
          dx: index === 0 ? '-0.25em' : '0.25em',
          dy: '0.25em',
        });
        return index === 0 ? (
          <AxisLeft
            key={axis.id}
            {...commonProps}
            tickLabelProps={sideTickLabelProps}
          />
        ) : (
          <AxisRight
            key={axis.id}
            {...commonProps}
            left={innerWidth + getSecondaryChartAxisOffset(axes, index)}
            tickLabelProps={sideTickLabelProps}
          />
        );
      }

      const edgeTickLabelProps = () => ({
        ...tickLabelStyle,
        textAnchor: 'middle' as const,
      });
      return index === 0 ? (
        <AxisBottom
          key={axis.id}
          {...commonProps}
          top={innerHeight}
          tickLabelProps={edgeTickLabelProps}
        />
      ) : (
        <AxisTop
          key={axis.id}
          {...commonProps}
          top={-getSecondaryChartAxisOffset(axes, index)}
          tickLabelProps={edgeTickLabelProps}
        />
      );
    })}
    {slots?.categoryAxis == null &&
      categoryAxis?.label != null &&
      (orientation === 'vertical' ? (
        <AxisLabel
          label={categoryAxis.label}
          x={innerWidth / 2}
          y={innerHeight + getChartAxisLabelOffset(categoryAxisThickness)}
        />
      ) : (
        <AxisLabel
          label={categoryAxis.label}
          x={-getChartAxisLabelOffset(categoryAxisThickness)}
          y={innerHeight / 2}
          rotation={-90}
        />
      ))}
    {slots?.valueAxis == null &&
      axes.map((axis, index) => {
        if (axis.label == null) return null;
        if (orientation === 'vertical') {
          const x =
            index === 0
              ? -getChartAxisLabelOffset(axis.thickness)
              : innerWidth +
                getSecondaryChartAxisOffset(axes, index) +
                getChartAxisLabelOffset(axis.thickness);
          return (
            <AxisLabel
              key={axis.id}
              label={axis.label}
              x={x}
              y={innerHeight / 2}
              rotation={index === 0 ? -90 : 90}
            />
          );
        }
        return (
          <AxisLabel
            key={axis.id}
            label={axis.label}
            x={innerWidth / 2}
            y={
              index === 0
                ? innerHeight + getChartAxisLabelOffset(axis.thickness)
                : -getSecondaryChartAxisOffset(axes, index) -
                  getChartAxisLabelOffset(axis.thickness)
            }
          />
        );
      })}
  </>
);
