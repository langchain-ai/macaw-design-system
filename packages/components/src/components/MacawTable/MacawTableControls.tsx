import type { ReactNode } from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { ColumnsIcon } from '@phosphor-icons/react/dist/ssr/Columns';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../Select';
import { Text } from '../Text';
import { columnLabel } from './columnUtils';

export interface MacawTableToolbarProps<TData> {
  table: Table<TData>;
  label?: string;
  actions?: ReactNode;
  endActions?: ReactNode;
  /** Caller owns permission checks, confirmation and execution of bulk actions. */
  bulkActions?: ReactNode | ((selected: TData[]) => ReactNode);
  /** Supply records from other pages when selection spans server pages. */
  selectedRows?: TData[];
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  showColumnVisibility?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MacawTableToolbar<TData>({
  table,
  label = 'Table controls',
  actions,
  endActions,
  bulkActions,
  selectedRows,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  searchLabel = 'Search table',
  showColumnVisibility = true,
  disabled,
  className,
}: MacawTableToolbarProps<TData>) {
  'use no memo';
  const selected =
    selectedRows ??
    table.getSelectedRowModel().flatRows.map((row) => row.original);
  const count = Object.values(table.getState().rowSelection).filter(
    Boolean
  ).length;
  const selectedCount = selectedRows ? selectedRows.length : count;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex min-h-space-8 flex-wrap items-center gap-space-2',
        className
      )}
      inert={disabled || undefined}
      aria-disabled={disabled || undefined}
    >
      {selectedCount > 0 ? (
        <>
          <Text
            as="span"
            variant="sm"
            weight="medium"
            className="border-r border-subtle pr-space-3"
          >
            {selectedCount} selected
          </Text>
          {typeof bulkActions === 'function'
            ? bulkActions(selected)
            : bulkActions}
          <IconButton
            icon={XIcon}
            iconWeight="regular"
            label="Clear selection"
            size="sm"
            variant="plain"
            color="secondary"
            onClick={() => table.resetRowSelection(true)}
          />
        </>
      ) : (
        <>
          {actions}
          {onSearchChange && (
            <Input
              size="md"
              value={searchQuery}
              onChange={onSearchChange}
              debounceMs={0}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
              leftIcon={MagnifyingGlassIcon}
              className="min-w-0 flex-1 sm:w-auto sm:flex-none"
            />
          )}
          {showColumnVisibility && <MacawTableColumnVisibility table={table} />}
          {endActions}
        </>
      )}
    </div>
  );
}

export function MacawTableColumnVisibility<TData>({
  table,
  disabled,
}: {
  table: Table<TData>;
  disabled?: boolean;
}) {
  'use no memo';
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  if (!columns.length) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="md"
          variant="outlined"
          color="secondary"
          leftDecorator={ColumnsIcon}
          disabled={disabled}
        >
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex max-h-80 flex-col gap-space-3 overflow-y-auto p-space-4"
        aria-label="Visible columns"
      >
        <Text variant="sm" weight="medium">
          Visible Columns
        </Text>
        {columns.map((column) => (
          <Checkbox
            key={column.id}
            label={columnLabel(column)}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(value === true)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

export interface MacawTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: readonly number[];
  /** Replaces the disabled next button, for cursor pagination or a limit notice. */
  nextPageAction?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function MacawTablePagination<TData>({
  table,
  pageSizeOptions = [10, 15, 25, 40, 50],
  nextPageAction,
  disabled = false,
  className,
}: MacawTablePaginationProps<TData>) {
  'use no memo';
  const { pageIndex, pageSize } = table.getState().pagination;
  const count = table.getPageCount();
  const options = [
    ...new Set([
      ...pageSizeOptions.filter((size) => Number.isFinite(size) && size > 0),
      pageSize,
    ]),
  ];
  return (
    <nav
      aria-label="Table pagination"
      className={cn(
        'flex flex-wrap items-center justify-end gap-space-2',
        className
      )}
    >
      <Text as="span" variant="sm" color="secondary" aria-live="polite">
        {count === 0
          ? 'No pages'
          : `Page ${pageIndex + 1}${count > 0 ? ` of ${count}` : ''}`}
      </Text>
      <IconButton
        icon={CaretLeftIcon}
        iconWeight="regular"
        label="Previous page"
        size="sm"
        variant="plain"
        color="secondary"
        disabled={disabled || !table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      />
      {nextPageAction != null && !table.getCanNextPage() ? (
        nextPageAction
      ) : (
        <IconButton
          icon={CaretRightIcon}
          iconWeight="regular"
          label="Next page"
          size="sm"
          variant="plain"
          color="secondary"
          disabled={disabled || !table.getCanNextPage()}
          onClick={() => table.nextPage()}
        />
      )}
      <SelectRoot
        value={String(pageSize)}
        disabled={disabled}
        onValueChange={(value) => table.setPageSize(Number(value))}
      >
        <SelectTrigger asChild>
          <Button
            size="sm"
            variant="plain"
            color="secondary"
            rightDecorator={CaretDownIcon}
            aria-label="Rows per page"
          >
            Show {pageSize}
          </Button>
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              Show {size}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </nav>
  );
}

const selectionAnchors = new WeakMap<object, string>();

function SelectionCell<TData>({
  row,
  table,
  getRowLabel,
}: {
  row: Row<TData>;
  table: Table<TData>;
  getRowLabel?: (row: TData) => string;
}) {
  return row.getCanSelect() ? (
    <Checkbox
      size="sm"
      aria-label={`Select ${getRowLabel?.(row.original) ?? `row ${row.id}`}`}
      checked={row.getIsSelected()}
      onClick={(event) => {
        event.stopPropagation();
        if (event.shiftKey) {
          const rows = table.getRowModel().rows;
          const from = rows.findIndex(
            (item) => item.id === selectionAnchors.get(table)
          );
          const to = rows.findIndex((item) => item.id === row.id);
          if (from >= 0 && to >= 0) {
            event.preventDefault();
            const selected = !row.getIsSelected();
            table.setRowSelection((old) => {
              const next = { ...old };
              for (const item of rows.slice(
                Math.min(from, to),
                Math.max(from, to) + 1
              ))
                if (item.getCanSelect()) next[item.id] = selected;
              return next;
            });
          }
        }
        selectionAnchors.set(table, row.id);
      }}
      onCheckedChange={(value) => row.toggleSelected(value === true)}
    />
  ) : null;
}

/** Optional selection column. Existing custom selection columns also work. */
export function createMacawTableSelectionColumn<TData>(options?: {
  getRowLabel?: (row: TData) => string;
}): ColumnDef<TData> {
  return {
    id: 'select',
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        size="sm"
        aria-label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        disabled={
          !table.getRowModel().flatRows.some((row) => row.getCanSelect())
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(value === true)
        }
      />
    ),
    cell: ({ row, table }) => (
      <SelectionCell
        row={row}
        table={table}
        getRowLabel={options?.getRowLabel}
      />
    ),
  };
}

export function MacawTableRowExpander<TData>({
  row,
  label,
}: {
  row: Row<TData>;
  label?: string;
}) {
  'use no memo';
  return (
    <span
      className="inline-flex shrink-0 items-center"
      style={{ paddingInlineStart: `${row.depth}rem` }}
    >
      {row.getCanExpand() ? (
        <IconButton
          icon={row.getIsExpanded() ? CaretDownIcon : CaretRightIcon}
          iconWeight="regular"
          label={`${row.getIsExpanded() ? 'Collapse' : 'Expand'} ${label ?? `row ${row.id}`}`}
          aria-expanded={row.getIsExpanded()}
          size="xs"
          variant="plain"
          color="secondary"
          onClick={row.getToggleExpandedHandler()}
        />
      ) : (
        <span className="w-space-5" />
      )}
    </span>
  );
}
