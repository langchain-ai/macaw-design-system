import { useEffect, useRef } from 'react';

import { useDebouncedCallback } from 'use-debounce';

/**
 * Keep this hook in the owner of a resource's draft, above conditionally mounted
 * editors. Update the draft synchronously, then schedule its accepted value.
 * Commits run in order and survive unmount. Each callback must return a promise
 * covering the full write; it must settle before the next write starts.
 */
export function useDebouncedCommit<T>({
  onCommit,
  onError,
  delay,
}: {
  onCommit: (value: T) => void | Promise<unknown>;
  onError: (error: unknown) => void;
  delay: number;
}) {
  const pending = useRef<Promise<void> | null>(null);
  const commit = useDebouncedCallback(
    (value: T, commitValue: typeof onCommit, reportError: typeof onError) => {
      const run = async () => {
        try {
          await commitValue(value);
        } catch (error) {
          reportError(error);
        }
      };
      // Capture this value and callback before waiting for earlier writes.
      const completion = (pending.current ?? Promise.resolve()).then(run, run);
      pending.current = completion;
      return completion;
    },
    delay
  );

  useEffect(() => () => void commit.flush(), [commit]);

  return {
    schedule: (value: T) => {
      commit(value, onCommit, onError);
    },
    flush: commit.flush,
  };
}
