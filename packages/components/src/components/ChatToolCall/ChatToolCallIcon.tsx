import type { ReactNode } from 'react';

/** Leading 12px icon slot shared by tool calls and reasoning rows. */
export function ChatToolCallIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-3 shrink-0 items-center justify-center text-icon-tertiary [&_svg]:size-3"
    >
      {children}
    </span>
  );
}
