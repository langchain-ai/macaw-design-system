import { cn } from '../../utils/cn';
import { Select } from '../Select';
import type { SelectProps } from '../Select';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import { useChatComposerContext } from './ChatComposerContext';

export type ChatComposerModelSelectProps<T extends string = string> =
  SelectProps<T>;

export function ChatComposerModelSelect<T extends string>({
  disabled,
  triggerClassName,
  renderValue,
  placeholder = 'Select...',
  size = 'sm',
  onChange,
  ...props
}: ChatComposerModelSelectProps<T>) {
  const composer = useChatComposerContext();

  const options =
    props.groups?.flatMap((group) => group.options) ?? props.options ?? [];
  const selectedOption = options.find((option) => option.value === props.value);
  const label = selectedOption?.label ?? selectedOption?.value ?? placeholder;
  return (
    // Narrow composers show "Model" and wide ones can truncate the name.
    <Tooltip title={label}>
      <div className="flex min-w-0 max-w-full items-center">
        <Select
          aria-label="Model"
          size={size}
          side="top"
          hideSearch={false}
          searchPlaceholder="Search models…"
          {...props}
          placeholder={placeholder}
          renderValue={(option) => (
            <>
              <Text
                as="span"
                variant={size === 'lg' ? 'md' : size}
                weight="normal"
                className="inline-block shrink-0 @[440px]/composer:hidden"
              >
                Model
              </Text>
              <span className="hidden min-w-0 truncate text-left @[440px]/composer:block">
                {renderValue ? (
                  renderValue(option)
                ) : (
                  <Text
                    as="span"
                    variant={size === 'lg' ? 'md' : size}
                    weight="normal"
                  >
                    {option.label ?? option.value}
                  </Text>
                )}
              </span>
            </>
          )}
          disabled={composer.disabled || disabled}
          triggerClassName={cn(
            'max-w-full gap-space-1 border-0 bg-transparent px-space-1 shadow-none @[440px]/composer:px-space-2',
            triggerClassName
          )}
          onChange={(value) => {
            if (!composer.disabled && !disabled) onChange(value);
          }}
        />
      </div>
    </Tooltip>
  );
}
