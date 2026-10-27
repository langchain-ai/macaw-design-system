import { useMemo, useState } from 'react';

import { expect, userEvent, within, waitFor } from 'storybook/test';

import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';

import {
  MacawTable,
  MacawTableToolbar,
  MacawTablePagination,
  MacawTableRowExpander,
  createMacawTableSelectionColumn,
  useMacawTable,
} from '.';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

type Item = {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused';
  records: number;
  updated: string;
  children?: Item[];
};
const data: Item[] = [
  {
    id: 'assistant',
    name: 'Production Assistant',
    description: 'Customer support and knowledge retrieval',
    status: 'Active',
    records: 24812,
    updated: '2 minutes ago',
  },
  {
    id: 'search',
    name: 'Search Pipeline',
    description: 'Semantic search across your workspace',
    status: 'Active',
    records: 8640,
    updated: '12 minutes ago',
  },
  {
    id: 'indexer',
    name: 'Document Indexer',
    description: 'Extract, enrich, and organize documents',
    status: 'Paused',
    records: 3204,
    updated: '1 hour ago',
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Multi-step research with cited sources',
    status: 'Active',
    records: 1876,
    updated: '3 hours ago',
  },
  {
    id: 'classifier',
    name: 'Feedback Classifier',
    description: 'Categorize incoming product feedback',
    status: 'Active',
    records: 946,
    updated: 'Yesterday',
  },
  {
    id: 'reviewer',
    name: 'Quality Reviewer',
    description: 'Evaluate responses against your criteria',
    status: 'Paused',
    records: 412,
    updated: 'Yesterday',
  },
];
const columns: ColumnDef<Item>[] = [
  createMacawTableSelectionColumn<Item>({ getRowLabel: (row) => row.name }),
  {
    accessorKey: 'name',
    header: 'Name',
    size: 300,
    minSize: 180,
    maxSize: 480,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-space-1">
        <Text as="span" variant="sm" weight="medium" className="truncate">
          {row.original.name}
        </Text>
        <Text as="span" variant="xs" color="secondary" className="truncate">
          {row.original.description}
        </Text>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 112,
    minSize: 90,
    maxSize: 160,
    cell: ({ getValue }) => (
      <Badge
        color={getValue() === 'Active' ? 'success' : 'secondary'}
        size="sm"
        className={getValue() === 'Active' ? 'text-success' : undefined}
      >
        {String(getValue())}
      </Badge>
    ),
  },
  {
    accessorKey: 'records',
    header: 'Records',
    size: 136,
    minSize: 90,
    maxSize: 200,
    cell: ({ getValue }) => Number(getValue()).toLocaleString('en-US'),
  },
  {
    accessorKey: 'updated',
    header: 'Last Updated',
    enableResizing: false,
    size: 160,
    minSize: 120,
    maxSize: 240,
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            icon={DotsThreeIcon}
            iconWeight="regular"
            label={`Actions for ${row.original.name}`}
            size="sm"
            variant="plain"
            color="secondary"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function Showcase({
  mode = 'ready',
  virtualized = false,
  narrow = false,
}: {
  mode?:
    | 'ready'
    | 'loading'
    | 'updating'
    | 'empty'
    | 'error'
    | 'disabled'
    | 'no-columns';
  virtualized?: boolean;
  narrow?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');
  const items = useMemo(
    () =>
      virtualized
        ? Array.from({ length: 5000 }, (_, index) => ({
            ...data[index % data.length],
            id: `row-${index}`,
            name: `${data[index % data.length].name} ${index + 1}`,
          }))
        : data,
    [virtualized]
  );
  const table = useMacawTable({
    data: mode === 'loading' || mode === 'empty' ? [] : items,
    columns,
    getRowId: (row) => row.id,
    state: { globalFilter: query },
    initialState: {
      columnPinning: { left: ['select'] },
      columnVisibility:
        mode === 'no-columns'
          ? { name: false, status: false, records: false, updated: false }
          : {},
      pagination: { pageIndex: 0, pageSize: virtualized ? 5000 : 10 },
    },
  });
  return (
    <div
      className="mx-auto flex min-w-0 flex-col gap-space-4 rounded-lg border border-subtle bg-surface-level-1 p-space-4"
      style={{ maxWidth: narrow ? 343 : 1040 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-space-3">
        <div className="flex flex-col gap-space-2">
          <Text as="h2" variant="h2">
            Workflows
          </Text>
          <Text variant="sm" color="secondary">
            Manage the workflows powering your workspace.
          </Text>
        </div>
        <Button
          size="md"
          leftDecorator={PlusIcon}
          disabled={mode === 'disabled'}
        >
          New workflow
        </Button>
      </div>
      <MacawTableToolbar
        table={table}
        searchQuery={query}
        onSearchChange={setQuery}
        searchLabel="Search workflows"
        searchPlaceholder="Search workflows…"
        disabled={mode === 'disabled'}
        bulkActions={
          <Button size="sm" variant="outlined" color="secondary">
            Export selection
          </Button>
        }
      />
      <MacawTable
        table={table}
        label="Workflows"
        enableColumnActions
        enableColumnReordering
        virtualized={virtualized}
        height={virtualized ? 400 : undefined}
        columnOptions={{
          name: { customTextOverflow: true },
          updated: { fill: true },
        }}
        getRowHeight={() => 56}
        onRowClick={(row) => setOpened(row.name)}
        isLoading={mode === 'loading'}
        isValidating={mode === 'updating'}
        disabled={mode === 'disabled'}
        errorState={
          mode === 'error' ? (
            <div className="flex flex-col items-center gap-space-3">
              <Text weight="medium">We couldn’t load workflows.</Text>
              <Button size="sm" variant="outlined" color="secondary">
                Try again
              </Button>
            </div>
          ) : undefined
        }
      />
      <MacawTablePagination
        table={table}
        disabled={mode === 'loading' || mode === 'disabled'}
      />
      {opened && (
        <Text role="status" variant="sm">
          Opened {opened}
        </Text>
      )}
    </div>
  );
}

const meta = {
  title: 'Components/Data Display/MacawTable',
  component: MacawTable,
  tags: [
    'autodocs',
    'a11y-test',
    'table',
    'data grid',
    'sorting',
    'pagination',
    'selection',
    'virtualization',
    'infinite scroll',
    'column resizing',
    'column reordering',
    'expandable rows',
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'Composable, domain-free TanStack v8 tables. Reuse existing table instances, or use useMacawTable. Import from @langchain/macaw-components/MacawTable. See docs/MACAW_TABLE.md for server state and the DataGridV2 migration map.',
      },
    },
  },
} satisfies Meta<typeof MacawTable>;
export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => <Showcase />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Production Assistant' })
    );
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Search workflows' }),
      'Research'
    );
    await expect(
      canvas.getByText('Research Agent', { exact: true })
    ).toBeVisible();
    await expect(
      canvas.queryByText('Production Assistant', { exact: true })
    ).not.toBeInTheDocument();
    await userEvent.clear(
      canvas.getByRole('textbox', { name: 'Search workflows' })
    );
  },
};
export const Loading: Story = { render: () => <Showcase mode="loading" /> };
export const Updating: Story = { render: () => <Showcase mode="updating" /> };
export const Empty: Story = { render: () => <Showcase mode="empty" /> };
export const Error: Story = { render: () => <Showcase mode="error" /> };
export const Disabled: Story = { render: () => <Showcase mode="disabled" /> };
export const Narrow: Story = { render: () => <Showcase narrow /> };
export const Virtualized: Story = {
  render: () => <Showcase virtualized />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvas.getByRole('region', {
      name: 'Workflows',
    });
    await expect(canvas.getAllByRole('row').length).toBeLessThan(100);
    await waitFor(() => expect(scroller.scrollHeight).toBeGreaterThan(100000));
    scroller.scrollTo({ top: scroller.scrollHeight });
    await waitFor(() =>
      expect(canvas.getByText('Search Pipeline 5000')).toBeVisible()
    );
    scroller.scrollTo({ top: 0 });
    await waitFor(() =>
      expect(canvas.getByText('Production Assistant 1')).toBeVisible()
    );
  },
};

function TreeExample({ fullWidth = false }: { fullWidth?: boolean }) {
  const tree = useMemo(
    () => [{ ...data[0], children: data.slice(1, 3) }, ...data.slice(3)],
    []
  );
  const treeColumns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 360,
        cell: ({ row }) => (
          <div className="flex items-center gap-space-1">
            <MacawTableRowExpander row={row} label={row.original.name} />
            <Text as="span" variant="sm">
              {row.original.name}
            </Text>
          </div>
        ),
      },
      { accessorKey: 'records', header: 'Records', size: 140 },
    ],
    []
  );
  const table = useMacawTable({
    data: tree,
    columns: treeColumns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children,
    initialState: { expanded: { assistant: true } },
  });
  return (
    <MacawTable
      table={table}
      label="Workflow groups"
      columnOptions={{ name: { customTextOverflow: true } }}
      getRowTone={(row) => (row.children ? 'subtle' : undefined)}
      highlightedRowIds={['research']}
      renderFullWidthRow={
        fullWidth
          ? (row) =>
              row.original.id === 'classifier' ? (
                <div className="flex items-center justify-between gap-space-3 rounded-md bg-brand-muted p-space-4">
                  <Text variant="sm">
                    Connect a source to discover more workflows.
                  </Text>
                  <Button size="sm" variant="outlined" color="secondary">
                    Connect source
                  </Button>
                </div>
              ) : null
          : undefined
      }
    />
  );
}
export const ExpandableRows: Story = { render: () => <TreeExample /> };
export const FullWidthRows: Story = { render: () => <TreeExample fullWidth /> };

function ServerExample() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 2,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  // Simulates a server response; real consumers fetch in their own data layer.
  const response = useMemo(() => {
    const sorted = [...data].sort((a, b) =>
      sorting[0] ? a.name.localeCompare(b.name) * (sorting[0].desc ? -1 : 1) : 0
    );
    return sorted.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );
  }, [pagination, sorting]);
  const table = useMacawTable({
    data: response,
    columns: columns.slice(0, 2),
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data.length,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  });
  return (
    <div className="flex flex-col gap-space-4">
      <MacawTableToolbar table={table} />
      <MacawTable
        table={table}
        label="Server-paginated workflows"
        columnOptions={{ name: { customTextOverflow: true } }}
      />
      <MacawTablePagination table={table} pageSizeOptions={[2, 4, 6]} />
    </div>
  );
}
export const ServerControlled: Story = { render: () => <ServerExample /> };

function InfiniteExample({
  virtualized = false,
  external = false,
}: {
  virtualized?: boolean;
  external?: boolean;
}) {
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [parent, setParent] = useState<HTMLDivElement | null>(null);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        ...data[index % data.length],
        id: `item-${index}`,
        name: `Workflow ${index + 1}`,
      })),
    [count]
  );
  const table = useMacawTable({
    data: items,
    columns: columns.slice(0, 5),
    getRowId: (row) => row.id,
    manualPagination: true,
  });
  return (
    <div
      ref={external ? setParent : undefined}
      style={external ? { height: 400, overflow: 'auto' } : undefined}
    >
      {external && (
        <div className="p-space-4">
          <Text variant="h3">Workspace Activity</Text>
          <Text variant="sm" color="secondary">
            This introduction scrolls with the table.
          </Text>
        </div>
      )}
      <MacawTable
        table={table}
        label="All workflows"
        virtualized={virtualized}
        customScrollParent={external ? parent : undefined}
        height={400}
        hasMore={count < 100}
        isValidating={loading}
        columnOptions={{ name: { customTextOverflow: true } }}
        onLoadMore={() => {
          setLoading(true);
          setTimeout(() => {
            setCount((value) => Math.min(100, value + 20));
            setLoading(false);
          }, 500);
        }}
      />
    </div>
  );
}
export const InfiniteLoading: Story = { render: () => <InfiniteExample /> };
export const VirtualizedInfiniteLoading: Story = {
  render: () => <InfiniteExample virtualized />,
};
export const CustomScrollParent: Story = {
  render: () => <InfiniteExample virtualized external />,
};

function GroupedExample({ pinned = false }: { pinned?: boolean }) {
  const grouped = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        header: 'Workflow',
        columns: [
          { accessorKey: 'name', header: 'Name', size: 320 },
          { accessorKey: 'status', header: 'Status', size: 120 },
        ],
      },
      {
        header: 'Activity',
        columns: [
          { accessorKey: 'records', header: 'Records', size: 140 },
          { accessorKey: 'updated', header: 'Last Updated', size: 180 },
        ],
      },
    ],
    []
  );
  const table = useMacawTable({
    data,
    columns: grouped,
    getRowId: (row) => row.id,
    initialState: {
      columnPinning: pinned
        ? { left: ['name'], right: ['updated'] }
        : { left: [], right: [] },
    },
  });
  return (
    <MacawTable
      table={table}
      label="Grouped workflow columns"
      showColumnDividers
      enableColumnReordering
    />
  );
}
export const GroupedHeaders: Story = { render: () => <GroupedExample /> };

export const GroupedPinnedColumns: Story = {
  render: () => <GroupedExample pinned />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /Last Updated/ });
    const cell = canvas.getByText('2 minutes ago').closest('td')!;
    const scroller = canvas.getByRole('region', {
      name: 'Grouped workflow columns scroll area',
    });
    await waitFor(() => {
      expect(cell.getBoundingClientRect().width).toBe(180);
      expect(header.getBoundingClientRect().right).toBe(
        cell.getBoundingClientRect().right
      );
      expect(cell.getBoundingClientRect().right).toBe(
        scroller.getBoundingClientRect().right
      );
    });
    expect(
      canvas.getAllByRole('columnheader', { name: 'Activity' })
    ).toHaveLength(2);
  },
};

function NoColumnsExample() {
  const table = useMacawTable({
    data,
    columns: columns
      .filter((c) => c.id !== 'select' && c.id !== 'actions')
      .map((c) => ({ ...c, enableHiding: true })),
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: {
        name: false,
        status: false,
        records: false,
        updated: false,
      },
    },
  });
  return (
    <div className="flex flex-col gap-space-4">
      <MacawTableToolbar table={table} />
      <MacawTable table={table} label="Workflow column recovery" />
    </div>
  );
}
export const NoColumns: Story = { render: () => <NoColumnsExample /> };

function PinnedExample({
  fill = false,
  virtualized = false,
}: {
  fill?: boolean;
  virtualized?: boolean;
}) {
  const configured = useMemo(
    () =>
      columns.map((column) =>
        'accessorKey' in column && column.accessorKey === 'updated'
          ? { ...column, enableResizing: !fill }
          : column
      ),
    [fill]
  );
  const table = useMacawTable({
    data,
    columns: configured,
    getRowId: (row) => row.id,
    initialState: {
      columnPinning: { left: ['select', 'name'], right: ['actions'] },
    },
  });
  return (
    <div style={{ maxWidth: 1040 }}>
      <MacawTable
        table={table}
        label="Pinned workflow columns"
        virtualized={virtualized}
        height={300}
        columnOptions={{
          name: { customTextOverflow: true },
          updated: { fill },
        }}
      />
    </div>
  );
}
const checkPinnedColumns: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const selectionCell = (
    await canvas.findByRole('checkbox', {
      name: 'Select Production Assistant',
    })
  ).closest('td')!;
  const nameCell = canvas
    .getByText('Production Assistant', { exact: true })
    .closest('td')!;
  const actionsCell = canvas
    .getByRole('button', {
      name: 'Actions for Production Assistant',
    })
    .closest('td')!;
  const actionsHeader = canvas.getByRole('columnheader', { name: 'Actions' });
  const scroller = canvas.getByRole('region', {
    name: /^Pinned workflow columns( scroll area)?$/,
  });
  const container = scroller.closest(
    '[data-slot="macaw-table"]'
  )!.parentElement!;
  for (const width of [1040, 640]) {
    container.style.maxWidth = `${width}px`;
    for (const left of [0, scroller.scrollWidth]) {
      scroller.scrollTo({ left });
      await waitFor(() => {
        expect(selectionCell.getBoundingClientRect().width).toBe(40);
        expect(nameCell.getBoundingClientRect().width).toBe(300);
        expect(nameCell.getBoundingClientRect().left).toBe(
          selectionCell.getBoundingClientRect().right
        );
        expect(actionsCell.getBoundingClientRect().width).toBe(40);
        expect(actionsCell.getBoundingClientRect().right).toBe(
          scroller.getBoundingClientRect().right
        );
        expect(actionsHeader.getBoundingClientRect().right).toBe(
          actionsCell.getBoundingClientRect().right
        );
      });
    }
  }
  container.style.maxWidth = '1040px';
  scroller.scrollTo({ left: 0 });
};
export const PinnedColumns: Story = {
  render: () => <PinnedExample />,
  play: checkPinnedColumns,
};
export const VirtualizedPinnedColumns: Story = {
  render: () => <PinnedExample virtualized />,
  play: checkPinnedColumns,
};
export const FillColumn: Story = {
  render: () => <PinnedExample fill />,
  play: checkPinnedColumns,
};
