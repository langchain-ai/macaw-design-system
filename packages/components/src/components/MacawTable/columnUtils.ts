import type { Column, Table } from '@tanstack/react-table';

import type { MacawTableColumnOptions } from './types';

export function columnLabel<TData>(column: Column<TData>) {
  return typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id;
}

export function canReorder<TData>(
  column: Column<TData>,
  options?: MacawTableColumnOptions<TData>
) {
  return (
    column.id !== 'select' &&
    column.id !== 'actions' &&
    !column.getIsPinned() &&
    options?.enableReordering !== false
  );
}

/** Move within the full order so hidden and fixed columns retain their slots. */
export function moveColumn<TData>(
  table: Table<TData>,
  fromId: string,
  toId: string,
  options?: Record<string, MacawTableColumnOptions<TData>>
) {
  const columns = table.getAllLeafColumns();
  const movable = columns.filter(
    (column) =>
      column.getIsVisible() && canReorder(column, options?.[column.id])
  );
  const ids = movable.map((column) => column.id);
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from < 0 || to < 0 || from === to) return;
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  let index = 0;
  table.setColumnOrder(
    columns.map((column) =>
      column.getIsVisible() && canReorder(column, options?.[column.id])
        ? ids[index++]
        : column.id
    )
  );
}
