import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '../../utils/cn';

const EASE_OUT = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

interface ChatToolCallCollapseProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'id' | 'role' | 'aria-label'
> {
  open: boolean;
  /** Keep children mounted (hidden) while closed, preserving their state. */
  keepMounted?: boolean;
  /** Applied to the content wrapper. */
  className?: string;
  children: ReactNode;
}

/** Animates height through `grid-template-rows`, so any content height works. */
export function ChatToolCallCollapse({
  open,
  keepMounted = false,
  className,
  children,
  ...props
}: ChatToolCallCollapseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  // Content that is open on first render is already at rest, so it only
  // animates in after it has been closed once.
  const [animateEnter, setAnimateEnter] = useState(!open);

  // Content is clipped only while moving or closed, so focus rings of rows
  // inside an open region aren't cut off.
  const [transitioning, setTransitioning] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(open);

  if (open && !present) setPresent(true);
  if (!open && !animateEnter) setAnimateEnter(true);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    setTransitioning(true);
  }

  useEffect(() => {
    if (!transitioning) return;
    const finish = () => {
      setTransitioning(false);
      if (!open) setPresent(false);
    };
    const element = ref.current;
    if (!element) {
      finish();
      return;
    }
    const style = getComputedStyle(element);
    // Reduced motion sets `transition-property: none` but keeps the duration.
    const seconds =
      style.transitionProperty === 'none'
        ? 0
        : Number.parseFloat(style.transitionDuration) || 0;
    if (seconds === 0) {
      finish();
      return;
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      if (
        event.target === element &&
        event.propertyName === 'grid-template-rows'
      ) {
        finish();
      }
    };
    element.addEventListener('transitionend', onTransitionEnd);
    const timeout = window.setTimeout(finish, seconds * 1000 + 50);
    return () => {
      element.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(timeout);
    };
  }, [open, transitioning]);

  if (!present && !keepMounted) return null;

  return (
    <div
      {...props}
      ref={ref}
      data-state={open ? 'open' : 'closed'}
      hidden={!open && !present}
      inert={!open}
      className={cn(
        'min-w-0 transition-[grid-template-rows] motion-reduce:transition-none',
        (open || present) && 'grid',
        EASE_OUT,
        open
          ? 'grid-rows-[1fr] duration-normal'
          : 'grid-rows-[0fr] duration-[150ms]',
        open && animateEnter && 'starting:grid-rows-[0fr]'
      )}
    >
      <div
        className={cn(
          'min-h-0 min-w-0',
          (!open || transitioning) && 'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'transition-[opacity,translate] motion-reduce:transition-none',
            open
              ? cn(
                  'translate-y-0 opacity-100 duration-normal',
                  EASE_OUT,
                  animateEnter && 'starting:-translate-y-1 starting:opacity-0'
                )
              : '-translate-y-1 opacity-0 duration-[120ms] ease-in',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
