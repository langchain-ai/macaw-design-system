import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type TableOptions,
} from '@tanstack/react-table';

export type UseMacawTableOptions<TData> = Omit<
  TableOptions<TData>,
  'getCoreRowModel'
> & {
  getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
  /** Stable IDs preserve selection and expansion across refreshes and pages. */
  getRowId: NonNullable<TableOptions<TData>['getRowId']>;
};

/** Optional convenience hook. MacawTable also accepts existing TanStack v8 tables. */
export function useMacawTable<TData>(options: UseMacawTableOptions<TData>) {
  'use no memo';
  return useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    columnResizeMode: 'onChange',
    autoResetExpanded: false,
    ...options,
  });
}
