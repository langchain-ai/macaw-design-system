import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import zIndices from './zIndices';

type Entry = { id: string; parentId?: string };
function createModalStack() {
  let entries: Entry[] = [];
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => entries,
    register(entry: Entry) {
      entries = [...entries, entry];
      emit();
      return () => {
        entries = entries.filter(({ id }) => id !== entry.id);
        emit();
      };
    },
  };
}
const StackContext = createContext<ReturnType<typeof createModalStack> | null>(
  null
);
const emptyEntries: Entry[] = [];
const subscribeToNothing = () => () => {};
const getEmptyEntries = () => emptyEntries;

/** Limits a scope to its base modal and one foreground modal. Further dialogs
 * replace the foreground layer until dismissed, preserving mounted form state. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack] = useState(createModalStack);
  return (
    <StackContext.Provider value={stack}>{children}</StackContext.Provider>
  );
}

type ModalLayer = {
  id: string;
  open: boolean;
  suspended: boolean;
  zIndex: number | undefined;
  backdropStyle: { backgroundColor: string } | undefined;
};

export function useModalLayer(open: boolean): ModalLayer {
  const stack = useContext(StackContext);
  const parentId = useContext(ModalLayerContext)?.id;
  const id = useId();
  const entries = useSyncExternalStore(
    stack?.subscribe ?? subscribeToNothing,
    stack?.getSnapshot ?? getEmptyEntries,
    getEmptyEntries
  );
  // Resolve visible layers before paint so a third modal never flashes underneath.
  useLayoutEffect(() => {
    if (open && stack) return stack.register({ id, parentId });
  }, [open, stack, id, parentId]);
  // Descendant effects may register before their parents on the initial mount.
  const ordered: Entry[] = [];
  const visit = (entry: Entry) => {
    ordered.push(entry);
    entries.filter((child) => child.parentId === entry.id).forEach(visit);
  };
  entries
    .filter((entry) => !entries.some((parent) => parent.id === entry.parentId))
    .forEach(visit);
  const index = ordered.findIndex((entry) => entry.id === id);
  const suspended = open && index > 0 && index < ordered.length - 1;
  useLayoutEffect(() => {
    if (!suspended) return;
    const target =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [suspended]);
  return {
    id,
    open,
    suspended,
    zIndex: stack ? zIndices.dialogOverlay + Math.max(index, 0) * 2 : undefined,
    backdropStyle: stack
      ? {
          backgroundColor:
            index <= 0
              ? 'color-mix(in srgb, var(--bg-overlay) 75%, transparent)'
              : 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)',
        }
      : undefined,
  };
}

export const ModalLayerContext = createContext<ModalLayer | null>(null);
export function ModalLayerProvider({
  layer,
  children,
}: {
  layer: ModalLayer;
  children: ReactNode;
}) {
  return (
    <ModalLayerContext.Provider value={layer}>
      {children}
    </ModalLayerContext.Provider>
  );
}
export function useCurrentModalLayer() {
  return useContext(ModalLayerContext);
}
