import { useEffect, useState } from 'react';

import {
  type CMBundle,
  getCodeMirror,
  loadCodeMirror,
} from './lazy-codemirror-loader';

/**
 * Returns the CodeMirror bundle once loaded, or null if still loading.
 * Initializes synchronously from cache if CM was already loaded (no flicker
 * on subsequent mounts after the first load).
 */
export function useCodeMirror(): CMBundle | null {
  const [cm, setCm] = useState<CMBundle | null>(() => getCodeMirror());

  useEffect(() => {
    if (cm) return;

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
  }, [cm]);

  return cm;
}
