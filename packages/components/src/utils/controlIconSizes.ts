import type { IconButtonProps } from '../components/IconButton';
import type { ControlSize } from './componentSizes';

/** Glyph sizes and plain icon-button insets for Input, Select, and Typeahead. */
export const CONTROL_ICON_SIZES: Record<
  ControlSize,
  {
    buttonSize: NonNullable<IconButtonProps['size']>;
    iconClassName: string;
    sizeVariableClassName: string;
    /** Outward offset by the button's glyph inset, including its border. */
    actionOffset: string;
  }
> = {
  xs: {
    buttonSize: 'xxs',
    iconClassName: 'size-3',
    sizeVariableClassName: '[--control-icon-size:0.75rem]',
    actionOffset: '-0.125rem',
  },
  sm: {
    buttonSize: 'xs',
    iconClassName: 'size-3.5',
    sizeVariableClassName: '[--control-icon-size:0.875rem]',
    actionOffset: 'calc(-0.125rem - 1px)',
  },
  md: {
    buttonSize: 'sm',
    iconClassName: 'size-4',
    sizeVariableClassName: '[--control-icon-size:1rem]',
    actionOffset: 'calc(-0.25rem - 1px)',
  },
  lg: {
    buttonSize: 'md',
    iconClassName: 'size-4',
    sizeVariableClassName: '[--control-icon-size:1rem]',
    actionOffset: 'calc(-0.5rem - 1px)',
  },
};
