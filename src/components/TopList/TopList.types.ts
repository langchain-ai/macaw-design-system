import type {
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent,
} from 'react';

export type TopListItem = {
  /** Stable identifier. Must be unique within the list. */
  id: string;
  label: string;
  value: number;
  /** Chart color from `chartColors`. */
  color?: string;
};

export type TopListSort<Item extends TopListItem = TopListItem> =
  | 'ascending'
  | 'descending'
  | 'none'
  | ((left: Item, right: Item) => number);

export type TopListProps<Item extends TopListItem = TopListItem> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'children'
> & {
  items: readonly Item[];
  /** Sorts before applying `limit`. Defaults to descending value order. */
  sort?: TopListSort<Item>;
  limit?: number;
  /** Formats value-axis ticks, value labels, and default accessible names. */
  formatValue?: (value: number) => string;
  valueAxisLabel?: string;
  /** Reserved width for category labels, in pixels. Defaults to 112. */
  categoryLabelWidth?: number;
  activeItemId?: string | null;
  /** Defaults to `<label>: <formatted value>`. */
  getItemAriaLabel?: (item: Item) => string;
  /** Keeps axes mounted while omitting rows during resize. */
  isRendering?: boolean;
  /** Animates the chart unless reduced motion is preferred. Defaults to true. */
  shouldAnimate?: boolean;
  onItemPointerMove?: (item: Item, event: PointerEvent<SVGElement>) => void;
  onItemPointerOut?: () => void;
  onItemActivate?: (
    item: Item,
    event: PointerEvent<SVGElement> | KeyboardEvent<SVGRectElement>
  ) => void;
  onItemFocus?: (item: Item, event: FocusEvent<SVGRectElement>) => void;
  onItemBlur?: (item: Item, event: FocusEvent<SVGRectElement>) => void;
  'aria-label': string;
};
