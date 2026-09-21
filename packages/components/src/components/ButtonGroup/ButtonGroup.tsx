import type { MouseEventHandler } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import { cn } from '../../utils/cn';
import type { ControlSize } from '../../utils/componentSizes';
import type { ButtonProps } from '../Button';
import type { IconButtonProps } from '../IconButton';

type ButtonGroupSize = Exclude<ControlSize, 'lg'>;

interface ButtonGroupProps {
  /** Button group color scheme to propagate to children */
  color?: 'primary' | 'secondary';
  /** Button group variant to propagate to children */
  variant?: 'normal' | 'outlined' | 'plain';
  /**
   * Control height: xs=20px, sm=24px, md=32px. Cloned onto direct React children.
   * Wrappers must forward it; otherwise set the same size on their inner controls.
   */
  size?: ButtonGroupSize;
  /** Additional CSS classes */
  className?: string;
  /**
   * Button or IconButton controls, optionally inside wrappers that render no
   * extra DOM element. PopoverTrigger/DropdownMenuTrigger with asChild forward
   * group props; Tooltip requires matching props on its inner control.
   */
  children: React.ReactNode;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

function ButtonGroup({
  color,
  variant,
  size,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
}: ButtonGroupProps) {
  const baseStyles = cn(
    'inline-flex items-stretch',
    '[&>*:not(:first-child)]:border-l-0', // Remove left border on all but first child
    '[&>*:not(:first-child):not(:last-child)]:rounded-none', // Remove border radius on middle children
    '[&>*:first-child]:rounded-r-none', // Remove right border radius on first child
    '[&>*:last-child]:rounded-l-none', // Remove left border radius on last child
    '[&>*:only-child]:rounded', // Preserve border radius when only one child
    className
  );

  const clonedChildren = Children.map(children, (child) => {
    if (isValidElement<ButtonProps | IconButtonProps>(child)) {
      // Replace direct-child props, including with undefined. Wrappers control
      // forwarding; Radix asChild gives explicitly set inner props precedence.
      const props: Partial<ButtonProps & IconButtonProps> = {
        color,
        size,
        variant,
      };

      return cloneElement(child, props);
    }
    return child;
  });

  return (
    <div
      className={baseStyles}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {clonedChildren}
    </div>
  );
}

ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup };
export type { ButtonGroupProps };
