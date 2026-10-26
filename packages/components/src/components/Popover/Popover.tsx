import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils/cn';
import { useZIndex } from '../../utils/useZIndex';
import { ZIndexProvider } from '../../utils/ZIndexContext';
import zIndices from '../../utils/zIndices';
import { useDialogContainer } from '../Dialog';
import { popoverSurfaceClassName } from './constants';

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverArrow = forwardRef<
  ElementRef<typeof PopoverPrimitive.Arrow>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, asChild, children, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn(
      'overflow-visible fill-popover stroke-subtle',
      !asChild && '-translate-y-px',
      className
    )}
    {...props}
    asChild
  >
    {asChild ? (
      children
    ) : (
      <svg>
        <polygon points="0,0 30,0 15,10" stroke="none" />
        <polyline
          points="0,0 15,10 30,0"
          fill="none"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )}
  </PopoverPrimitive.Arrow>
));
PopoverArrow.displayName = 'PopoverArrow';

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /**
     * Portal target for the popover. When omitted, the popover automatically
     * portals into the enclosing modal `Dialog` (if any) so it stays
     * mouse-interactive, and falls back to `document.body` otherwise.
     */
    container?: HTMLElement | null;
  }
>(
  (
    {
      className,
      align = 'center',
      sideOffset = 4,
      forceMount,
      container,
      children,
      ...props
    },
    ref
  ) => {
    const zIndex = useZIndex(zIndices.popover);
    // Portal into the enclosing modal Dialog (null when not inside one) so the
    // popover stays inside the dialog's pointer-events-interactive region.
    const dialogContainer = useDialogContainer();

    return (
      <PopoverPrimitive.Portal
        forceMount={forceMount}
        // Fall back to `undefined` (not `null`) when there is no dialog: Radix's
        // Portal only defaults to `document.body` when `container` is absent, so
        // an explicit `null` leaves non-forceMount popovers unrendered.
        container={container ?? dialogContainer ?? undefined}
      >
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          forceMount={forceMount}
          className={cn(popoverSurfaceClassName, className)}
          collisionBoundary={dialogContainer ?? undefined}
          {...props}
          style={{ zIndex, ...props.style }}
        >
          <ZIndexProvider value={zIndex}>{children}</ZIndexProvider>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
