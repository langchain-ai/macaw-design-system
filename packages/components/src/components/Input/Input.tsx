import type { ComponentProps, ReactNode } from 'react';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { CalendarBlankIcon } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { PaperclipIcon } from '@phosphor-icons/react/dist/ssr/Paperclip';

import { cn } from '../../utils/cn';
import { CONTROL_ICON_SIZES } from '../../utils/controlIconSizes';
import type { IconComponent } from '../../utils/icon-types';
import { mergeRefs } from '../../utils/merge-refs';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import {
  DECORATOR_CLASSES,
  getInputContainerClasses,
  getInputElementClasses,
  INPUT_TEXT_CLASSES,
} from './inputStyles';
import type { InputSize } from './inputStyles';

export type InputIconAction = Pick<
  ComponentProps<typeof IconButton>,
  'icon' | 'label' | 'disabled' | 'tooltipProps'
> & {
  onClick: NonNullable<ComponentProps<typeof IconButton>['onClick']>;
};

export interface InputProps {
  /** Exact outer height. The default lg tier preserves the legacy 40px field. */
  size?: InputSize;
  variant?: 'outlined' | 'plain';
  /** Decorative icon. Input owns its size and color. */
  leftIcon?: IconComponent;
  /** Decorative icon. Input owns its size and color. */
  rightIcon?: IconComponent;
  /** Plain icon button. Takes precedence over leftIcon. */
  leftAction?: InputIconAction;
  /** Plain icon button. Takes precedence over rightIcon; precedes the password toggle. */
  rightAction?: InputIconAction;
  /** Custom content; overrides leftIcon/leftAction and the default file icon. */
  leftDecorator?: ReactNode;
  /** Custom content; overrides rightIcon/rightAction. The password toggle remains last. */
  rightDecorator?: ReactNode;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input has an error state */
  isError?: boolean;
  /** Label text displayed above the input */
  label?: string | ReactNode;
  /** Hint text displayed below the input */
  hintText?: string;
  /** Current input value */
  value?: string | null;
  /** Change handler that will be debounced */
  onChange: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Placeholder text */
  placeholder?: string;
  /**
   * Input type. Limited to the "text-like" native types that share this
   * component's styled-text rendering and string value contract. `password`
   * renders a masked secret field with a show/hide toggle. `date` uses the
   * browser's native date picker; its value is a `YYYY-MM-DD` string.
   * `datetime-local` uses the native date+time picker; its value is a
   * `YYYY-MM-DDTHH:mm` string in the viewer's local time. `file` is
   * uncontrolled: read the selection from `event.target.files` on the change
   * event, and scope it with `accept`/`multiple`.
   */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'url'
    | 'date'
    | 'datetime-local'
    | 'file';
  /** Debounce delay in milliseconds (default: 300). Ignored for `type="file"`. */
  debounceMs?: number;
  /** Additional CSS classes */
  className?: string;
  /** Input ID for accessibility */
  id?: string;
  /** Input name for forms */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** CSS class for the input container */
  inputContainerClassName?: string;
  /**
   * Which files the picker offers, as a comma-separated list of extensions or
   * MIME types (`'.csv,.json'`, `'image/*'`). `type="file"` only. The browser
   * treats this as a filter, not a guarantee — validate the selection too.
   */
  accept?: string;
  /** Whether more than one file can be picked. `type="file"` only. */
  multiple?: boolean;
}

function InputIconSlot({
  icon,
  action,
  size,
  disabled,
}: {
  icon?: IconComponent;
  action?: InputIconAction;
  size: InputSize;
  disabled: boolean;
}) {
  const isDisabled = disabled || action?.disabled;
  const colorClassName = isDisabled
    ? 'text-icon-disabled'
    : 'text-icon-secondary';

  return action ? (
    <IconButton
      {...action}
      color="secondary"
      variant="plain"
      size={CONTROL_ICON_SIZES[size].buttonSize}
      className={colorClassName}
      iconWeight="regular"
      disabled={isDisabled}
      onMouseDown={(event) => event.preventDefault()}
    />
  ) : icon ? (
    <Icon
      aria-hidden
      icon={icon}
      iconClassName={CONTROL_ICON_SIZES[size].iconClassName}
      className={colorClassName}
      weight="regular"
    />
  ) : null;
}

function FileSelection({
  size,
  fileNames,
  placeholder,
}: {
  size: InputSize;
  fileNames: string[];
  placeholder?: string;
}) {
  const summary =
    fileNames.length > 1 ? `${fileNames.length} files selected` : fileNames[0];
  const textClasses = INPUT_TEXT_CLASSES[size];

  return (
    <>
      <Text
        aria-hidden
        as="span"
        className={cn(
          textClasses,
          'min-w-0 flex-1 truncate',
          summary ? 'text-primary' : 'text-placeholder'
        )}
      >
        {summary ?? placeholder ?? 'No file selected'}
      </Text>
      <Text
        aria-hidden
        as="span"
        weight="medium"
        className={cn(textClasses, 'shrink-0 text-secondary')}
      >
        Browse
      </Text>
    </>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputProps &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof InputProps>
>(
  (
    {
      size = 'lg',
      variant = 'outlined',
      leftIcon,
      rightIcon,
      leftAction,
      rightAction,
      leftDecorator,
      rightDecorator,
      disabled = false,
      isError = false,
      label,
      hintText,
      value,
      onChange,
      placeholder,
      type = 'text',
      debounceMs = 0,
      className,
      inputContainerClassName,
      id,
      name,
      required = false,
      autoFocus = false,
      accept,
      multiple,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hintTextId = `${inputId}-hint`;
    const describedBy =
      [hintText ? hintTextId : undefined, ariaDescribedBy]
        .filter(Boolean)
        .join(' ') || undefined;
    const shouldDebounce = debounceMs > 0;
    const isFileInput = type === 'file';
    const isPasswordInput = type === 'password';
    const isDateInput = type === 'date' || type === 'datetime-local';
    const [internalValue, setInternalValue] = useState(value);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
    const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!shouldDebounce) return;
      return () => debouncedOnChange.flush();
    }, [shouldDebounce, debouncedOnChange]);

    // Skip the click forwarded below, which would otherwise re-enter here.
    const openFilePicker = (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (
        disabled ||
        (target instanceof Element &&
          target.closest(
            'button, a, input, select, textarea, summary, [role="button"], [role="link"], [contenteditable="true"]'
          ))
      ) {
        return;
      }
      fileInputRef.current?.click();
    };

    useEffect(() => {
      if (shouldDebounce) setInternalValue(value);
    }, [shouldDebounce, value]);

    useEffect(() => {
      if (!isPasswordInput) {
        setIsPasswordVisible(false);
      }
    }, [isPasswordInput]);

    useEffect(() => {
      const form = isFileInput ? fileInputRef.current?.form : null;
      if (!form) return;

      const clearFileSelection = () => setSelectedFileNames([]);
      form.addEventListener('reset', clearFileSelection);
      return () => form.removeEventListener('reset', clearFileSelection);
    }, [isFileInput]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (isFileInput) {
        onChange(newValue, e);
        setSelectedFileNames(
          Array.from(e.target.files ?? []).map((file) => file.name)
        );
        return;
      }

      if (shouldDebounce) {
        setInternalValue(newValue);
        debouncedOnChange(newValue);
      } else {
        onChange(newValue, e);
      }
    };

    const inputContainerClasses = getInputContainerClasses({
      size,
      variant,
      isError,
      disabled,
      className: inputContainerClassName,
    });

    const inputClasses = isFileInput
      ? 'sr-only'
      : getInputElementClasses({
          size,
          disabled,
          className: cn(
            isPasswordInput && !isPasswordVisible && 'text-security',
            isDateInput && [
              'supports-[selector(input::-webkit-calendar-picker-indicator)]:[&::-webkit-calendar-picker-indicator]:size-[var(--control-icon-size)]',
              'supports-[selector(input::-webkit-calendar-picker-indicator)]:[&::-webkit-calendar-picker-indicator]:m-0',
              'supports-[selector(input::-webkit-calendar-picker-indicator)]:[&::-webkit-calendar-picker-indicator]:p-0',
              'supports-[selector(input::-webkit-calendar-picker-indicator)]:[&::-webkit-calendar-picker-indicator]:opacity-0',
            ]
          ),
        });

    const effectiveLeftIcon =
      leftIcon ?? (isFileInput ? PaperclipIcon : undefined);
    const hasCustomLeftDecorator = leftDecorator != null;
    const hasCustomRightDecorator = rightDecorator != null;
    const effectiveLeftDecorator =
      leftDecorator ??
      (effectiveLeftIcon || leftAction ? (
        <InputIconSlot
          icon={effectiveLeftIcon}
          action={leftAction}
          size={size}
          disabled={disabled}
        />
      ) : null);
    const rightContent =
      rightDecorator ??
      (rightIcon || rightAction ? (
        <InputIconSlot
          icon={rightIcon}
          action={rightAction}
          size={size}
          disabled={disabled}
        />
      ) : null);
    // Offset only known edge buttons by their glyph inset, including the border.
    const leftActionOffset =
      !hasCustomLeftDecorator && leftAction
        ? CONTROL_ICON_SIZES[size].actionOffset
        : undefined;
    const rightActionOffset =
      isPasswordInput || (!hasCustomRightDecorator && rightAction)
        ? CONTROL_ICON_SIZES[size].actionOffset
        : undefined;
    const effectiveRightDecorator =
      rightContent || isPasswordInput ? (
        <>
          {rightContent}
          {isPasswordInput && (
            <InputIconSlot
              size={size}
              disabled={disabled}
              action={{
                icon: isPasswordVisible ? EyeSlashIcon : EyeIcon,
                label: 'toggle password visibility',
                tooltipProps: { disabled: true },
                onClick: () => setIsPasswordVisible((show) => !show),
              }}
            />
          )}
        </>
      ) : null;

    const nativeInput = (
      // eslint-disable-next-line react/forbid-elements
      <input
        ref={isFileInput ? mergeRefs([fileInputRef, ref]) : ref}
        id={inputId}
        name={name ?? (typeof label === 'string' ? label : undefined)}
        type={
          isPasswordInput ? (isPasswordVisible ? 'text' : 'password') : type
        }
        value={
          isFileInput
            ? undefined
            : shouldDebounce
              ? (internalValue ?? '')
              : value === null
                ? ''
                : value
        }
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        accept={accept}
        multiple={multiple}
        aria-describedby={describedBy}
        aria-invalid={isError || undefined}
        className={inputClasses}
        {...rest}
      />
    );

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <Text
            as="label"
            htmlFor={inputId}
            className={cn(
              'mb-space-1 block text-sm font-medium text-primary',
              disabled && 'text-disabled'
            )}
            variant="xs"
          >
            {label}
            {required && (
              <span className="ml-space-1 text-error-secondary">*</span>
            )}
          </Text>
        )}

        <div
          className={cn(
            inputContainerClasses,
            isFileInput && !disabled && 'cursor-pointer'
          )}
          onClick={isFileInput ? openFilePicker : undefined}
        >
          {effectiveLeftDecorator && (
            <div
              className={DECORATOR_CLASSES}
              style={{ marginInlineStart: leftActionOffset }}
            >
              {effectiveLeftDecorator}
            </div>
          )}

          {isFileInput && (
            <FileSelection
              size={size}
              fileNames={selectedFileNames}
              placeholder={placeholder}
            />
          )}

          {isDateInput ? (
            <div
              className={cn(
                'relative flex min-w-0 flex-1 items-center',
                CONTROL_ICON_SIZES[size].sizeVariableClassName
              )}
            >
              {nativeInput}
              {/* The native picker target stays interactive beneath this glyph. */}
              <span className="pointer-events-none absolute inset-y-0 end-0 hidden items-center supports-[selector(input::-webkit-calendar-picker-indicator)]:flex">
                <InputIconSlot
                  icon={CalendarBlankIcon}
                  size={size}
                  disabled={disabled}
                />
              </span>
            </div>
          ) : (
            nativeInput
          )}

          {effectiveRightDecorator && (
            <div
              className={cn(DECORATOR_CLASSES, 'gap-space-1')}
              style={{ marginInlineEnd: rightActionOffset }}
            >
              {effectiveRightDecorator}
            </div>
          )}
        </div>

        {hintText && (
          <Text
            id={hintTextId}
            className={cn(
              'mt-space-1 text-xs',
              isError ? 'text-error-secondary' : 'text-tertiary'
            )}
            variant="xs"
            weight="normal"
          >
            {hintText}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
