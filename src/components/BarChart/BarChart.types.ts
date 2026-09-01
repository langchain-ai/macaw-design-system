import type {
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from 'react';

import type { scaleLinear } from '@visx/scale';

import type { ChartLegendProps } from '../ChartLegend';

export type BarChartCategory = string | number;

export type BarChartDataPoint = {
  /** Stable ID for controlled active state and callbacks. Must be unique within the chart. */
  id?: string;
  category: BarChartCategory;
  /** Null renders a gap rather than a zero-height bar. */
  value: number | null;
  /** Overrides the series color for this bar. Use a design-system CSS chart color token. */
  color?: string;
};

export type BarChartSeries = {
  id: string;
  label: ReactNode;
  /** Plain-text series name for assistive technology. Defaults to `label` when it is text, then `id`. */
  ariaLabel?: string;
  data: readonly BarChartDataPoint[];
  /** Use a design-system CSS chart color token. */
  color?: string;
  valueAxisId?: string;
  /** Series opacity from 0 to 1. Defaults to 1. */
  opacity?: number;
  /** Outer-corner radius in SVG pixels. Defaults to 3. */
  cornerRadius?: number;
  /** Rounds the value end only, or the whole bar. Defaults to end. */
  cornerStyle?: BarChartCornerStyle;
};

export type BarChartCornerStyle = 'end' | 'all';
export type BarChartMode = 'grouped' | 'stacked';
export type BarChartOrientation = 'vertical' | 'horizontal';

export type BarChartGrid = {
  /** Guides parallel to the category axis. Defaults to true. */
  value?: boolean;
  /** Guides through category buckets. Defaults to false. */
  category?: boolean;
  /** Value guides to draw. Defaults to the primary value axis tick count. */
  tickCount?: number;
  /** Exact value guides to draw. Overrides `tickCount`. */
  tickValues?: readonly number[];
};

export type BarChartCategoryAxis = {
  label?: string;
  /** Explicit category order. By default, first appearance wins. */
  domain?: readonly BarChartCategory[];
  /** Defaults to `String(category)`. */
  formatValue?: (value: BarChartCategory) => string;
  tickCount?: number;
  tickValues?: readonly BarChartCategory[];
  /** Reserved width for horizontal charts or height for vertical charts, in pixels. */
  thickness?: number;
};

export type BarChartValueAxis = {
  id: string;
  label?: string;
  domain?: readonly [number, number];
  /** Rounds the domain out to whole tick values. Defaults to true only when `domain` is omitted. */
  nice?: boolean;
  /** Defaults to a plain `en-US` number; pass a unit-aware formatter for cost or duration. */
  formatValue?: (value: number) => string;
  tickCount?: number;
  tickValues?: readonly number[];
  /** Reserved width for vertical charts or height for horizontal charts, in pixels. */
  thickness?: number;
};

export type BarChartValueBand = {
  id: string;
  /** Defaults to the primary value axis. */
  valueAxisId?: string;
  /** Defaults to the lower edge of the axis domain. */
  from?: number;
  /** Defaults to the upper edge of the axis domain. */
  to?: number;
  /** Use a design-system CSS chart color token. */
  color: string;
  /** Defaults to 0.5. */
  opacity?: number;
  ariaLabel?: string;
};

export type BarChartSelectionRange = {
  from: BarChartCategory;
  to: BarChartCategory;
};

export type BarChartDisplaySeries = BarChartSeries & {
  color: string;
  valueAxisId: string;
  opacity: number;
  cornerRadius: number;
  cornerStyle: BarChartCornerStyle;
};

export type BarChartLayoutBar = {
  id: string;
  category: BarChartCategory;
  value: number;
  startValue: number;
  endValue: number;
  seriesId: string;
  seriesLabel: ReactNode;
  color: string;
  valueAxisId: string;
  opacity: number;
  cornerRadius: number;
  cornerStyle: BarChartCornerStyle;
  groupIndex: number;
  groupCount: number;
  isStackEnd: boolean;
};

export type BarChartDisplayAxis = Omit<BarChartValueAxis, 'thickness'> & {
  thickness: number;
  scale: ReturnType<typeof scaleLinear<number>>;
};

export type BarChartInteractionBar = Pick<
  BarChartLayoutBar,
  | 'id'
  | 'category'
  | 'value'
  | 'startValue'
  | 'endValue'
  | 'seriesId'
  | 'seriesLabel'
  | 'color'
  | 'valueAxisId'
>;

export type BarChartInteractionDatum = {
  category: BarChartCategory;
  /** SVG position snapped to the category center on the category axis. */
  categoryPosition: number;
  /** SVG coordinates suitable for consumer-owned overlays. */
  xPosition: number;
  yPosition: number;
  bars: readonly BarChartInteractionBar[];
};

export type BarChartRenderedBar = BarChartLayoutBar & {
  x: number;
  y: number;
  width: number;
  height: number;
  baselinePosition: number;
};

export type BarChartCategoryAxisSlotProps = {
  orientation: BarChartOrientation;
  categories: readonly BarChartCategory[];
  innerWidth: number;
  innerHeight: number;
  bandwidth: number;
  getCategoryPosition: (category: BarChartCategory) => number | undefined;
  formatValue: (category: BarChartCategory) => string;
};

export type BarChartValueAxisSlotProps = {
  orientation: BarChartOrientation;
  axis: BarChartValueAxis;
  index: number;
  innerWidth: number;
  innerHeight: number;
  getValuePosition: (value: number) => number;
};

export type BarChartPlotSlotProps = {
  orientation: BarChartOrientation;
  categories: readonly BarChartCategory[];
  bars: readonly BarChartRenderedBar[];
  innerWidth: number;
  innerHeight: number;
  bandwidth: number;
  getCategoryPosition: (category: BarChartCategory) => number | undefined;
  getValuePosition: (valueAxisId: string, value: number) => number | undefined;
};

export type BarChartSlots = {
  /** Replaces the built-in category axis. Return SVG-compatible content. */
  categoryAxis?: (props: BarChartCategoryAxisSlotProps) => ReactNode;
  /** Replaces each built-in value axis. Return SVG-compatible content. */
  valueAxis?: (props: BarChartValueAxisSlotProps) => ReactNode;
  /** Renders SVG-compatible content beneath the bars, above the grid. */
  background?: (props: BarChartPlotSlotProps) => ReactNode;
  /** Renders SVG-compatible content after an individual bar. */
  barLabel?: (bar: BarChartRenderedBar) => ReactNode;
  /** Renders SVG-compatible content over the completed plot. */
  overlay?: (props: BarChartPlotSlotProps) => ReactNode;
};

/**
 * Naming and interaction hooks. Declared once so the public component and the
 * plot renderer cannot drift apart.
 */
export type BarChartInteractionProps = {
  /** Naming a bar also makes it a keyboard target. */
  getBarAriaLabel?: (bar: BarChartInteractionBar) => string | undefined;
  /** Naming a category also makes its whole band a keyboard target. */
  getCategoryAriaLabel?: (
    datum: BarChartInteractionDatum
  ) => string | undefined;
  onDatumPointerDown?: (
    datum: BarChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
  onDatumPointerMove?: (
    datum: BarChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
  /** Fires when the pointer leaves the plot area or the chart entirely. */
  onDatumPointerOut?: () => void;
  /** The raw pointer release. `onDatumActivate` is the semantic click. */
  onDatumPointerUp?: (
    datum: BarChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
  /** Fires for a primary pointer release or Enter/Space on a category target. */
  onDatumActivate?: (
    datum: BarChartInteractionDatum,
    event: PointerEvent<SVGSVGElement> | KeyboardEvent<SVGRectElement>
  ) => void;
  onDatumFocus?: (
    datum: BarChartInteractionDatum,
    event: FocusEvent<SVGRectElement>
  ) => void;
  onDatumBlur?: (
    datum: BarChartInteractionDatum,
    event: FocusEvent<SVGRectElement>
  ) => void;
  /** Fires while the pointer is over a rendered bar. Track its ID and set `ChartTooltipRow.highlighted` on the matching tooltip row. */
  onBarPointerMove?: (
    bar: BarChartInteractionBar,
    event: PointerEvent<SVGPathElement>
  ) => void;
  /** Fires when the pointer leaves a rendered bar. Clear the matching `ChartTooltipRow.highlighted` state here. */
  onBarPointerOut?: () => void;
  /** Fires for a primary pointer release or Enter/Space on a bar, and stops the datum-level activation. */
  onBarActivate?: (
    bar: BarChartInteractionBar,
    event: PointerEvent<SVGPathElement> | KeyboardEvent<SVGPathElement>
  ) => void;
  onBarFocus?: (
    bar: BarChartInteractionBar,
    event: FocusEvent<SVGPathElement>
  ) => void;
  onBarBlur?: (
    bar: BarChartInteractionBar,
    event: FocusEvent<SVGPathElement>
  ) => void;
};

export type BarChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'aria-label'
> &
  BarChartInteractionProps & {
    series: readonly BarChartSeries[];
    /** Defaults to true when the chart has more than one series. */
    showLegend?: boolean;
    /** Forwarded to the rendered `ChartLegend`. Inert when there is no legend. */
    legendProps?: Omit<ChartLegendProps, 'items'>;
    categoryAxis?: BarChartCategoryAxis;
    valueAxes?: readonly BarChartValueAxis[];
    /** Defaults to grouped. */
    mode?: BarChartMode;
    /** Defaults to vertical. */
    orientation?: BarChartOrientation;
    /** Controlled legend filter. An empty set renders every series. */
    selectedIds?: ReadonlySet<string>;
    grid?: BarChartGrid;
    valueBands?: readonly BarChartValueBand[];
    /** Draws a guide through one category. */
    activeCategory?: BarChartCategory | null;
    /** Draws a guide through the center of one bar. Takes precedence over `activeCategory`. */
    activeGuideBarId?: string | null;
    /** Emphasizes one bar and dims the rest. */
    activeBarId?: string | null;
    selectionRange?: BarChartSelectionRange;
    /** Band-scale padding from 0 to 1. */
    categoryPadding?: {
      inner?: number;
      outer?: number;
    };
    /** Additional room around the plot for consumer-owned SVG slots. */
    plotPadding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    /** Narrowest the plot area gets before the chart scrolls. Defaults to 160; pass 0 to always fit. */
    minimumPlotWidth?: number;
    /** Fraction of each grouped slot reserved as a gap. Defaults to 0.08. */
    groupPadding?: number;
    /** Minimum visible bar length for zero or very small values. Defaults to 1. */
    minimumBarSize?: number;
    /** Animates the chart unless reduced motion is preferred. Defaults to true. */
    shouldAnimate?: boolean;
    slots?: BarChartSlots;
    /** Set false to drop the marks while a parent is actively resizing. Defaults to true. */
    isRendering?: boolean;
    'aria-label': string;
  };
