import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';

import { TableVirtuoso, type TableComponents } from 'react-virtuoso';

import { flexRender } from '@tanstack/react-table';

import { cn } from '../../utils/cn';
import { SPACE_SCALE_PX } from '../../utils/spacing';
import zIndices from '../../utils/zIndices';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { LinearProgress } from '../LinearProgress';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { MacawTableHeader } from './MacawTableHeader';
import type { MacawTableProps } from './types';

const TABLE_CLASS =
  'min-w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-space-1 text-left text-sm text-primary';
// The row gap from border-spacing-y-space-1. Virtual item sizes include it so
// Virtuoso's offsets match the rendered rows and scrolling does not jump.
const ROW_GAP_PX = SPACE_SCALE_PX[1];
const ROW_HEIGHT = '2.5rem';
const INTERACTIVE =
  'a,button,input,select,textarea,[role="button"],[role="checkbox"],[role="switch"],[role="radio"],[role="link"],[role="combobox"],[contenteditable="true"],[data-table-interactive]';

type VirtualContext = {
  label: string;
  scrollLabel: string;
  width: number;
  rowCount: number;
  columnCount: number;
  colGroup: ReactNode;
  renderRow: (
    index: number,
    children: ReactNode,
    props: ComponentProps<'tr'>,
    ref: Ref<HTMLTableRowElement>
  ) => ReactNode;
  syncScroll: (element: HTMLElement) => void;
};

// Module-level components keep Virtuoso's measurement and scroll state stable.
const virtualComponents: TableComponents<number, VirtualContext> = {
  Scroller: forwardRef<
    HTMLDivElement,
    ComponentProps<'div'> & { context?: VirtualContext }
  >(({ context, onScroll, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      tabIndex={0}
      role="region"
      aria-label={context?.scrollLabel}
      onScroll={(event) => {
        onScroll?.(event);
        context?.syncScroll(event.currentTarget);
      }}
    />
  )),
  Table: ({ context, style, ...props }) => (
    <table
      {...props}
      aria-label={context?.label}
      aria-rowcount={context?.rowCount}
      aria-colcount={context?.columnCount}
      className={TABLE_CLASS}
      // Virtuoso zeroes border-spacing inline; keep the row gap from TABLE_CLASS.
      style={{ ...style, borderSpacing: undefined, width: context?.width }}
    >
      {context?.colGroup}
      {props.children}
    </table>
  ),
  // Item sizes include the row gap, so each filler returns the gap that
  // border-spacing adds after it.
  FillerRow: ({ height }) => (
    <tr aria-hidden>
      <td
        style={{
          height: Math.max(0, height - ROW_GAP_PX),
          padding: 0,
          border: 0,
        }}
      />
    </tr>
  ),
  TableHead: forwardRef(({ context: _context, ...props }, ref) => (
    <thead
      {...props}
      ref={ref}
      className="bg-surface-level-1"
      style={{ ...props.style, zIndex: zIndices.tableStickyHeader }}
    />
  )),
  TableRow: forwardRef<
    HTMLTableRowElement,
    ComponentProps<
      NonNullable<TableComponents<number, VirtualContext>['TableRow']>
    >
  >(({ item, context, ...props }, ref) =>
    context.renderRow(item, props.children, props, ref)
  ),
};

export function MacawTable<TData>(props: MacawTableProps<TData>) {
  'use no memo';
  const {
    table,
    label,
    isLoading = false,
    isValidating = false,
    disabled = false,
  } = props;
  const rows = table.getRowModel().rows;
  const leftColumns = table.getLeftVisibleLeafColumns();
  const centerColumns = table.getCenterVisibleLeafColumns();
  const rightColumns = table.getRightVisibleLeafColumns();
  const columns = [...leftColumns, ...centerColumns, ...rightColumns];
  const hasSpacer = !columns.some(
    (column) => props.columnOptions?.[column.id]?.fill && !column.getIsPinned()
  );
  const columnSlots = [
    ...leftColumns,
    ...centerColumns,
    ...(hasSpacer ? [null] : []),
    ...rightColumns,
  ];
  const colGroup = (
    <colgroup>
      {columnSlots.map((column) =>
        column ? (
          <col
            key={column.id}
            style={{
              width:
                props.columnOptions?.[column.id]?.fill && !column.getIsPinned()
                  ? undefined
                  : column.getSize(),
            }}
          />
        ) : (
          <col key="spacer" />
        )
      )}
    </colgroup>
  );
  const busy = isLoading || isValidating;
  const hasError = props.errorState != null;
  const noColumns = columns.every(
    (column) => column.id === 'select' || column.id === 'actions'
  );
  const showSkeletons =
    !hasError &&
    (isLoading || (isValidating && !props.hideSkeletonsWhileValidating)) &&
    (rows.length === 0 || props.hasMore);
  const skeletonCount = showSkeletons
    ? Math.max(0, props.loadingRowCount ?? 5)
    : 0;
  const rowCount = rows.length + skeletonCount;
  const width = table.getTotalSize();
  const canLoad =
    !!props.hasMore &&
    !!props.onLoadMore &&
    !busy &&
    !disabled &&
    !hasError &&
    !noColumns;
  const loadState = useRef({
    canLoad,
    callback: props.onLoadMore,
    count: rows.length,
  });
  loadState.current = {
    canLoad,
    callback: props.onLoadMore,
    count: rows.length,
  };
  const requestedCount = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const scrollLabel = `${label} scroll area`;
  const sentinel = useRef<HTMLDivElement>(null);
  const topScroll = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLElement | null>(null);

  const loadMore = useCallback(() => {
    const state = loadState.current;
    if (!state.canLoad || requestedCount.current === state.count) return;
    requestedCount.current = state.count;
    state.callback?.();
  }, []);

  useEffect(() => {
    if (busy) requestedCount.current = null;
  }, [busy]);
  useEffect(() => {
    const element = sentinel.current;
    if (
      !element ||
      props.virtualized ||
      !canLoad ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      {
        root:
          props.customScrollParent ?? (props.height ? scroller.current : null),
        rootMargin: '200px',
      }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [
    canLoad,
    rows.length,
    props.customScrollParent,
    props.height,
    props.virtualized,
    loadMore,
  ]);

  // Fill a viewport after a page arrives, including custom scroll parents.
  useEffect(() => {
    if (!props.virtualized || !canLoad) return;
    const frame = requestAnimationFrame(() => {
      const element = props.customScrollParent ?? scroller.current;
      if (
        element &&
        element.scrollHeight - element.scrollTop - element.clientHeight < 200
      )
        loadMore();
    });
    return () => cancelAnimationFrame(frame);
  }, [
    props.virtualized,
    props.customScrollParent,
    canLoad,
    rows.length,
    loadMore,
  ]);

  const renderCells = (index: number) => {
    const row = rows[index];
    if (!row)
      return (
        <>
          {columnSlots.map((column) =>
            column ? (
              <td
                key={column.id}
                aria-hidden
                className="px-space-2 py-space-3"
                style={{ height: ROW_HEIGHT, width: column.getSize() }}
              >
                <Skeleton className="h-3 w-full" />
              </td>
            ) : (
              <td
                key="spacer"
                aria-hidden
                role="presentation"
                className="p-0"
              />
            )
          )}
        </>
      );
    const fullWidth = props.renderFullWidthRow?.(row);
    const height = props.getRowHeight?.(row.original) ?? ROW_HEIGHT;
    const highlighted = props.highlightedRowIds?.includes(row.id);
    const tone = props.getRowTone?.(row.original);
    const cellBackground =
      highlighted || row.getIsSelected()
        ? 'bg-selected group-hover/row:bg-selected-hover'
        : tone === 'brand'
          ? 'bg-brand-muted group-hover/row:bg-brand-subtle'
          : tone === 'subtle'
            ? 'bg-surface-level-2 group-hover/row:bg-surface-level-2-hover'
            : 'bg-surface-level-1 group-hover/row:bg-surface-level-1-hover';
    if (fullWidth != null)
      return (
        <td
          colSpan={columns.length + (hasSpacer ? 1 : 0)}
          className={cn('rounded-md p-0', cellBackground)}
          style={{ height }}
        >
          {fullWidth}
        </td>
      );
    return (
      <>
        {[
          ...row.getLeftVisibleCells(),
          ...row.getCenterVisibleCells(),
          ...(hasSpacer ? [null] : []),
          ...row.getRightVisibleCells(),
        ].map((cell) => {
          if (!cell)
            return (
              <td
                key="spacer"
                aria-hidden
                role="presentation"
                className={cn('p-0 last:rounded-e-md', cellBackground)}
              />
            );
          const column = cell.column;
          const pinned = column.getIsPinned();
          const options = props.columnOptions?.[column.id];
          const custom =
            props.customTextOverflow ||
            options?.customTextOverflow ||
            column.id === 'select' ||
            column.id === 'actions';
          return (
            <td
              key={cell.id}
              data-column-id={column.id}
              className={cn(
                'relative px-space-2 py-space-2 align-middle first:rounded-s-md last:rounded-e-md',
                cellBackground,
                highlighted && 'first:border-l-2 first:border-brand',
                options?.className
              )}
              style={{
                height,
                width: options?.fill && !pinned ? undefined : column.getSize(),
                ...(pinned
                  ? {
                      position: 'sticky',
                      left:
                        pinned === 'left' ? column.getStart('left') : undefined,
                      right:
                        pinned === 'right'
                          ? column.getAfter('right')
                          : undefined,
                      zIndex: zIndices.tableStickyCell,
                    }
                  : {}),
              }}
            >
              {custom ? (
                flexRender(column.columnDef.cell, cell.getContext())
              ) : (
                <Text as="div" variant="sm" className="truncate">
                  {flexRender(column.columnDef.cell, cell.getContext())}
                </Text>
              )}
            </td>
          );
        })}
      </>
    );
  };

  const renderRow: VirtualContext['renderRow'] = (
    index,
    children,
    rowProps,
    ref
  ) => {
    const row = rows[index];
    const clickable =
      !!row &&
      (props.isRowClickable?.(row.original) ?? true) &&
      !!(props.onRowClick || props.onRowAuxClick) &&
      !disabled;
    const ignoresEvent = (
      target: EventTarget | null,
      element: HTMLTableRowElement
    ) =>
      !(target instanceof Node) ||
      !element.contains(target) ||
      (target instanceof Element && !!target.closest(INTERACTIVE));
    return (
      <tr
        {...rowProps}
        ref={ref}
        key={row?.id ?? `loading-${index}`}
        data-row-id={row?.id}
        aria-rowindex={
          props.virtualized && row
            ? index +
              (props.hideHeader ? 0 : table.getHeaderGroups().length) +
              1
            : undefined
        }
        aria-selected={row?.getCanSelect() ? row.getIsSelected() : undefined}
        data-state={row?.getIsSelected() ? 'selected' : undefined}
        aria-hidden={!row || undefined}
        tabIndex={clickable && props.onRowClick ? 0 : undefined}
        className={cn(
          'group/row outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
          clickable && 'cursor-pointer',
          rowProps.className
        )}
        onClick={(event) => {
          if (
            row &&
            clickable &&
            !event.defaultPrevented &&
            !ignoresEvent(event.target, event.currentTarget)
          )
            props.onRowClick?.(row.original, event);
        }}
        onAuxClick={(event) => {
          if (
            row &&
            clickable &&
            !event.defaultPrevented &&
            !ignoresEvent(event.target, event.currentTarget)
          )
            props.onRowAuxClick?.(row.original, event);
        }}
        onKeyDown={(event) => {
          if (
            row &&
            clickable &&
            event.target === event.currentTarget &&
            event.key === 'Enter'
          ) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
      >
        {children}
      </tr>
    );
  };

  const loadMoreControl = !hasError &&
    !noColumns &&
    props.hasMore &&
    props.onLoadMore && (
      <div ref={sentinel} className="flex justify-center p-space-3">
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={busy || disabled}
          onClick={() => {
            requestedCount.current = null;
            loadMore();
          }}
        >
          {busy ? 'Loading…' : (props.loadMoreLabel ?? 'Load more')}
        </Button>
      </div>
    );

  let state: ReactNode;
  if (hasError) state = <div role="alert">{props.errorState}</div>;
  else if (noColumns)
    state = props.noColumnsState ?? (
      <EmptyState
        title="No columns selected"
        description="Choose columns to see your data."
      />
    );
  else if (rowCount === 0 && !busy)
    state = props.emptyState ?? (
      <EmptyState
        title="No results"
        description="There is no data to display."
      />
    );

  return (
    <div
      className={cn('relative min-w-0 bg-surface-level-1', props.className)}
      style={props.style}
      aria-disabled={disabled || undefined}
      data-slot="macaw-table"
    >
      <div role="status" className="sr-only">
        {busy && (
          <span>
            {rows.length > 0 ? 'Updating results…' : 'Loading results…'}
          </span>
        )}
        {announcement && <span>{announcement}</span>}
      </div>
      <div inert={disabled || undefined} aria-busy={busy}>
        {state != null ? (
          <div className="p-space-6">
            {state}
            {loadMoreControl}
          </div>
        ) : props.virtualized ? (
          <>
            {!props.customScrollParent && (
              // A pointer shortcut only: the table's own scroll region is the
              // keyboard and assistive-technology path.
              <div
                ref={topScroll}
                aria-hidden
                tabIndex={-1}
                className="overflow-x-auto overflow-y-hidden"
                onScroll={(event) => {
                  if (
                    scroller.current &&
                    scroller.current.scrollLeft !==
                      event.currentTarget.scrollLeft
                  )
                    scroller.current.scrollLeft =
                      event.currentTarget.scrollLeft;
                }}
              >
                <div className="h-px" style={{ width }} />
              </div>
            )}
            <TableVirtuoso<number, VirtualContext>
              style={
                props.customScrollParent
                  ? undefined
                  : { height: props.height ?? '24rem' }
              }
              customScrollParent={props.customScrollParent ?? undefined}
              scrollerRef={(element) => {
                scroller.current =
                  element instanceof HTMLElement ? element : null;
              }}
              data={Array.from({ length: rowCount }, (_, index) => index)}
              computeItemKey={(index) => rows[index]?.id ?? `loading-${index}`}
              itemSize={(element) =>
                element.getBoundingClientRect().height + ROW_GAP_PX
              }
              context={{
                label,
                scrollLabel,
                width,
                rowCount:
                  rows.length +
                  (props.hideHeader ? 0 : table.getHeaderGroups().length),
                columnCount: columns.length,
                colGroup,
                renderRow,
                syncScroll: (element) => {
                  if (
                    topScroll.current &&
                    topScroll.current.scrollLeft !== element.scrollLeft
                  )
                    topScroll.current.scrollLeft = element.scrollLeft;
                },
              }}
              components={virtualComponents}
              fixedHeaderContent={
                props.hideHeader
                  ? undefined
                  : () => (
                      <MacawTableHeader
                        {...props}
                        onAnnounce={setAnnouncement}
                      />
                    )
              }
              itemContent={renderCells}
              endReached={loadMore}
              atBottomThreshold={200}
              increaseViewportBy={200}
            />
            {loadMoreControl}
          </>
        ) : (
          <div
            ref={(element) => {
              scroller.current = element;
            }}
            role="region"
            aria-label={scrollLabel}
            tabIndex={0}
            className="overflow-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus"
            style={{ maxHeight: props.height }}
          >
            <table aria-label={label} className={TABLE_CLASS} style={{ width }}>
              {colGroup}
              {!props.hideHeader && (
                <thead
                  className="sticky top-0 bg-surface-level-1"
                  style={{ zIndex: zIndices.tableStickyHeader }}
                >
                  <MacawTableHeader {...props} onAnnounce={setAnnouncement} />
                </thead>
              )}
              <tbody>
                {Array.from({ length: rowCount }, (_, index) =>
                  renderRow(index, renderCells(index), {}, null)
                )}
              </tbody>
            </table>
            {loadMoreControl}
          </div>
        )}
      </div>
      {/* Overlays the top edge, above the sticky header, so a refresh does not
          shift the rows. The status region announces it. */}
      {busy && rows.length > 0 && (
        <LinearProgress
          aria-hidden
          className="absolute inset-x-0 top-0"
          style={{ zIndex: zIndices.tableStickyHeader }}
        />
      )}
    </div>
  );
}
