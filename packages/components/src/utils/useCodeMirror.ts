import { useEffect, useState } from 'react';

import {
  type CMBundle,
  getCodeMirror,
  loadCodeMirror,
} from './lazy-codemirror-loader';

/**
 * Loads CodeMirror when enabled and returns the cached bundle or null.
 * Initializes synchronously from cache if CM was already loaded (no flicker
 * on subsequent mounts after the first load).
 */
export function useCodeMirror(enabled = true): CMBundle | null {
  const [cm, setCm] = useState<CMBundle | null>(() => getCodeMirror());

  useEffect(() => {
    if (!enabled || cm) return;

    let cancelled = false;

    loadCodeMirror()
      .then((loaded) => {
        if (!cancelled) setCm(loaded);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load CodeMirror:', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cm, enabled]);

  return cm;
}
