import type {
  AriaAttributes,
  HTMLAttributes,
  PointerEvent,
  ReactNode,
} from 'react';

import type { scaleLinear } from '@visx/scale';

import type { ChartLegendProps } from '../ChartLegend';

export type LineChartPoint = {
  x: number;
  y: number | null;
};

export type LineChartSeries = {
  id: string;
  label: ReactNode;
  /** Plain-text series name used by assistive technology. Defaults to `id`. */
  'aria-label'?: AriaAttributes['aria-label'];
  points: readonly LineChartPoint[];
  color?: string;
  yAxisId?: string;
  /** Defaults to 2. */
  strokeWidth?: number;
  /** SVG dash pattern such as `5 4`. */
  strokeDasharray?: string;
  /** Series opacity from 0 to 1. Defaults to 1. */
  opacity?: number;
  /** Whether the controlled crosshair draws this series' marker. Defaults to true. */
  showActiveMarker?: boolean;
};

export type LineChartYAxis = {
  id: string;
  label?: string;
  domain?: readonly [number, number];
  formatValue?: (value: number) => string;
  tickCount?: number;
  /** Fixed y-axis and horizontal-grid tick values. */
  tickValues?: readonly number[];
};

export type LineChartInteractionPoint = {
  seriesId: string;
  seriesLabel: ReactNode;
  color: string;
  value: number | null;
};

export type LineChartInteractionDatum = {
  /** Nearest rendered data bucket. */
  x: number;
  /** Unsnapped x-domain value directly beneath the pointer. */
  pointerX: number;
  /** Horizontal SVG coordinate for positioning consumer-owned overlays. */
  xPosition: number;
  points: readonly LineChartInteractionPoint[];
};

export type LineChartXScale = 'linear' | 'band';

export type LineChartSelectionRange = {
  from: number;
  to: number;
};

export type LineChartGrid = {
  /** Defaults to true. Grid guides are dashed. */
  rows?: boolean;
  /** Defaults to true. Grid guides are dashed. */
  columns?: boolean;
};

export type LineChartYBand = {
  id: string;
  /** Defaults to the primary y axis. */
  yAxisId?: string;
  /** Defaults to the lower edge of the axis domain. */
  from?: number;
  /** Defaults to the upper edge of the axis domain. */
  to?: number;
  /** Use a design-system CSS color token. */
  color: string;
  opacity?: number;
};

export type LineChartDisplaySeries = {
  id: string;
  label: ReactNode;
  'aria-label'?: AriaAttributes['aria-label'];
  points: readonly LineChartPoint[];
  color: string;
  yAxisId: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
  showActiveMarker: boolean;
};

export type LineChartDisplayAxis = LineChartYAxis & {
  thickness: number;
  scale: ReturnType<typeof scaleLinear<number>>;
};

type LineChartLegendProps = Omit<ChartLegendProps, 'items'>;

type LineChartLegendConfig =
  | {
      showLegend?: true;
      legendProps?: LineChartLegendProps;
    }
  | {
      showLegend: false;
      legendProps?: never;
    };

export type LineChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
  | 'onPointerLeave'
  | 'onPointerMove'
  | 'onPointerOut'
  | 'onPointerUp'
  | 'aria-describedby'
  | 'aria-label'
> &
  LineChartLegendConfig & {
    series: readonly LineChartSeries[];
    yAxes?: readonly LineChartYAxis[];
    xDomain?: readonly [number, number];
    formatXValue?: (value: number) => string;
    /** Linear preserves elapsed distance; band spaces buckets evenly. Defaults to linear. */
    xScale?: LineChartXScale;
    xTickCount?: number;
    xTickValues?: readonly number[];
    selectedIds?: ReadonlySet<string>;
    showPoints?: boolean;
    /** Connects valid observations across null values. Defaults to true. */
    connectNulls?: boolean;
    /** Visible horizontal and vertical grid lines. Pass false to hide both. */
    grid?: LineChartGrid | false;
    /** Draws a crosshair and point markers at this x value. */
    activeX?: number;
    /** Emphasizes the series represented by one external legend item. Built-in legends set this automatically. */
    activeLegendItemId?: string | null;
    /** Controlled x-domain range drawn over the plot for brush selection. */
    selectionRange?: LineChartSelectionRange;
    /** Background ranges such as warning or threshold regions. */
    yBands?: readonly LineChartYBand[];
    /**
     * Rendered inside the plot's relative container at the resolved activeX
     * position (SVG-container-relative pixels). Only invoked when activeX is
     * inside the plot bounds.
     */
    renderActiveOverlay?: (info: {
      xPosition: number;
      activeX: number;
    }) => ReactNode;
    /** Animates the chart unless reduced motion is preferred. Defaults to true. */
    shouldAnimate?: boolean;
    isRendering?: boolean;
    'aria-describedby'?: AriaAttributes['aria-describedby'];
    'aria-label': string;
    onDatumPointerMove?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
    onDatumPointerDown?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
    onDatumPointerOut?: () => void;
    onDatumPointerUp?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
  };
