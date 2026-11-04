import { type FocusEvent, useEffect, useEffectEvent, useId } from 'react';

import { FunnelIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import type { ChartLegendItem } from './ChartLegend';
import type { ChartLegendItemActiveChangeHandler } from './useChartLegendActiveItem';
import {
  getAccessibleText,
  getChartLegendAriaLabel,
  type ChartLegendListColumns,
} from './utils';

type ChartLegendItemRendererProps = {
  item: ChartLegendItem;
  onClick?: () => void;
  /** Adds the exclude action beside the item. */
  onExcludeClick?: () => void;
  onActiveChange?: ChartLegendItemActiveChangeHandler<ChartLegendItem>;
  className?: string;
  tabIndex?: number;
  layout?: 'inline' | 'list';
  listColumns?: ChartLegendListColumns;
};

/** Reveals the exclude action while its item is hovered or focused. */
const EXCLUDE_REVEAL =
  'opacity-0 group-hover/legend-item:opacity-100 group-focus-within/legend-item:opacity-100 [@media(hover:none)]:opacity-100';

export const ChartLegendItemRenderer = ({
  item,
  onClick,
  onExcludeClick,
  onActiveChange,
  className,
  tabIndex,
  layout = 'inline',
  listColumns,
}: ChartLegendItemRendererProps) => {
  const labelId = useId();
  const clearActivity = useEffectEvent(() => {
    onActiveChange?.(item, 'pointer', false);
    onActiveChange?.(item, 'focus', false);
  });
  // Removing a focused or hovered row does not fire blur or pointerleave.
  useEffect(() => () => clearActivity(), []);

  const isList = layout === 'list';
  const excluded = item.excluded ?? false;
  // Exclusion takes precedence, so an item is never shown as both.
  const selected = (item.selected ?? false) && !excluded;
  const hasExclude = onExcludeClick != null;
  const defaultAriaLabel = getChartLegendAriaLabel(
    item.label,
    isList ? item.value : undefined,
    isList ? item.secondaryValue : undefined
  );
  const ariaLabel = item['aria-label'] ?? defaultAriaLabel;
  const marker =
    item.marker ??
    (item.markerColor != null ? (
      <div
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full',
          // An excluded series keeps its color as an outline.
          excluded && 'border border-solid'
        )}
        style={
          excluded
            ? { borderColor: item.markerColor }
            : { backgroundColor: item.markerColor }
        }
      />
    ) : null);
  const action =
    onClick != null || selected ? (
      <Icon
        aria-hidden="true"
        icon={FunnelIcon}
        weight={selected ? 'fill' : undefined}
        size="xs"
        className={cn(
          'size-3 shrink-0 text-icon-tertiary transition-opacity duration-fast',
          selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
        )}
      />
    ) : null;
  const content = (
    <>
      {isList && listColumns?.marker ? (marker ?? <div aria-hidden />) : marker}
      <Text
        id={labelId}
        as="span"
        variant="xs"
        color={excluded ? 'tertiary' : undefined}
        className={cn(
          'min-w-0 flex-1 text-left',
          isList ? 'whitespace-normal break-words' : 'truncate',
          excluded && 'line-through'
        )}
      >
        {item.label}
      </Text>
      {isList &&
        listColumns?.value &&
        (item.value != null ? (
          <Text
            as="span"
            variant="xs"
            className="shrink-0 text-right tabular-nums"
          >
            {item.value}
          </Text>
        ) : (
          <div aria-hidden />
        ))}
      {isList &&
        listColumns?.secondaryValue &&
        (item.secondaryValue != null ? (
          <Text
            as="span"
            variant="xs"
            color="tertiary"
            className="shrink-0 text-right tabular-nums"
          >
            {item.secondaryValue}
          </Text>
        ) : (
          <div aria-hidden />
        ))}
      {isList && listColumns?.action ? (action ?? <div aria-hidden />) : action}
    </>
  );

  const styles = cn(
    'group relative min-w-0 items-center rounded-xs py-space-1 text-primary transition-colors duration-fast',
    isList
      ? cn(
          // The exclude action takes the last column, beside the item.
          hasExclude ? 'col-[1/-2]' : 'col-span-full',
          'grid w-full grid-cols-subgrid gap-space-2 px-space-2'
        )
      : cn(
          'flex gap-space-1 px-space-1',
          hasExclude ? 'shrink' : 'max-w-full shrink-0'
        ),
    selected
      ? 'bg-surface-level-3 hover:bg-surface-level-3'
      : (onClick != null || onActiveChange != null) &&
          'hover:bg-surface-level-1-hover focus-visible:bg-surface-level-1-hover',
    !hasExclude && className
  );

  // With an exclude action, the item and its action report activity as one,
  // so moving between them keeps the item active.
  const leavesWrapper = (event: FocusEvent<HTMLElement>) =>
    !hasExclude ||
    !(
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    );
  const activityHandlers = {
    onPointerEnter: () => onActiveChange?.(item, 'pointer', true),
    onPointerLeave: () => onActiveChange?.(item, 'pointer', false),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (leavesWrapper(event)) onActiveChange?.(item, 'focus', true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (leavesWrapper(event)) onActiveChange?.(item, 'focus', false);
    },
  };
  const itemActivityHandlers = hasExclude ? {} : activityHandlers;

  const element =
    onClick == null ? (
      <div
        className={cn(
          styles,
          onActiveChange != null &&
            'focus-visible:ring-focus focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset'
        )}
        role={onActiveChange == null ? undefined : 'group'}
        aria-label={onActiveChange == null ? undefined : ariaLabel}
        aria-labelledby={
          onActiveChange != null && ariaLabel == null ? labelId : undefined
        }
        tabIndex={onActiveChange == null ? tabIndex : (tabIndex ?? 0)}
        {...itemActivityHandlers}
      >
        {content}
      </div>
    ) : (
      <Button
        type="button"
        size="xs"
        color="secondary"
        variant="plain"
        className={cn(
          styles,
          'focus-visible:ring-focus border-transparent shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset',
          isList && 'h-auto justify-start',
          !selected && 'bg-transparent'
        )}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel == null ? labelId : undefined}
        aria-pressed={selected}
        tabIndex={tabIndex}
        {...itemActivityHandlers}
        onClick={onClick}
      >
        {content}
      </Button>
    );

  if (!hasExclude) return element;

  const name =
    getAccessibleText(item.label) ?? item['aria-label'] ?? String(item.id);
  return (
    <div
      className={cn(
        'group/legend-item relative flex min-w-0 items-center',
        isList ? 'col-span-full grid grid-cols-subgrid' : 'max-w-full shrink-0',
        className
      )}
      {...activityHandlers}
    >
      {element}
      <IconButton
        icon={ProhibitIcon}
        iconWeight={excluded ? 'fill' : undefined}
        label={`Exclude ${name}`}
        aria-pressed={excluded}
        size="xxs"
        color="secondary"
        variant="plain"
        tabIndex={tabIndex}
        className={cn(
          'shrink-0 text-icon-tertiary transition-opacity duration-fast',
          !excluded && EXCLUDE_REVEAL
        )}
        onClick={onExcludeClick}
      />
    </div>
  );
};
