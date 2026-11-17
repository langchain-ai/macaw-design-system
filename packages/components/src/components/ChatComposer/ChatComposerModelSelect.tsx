import { useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { CheckIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Select } from '../Select';
import type { SelectGroup, SelectOption, SelectProps } from '../Select';
import { Text } from '../Text';
import { ChatComposerContext } from './ChatComposerContext';

export interface ChatComposerModelOption<
  T extends string = string,
> extends SelectOption<T> {
  /** Group's display label; groups follow their first appearance in the options. */
  group?: string;
  /** Host-supplied provider or tier mark, also shown in the trigger. */
  icon?: ReactNode;
  /** Short status beside the label, such as a `Badge` reading "Default". */
  badge?: ReactNode;
}

export type ChatComposerModelSelectProps<T extends string = string> = Omit<
  SelectProps<T>,
  'options' | 'groups' | 'renderValue' | 'renderOption' | 'hideSearch'
> & {
  /** Defaults to hidden below eight options, except for host-filtered lists.
   * Set explicitly to override that policy, including a host-defined threshold. */
  hideSearch?: boolean;
} & (
    | { options: ChatComposerModelOption<T>[]; groups?: never }
    | { groups: SelectGroup<T>[]; options?: never }
  );

const SEARCH_MIN_OPTIONS = 8;

function ModelOptionRow({
  option,
  selected,
}: {
  option: ChatComposerModelOption;
  selected: boolean;
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
          <Text as="span" variant="sm" className="[overflow-wrap:anywhere]">
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
  onChange,
  open: controlledOpen,
  onOpenChange,
  disabled,
  hideSearch,
  disableFilter,
  triggerClassName,
  contentClassName,
  placeholder = 'Select a model',
  searchPlaceholder = 'Search models…',
  size = 'sm',
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

  const searchGroups = useMemo(() => {
    const optionsByGroup = new Map<
      string | undefined,
      ChatComposerModelOption<T>[]
    >();
    for (const option of options ?? []) {
      const items = optionsByGroup.get(option.group) ?? [];
      items.push(option);
      optionsByGroup.set(option.group, items);
    }
    // Retain the existing Select `groups` input for current consumers.
    const modelGroups =
      groups ??
      Array.from(optionsByGroup, ([heading, options]) => ({
        heading,
        options,
      }));
    return modelGroups.map(({ heading, options: groupOptions }) => ({
      heading,
      options: groupOptions.map((option) => ({
        ...option,
        keywords: heading
          ? [...(option.keywords ?? []), heading]
          : option.keywords,
      })),
    }));
  }, [groups, options]);
  const optionCount = searchGroups.reduce(
    (count, group) => count + group.options.length,
    0
  );
  const hideAutomaticSearch =
    !disableFilter && optionCount < SEARCH_MIN_OPTIONS;
  const transparentDisabledTrigger = isDisabled && variant === 'plain';

  return (
    <div className="flex min-w-0 max-w-full items-center">
      <Select<T>
        {...props}
        groups={searchGroups}
        value={value}
        open={open && !isDisabled}
        onOpenChange={setOpen}
        variant={variant}
        size={size}
        aria-label={ariaLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        hideSearch={hideSearch ?? hideAutomaticSearch}
        disableFilter={disableFilter}
        disabled={isDisabled}
        contentClassName={cn('min-w-56', contentClassName)}
        triggerClassName={cn(
          'px-space-2',
          transparentDisabledTrigger && 'bg-transparent dark:bg-transparent',
          triggerClassName
        )}
        renderValue={(option: ChatComposerModelOption<T>) => {
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
                <Text as="span" variant="sm" weight="normal">
                  {option.label ?? option.value}
                </Text>
              </span>
            </span>
          );
        }}
        renderOption={(option: ChatComposerModelOption<T>, isSelected) => (
          <ModelOptionRow option={option} selected={isSelected} />
        )}
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
