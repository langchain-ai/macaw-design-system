import {
  type ElementType,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { ChatStateTimer } from '../ChatState/ChatStateTimer';

interface RowReport {
  status: 'succeeded' | 'running' | 'other';
  /** Host-supplied icon; defaults like the wrench are not reported. */
  icon?: ReactNode;
}

interface GroupRegistry {
  update: (id: string, report: RowReport) => void;
  remove: (id: string) => void;
}

export const ChatToolCallGroupStatusContext =
  createContext<GroupRegistry | null>(null);

const iconType = (icon: ReactNode): ElementType | string | null =>
  isValidElement(icon) ? (icon.type as ElementType | string) : null;

/**
 * Reports a row's status and icon to the enclosing group, which shows the
 * combined status on its header. Returns whether the row is inside a group.
 */
export function useReportToGroup({ status, icon }: RowReport) {
  const registry = useContext(ChatToolCallGroupStatusContext);
  const id = useId();
  useLayoutEffect(() => {
    registry?.update(id, { status, icon });
  }, [registry, id, status, icon]);
  useLayoutEffect(() => () => registry?.remove(id), [registry, id]);
  return registry !== null;
}

/** Collects row reports for the group header. */
export function useGroupRows() {
  const [rows, setRows] = useState<ReadonlyMap<string, RowReport>>(
    () => new Map()
  );
  const registry = useMemo<GroupRegistry>(
    () => ({
      // Hosts recreate icon elements every render, so compare by icon type.
      update: (id, report) =>
        setRows((previous) => {
          const current = previous.get(id);
          if (
            current?.status === report.status &&
            iconType(current.icon) === iconType(report.icon)
          ) {
            return previous;
          }
          return new Map(previous).set(id, report);
        }),
      remove: (id) =>
        setRows((previous) => {
          const next = new Map(previous);
          next.delete(id);
          return next;
        }),
    }),
    []
  );

  const reports = [...rows.values()];
  const anyRunning = reports.some((report) => report.status === 'running');
  const allSucceeded =
    reports.length > 0 &&
    reports.every((report) => report.status === 'succeeded');
  const icons: ReactElement[] = [];
  const seen = new Set<ElementType | string>();
  for (const { icon } of reports) {
    const type = iconType(icon);
    if (!type || seen.has(type) || !isValidElement(icon)) continue;
    seen.add(type);
    icons.push(icon);
    if (icons.length === 3) break;
  }

  return { registry, anyRunning, allSucceeded, icons };
}

/** A running row inside a group shows only its seconds; the header has the indicator. */
export function ChatToolCallGroupedTimer({
  elapsedMs,
}: {
  elapsedMs?: number;
}) {
  return (
    <ChatStateTimer
      visible
      running
      elapsedMs={elapsedMs}
      precision="seconds"
      format="seconds"
    />
  );
}
