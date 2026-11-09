import {
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

import type { ChatStateStatus } from '../ChatState';
import { ChatStateTimer } from '../ChatState/ChatStateTimer';

interface RowReport {
  status: ChatStateStatus;
  /** Host-supplied icon; defaults like the wrench are not reported. */
  icon?: ReactNode;
}

interface GroupRegistry {
  update: (id: string, report: RowReport) => void;
  remove: (id: string) => void;
}

export const ChatToolCallGroupContext = createContext<GroupRegistry | null>(
  null
);

const iconType = (icon: ReactNode) => isValidElement(icon) && icon.type;

/**
 * Reports a row's status and icon to the enclosing group, which shows the
 * combined status on its header. Returns whether the row is inside a group.
 */
export function useReportToGroup({ status, icon }: RowReport) {
  const registry = useContext(ChatToolCallGroupContext);
  const id = useId();
  useLayoutEffect(() => {
    registry?.update(id, { status, icon });
  }, [registry, id, status, icon]);
  useLayoutEffect(() => () => registry?.remove(id), [registry, id]);
  return registry !== null;
}

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
  const anyRunning = reports.some((report) => report.status === 'streaming');
  const allSucceeded =
    reports.length > 0 &&
    reports.every((report) => report.status === 'completed');
  const icons: ReactElement[] = [];
  const seen = new Set<ReactElement['type']>();
  for (const { icon } of reports) {
    if (!isValidElement(icon) || seen.has(icon.type)) continue;
    seen.add(icon.type);
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
