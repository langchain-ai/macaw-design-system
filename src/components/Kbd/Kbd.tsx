import { forwardRef, isValidElement } from 'react';

import { cn } from '../../utils/cn';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Color scheme. `inherit` adopts the ambient text color, for chips on colored/dark surfaces. */
  variant?: 'default' | 'inherit';
  /** Key content — a label string or an icon element. */
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<KbdProps['variant']>, string> = {
  default: 'border-subtle text-tertiary',
  inherit: 'border-current bg-transparent text-current',
};

const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const isSingleGlyph =
      isValidElement(children) ||
      (typeof children === 'string' && Array.from(children).length === 1);

    return (
      <kbd
        ref={ref}
        className={cn(
          'box-border inline-flex items-center justify-center rounded-xs border font-sans text-[0.625rem] font-medium leading-none',
          isSingleGlyph ? 'size-4 px-0' : 'h-4 min-w-4 px-space-1',
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';

interface KbdGroupProps extends React.HTMLAttributes<HTMLElement> {
  /** The `Kbd` chips making up the shortcut, in order. */
  children?: React.ReactNode;
}

/** Groups multiple `Kbd` chips into a single keyboard shortcut, e.g. `⌘ K`. */
const KbdGroup = forwardRef<HTMLElement, KbdGroupProps>(
  ({ className, children, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn('inline-flex items-center gap-space-1', className)}
      {...props}
    >
      {children}
    </kbd>
  )
);

KbdGroup.displayName = 'KbdGroup';

export { Kbd, KbdGroup };
export type { KbdProps, KbdGroupProps };
