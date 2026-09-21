/**
 * Named outer-size contracts shared by related design-system components.
 *
 * Each family owns its supported tiers. Do not combine these into a universal
 * size type: the same name is meaningful only within its component family.
 */
/** Components: Decorated Icon, Avatar, and Spinner. */
export const VISUAL_ELEMENT_SIZES = {
  xxs: { name: 'xxs', rem: 0.75, className: 'size-3' },
  xs: { name: 'xs', rem: 1, className: 'size-4' },
  sm: { name: 'sm', rem: 1.25, className: 'size-5' },
  md: { name: 'md', rem: 1.5, className: 'size-6' },
} as const;

export type VisualElementSize = keyof typeof VISUAL_ELEMENT_SIZES;

/**
 * Components: Button, IconButton, ButtonGroup, CopyButton, Input,
 * CommandInput, Select, Typeahead, and GroupedTabs.
 */
export const CONTROL_SIZES = {
  xs: {
    name: 'xs',
    rem: 1.25,
    heightClassName: 'h-5',
    minHeightClassName: 'min-h-5',
  },
  sm: {
    name: 'sm',
    rem: 1.5,
    heightClassName: 'h-6',
    minHeightClassName: 'min-h-6',
  },
  md: {
    name: 'md',
    rem: 2,
    heightClassName: 'h-8',
    minHeightClassName: 'min-h-8',
  },
  lg: {
    name: 'lg',
    rem: 2.5,
    heightClassName: 'h-10',
    minHeightClassName: 'min-h-10',
  },
} as const;

export type ControlSize = keyof typeof CONTROL_SIZES;

/**
 * Components: Checkbox, RadioButton, Switch, and RadioCard support every tier.
 * RadioGroupItem and Slider retain intrinsic/default geometry. Applies to
 * indicator geometry, not intrinsic row/card height.
 */
export const SELECTION_CONTROL_SIZES = {
  sm: {
    name: 'sm',
    rem: 1,
    className: 'size-4',
    heightClassName: 'h-4',
  },
  md: {
    name: 'md',
    rem: 1.25,
    className: 'size-5',
    heightClassName: 'h-5',
  },
} as const;

export type SelectionControlSize = keyof typeof SELECTION_CONTROL_SIZES;

/**
 * Keeps compact visual indicators at least 24px pointer targets without
 * changing their layout geometry.
 */
export const SELECTION_CONTROL_HIT_AREA_STYLES = `relative after:absolute after:left-1/2 after:top-1/2 after:min-h-6 after:min-w-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']`;

/**
 * Components: CommandItem, DropdownMenuItem, DropdownMenuSubTrigger,
 * ContextMenuItem, SelectItem, and Typeahead option/create-option rows.
 */
export const OPTION_ROW_SIZES = {
  sm: { name: 'sm', rem: 1.5, minHeightClassName: 'min-h-6' },
  md: { name: 'md', rem: 2, minHeightClassName: 'min-h-8' },
} as const;

/** @knipignore Public family type for components adopting this contract. */
export type OptionRowSize = keyof typeof OPTION_ROW_SIZES;
