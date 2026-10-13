import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useShowChildren({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [showChildren, setShowChildren] = useState<ReactNode>(children);
  useIsomorphicLayoutEffect(() => {
    if (open) setShowChildren(children);
  }, [open, children]);
  return showChildren;
}
