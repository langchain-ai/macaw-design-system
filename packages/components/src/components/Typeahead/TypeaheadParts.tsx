import type { ReactNode } from 'react';

import { CheckIcon, PlusIcon, XIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { CONTROL_ICON_SIZES } from '../../utils/controlIconSizes';
import { Badge } from '../Badge';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import type {
  TypeaheadRenderOptionState,
  TypeaheadSelectedValue,
  TypeaheadSize,
} from './Typeahead.types';
import { isTypeaheadOption } from './Typeahead.utils';

export function TypeaheadClearButton({
  label,
  onClick,
  size,
}: {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size: TypeaheadSize;
}) {
  // Let the click target extend vertically without making tag rows taller.
  return (
    <IconButton
      type="button"
      icon={XIcon}
      iconWeight="regular"
      label={label}
      variant="plain"
      color="secondary"
      size={CONTROL_ICON_SIZES[size].buttonSize}
      tooltipProps={{ title: null }}
      className="bg-transparent text-icon-tertiary shadow-none hover:bg-elevated-hover hover:text-icon-primary"
      style={{ marginBlock: CONTROL_ICON_SIZES[size].actionOffset }}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    />
  );
}

export function TypeaheadDefaultTag<TOption>({
  selected,
  index,
  disabled,
  size,
  getLabel,
  getValue,
  onRemove,
}: {
  selected: TypeaheadSelectedValue<TOption>;
  index: number;
  disabled: boolean;
  size: TypeaheadSize;
  getLabel: (option: TypeaheadSelectedValue<TOption>) => string;
  getValue: (option: TypeaheadSelectedValue<TOption>) => string;
  onRemove: () => void;
}) {
  const label = getLabel(selected);

  return (
    <Badge
      key={`${getValue(selected)}-${index}`}
      color="plain"
      rounded="xs"
      size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'}
      textWeight="normal"
      rightDecorator={!disabled ? XIcon : undefined}
      iconWeight="regular"
      aria-label={!disabled ? `Remove ${label}` : undefined}
      role={!disabled ? 'button' : undefined}
      tabIndex={!disabled ? 0 : undefined}
      onMouseDown={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }
      }}
      onClick={
        !disabled
          ? (event) => {
              event.stopPropagation();
              onRemove();
            }
          : undefined
      }
      className={cn(
        'min-w-0 max-w-full justify-start border-default bg-surface-level-2 px-space-1 text-primary [&>span]:min-w-0 [&>span]:truncate [&>span]:text-xxs',
        size === 'xs' && 'border-0 py-0',
        !disabled &&
          'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
        disabled && 'cursor-not-allowed'
      )}
    >
      {label}
    </Badge>
  );
}

export function TypeaheadDefaultOption<TOption>({
  option,
  state,
  getLabel,
}: {
  option: TypeaheadSelectedValue<TOption>;
  state: TypeaheadRenderOptionState;
  getLabel: (option: TypeaheadSelectedValue<TOption>) => string;
}) {
  const label = getLabel(option);
  const description = isTypeaheadOption(option)
    ? option.description
    : undefined;
  const rightDecorator = isTypeaheadOption(option)
    ? option.rightDecorator
    : undefined;

  return (
    <>
      <Icon
        aria-hidden="true"
        icon={CheckIcon}
        size="md"
        className={cn(
          'shrink-0 text-icon-primary',
          state.selected ? 'opacity-100' : 'opacity-0'
        )}
      />
      <OptionText label={label} description={description} />
      {rightDecorator && (
        <div className="ml-auto shrink-0">{rightDecorator}</div>
      )}
    </>
  );
}

function OptionText({
  label,
  description,
}: {
  label: string;
  description: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Text as="span" variant="sm" className="truncate text-primary">
        {label}
      </Text>
      {description && (
        <Text as="span" variant="xs" className="truncate text-tertiary">
          {description}
        </Text>
      )}
    </div>
  );
}

export function TypeaheadCreateOption({
  inputValue,
  label,
}: {
  inputValue: string;
  label?: ReactNode;
}) {
  if (label != null) {
    return label;
  }

  return (
    <>
      <span
        aria-hidden
        className="inline-flex size-4 shrink-0 text-icon-secondary"
      >
        <PlusIcon size="100%" weight="regular" />
      </span>
      <span className="min-w-0 truncate">{inputValue || 'Add new'}</span>
    </>
  );
}
