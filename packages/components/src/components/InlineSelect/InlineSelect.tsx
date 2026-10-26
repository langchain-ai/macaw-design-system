import { cn } from '../../utils/cn';
import { Badge } from '../Badge';
import { Select, type SelectSize } from '../Select';
import { Text } from '../Text';

export interface InlineSelectOption<T extends string> {
  value: T;
  label: string;
  /** A line under the label in the menu. */
  description?: string;
}

export interface InlineSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly InlineSelectOption<T>[];
  /**
   * The setting's own default. The menu marks it, and the trigger says
   * Default while it's still in use.
   */
  defaultValue?: T;
  /** Names the setting, e.g. "Dana's role". */
  'aria-label': string;
  disabled?: boolean;
  size?: SelectSize;
  /** The menu's width, as a class; it fits its options' descriptions. */
  menuClassName?: string;
  className?: string;
}

function DefaultTag({ disabled = false }: { disabled?: boolean }) {
  return (
    <Badge
      color="secondary"
      size="xxs"
      rounded="xs"
      className={cn('shrink-0', disabled && 'opacity-50')}
    >
      Default
    </Badge>
  );
}

/**
 * A borderless, content-sized select that reads as text in a row until
 * hovered, such as the `action` of an `AccordionItem`.
 */
export function InlineSelect<T extends string>({
  value,
  onChange,
  options,
  defaultValue,
  disabled = false,
  size = 'xs',
  menuClassName = 'w-64',
  className,
  'aria-label': ariaLabel,
}: InlineSelectProps<T>) {
  const isDefault = defaultValue != null && value === defaultValue;
  return (
    <Select<T>
      value={value}
      onChange={(next) => {
        if (next != null) onChange(next);
      }}
      options={options.map((option) => ({
        ...option,
        rightDecorator:
          option.value === defaultValue ? <DefaultTag /> : undefined,
      }))}
      disabled={disabled}
      size={size}
      aria-label={isDefault ? `${ariaLabel}, default` : ariaLabel}
      triggerVariant="plain"
      triggerClassName={cn('w-auto gap-space-1 px-space-1', className)}
      contentClassName={menuClassName}
      align="end"
      renderValue={(option) => (
        <span className="flex items-center gap-space-2">
          <Text as="span" variant={size === 'xs' ? 'xs' : 'sm'}>
            {option.label}
          </Text>
          {isDefault && <DefaultTag disabled={disabled} />}
        </span>
      )}
    />
  );
}
