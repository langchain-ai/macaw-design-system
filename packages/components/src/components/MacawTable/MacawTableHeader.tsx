import { useRef, useState } from 'react';

import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowsDownUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowsDownUp';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { DotsSixVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsSixVertical';
import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';
import { flexRender } from '@tanstack/react-table';

import { cn } from '../../utils/cn';
import zIndices from '../../utils/zIndices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { canReorder, columnLabel, moveColumn } from './columnUtils';
import type { MacawTableProps } from './types';

export function MacawTableHeader<TData>(props: MacawTableProps<TData>) {
  'use no memo';
  const { table, columnOptions } = props;
  const draggedId = useRef<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const hasSpacer = !table
    .getCenterVisibleLeafColumns()
    .some((column) => columnOptions?.[column.id]?.fill);
  const leftGroups = table.getLeftHeaderGroups();
  const centerGroups = table.getCenterHeaderGroups();
  const rightGroups = table.getRightHeaderGroups();
  const groups = table.getHeaderGroups().map((group, index) => ({
    ...group,
    headers: [
      ...(leftGroups[index]?.headers ?? []),
      ...(centerGroups[index]?.headers ?? []),
      ...(hasSpacer ? [null] : []),
      ...(rightGroups[index]?.headers ?? []),
    ],
  }));
  const reorderable = props.enableColumnReordering && groups.length === 1;
  const visibleMovable = table
    .getVisibleLeafColumns()
    .filter((c) => canReorder(c, columnOptions?.[c.id]));

  const move = (from: string, to: string) => {
    const position =
      table.getVisibleLeafColumns().findIndex((column) => column.id === to) + 1;
    moveColumn(table, from, to, columnOptions);
    setAnnouncement(
      `Moved ${columnLabel(table.getColumn(from)!)} to column ${position}`
    );
  };

  return (
    <>
      {groups.map((group) => (
        <tr key={group.id}>
          {group.headers.map((header) => {
            if (!header)
              return (
                <th
                  key="spacer"
                  aria-hidden
                  role="presentation"
                  className="border-b border-subtle bg-surface-level-1 p-0"
                />
              );
            const column = header.column;
            const options = columnOptions?.[column.id];
            const leaves = header
              .getLeafHeaders()
              .filter((leaf) => leaf.subHeaders.length === 0);
            const pinned = leaves[0]?.column.getIsPinned();
            const sorted = column.getIsSorted();
            const label = columnLabel(column);
            const canMove = reorderable && canReorder(column, options);
            const moveIndex = visibleMovable.findIndex(
              (c) => c.id === column.id
            );
            const sortIcon =
              sorted === 'asc'
                ? ArrowUpIcon
                : sorted === 'desc'
                  ? ArrowDownIcon
                  : ArrowsDownUpIcon;
            return (
              <th
                key={header.id}
                scope={header.colSpan > 1 ? 'colgroup' : 'col'}
                colSpan={header.colSpan}
                aria-sort={
                  sorted === 'asc'
                    ? 'ascending'
                    : sorted === 'desc'
                      ? 'descending'
                      : undefined
                }
                data-column-id={column.id}
                className={cn(
                  'group/header relative border-b border-subtle bg-surface-level-1 px-space-2 py-space-2 text-left align-middle',
                  props.showColumnDividers && 'border-r',
                  dropId === column.id && 'ring-2 ring-focus',
                  options?.headerClassName
                )}
                style={{
                  width:
                    options?.fill && !pinned ? undefined : header.getSize(),
                  ...(pinned
                    ? {
                        position: 'sticky',
                        left:
                          pinned === 'left'
                            ? leaves[0].column.getStart('left')
                            : undefined,
                        right:
                          pinned === 'right'
                            ? leaves[leaves.length - 1].column.getAfter('right')
                            : undefined,
                        zIndex: zIndices.tableStickyHeader,
                      }
                    : {}),
                }}
                onDragOver={(event) => {
                  if (canMove && draggedId.current) {
                    event.preventDefault();
                    setDropId(column.id);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (canMove && draggedId.current)
                    move(draggedId.current, column.id);
                  draggedId.current = null;
                  setDropId(null);
                }}
              >
                <div className="flex min-w-0 items-center gap-space-1">
                  {canMove && (
                    <span
                      draggable
                      className="w-0 shrink-0 overflow-hidden group-hover/header:w-space-5 group-focus-within/header:w-space-5 [@media(hover:none)]:w-space-5"
                      onDragStart={(event) => {
                        draggedId.current = column.id;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', column.id);
                      }}
                      onDragEnd={() => {
                        draggedId.current = null;
                        setDropId(null);
                      }}
                    >
                      <IconButton
                        icon={DotsSixVerticalIcon}
                        iconWeight="regular"
                        label={`Move ${label}`}
                        size="xs"
                        variant="plain"
                        color="secondary"
                        tooltipProps={{
                          title:
                            'Drag to reorder, or use Left and Right arrow keys',
                        }}
                        className="cursor-grab opacity-0 group-hover/header:opacity-100 group-focus-within/header:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none"
                        onKeyDown={(event) => {
                          if (
                            event.key !== 'ArrowLeft' &&
                            event.key !== 'ArrowRight'
                          )
                            return;
                          event.preventDefault();
                          const target =
                            visibleMovable[
                              moveIndex + (event.key === 'ArrowLeft' ? -1 : 1)
                            ];
                          if (target) move(column.id, target.id);
                        }}
                      />
                    </span>
                  )}
                  <Text
                    as="span"
                    variant="sm"
                    weight="medium"
                    color="secondary"
                    className="min-w-0 flex-1 truncate"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          column.columnDef.header,
                          header.getContext()
                        )}
                  </Text>
                  {!header.isPlaceholder && column.getCanSort() && (
                    <IconButton
                      icon={sortIcon}
                      iconWeight="regular"
                      label={
                        column.getNextSortingOrder()
                          ? `Sort ${label} ${column.getNextSortingOrder() === 'asc' ? 'ascending' : 'descending'}`
                          : `Remove sort for ${label}`
                      }
                      size="xs"
                      variant="plain"
                      color="secondary"
                      onClick={column.getToggleSortingHandler()}
                    />
                  )}
                  {!header.isPlaceholder &&
                    options?.renderHeaderActions?.(column, table)}
                  {!header.isPlaceholder &&
                    (props.enableColumnActions || canMove) &&
                    (column.getCanHide() ||
                      props.onFilterColumn ||
                      canMove) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <IconButton
                            icon={DotsThreeIcon}
                            iconWeight="regular"
                            label={`Actions for ${label}`}
                            size="xs"
                            variant="plain"
                            color="secondary"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {props.enableColumnActions &&
                            props.onFilterColumn && (
                              <DropdownMenuItem
                                onSelect={() =>
                                  props.onFilterColumn?.(column.id)
                                }
                              >
                                Filter {label}
                              </DropdownMenuItem>
                            )}
                          {canMove && (
                            <>
                              <DropdownMenuItem
                                disabled={moveIndex === 0}
                                onSelect={() =>
                                  move(
                                    column.id,
                                    visibleMovable[moveIndex - 1].id
                                  )
                                }
                              >
                                Move left
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  moveIndex === visibleMovable.length - 1
                                }
                                onSelect={() =>
                                  move(
                                    column.id,
                                    visibleMovable[moveIndex + 1].id
                                  )
                                }
                              >
                                Move right
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {props.enableColumnActions && column.getCanHide() && (
                            <DropdownMenuItem
                              onSelect={() => column.toggleVisibility(false)}
                            >
                              Hide column
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  {!header.isPlaceholder &&
                    column.getCanResize() &&
                    header.subHeaders.length === 0 && (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${label}`}
                        aria-valuemin={column.columnDef.minSize ?? 20}
                        aria-valuemax={
                          column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
                        }
                        aria-valuenow={column.getSize()}
                        tabIndex={0}
                        className={cn(
                          'absolute inset-y-0 right-0 flex w-space-2 cursor-col-resize touch-none items-center justify-center outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
                          column.getIsResizing() && 'bg-brand-muted'
                        )}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => column.resetSize()}
                        onKeyDown={(event) => {
                          if (event.key === 'Home') {
                            event.preventDefault();
                            column.resetSize();
                            return;
                          }
                          if (
                            event.key !== 'ArrowLeft' &&
                            event.key !== 'ArrowRight'
                          )
                            return;
                          event.preventDefault();
                          const size = Math.min(
                            column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
                            Math.max(
                              column.columnDef.minSize ?? 20,
                              column.getSize() +
                                (event.key === 'ArrowRight' ? 10 : -10)
                            )
                          );
                          table.setColumnSizing((old) => ({
                            ...old,
                            [column.id]: size,
                          }));
                        }}
                      >
                        <span
                          className={cn(
                            'h-full w-px border-l border-transparent group-hover/header:border-strong',
                            props.showColumnDividers && 'border-subtle',
                            column.getIsResizing() && 'bg-brand'
                          )}
                        />
                      </div>
                    )}
                </div>
                {header === groups[0]?.headers.find(Boolean) && (
                  <span role="status" className="sr-only">
                    {announcement}
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </>
  );
}
