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
  xs: { name: 'xs', rem: 1.25, heightClassName: 'h-5' },
  sm: { name: 'sm', rem: 1.5, heightClassName: 'h-6' },
  md: { name: 'md', rem: 2, heightClassName: 'h-8' },
  lg: { name: 'lg', rem: 2.5, heightClassName: 'h-10' },
} as const;

/** @knipignore Public family type for components adopting this contract. */
export type ControlSize = keyof typeof CONTROL_SIZES;

/**
 * Components: Checkbox, RadioButton, RadioGroupItem, RadioCard, Switch,
 * and Slider. Applies to indicator geometry, not intrinsic row/card height.
 */
export const SELECTION_CONTROL_SIZES = {
  xs: { name: 'xs', rem: 0.75, className: 'size-3' },
  sm: { name: 'sm', rem: 1, className: 'size-4' },
  md: { name: 'md', rem: 1.25, className: 'size-5' },
} as const;

/** @knipignore Public family type for components adopting this contract. */
export type SelectionControlSize = keyof typeof SELECTION_CONTROL_SIZES;

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
