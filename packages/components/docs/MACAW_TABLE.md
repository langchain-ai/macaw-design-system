# MacawTable

Import the table family from `@langchain/macaw-components/MacawTable` and load
`@langchain/macaw-components/styles.css` once at the application entry point.
The table engine and virtualization stay out of the root barrel.

`MacawTable` renders an existing TanStack Table v8 instance. `useMacawTable` is an
optional convenience hook with client sorting, filtering, pagination, expansion,
and live resizing configured. Use stable row IDs and memoize column definitions.
Do not memoize the JSX containing a mutable table instance: the instance stays
stable while its internal state changes (including under React Compiler).

```tsx
import { useMemo } from 'react';
import type { ColumnDef } from '@langchain/macaw-components/MacawTable';
import {
  MacawTable,
  MacawTableToolbar,
  MacawTablePagination,
  createMacawTableSelectionColumn,
  useMacawTable,
} from '@langchain/macaw-components/MacawTable';

type Item = { id: string; name: string };

function ItemsTable({ items }: { items: Item[] }) {
  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      createMacawTableSelectionColumn({
        getRowLabel: (item: Item) => item.name,
      }),
      {
        accessorKey: 'name',
        header: 'Name',
        size: 280,
        minSize: 160,
        maxSize: 480,
      },
    ],
    []
  );
  const table = useMacawTable({
    data: items,
    columns,
    getRowId: (item) => item.id,
  });
  return (
    <>
      <MacawTableToolbar table={table} />
      <MacawTable table={table} label="Items" enableColumnReordering />
      <MacawTablePagination table={table} />
    </>
  );
}
```

## State and ownership

Pass any TanStack v8 options to `useMacawTable`, including `state`, `initialState`,
`onSortingChange`, `onPaginationChange`, `onColumnVisibilityChange`,
`onColumnSizingChange`, `onColumnOrderChange`, `onRowSelectionChange`, and
`onExpandedChange`. Omit uncontrolled state keys rather than setting them to
`undefined`. App adapters own URL/localStorage persistence and saved-view defaults.

For server data, set `manualPagination`, `manualSorting`, and `manualFiltering`
to `true`, provide `rowCount` (or `pageCount`), and control the matching state and
change callbacks. Reset `pageIndex` when server search/filter/sort changes. The
component never fetches data. Cursor pagination can use `nextPageAction`.

Search is a controlled toolbar input: supply `searchQuery` and `onSearchChange`.
Bind them to client `globalFilter` or to the application's server search. Debounce
and analytics belong to the caller. `bulkActions` receives the loaded selected
records; use `selectedRows` when the app resolves selection across server pages.
The toolbar's selection count includes selected IDs from other pages, but it
cannot resolve their records. Permission checks, selection limits, delete
confirmation, and operations stay in the application.

## Columns and rows

- TanStack `ColumnDef`, `createColumnHelper`, cell renderers, table metadata,
  selection restrictions, nested accessors, and custom display/action columns
  work unchanged. Custom headers should have a readable string `id`.
- `columnOptions[id]` configures `fill`, `customTextOverflow`, cell/header classes,
  `enableReordering`, and `renderHeaderActions(column, table)`. This avoids globally
  augmenting TanStack metadata or colliding with consumer fields. Set `fill` on a
  non-resizable, unpinned column to absorb spare space; the remaining columns keep their widths.
- `enableColumnActions` adds hide/filter and move menu items. `onFilterColumn(id)`
  opens the application's filter UI. Sorting remains visible independently.
- `enableColumnReordering` adds drag handles, Left/Right keyboard movement, and
  move menu items usable on touch devices.
  Hidden and fixed columns retain their order slots. Selection/action IDs,
  pinned columns, and columns with `enableReordering: false` stay fixed. Grouped
  headers keep their hierarchy; reorder handles appear only for a single header row.
- Resize with mouse or touch, or focus a separator and press Left/Right in 10px
  steps. Home or double-click restores the default width. Column min/max bounds apply.
- Pin columns with TanStack `columnPinning`, for example
  `initialState: { columnPinning: { left: ['select'], right: ['actions'] } }`.
  Sticky cells keep their row tone, selection, and hover surface.
- `getSubRows` plus `MacawTableRowExpander` supports nested rows. Control `expanded`
  for persistence; the expander is a real keyboard-accessible button.
- `renderFullWidthRow(row)` replaces a row's cells with one spanning cell, including the decorative width spacer when present. Return
  `null`/`undefined` for ordinary rows. `getRowHeight` also works in virtual mode,
  whose measured rows can grow for rich content. The default minimum is 40px.
- `getRowTone` supports `brand` and `subtle`; `highlightedRowIds` and selection use
  the selected surface and take precedence over tones. Pair a tint with meaningful
  text or controls. `customTextOverflow` opts into rich cells; default cells truncate.

## Navigation and events

`onRowClick(record, event)` supports row actions and Enter on a focused row;
`isRowClickable` can exclude summary or synthetic rows. `onRowAuxClick` exposes
native auxiliary clicks. Controls, links, editable content, and elements marked
`data-table-interactive` do not activate the row. Use actual links in primary
cells for native open-in-new-tab, modifier keys, copying URLs, and routing.
Applications own `to`, router navigation, basenames, peek panes, and any row-level
modifier behavior. Macaw does not synthesize browser clicks or inspect user agents.

## Scrolling and states

Use `virtualized` with `height` (default `24rem`), or provide `customScrollParent`
for an existing scroll container. Virtual tables have sticky headers, measured
row heights, stable row keys, and a synchronized top horizontal scrollbar when
they own the scroller. Standard tables scroll horizontally and can use `height`
to bound vertical scrolling. Neither mode widens its containing layout.

For infinite results, set `hasMore` and `onLoadMore` and use `manualPagination`
(or disable the pagination row model on an existing table). Standard tables use
an intersection sentinel; virtual tables also load near the end and fill short
viewports. Requests are suppressed while loading, validating, disabled, or in an
error state, and deduplicated per loaded row count until a loading cycle completes.
A visible load-more button provides keyboard access and explicit retries.

`isLoading` renders five skeleton rows for an empty table (`loadingRowCount`
customizes this). `isValidating` preserves existing records and announces refresh;
infinite tables append skeletons while loading another page. Use
`hideSkeletonsWhileValidating` to suppress them. Skeletons are separate from real
records and never reach row callbacks. `errorState`, `emptyState`, and
`noColumnsState` allow contextual recovery content. The default empty state says
"No results"; the no-columns state remains recoverable through the separate
column picker. `disabled` makes table content inert; also pass it to the toolbar
and pagination. Semantic tokens supply light/dark surfaces and focus indicators.

## DataGridV2 migration map

Audited the `smith-frontend/src/components/DataGridV2` family and importers at
LangChainPlus commit `f55a9a20bc44845cf8cb87ecf1c8ef2e5a421c37`. Representative
consumers include RunsTable (virtual/infinite, row tones, custom scroll parent),
ExamplesTable (custom cell content), EngineSpendBreakdownTable (full-width rows
and row heights), ContextTable (expandable groups), and resource/settings tables
(server pagination, bulk actions, search, and persistent columns).

| DataGridV2 surface                                                 | Macaw equivalent / migration                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `DataGrid.Table` / `DataGrid`                                      | `MacawTable`, with required accessible `label`                                 |
| Existing `table` and column definitions                            | Pass the same TanStack v8 instance and definitions                             |
| `DataGrid.Header`                                                  | `MacawTableToolbar`; search setter becomes `onSearchChange`                    |
| `DataGrid.Pagination`                                              | `MacawTablePagination`                                                         |
| `customPageSizeOptions`, pagination `onNextTrigger`                | `pageSizeOptions`, `nextPageAction`                                            |
| `createDataGrid`, `useDataGrid`, `useDataGridState`                | Retain the app adapter/state hooks; optionally adopt `useMacawTable`           |
| Column helper wrappers                                             | Native TanStack helpers; retain app-specific formatting helpers                |
| Selection helper                                                   | Existing column or `createMacawTableSelectionColumn` (including shift ranges)  |
| Row action menus / primary column                                  | Existing display/cell definitions composed with Macaw DropdownMenu/Link        |
| `to`, `onClick`, native middle-click emulation                     | Real primary-cell links, `onRowClick`, `onRowAuxClick`; routing stays in app   |
| `isRowClickable`, `getRowTone`, `renderFullWidthRow`               | Same contracts                                                                 |
| `getCellHeight`, `highlightedIds`                                  | `getRowHeight`, `highlightedRowIds`                                            |
| `withCustomTextOverflow`, `meta.customTextOverflow`                | `customTextOverflow`, `columnOptions[id].customTextOverflow`                   |
| `meta.fill`, `meta.columnActions`                                  | `columnOptions[id].fill`, `.renderHeaderActions`                               |
| `createColumnHeaderActions`                                        | `enableColumnActions`, `onFilterColumn` or custom header renderer              |
| `isInfinite`, `hasMore`, table `onNextTrigger`                     | `hasMore`, `onLoadMore`; virtualization is independent                         |
| `customScrollParent`, `virtualized`, loading/header/skeleton flags | Same props                                                                     |
| `showDividerByDefault`                                             | `showColumnDividers`                                                           |
| Default sticky selection column                                    | Explicit TanStack `columnPinning.left: ['select']`                             |
| `DataGridRowExpander`                                              | `MacawTableRowExpander`; no row click handler required                         |
| `actions`, `endActions`, `bulkActions`, `selectedRows`             | Toolbar slots; compose sort indicators into `actions`/`endActions`             |
| `onBulkDelete`, `canBulkDelete`, fixed 100-item limit              | App-owned Button/Tooltip in `bulkActions` with its permission and limit checks |
| Persistence keys, default visibility, URL/time/filter models       | App-controlled TanStack state; retain existing keys and default merging        |

Migration is incremental, not a blind import replacement. Publish Macaw first,
bump the consumer's pinned version, then migrate an app adapter and verify its
server state, native links, saved columns, and permission gates. This PR supplies
the shared capabilities and contract; it does not migrate LangChainPlus routes.
