import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';

import { cn } from '../../utils/cn';

/** The 16px slot centers the caret on the same line as a 16px status icon. */
export function ChatToolCallCaret({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none flex size-4 shrink-0 items-center justify-center"
    >
      <CaretRightIcon
        size={12}
        weight="regular"
        className={cn(
          'shrink-0 text-icon-tertiary transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          open ? 'rotate-90 duration-normal' : 'duration-[150ms]'
        )}
      />
    </span>
  );
}
