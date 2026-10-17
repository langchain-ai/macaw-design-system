import { useId, type HTMLAttributes } from 'react';

import {
  CHART_SINGLE_FILL_COLOR,
  CHART_INTERACTION_CONTRAST_COLOR,
  getCategoricalLineChartColor,
} from '../../utils/chartColors';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

export type RadarChartDatum = {
  id: string;
  label: string;
  value: number;
};

export type RadarChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /** Axes in clockwise order, beginning at the top. Supply at least three. */
  data: readonly RadarChartDatum[];
  /** Shared axis maximum; defaults to the largest finite positive value. */
  maxValue?: number;
  /** Formats labels and the accessible data summary. */
  formatValue?: (value: number) => string;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

/** A single-series radar with a shared scale and clockwise, outside axis labels. */
export const RadarChart = ({
  data,
  maxValue,
  formatValue = formatNumber,
  className,
  'aria-label': ariaLabel = 'Radar chart',
  ...props
}: RadarChartProps) => {
  const summaryId = useId();
  const values = data.map(({ value }) =>
    Number.isFinite(value) ? Math.max(0, value) : 0
  );
  const maximum =
    maxValue !== undefined && Number.isFinite(maxValue) && maxValue > 0
      ? maxValue
      : Math.max(1, ...values);
  const axes = data.map((datum, index) => {
    const angle = (index * Math.PI * 2) / data.length - Math.PI / 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const ratio = Math.min(1, values[index] / maximum);
    return {
      ...datum,
      value: values[index],
      x: 220 + x * 96,
      y: 170 + y * 96,
      pointX: 220 + x * 96 * ratio,
      pointY: 170 + y * 96 * ratio,
      labelX: 220 + x * 116 - (x < -0.1 ? 100 : x > 0.1 ? 0 : 50),
      labelY: 170 + y * 116 - (y < -0.5 ? 40 : y > 0.5 ? 0 : 20),
      align: x < -0.1 ? 'text-right' : x > 0.1 ? 'text-left' : 'text-center',
    };
  });
  const lineColor = getCategoricalLineChartColor(0);

  return (
    <div className={cn('w-full overflow-x-auto', className)} {...props}>
      {data.length < 3 ? (
        <div className="flex h-80 items-center justify-center" role="status">
          <Text variant="sm" color="secondary">
            At least three axes are needed to display a radar chart.
          </Text>
        </div>
      ) : (
        <svg
          viewBox="0 0 440 340"
          className="block w-full min-w-80"
          role="img"
          aria-label={ariaLabel}
          aria-describedby={summaryId}
        >
          <desc id={summaryId}>
            {axes
              .map(({ label, value }) => `${label}: ${formatValue(value)}`)
              .join('; ')}
          </desc>
          <g aria-hidden="true">
            {axes.map(({ id, x, y }) => (
              <line
                key={id}
                x1={220}
                y1={170}
                x2={x}
                y2={y}
                stroke={lineColor}
                strokeWidth={1.5}
              />
            ))}
            <polygon
              points={axes
                .map(({ pointX, pointY }) => `${pointX},${pointY}`)
                .join(' ')}
              fill={CHART_SINGLE_FILL_COLOR}
              fillOpacity={0.5}
              stroke={lineColor}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {axes.map(
              ({ id, label, value, pointX, pointY, labelX, labelY, align }) => (
                <g key={id}>
                  <circle
                    cx={pointX}
                    cy={pointY}
                    r={3.5}
                    fill={CHART_INTERACTION_CONTRAST_COLOR}
                    stroke={lineColor}
                    strokeWidth={2}
                  />
                  <foreignObject x={labelX} y={labelY} width={100} height={40}>
                    <div
                      className={cn(
                        'flex h-full flex-col justify-center',
                        align
                      )}
                      title={`${label}: ${formatValue(value)}`}
                    >
                      <Text
                        variant="xs"
                        color="secondary"
                        className="truncate tabular-nums"
                      >
                        {formatValue(value)}
                      </Text>
                      <Text variant="xs" color="secondary" className="truncate">
                        {label}
                      </Text>
                    </div>
                  </foreignObject>
                </g>
              )
            )}
          </g>
        </svg>
      )}
    </div>
  );
};
