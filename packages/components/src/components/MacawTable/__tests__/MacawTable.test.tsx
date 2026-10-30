import { useState } from 'react';

import { createPortal } from 'react-dom';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';

import {
  MacawTable,
  MacawTableToolbar,
  MacawTablePagination,
  MacawTableRowExpander,
  createMacawTableSelectionColumn,
  useMacawTable,
  type MacawTableProps,
} from '..';
import { act, fireEvent, render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';

type Item = { id: string; name: string; count: number; children?: Item[] };
const data: Item[] = [
  { id: 'a', name: 'Alpha', count: 2 },
  { id: 'b', name: 'Beta', count: 1 },
  { id: 'c', name: 'Gamma', count: 3 },
  { id: 'd', name: 'Delta', count: 4 },
];
const columns: ColumnDef<Item>[] = [
  createMacawTableSelectionColumn<Item>({ getRowLabel: (row) => row.name }),
  {
    accessorKey: 'name',
    header: 'Name',
    size: 180,
    minSize: 160,
    maxSize: 200,
  },
  { accessorKey: 'count', header: 'Count', size: 100 },
  {
    id: 'actions',
    header: 'Actions',
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    cell: () => <Button size="sm">Edit</Button>,
  },
];

type HarnessProps = Omit<MacawTableProps<Item>, 'table' | 'label'> & {
  items?: Item[];
  columnDefs?: ColumnDef<Item>[];
  pageSize?: number;
  manualPagination?: boolean;
  initialVisibility?: Record<string, boolean>;
  initialPinning?: { left: string[]; right: string[] };
};
function Harness({
  items = data,
  columnDefs = columns,
  pageSize = 10,
  manualPagination = false,
  initialVisibility = {},
  initialPinning = { left: [], right: [] },
  ...props
}: HarnessProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [query, setQuery] = useState('');
  const table = useMacawTable({
    data: items,
    columns: columnDefs,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children,
    enableRowSelection: (row) => row.id !== 'b',
    manualPagination,
    rowCount: manualPagination ? 6 : undefined,
    state: { pagination, globalFilter: query },
    onPaginationChange: setPagination,
    initialState: {
      columnVisibility: initialVisibility,
      columnPinning: initialPinning,
    },
  });
  return (
    <>
      <MacawTableToolbar
        table={table}
        searchQuery={query}
        onSearchChange={setQuery}
        bulkActions={(selected) => <Button>Export {selected.length}</Button>}
      />
      <MacawTable table={table} label="Items" {...props} />
      <MacawTablePagination table={table} pageSizeOptions={[2, 4]} />
    </>
  );
}

const bodyRows = () =>
  within(screen.getByRole('table', { name: 'Items' }))
    .getAllByRole('row')
    .slice(1);
const headerNames = () =>
  within(screen.getByRole('table'))
    .getAllByRole('columnheader')
    .map((el) => el.getAttribute('data-column-id'));

describe('MacawTable', () => {
  it('sorts, filters, and paginates through the table instance', async () => {
    const { user } = render(<Harness pageSize={2} />);
    expect(bodyRows()).toHaveLength(2);
    await user.click(
      screen.getByRole('button', { name: 'Sort Name ascending' })
    );
    expect(bodyRows()[0]).toHaveTextContent('Alpha');
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2 of 2')).toBeVisible();
    await user.type(
      screen.getByRole('textbox', { name: 'Search table' }),
      'Alpha'
    );
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent('Alpha');
  });

  it('preserves server pagination and includes the active custom page size', async () => {
    const { user } = render(
      <Harness items={data.slice(0, 2)} pageSize={3} manualPagination />
    );
    expect(screen.getByText('Page 1 of 2')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2 of 2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await user.tab();
    screen.getByRole('combobox', { name: 'Rows per page' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('option', { name: 'Show 3' })).toBeVisible();
    await user.click(screen.getByRole('option', { name: 'Show 4' }));
    expect(screen.getByText('Page 1 of 2')).toBeVisible();
  });

  it('selects a range, skips unselectable rows, and clears bulk selection', async () => {
    const onRowClick = vi.fn();
    const { user } = render(<Harness onRowClick={onRowClick} />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('checkbox', { name: 'Select Gamma' }));
    await user.keyboard('{/Shift}');
    expect(screen.getByText('2 selected')).toBeVisible();
    expect(
      screen.queryByRole('checkbox', { name: 'Select Beta' })
    ).not.toBeInTheDocument();
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(
      screen.getByRole('checkbox', { name: 'Select Alpha' })
    ).not.toBeChecked();
  });

  it('selects only eligible page rows and reports indeterminate selection', async () => {
    const { user } = render(<Harness />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    expect(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    ).toHaveAttribute('data-state', 'indeterminate');
    await user.click(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    );
    expect(screen.getByText('3 selected')).toBeVisible();
  });

  it('keeps links and controls independent from row activation and supports Enter and auxiliary clicks', async () => {
    const onRowClick = vi.fn();
    const onRowAuxClick = vi.fn();
    const linked: ColumnDef<Item>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => <a href="#details">{String(getValue())}</a>,
      },
      columns[3],
    ];
    const { user } = render(
      <Harness
        columnDefs={linked}
        onRowClick={onRowClick}
        onRowAuxClick={onRowAuxClick}
        isRowClickable={(row) => row.id !== 'b'}
      />
    );
    await user.click(screen.getByRole('link', { name: 'Alpha' }));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    const row = bodyRows()[0];
    act(() => row.focus());
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledTimes(1);
    fireEvent(row, new MouseEvent('auxclick', { button: 1, bubbles: true }));
    expect(onRowAuxClick).toHaveBeenCalledTimes(1);
    await user.click(bodyRows()[1]);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('does not activate a row when a portaled menu surface is clicked', async () => {
    const onRowClick = vi.fn();
    const portalColumns: ColumnDef<Item>[] = [
      { accessorKey: 'name', header: 'Name' },
      {
        id: 'actions',
        cell: ({ row }) =>
          createPortal(<div>Menu for {row.id}</div>, document.body),
      },
    ];
    const { user } = render(
      <Harness columnDefs={portalColumns} onRowClick={onRowClick} />
    );
    await user.click(screen.getByText('Menu for a'));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('resizes within column bounds using the keyboard and resets with Home', async () => {
    const { user } = render(<Harness />);
    const resize = screen.getByRole('separator', { name: 'Resize Name' });
    act(() => resize.focus());
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(resize).toHaveAttribute('aria-valuenow', '200');
    await user.keyboard('{Home}');
    expect(resize).toHaveAttribute('aria-valuenow', '180');
  });

  it('reorders visible columns with the keyboard while keeping fixed columns and hidden positions', async () => {
    const { user } = render(
      <Harness
        enableColumnReordering
        initialVisibility={{ count: false }}
        columnDefs={[
          columns[0],
          columns[1],
          columns[2],
          { accessorKey: 'id', header: 'ID' },
          columns[3],
        ]}
      />
    );
    const move = screen.getByRole('button', { name: 'Move Name' });
    act(() => move.focus());
    await user.keyboard('{ArrowRight}');
    expect(headerNames()).toEqual(['select', 'id', 'name', 'actions']);
    expect(move).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(screen.getByRole('checkbox', { name: 'Count' }));
    await user.keyboard('{Escape}');
    expect(headerNames()).toEqual(['select', 'id', 'count', 'name', 'actions']);
  });

  it('keeps pinned columns fixed and sizes columns in rendered order', () => {
    render(
      <Harness
        enableColumnReordering
        initialPinning={{ left: ['name'], right: ['actions'] }}
      />
    );
    expect(headerNames()).toEqual(['name', 'select', 'count', 'actions']);
    expect(
      [...screen.getByRole('table').querySelectorAll('col')].map(
        (column) => column.style.width
      )
    ).toEqual(['180px', '40px', '100px', '', '60px']);
    expect(
      screen.queryByRole('button', { name: 'Move Name' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toHaveStyle({
      position: 'sticky',
      left: '0px',
    });
  });

  it('hides a column from its menu and restores it from the visibility control', async () => {
    const { user } = render(<Harness enableColumnActions />);
    await user.click(screen.getByRole('button', { name: 'Actions for Count' }));
    await user.click(screen.getByRole('menuitem', { name: 'Hide column' }));
    expect(headerNames()).not.toContain('count');
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(screen.getByRole('checkbox', { name: 'Count' }));
    await user.keyboard('{Escape}');
    expect(headerNames()).toContain('count');
  });

  it('distinguishes empty data, hidden columns and errors, with a recoverable column picker', async () => {
    const { rerender, user } = render(<Harness items={[]} />);
    expect(screen.getByText('No results')).toBeVisible();
    rerender(
      <Harness
        initialVisibility={{ name: false, count: false }}
        columnDefs={columns.slice(1, 3)}
        key="hidden"
      />
    );
    expect(screen.getByText('No columns selected')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(screen.getByRole('checkbox', { name: 'Name' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeVisible();
    rerender(<Harness errorState="Could not load items" isLoading />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load items');
  });

  it('shows loading placeholders without invoking callbacks on fabricated records, and retains rows during refresh', () => {
    const renderFullWidthRow = vi.fn();
    const { rerender, container } = render(
      <Harness
        items={[]}
        isLoading
        loadingRowCount={3}
        renderFullWidthRow={renderFullWidthRow}
      />
    );
    expect(screen.getByText('Loading results…')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(renderFullWidthRow).not.toHaveBeenCalled();
    rerender(<Harness isValidating hideSkeletonsWhileValidating />);
    expect(screen.getByText('Updating results…')).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeVisible();
  });

  it('spans full-width rows across exactly the visible columns and supports custom heights', () => {
    render(
      <Harness
        renderFullWidthRow={(row) =>
          row.id === 'a' ? <Button>Connect source</Button> : null
        }
        getRowHeight={(row) => (row.id === 'a' ? 72 : undefined)}
      />
    );
    const cell = screen.getByRole('cell', { name: 'Connect source' });
    expect(cell).toHaveAttribute('colspan', '5');
    expect(cell).toHaveStyle({ height: '72px' });
  });

  it('expands nested rows using an accessible button without activating the parent row', async () => {
    const onRowClick = vi.fn();
    const tree: Item[] = [{ ...data[0], children: [data[1]] }];
    const treeColumns: ColumnDef<Item>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <>
            <MacawTableRowExpander row={row} label={row.original.name} />
            {row.original.name}
          </>
        ),
      },
    ];
    const { user } = render(
      <Harness items={tree} columnDefs={treeColumns} onRowClick={onRowClick} />
    );
    expect(
      screen.queryByRole('cell', { name: /Beta/ })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));
    expect(screen.getByRole('cell', { name: 'Beta' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Collapse Alpha' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('loads once per row count, blocks loading while busy, and allows an explicit retry', async () => {
    const onLoadMore = vi.fn();
    const { user, rerender } = render(
      <Harness hasMore onLoadMore={onLoadMore} />
    );
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<Harness hasMore onLoadMore={onLoadMore} isValidating />);
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled();
    rerender(<Harness hasMore onLoadMore={onLoadMore} />);
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('deduplicates automatic requests until the row count changes', () => {
    let intersect: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    const Observer = vi.fn(function (
      this: IntersectionObserver,
      callback: IntersectionObserverCallback
    ) {
      intersect = callback;
      Object.assign(this, { observe: vi.fn(), disconnect });
    });
    vi.stubGlobal('IntersectionObserver', Observer);
    const onLoadMore = vi.fn();
    const { rerender, unmount } = render(
      <Harness hasMore onLoadMore={onLoadMore} />
    );
    act(() => {
      intersect(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      intersect(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(
      <Harness items={data.slice(0, 3)} hasMore onLoadMore={onLoadMore} />
    );
    act(() =>
      intersect(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    );
    expect(onLoadMore).toHaveBeenCalledTimes(2);
    unmount();
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
