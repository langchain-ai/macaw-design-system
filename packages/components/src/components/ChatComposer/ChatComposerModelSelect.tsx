import { useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { CheckIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Select } from '../Select';
import type { SelectOption, SelectProps } from '../Select';
import { Text } from '../Text';
import { ChatComposerContext } from './ChatComposerContext';

export interface ChatComposerModelOption<
  T extends string = string,
> extends SelectOption<T> {
  /** Host-supplied provider or tier mark, also shown in the trigger. */
  icon?: ReactNode;
  /** Short status beside the label, such as a `Badge` reading "Default". */
  badge?: ReactNode;
}

export interface ChatComposerModelGroup<T extends string = string> {
  /** Provider or tier name. Searching for it finds the group's models. */
  heading?: string;
  options: ChatComposerModelOption<T>[];
}

export type ChatComposerModelSelectProps<T extends string = string> = Omit<
  SelectProps<T>,
  'options' | 'groups' | 'renderValue' | 'renderOption' | 'selectedOption'
> & {
  /** Selected model metadata when it is absent from paginated or filtered options. */
  selectedOption?: ChatComposerModelOption<T>;
  /** Replaces the selected model's label, preserving its icon. */
  renderValue?: (option: ChatComposerModelOption<T>) => ReactNode;
  /** Replaces the whole row. Keep interactive actions in the footer. */
  renderOption?: (
    option: ChatComposerModelOption<T>,
    isSelected: boolean
  ) => ReactNode;
} & (
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
      <span className="flex min-w-0 flex-1 flex-col gap-space-1">
        <span className="flex min-w-0 flex-wrap items-center gap-space-2">
          <Text
            as="span"
            variant={textVariant}
            className="[overflow-wrap:anywhere]"
          >
            {option.label ?? option.value}
          </Text>
          {option.badge != null && (
            <span className="flex shrink-0 items-center">{option.badge}</span>
          )}
        </span>
        {option.description && (
          <Text
            as="span"
            variant="xs"
            className="whitespace-normal text-tertiary [overflow-wrap:anywhere]"
          >
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
        aria-hidden
        icon={CheckIcon}
        size="md"
        className={cn('shrink-0', selected ? 'opacity-100' : 'opacity-0')}
      />
    </>
  );
}

/** Shared model selection for composer toolbars and standalone controls. The host owns the selected value. */
export function ChatComposerModelSelect<T extends string>({
  options,
  groups,
  value,
  selectedOption,
  onChange,
  open: controlledOpen,
  onOpenChange,
  disabled,
  hideSearch,
  disableFilter,
  triggerClassName,
  contentClassName,
  renderValue,
  renderOption,
  placeholder = 'Select a model',
  searchPlaceholder = 'Search models…',
  emptyText = 'No models found.',
  size = 'sm',
  side = 'top',
  variant = 'plain',
  onCloseAutoFocus,
  'aria-label': ariaLabel = 'Model',
  ...props
}: ChatComposerModelSelectProps<T>) {
  const composer = useContext(ChatComposerContext);
  const inComposer = composer != null;
  const isDisabled = Boolean(composer?.disabled || disabled);
  const choseModel = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const searchGroups = useMemo(
    () =>
      groups?.map(({ heading, options: groupOptions }) => ({
        heading,
        options: groupOptions.map((option) => ({
          ...option,
          keywords: heading
            ? [...(option.keywords ?? []), heading]
            : option.keywords,
        })),
      })),
    [groups]
  );
  const allOptions = useMemo(
    () => (groups ? groups.flatMap((group) => group.options) : (options ?? [])),
    [groups, options]
  );
  const optionByValue = useMemo(() => {
    const entries = new Map<T, ChatComposerModelOption<T>>();
    if (selectedOption) entries.set(selectedOption.value, selectedOption);
    for (const option of allOptions) entries.set(option.value, option);
    return entries;
  }, [allOptions, selectedOption]);
  const findOption = (option: SelectOption<T>): ChatComposerModelOption<T> =>
    optionByValue.get(option.value) ?? option;
  const textVariant = size === 'lg' ? 'md' : size;
  const hideAutomaticSearch =
    !disableFilter && allOptions.length < SEARCH_MIN_OPTIONS;
  const transparentDisabledTrigger = isDisabled && variant === 'plain';

  return (
    <div className="flex min-w-0 max-w-full items-center">
      <Select<T>
        {...props}
        {...(searchGroups ? { groups: searchGroups } : { options: allOptions })}
        value={value}
        selectedOption={selectedOption}
        open={open && !isDisabled}
        onOpenChange={setOpen}
        variant={variant}
        size={size}
        side={side}
        aria-label={ariaLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        hideSearch={hideSearch ?? hideAutomaticSearch}
        disableFilter={disableFilter}
        disabled={isDisabled}
        contentClassName={cn('min-w-56', contentClassName)}
        triggerClassName={cn(
          'px-space-2',
          transparentDisabledTrigger && 'bg-transparent dark:bg-transparent',
          triggerClassName
        )}
        renderValue={(selected) => {
          const option = findOption(selected);
          return (
            <span
              className="flex min-w-0 items-center gap-space-2"
              title={option.label ?? option.value}
            >
              {option.icon != null && (
                <span
                  aria-hidden
                  className="flex size-4 shrink-0 items-center justify-center"
                >
                  {option.icon}
                </span>
              )}
              <span
                className={cn(
                  'min-w-0 truncate text-left',
                  inComposer && 'max-w-32 @[440px]/composer:max-w-56'
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
          if (isDisabled) return;
          choseModel.current = true;
          onChange(next);
        }}
        onCloseAutoFocus={(event) => {
          const continueInInput = choseModel.current;
          choseModel.current = false;
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          if (continueInInput && composer?.inputFocusRef?.current?.())
            event.preventDefault();
        }}
      />
    </div>
  );
}
