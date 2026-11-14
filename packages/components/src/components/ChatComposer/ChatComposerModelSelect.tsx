import { useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { CheckIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import type { DataAttributes } from '../../utils/dataAttributes';
import { Icon } from '../Icon';
import { Select } from '../Select';
import type { SelectGroup, SelectOption, SelectProps } from '../Select';
import { Text } from '../Text';
import { ChatComposerContext } from './ChatComposerContext';

export interface ChatComposerModelOption<
  T extends string = string,
> extends SelectOption<T> {
  /** Provider or model mark, about 16px. The trigger shows it too. */
  icon?: ReactNode;
  /** Short status after the label, such as a `Badge` reading "Default". */
  badge?: ReactNode;
}

export interface ChatComposerModelGroup<T extends string = string> {
  /** Provider or tier name. Searching for it finds the group's models. */
  heading?: string;
  options: ChatComposerModelOption<T>[];
}

type ChatComposerModelSelectBaseProps<T extends string> = Pick<
  SelectProps<T>,
  | 'placeholder'
  | 'searchPlaceholder'
  | 'disabled'
  | 'size'
  | 'emptyText'
  | 'hideSearch'
  | 'disableFilter'
  | 'onSearchChange'
  | 'loading'
  | 'loadingRows'
  | 'onEndReached'
  | 'endReachedThresholdPx'
  | 'triggerClassName'
  | 'contentClassName'
  | 'footer'
  | 'side'
  | 'align'
  | 'onCloseAutoFocus'
  | 'aria-label'
  | 'data-testid'
> &
  DataAttributes & {
    /** Selected model. Omit it, and optionally pass `defaultValue`, to leave the selection to the component. */
    value?: T;
    /** Initial model when `value` is not controlled. */
    defaultValue?: T;
    /** Called with the newly chosen model. */
    onChange?: (value: T) => void;
    /** Controlled open state, for example to open the menu from a shortcut. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Replaces the selected model's label in the trigger. */
    renderValue?: (option: ChatComposerModelOption<T>) => ReactNode;
    /** Replaces the default row: icon, label, badge, description, and check. */
    renderOption?: (
      option: ChatComposerModelOption<T>,
      isSelected: boolean
    ) => ReactNode;
  };

export type ChatComposerModelSelectProps<T extends string = string> =
  ChatComposerModelSelectBaseProps<T> &
    (
      | { options: ChatComposerModelOption<T>[]; groups?: never }
      | { groups: ChatComposerModelGroup<T>[]; options?: never }
    );

const SEARCH_MIN_OPTIONS = 8;

function ModelOptionRow({
  option,
  selected,
  textVariant,
}: {
  option: ChatComposerModelOption;
  selected: boolean;
  textVariant: 'xs' | 'sm' | 'md';
}) {
  return (
    <>
      {option.icon != null && (
        <span
          aria-hidden
          className="flex size-4 shrink-0 items-center justify-center"
        >
          {option.icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-space-2">
          <Text as="span" variant={textVariant} className="truncate">
            {option.label ?? option.value}
          </Text>
          {option.badge != null && (
            <span className="flex shrink-0 items-center">{option.badge}</span>
          )}
        </span>
        {option.description && (
          <Text as="span" variant="xs" className="truncate text-tertiary">
            {option.description}
          </Text>
        )}
      </span>
      {option.rightDecorator != null && (
        <span className="ml-auto flex shrink-0 items-center">
          {option.rightDecorator}
        </span>
      )}
      <Icon
        icon={CheckIcon}
        size="md"
        className={cn('shrink-0', selected ? 'opacity-100' : 'opacity-0')}
      />
    </>
  );
}

/** A borderless model picker for a chat composer toolbar, inside `ChatComposer` or on its own. */
export function ChatComposerModelSelect<T extends string>({
  options,
  groups,
  value: controlledValue,
  defaultValue,
  onChange,
  open: controlledOpen,
  onOpenChange,
  disabled,
  hideSearch,
  triggerClassName,
  contentClassName,
  renderValue,
  renderOption,
  placeholder = 'Select a model',
  searchPlaceholder = 'Search models…',
  emptyText = 'No models found.',
  size = 'sm',
  side = 'top',
  onCloseAutoFocus,
  'aria-label': ariaLabel = 'Model',
  ...props
}: ChatComposerModelSelectProps<T>) {
  const composer = useContext(ChatComposerContext);
  const inComposer = composer != null;
  const isDisabled = Boolean(composer?.disabled || disabled);
  const choseModel = useRef(false);

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const searchGroups = useMemo<SelectGroup<T>[] | undefined>(
    () =>
      groups?.map(({ heading, options: groupOptions }) => ({
        heading,
        options: heading
          ? groupOptions.map((option) => ({
              ...option,
              keywords: [...(option.keywords ?? []), heading],
            }))
          : groupOptions,
      })),
    [groups]
  );
  const allOptions = useMemo<ChatComposerModelOption<T>[]>(
    () => (groups ? groups.flatMap((group) => group.options) : (options ?? [])),
    [groups, options]
  );
  const findOption = (option: SelectOption<T>): ChatComposerModelOption<T> =>
    allOptions.find((candidate) => candidate.value === option.value) ?? option;

  const textVariant = size === 'lg' ? 'md' : size;

  return (
    <div className="flex min-w-0 max-w-full items-center">
      <Select<T>
        {...props}
        {...(searchGroups ? { groups: searchGroups } : { options: allOptions })}
        value={value}
        open={open && !isDisabled}
        onOpenChange={setOpen}
        variant="plain"
        size={size}
        side={side}
        aria-label={ariaLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        hideSearch={hideSearch ?? allOptions.length < SEARCH_MIN_OPTIONS}
        disabled={isDisabled}
        contentClassName={cn('min-w-56', contentClassName)}
        triggerClassName={cn(
          inComposer ? 'px-space-1 @[440px]/composer:px-space-2' : 'px-space-2',
          isDisabled && 'bg-transparent dark:bg-transparent',
          triggerClassName
        )}
        renderValue={(selectedOption) => {
          const option = findOption(selectedOption);
          return (
            <span className="flex min-w-0 items-center gap-space-2">
              {option.icon != null && (
                <span
                  aria-hidden
                  className="flex size-4 shrink-0 items-center justify-center"
                >
                  {option.icon}
                </span>
              )}
              {inComposer && option.icon == null && (
                <Text
                  as="span"
                  variant={textVariant}
                  weight="normal"
                  className="inline-block shrink-0 @[440px]/composer:hidden"
                >
                  {ariaLabel}
                </Text>
              )}
              <span
                className={cn(
                  'min-w-0 truncate text-left',
                  inComposer && 'hidden @[440px]/composer:block'
                )}
              >
                {renderValue ? (
                  renderValue(option)
                ) : (
                  <Text as="span" variant={textVariant} weight="normal">
                    {option.label ?? option.value}
                  </Text>
                )}
              </span>
            </span>
          );
        }}
        renderOption={(selectOption, isSelected) => {
          const option = findOption(selectOption);
          return renderOption ? (
            renderOption(option, isSelected)
          ) : (
            <ModelOptionRow
              option={option}
              selected={isSelected}
              textVariant={textVariant}
            />
          );
        }}
        onChange={(next) => {
          if (isDisabled || next === undefined) return;
          choseModel.current = true;
          if (next === value) return;
          if (controlledValue === undefined) setUncontrolledValue(next);
          onChange?.(next);
        }}
        // After a choice in a composer, continue in the message. Escape and
        // outside clicks keep the default.
        onCloseAutoFocus={(event) => {
          const continueInInput = choseModel.current;
          choseModel.current = false;
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          if (continueInInput && composer?.inputFocusRef?.current?.()) {
            event.preventDefault();
          }
        }}
      />
    </div>
  );
}
