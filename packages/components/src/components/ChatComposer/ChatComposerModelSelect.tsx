import { useRef } from 'react';

import { cn } from '../../utils/cn';
import { Select } from '../Select';
import type { SelectProps } from '../Select';
import { Text } from '../Text';
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
  onCloseAutoFocus,
  ...props
}: ChatComposerModelSelectProps<T>) {
  const composer = useChatComposerContext();
  const choseModel = useRef(false);

  return (
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
          if (composer.disabled || disabled) return;
          choseModel.current = true;
          onChange(value);
        }}
        // After a choice, continue in the message. Escape and outside clicks
        // keep the default.
        onCloseAutoFocus={(event) => {
          const continueInInput = choseModel.current;
          choseModel.current = false;
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          if (continueInInput && composer.inputFocusRef?.current?.()) {
            event.preventDefault();
          }
        }}
      />
    </div>
  );
}
