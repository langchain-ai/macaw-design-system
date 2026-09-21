/* eslint-disable max-lines -- Keep the control, tag layout, and popover rendering together in this view. */
import type {
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import { useRef } from 'react';

import { Command as CommandPrimitive } from 'cmdk';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { CaretDownIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { CONTROL_SIZES } from '../../utils/componentSizes';
import { CONTROL_ICON_SIZES } from '../../utils/controlIconSizes';
import { Command, CommandEmpty, CommandItem, CommandList } from '../Command';
import { Icon } from '../Icon';
import { Popover, PopoverAnchor, PopoverContent } from '../Popover';
import { Text } from '../Text';
import type {
  TypeaheadListItem,
  TypeaheadMultipleValue,
  TypeaheadRenderOptionState,
  TypeaheadSelectedValue,
  TypeaheadSize,
  TypeaheadTagProps,
} from './Typeahead.types';
import { isTypeaheadOption } from './Typeahead.utils';
import {
  TypeaheadClearButton,
  TypeaheadCreateOption,
  TypeaheadDefaultOption,
  TypeaheadDefaultTag,
} from './TypeaheadParts';

interface TypeaheadViewRootProps {
  ref: Ref<HTMLDivElement>;
  props: HTMLAttributes<HTMLDivElement>;
  handleBlur: (event: FocusEvent<HTMLDivElement>) => void;
  dataTestId?: string;
  className?: string;
}

interface TypeaheadViewState {
  size: TypeaheadSize;
  disabled: boolean;
  isError: boolean;
  multiple?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface TypeaheadViewIds {
  commandLabel: string;
  resolvedInputId: string;
  listId: string;
  selectedSummaryId: string;
  inputAriaLabel?: string;
}

interface TypeaheadViewInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  leftDecorator?: ReactNode;
  showPlaceholderWithValues: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  setNode: (node: HTMLInputElement | null) => void;
  focus: () => void;
}

interface TypeaheadViewSelectionProps<TOption> {
  selectedValues: TypeaheadMultipleValue<TOption>;
  selectedKeys: Set<string>;
  getTagProps: (params: { index: number }) => TypeaheadTagProps;
  renderTags?: (
    value: TypeaheadMultipleValue<TOption>,
    getTagProps: (params: { index: number }) => TypeaheadTagProps
  ) => ReactNode;
  getLabel: (option: TypeaheadSelectedValue<TOption>) => string;
  getValue: (option: TypeaheadSelectedValue<TOption>) => string;
  showClearButton: boolean;
  clearValue: () => void;
  forcePopupIcon: boolean;
  selectedSummary?: string;
}

interface TypeaheadViewListProps<TOption> {
  ref: Ref<HTMLDivElement>;
  items: TypeaheadListItem<TOption>[];
  emptyText: string;
  emptyState?: ReactNode;
  listFooter?: ReactNode;
  hideEmptyList: boolean;
  optionIsDisabled: (item: TypeaheadListItem<TOption>) => boolean;
  selectValue: (selected: TypeaheadSelectedValue<TOption>) => void;
  renderOption?: (
    option: TOption,
    state: TypeaheadRenderOptionState
  ) => ReactNode;
}

interface TypeaheadViewCreateOptionProps {
  show: boolean;
  inputValue: string;
  label?: ReactNode;
  onCreate: () => void;
}

interface TypeaheadViewProps<TOption> {
  root: TypeaheadViewRootProps;
  state: TypeaheadViewState;
  ids: TypeaheadViewIds;
  input: TypeaheadViewInputProps;
  selection: TypeaheadViewSelectionProps<TOption>;
  list: TypeaheadViewListProps<TOption>;
  createOption: TypeaheadViewCreateOptionProps;
  popoverContentRef: Ref<HTMLDivElement>;
}

const CONTROL_RADIUS_CLASSES = {
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-md',
} as const satisfies Record<TypeaheadSize, string>;

const MULTIPLE_INPUT_HEIGHT_CLASSES = {
  xs: 'h-4',
  sm: 'h-5',
  md: 'h-6',
  lg: 'h-6',
} as const satisfies Record<TypeaheadSize, string>;

const INPUT_TEXT_CLASSES = {
  xs: 'text-xxs leading-[1.15]',
  sm: 'text-xs leading-normal',
  md: 'text-sm leading-normal',
  lg: 'text-sm leading-normal',
} as const satisfies Record<TypeaheadSize, string>;

export function TypeaheadView<TOption>({
  root,
  state,
  ids,
  input,
  selection,
  list,
  createOption,
  popoverContentRef,
}: TypeaheadViewProps<TOption>) {
  const controlRef = useRef<HTMLDivElement | null>(null);
  const preventInputDismiss = (event: Event) => {
    if (
      open &&
      event.target instanceof HTMLInputElement &&
      event.target.getAttribute('role') === 'combobox' &&
      controlRef.current?.contains(event.target)
    ) {
      event.preventDefault();
    }
  };
  const { ref: rootRef, handleBlur, dataTestId, className } = root;
  const { size, disabled, isError, multiple, open, setOpen } = state;
  const {
    commandLabel,
    resolvedInputId,
    listId,
    selectedSummaryId,
    inputAriaLabel,
  } = ids;
  const {
    value: inputValue,
    onValueChange: handleInputValueChange,
    onKeyDown: handleKeyDown,
    placeholder,
    leftDecorator,
    showPlaceholderWithValues,
    autoFocus,
    autoComplete,
    setNode: setInputNode,
    focus: focusInput,
  } = input;
  const {
    selectedValues,
    selectedKeys,
    getTagProps,
    renderTags,
    getLabel,
    getValue,
    showClearButton,
    clearValue,
    forcePopupIcon,
    selectedSummary,
  } = selection;
  const {
    ref: listRef,
    items,
    emptyText,
    emptyState,
    listFooter,
    hideEmptyList,
    optionIsDisabled,
    selectValue,
    renderOption,
  } = list;
  const hasValue = selectedValues.length > 0;
  const visibleItems = open ? items : [];
  const visibleShowCreateOption = open && createOption.show;
  const showEmptyState =
    open &&
    visibleItems.length === 0 &&
    !visibleShowCreateOption &&
    (emptyState != null || !hideEmptyList);
  const controlHeightClass = multiple
    ? CONTROL_SIZES[size].minHeightClassName
    : CONTROL_SIZES[size].heightClassName;
  const controlPaddingClass =
    size === 'xs' || size === 'sm' ? 'px-space-2' : 'px-space-3';
  const renderedTags =
    multiple &&
    (renderTags
      ? renderTags(selectedValues, getTagProps)
      : selectedValues.map((selected, index) => {
          const tagProps = getTagProps({ index });
          return (
            <TypeaheadDefaultTag
              key={`${getValue(selected)}-${index}`}
              selected={selected}
              index={index}
              disabled={disabled}
              size={size}
              getLabel={getLabel}
              getValue={getValue}
              onRemove={tagProps.onDelete}
            />
          );
        }));
  const inputField = (
    <div
      className={cn(
        'flex items-center gap-space-2',
        multiple ? 'min-w-0 flex-1' : 'flex-1',
        !multiple && (size === 'xs' ? 'min-w-12' : 'min-w-16')
      )}
    >
      {leftDecorator != null ? (
        <div className="flex min-w-0 shrink items-center text-icon-tertiary">
          {leftDecorator}
        </div>
      ) : !multiple && !hasValue ? (
        <Icon
          aria-hidden
          icon={MagnifyingGlassIcon}
          iconClassName={CONTROL_ICON_SIZES[size].iconClassName}
          className="text-icon-tertiary"
          weight="regular"
        />
      ) : null}
      {/*
        cmdk rewrites some of these combobox attributes as the query changes, so
        useTypeaheadDomSync re-asserts them imperatively. Keep the two attribute
        sets in sync when editing either here or in that hook.
      */}
      <CommandPrimitive.Input
        ref={setInputNode}
        id={resolvedInputId}
        value={inputValue}
        onValueChange={handleInputValueChange}
        onFocus={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          hasValue && multiple && !showPlaceholderWithValues
            ? undefined
            : placeholder
        }
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-invalid={isError || undefined}
        aria-describedby={multiple ? selectedSummaryId : undefined}
        aria-label={inputAriaLabel}
        className={cn(
          'min-w-0 max-w-full border-none bg-transparent p-0 outline-none placeholder:text-placeholder',
          INPUT_TEXT_CLASSES[size],
          disabled && 'cursor-not-allowed',
          multiple
            ? cn(MULTIPLE_INPUT_HEIGHT_CLASSES[size], 'w-full')
            : 'h-full w-full flex-1'
        )}
      />
    </div>
  );
  const actionControls = (
    <div
      className={cn(
        'flex shrink-0 items-center gap-space-1 text-icon-tertiary',
        multiple ? 'self-center' : 'ml-auto'
      )}
      style={{
        marginInlineEnd:
          showClearButton && !forcePopupIcon
            ? CONTROL_ICON_SIZES[size].actionOffset
            : undefined,
      }}
    >
      {showClearButton && (
        <TypeaheadClearButton
          size={size}
          label={multiple ? 'Clear selections' : 'Clear selection'}
          onClick={(event) => {
            event.stopPropagation();
            clearValue();
          }}
        />
      )}
      {forcePopupIcon && (
        <Icon
          aria-hidden
          icon={CaretDownIcon}
          iconClassName={CONTROL_ICON_SIZES[size].iconClassName}
          className={cn(
            'text-icon-tertiary transition-transform',
            open && 'rotate-180'
          )}
          weight="regular"
        />
      )}
    </div>
  );

  return (
    <Command
      ref={rootRef}
      shouldFilter={false}
      label={commandLabel}
      className="overflow-visible bg-transparent"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={controlRef}
            {...root.props}
            data-testid={dataTestId}
            onBlur={handleBlur}
            className={cn(
              'w-full cursor-text border border-default bg-elevated text-primary transition-colors',
              multiple
                ? 'flex flex-wrap items-center gap-space-1'
                : 'flex items-center gap-space-1 overflow-hidden',
              'focus-within:border-focus focus-within:bg-elevated hover:bg-elevated-hover',
              controlHeightClass,
              multiple && {
                'px-space-1 py-0': size === 'xs',
                'px-space-1 py-px': size === 'sm',
                'px-space-2 py-0.5': size === 'md',
                'px-space-3 py-space-1': size === 'lg',
              },
              !multiple && controlPaddingClass,
              CONTROL_RADIUS_CLASSES[size],
              isError && 'border-error focus-within:border-error',
              disabled &&
                'cursor-not-allowed border-disabled bg-disabled text-disabled opacity-70',
              className
            )}
            onClick={(event) => {
              root.props.onClick?.(event);
              if (!disabled) {
                focusInput();
                setOpen(true);
              }
            }}
          >
            {multiple ? (
              <>
                {renderedTags}
                <div className="flex min-w-16 flex-1 items-center gap-space-1">
                  {inputField}
                  {actionControls}
                </div>
              </>
            ) : (
              <>
                {inputField}
                {actionControls}
              </>
            )}
          </div>
        </PopoverAnchor>

        {multiple && (
          <span
            id={selectedSummaryId}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedSummary}
          </span>
        )}

        <PopoverContent
          ref={popoverContentRef}
          hidden={!open}
          className={cn(
            'w-[var(--radix-popover-trigger-width)] min-w-48 max-w-[calc(100vw-1rem)] bg-elevated p-space-1 text-primary',
            !open && 'hidden'
          )}
          align="start"
          sideOffset={4}
          forceMount
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onFocusOutside={preventInputDismiss}
          onInteractOutside={preventInputDismiss}
        >
          <CommandList
            ref={listRef}
            id={listId}
            aria-label={`${commandLabel} options`}
            aria-multiselectable={multiple ? true : undefined}
            className="max-h-[18.75rem]"
          >
            {showEmptyState && (
              <CommandEmpty>
                {emptyState ?? (
                  <Text variant="sm" color="secondary">
                    {emptyText}
                  </Text>
                )}
              </CommandEmpty>
            )}

            {visibleItems.map((item) => {
              const { option } = item;
              const optionKey = getValue(option);
              const optionLabel = getLabel(option);
              const selected = selectedKeys.has(optionKey);
              const optionDisabled = optionIsDisabled(item);
              const optionState = {
                selected,
                disabled: optionDisabled,
                inputValue,
              };

              return (
                <CommandItem
                  key={optionKey}
                  value={optionKey}
                  disabled={optionDisabled}
                  keywords={
                    isTypeaheadOption(option)
                      ? [optionLabel, ...(option.keywords ?? [])]
                      : [optionLabel]
                  }
                  onSelect={() => selectValue(option)}
                  aria-checked={multiple ? selected : undefined}
                  className={cn(
                    'flex items-center gap-space-2 rounded-sm px-space-2 py-space-2 text-sm text-primary hover:bg-surface-level-2 aria-selected:bg-surface-level-2',
                    optionDisabled && 'text-disabled'
                  )}
                >
                  {renderOption && item.source === 'option' ? (
                    renderOption(option as TOption, optionState)
                  ) : (
                    <TypeaheadDefaultOption
                      option={option}
                      state={optionState}
                      getLabel={getLabel}
                    />
                  )}
                </CommandItem>
              );
            })}

            {visibleShowCreateOption && (
              <CommandItem
                value={`__typeahead_create__${createOption.inputValue}`}
                keywords={[createOption.inputValue]}
                onSelect={createOption.onCreate}
                aria-label={
                  createOption.inputValue
                    ? `Add ${createOption.inputValue}`
                    : 'Add new'
                }
                className="flex items-center gap-space-2 rounded-sm p-space-2 text-sm text-primary hover:bg-surface-level-2 aria-selected:bg-surface-level-2"
              >
                <TypeaheadCreateOption
                  inputValue={createOption.inputValue}
                  label={createOption.label}
                />
              </CommandItem>
            )}

            {listFooter}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
