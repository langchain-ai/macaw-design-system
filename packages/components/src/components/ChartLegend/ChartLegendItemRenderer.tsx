import { useEffect, useEffectEvent, useId } from 'react';

import { FunnelIcon } from '@phosphor-icons/react/dist/ssr/Funnel';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { ChartLegendItem } from './ChartLegend';
import type { ChartLegendItemActiveChangeHandler } from './useChartLegendActiveItem';
import { getChartLegendAriaLabel, type ChartLegendListColumns } from './utils';

type ChartLegendItemRendererProps = {
  item: ChartLegendItem;
  onClick?: () => void;
  onActiveChange?: ChartLegendItemActiveChangeHandler<ChartLegendItem>;
  className?: string;
  tabIndex?: number;
  layout?: 'inline' | 'list';
  listColumns?: ChartLegendListColumns;
};

export const ChartLegendItemRenderer = ({
  item,
  onClick,
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
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: item.markerColor }}
      />
    ) : null);
  const action =
    onClick != null || item.selected ? (
      <Icon
        aria-hidden="true"
        icon={FunnelIcon}
        weight={item.selected ? 'fill' : undefined}
        size="xs"
        className={cn(
          'size-3 shrink-0 text-icon-tertiary transition-opacity duration-fast',
          item.selected
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
        className={cn(
          'min-w-0 flex-1 text-left',
          isList ? 'whitespace-normal break-words' : 'truncate'
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
      ? 'col-span-full grid w-full grid-cols-subgrid gap-space-2 px-space-2'
      : 'flex max-w-full shrink-0 gap-space-1 px-space-1',
    item.selected
      ? 'bg-surface-level-3 hover:bg-surface-level-3'
      : (onClick != null || onActiveChange != null) &&
          'hover:bg-surface-level-1-hover focus-visible:bg-surface-level-1-hover',
    className
  );

  if (onClick == null) {
    return (
      <div
        className={cn(
          styles,
          onActiveChange != null &&
            'focus-visible:ring-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
        )}
        role={onActiveChange == null ? undefined : 'group'}
        aria-label={onActiveChange == null ? undefined : ariaLabel}
        aria-labelledby={
          onActiveChange != null && ariaLabel == null ? labelId : undefined
        }
        tabIndex={onActiveChange == null ? tabIndex : (tabIndex ?? 0)}
        onPointerEnter={() => onActiveChange?.(item, 'pointer', true)}
        onPointerLeave={() => onActiveChange?.(item, 'pointer', false)}
        onFocus={() => onActiveChange?.(item, 'focus', true)}
        onBlur={() => onActiveChange?.(item, 'focus', false)}
      >
        {content}
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="xs"
      color="secondary"
      variant="plain"
      className={cn(
        styles,
        'focus-visible:ring-focus border-transparent shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        isList && 'justify-start',
        !item.selected && 'bg-transparent'
      )}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel == null ? labelId : undefined}
      aria-pressed={item.selected ?? false}
      tabIndex={tabIndex}
      onPointerEnter={() => onActiveChange?.(item, 'pointer', true)}
      onPointerLeave={() => onActiveChange?.(item, 'pointer', false)}
      onFocus={() => onActiveChange?.(item, 'focus', true)}
      onBlur={() => onActiveChange?.(item, 'focus', false)}
      onClick={onClick}
    >
      {content}
    </Button>
  );
};
