import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import type { Column, Row, Table } from '@tanstack/react-table';

export type MacawTableRowTone = 'brand' | 'subtle';

export interface MacawTableColumnOptions<TData> {
  /** Absorb spare width. Use on a non-resizable column. */
  fill?: boolean;
  /** Render rich or multiline content without the default single-line truncation. */
  customTextOverflow?: boolean;
  className?: string;
  headerClassName?: string;
  /** Selection, action and pinned columns are fixed by default. */
  enableReordering?: boolean;
  renderHeaderActions?: (
    column: Column<TData>,
    table: Table<TData>
  ) => ReactNode;
}

export interface MacawTableProps<TData> {
  table: Table<TData>;
  /** Accessible name for both the table and its scroll region. */
  label: string;
  className?: string;
  style?: CSSProperties;
  isLoading?: boolean;
  isValidating?: boolean;
  loadingRowCount?: number;
  hideSkeletonsWhileValidating?: boolean;
  emptyState?: ReactNode;
  /** Error content takes precedence over empty and loading content. */
  errorState?: ReactNode;
  noColumnsState?: ReactNode;
  disabled?: boolean;
  hideHeader?: boolean;
  showColumnDividers?: boolean;
  enableColumnActions?: boolean;
  enableColumnReordering?: boolean;
  onFilterColumn?: (columnId: string) => void;
  columnOptions?: Record<string, MacawTableColumnOptions<TData>>;
  customTextOverflow?: boolean;
  onRowClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Native auxiliary click; inspect event.button for middle-click behavior. */
  onRowAuxClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  isRowClickable?: (row: TData) => boolean;
  getRowTone?: (row: TData) => MacawTableRowTone | undefined;
  highlightedRowIds?: readonly string[];
  getRowHeight?: (row: TData) => number | undefined;
  /** Return null/undefined to render normal cells. */
  renderFullWidthRow?: (row: Row<TData>) => ReactNode;
  virtualized?: boolean;
  /** Give a virtual table a bounded height, or provide customScrollParent. */
  height?: CSSProperties['height'];
  customScrollParent?: HTMLElement | null;
  hasMore?: boolean;
  /** Called near the end, once per loaded row count until a loading cycle completes. */
  onLoadMore?: () => void;
  loadMoreLabel?: string;
}
