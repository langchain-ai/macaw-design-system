import { type ReactNode, useId } from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CircleDashedIcon } from '@phosphor-icons/react/dist/ssr/CircleDashed';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { hasContent } from '../../utils/hasContent';
import { Button } from '../Button';
import { CircularProgress } from '../CircularProgress';
import { Text } from '../Text';

export interface ChecklistProps {
  title: string;
  completed: number;
  total: number;
  children?: ReactNode;
  /** Header actions, such as a dismiss button or path picker. */
  action?: ReactNode;
  className?: string;
}

/** A compact task panel; the host owns task state, ordering, and persistence. */
export function Checklist({
  title,
  completed,
  total,
  children,
  action,
  className,
}: ChecklistProps) {
  const titleId = useId();
  const count = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const done = Number.isFinite(completed)
    ? Math.min(count, Math.max(0, Math.floor(completed)))
    : 0;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex min-w-0 max-w-full flex-col gap-space-3 rounded-lg border border-subtle bg-elevated p-space-3 text-primary',
        className
      )}
    >
      <div className="flex items-start gap-space-3 px-space-1 py-space-1">
        <CircularProgress
          size={32}
          strokeWidth={3}
          value={count === 0 ? 0 : done / count}
          aria-label={`${title} completion`}
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-space-1">
          <Text as="h3" variant="sm" weight="semibold" id={titleId}>
            {title}
          </Text>
          <Text as="p" variant="sm" color="secondary">
            {done} of {count} complete
          </Text>
        </div>
        {action}
      </div>
      <div className="flex min-w-0 flex-col gap-space-1">{children}</div>
    </section>
  );
}

interface DisclosureProps {
  children?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

function useChecklistDisclosure({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: DisclosureProps) {
  const id = useId();
  const [open, setOpen] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  return { id, open, toggle: () => setOpen(!open) };
}

const TRIGGER =
  'h-auto min-h-8 w-full min-w-0 justify-start gap-space-2 whitespace-normal rounded-md border-0 px-space-2 py-space-2 text-left shadow-none hover:bg-elevated-hover';

export interface ChecklistItemProps extends DisclosureProps {
  title: string;
  status?: 'pending' | 'completed' | 'locked';
  disabled?: boolean;
  /** Noninteractive summary, such as a connected repository or recommendation. */
  trailingContent?: ReactNode;
}

/** An informational task row, expandable when it has content. */
export function ChecklistItem({
  title,
  status = 'pending',
  disabled = false,
  trailingContent,
  children,
  className,
  ...disclosure
}: ChecklistItemProps) {
  const { id, open, toggle } = useChecklistDisclosure(disclosure);
  const hasBody = hasContent(children);
  const unavailable = disabled || status === 'locked';
  const isOpen = hasBody && open && !unavailable;
  const StatusIcon =
    status === 'completed'
      ? CheckCircleIcon
      : status === 'locked'
        ? LockSimpleIcon
        : CircleDashedIcon;
  const header = (
    <>
      <StatusIcon
        aria-hidden="true"
        size={16}
        weight={status === 'completed' ? 'fill' : 'regular'}
        className={cn(
          'shrink-0',
          unavailable
            ? 'text-icon-disabled'
            : status === 'completed'
              ? 'text-icon-success'
              : 'text-icon-tertiary'
        )}
      />
      <Text
        as="span"
        variant="sm"
        id={`${id}-title`}
        className="min-w-0 flex-1 break-words"
      >
        <span className="sr-only">
          {status === 'completed'
            ? 'Completed:'
            : status === 'locked'
              ? 'Locked:'
              : 'Pending:'}
        </span>{' '}
        {title}
      </Text>{' '}
      {trailingContent != null && (
        <Text
          as="span"
          variant="xs"
          color="tertiary"
          id={`${id}-summary`}
          className="max-w-[40%] break-words"
        >
          {trailingContent}
        </Text>
      )}
    </>
  );

  return (
    <div
      className={cn(
        'min-w-0 rounded-md',
        isOpen && 'bg-elevated-selected',
        className
      )}
    >
      {hasBody ? (
        <Button
          type="button"
          variant="plain"
          color="secondary"
          size="md"
          disabled={unavailable}
          aria-labelledby={`${id}-title${trailingContent != null ? ` ${id}-summary` : ''}`}
          aria-expanded={isOpen}
          aria-controls={id}
          onClick={toggle}
          className={cn(TRIGGER, isOpen && 'hover:bg-elevated-selected')}
        >
          {header}
        </Button>
      ) : (
        <div
          aria-disabled={unavailable || undefined}
          className={cn(
            'flex min-w-0 items-center gap-space-2 px-space-2 py-space-2',
            unavailable && 'text-disabled'
          )}
        >
          {header}
        </div>
      )}
      {hasBody && (
        <div
          id={id}
          hidden={!isOpen}
          className="pb-space-3 pl-space-6 pr-space-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface ChecklistSectionProps extends DisclosureProps {
  title: string;
  description?: string;
  /** Completion in task order, including nonconsecutive completed tasks. */
  steps: readonly boolean[];
}

/** An optional collapsible group with a compact per-task progress tracker. */
export function ChecklistSection({
  title,
  description,
  steps,
  children,
  className,
  ...disclosure
}: ChecklistSectionProps) {
  const { id, open, toggle } = useChecklistDisclosure(disclosure);
  const done = steps.filter(Boolean).length;
  return (
    <div className={cn('min-w-0 border-t border-subtle pt-space-1', className)}>
      <Button
        type="button"
        variant="plain"
        color="secondary"
        size="md"
        aria-labelledby={`${id}-title ${description ? `${id}-description ` : ''}${id}-progress`}
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        className={TRIGGER}
      >
        <CaretDownIcon
          aria-hidden="true"
          size={16}
          weight="regular"
          className={cn('shrink-0 text-icon-tertiary', !open && '-rotate-90')}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-space-1">
          <Text as="span" variant="sm" weight="semibold" id={`${id}-title`}>
            {title}
          </Text>{' '}
          {description && (
            <Text
              as="span"
              variant="xs"
              color="tertiary"
              id={`${id}-description`}
            >
              {description}
            </Text>
          )}
        </span>{' '}
        <span className="flex max-w-[40%] flex-wrap items-center justify-end gap-space-2">
          <span aria-hidden="true" className="flex flex-wrap gap-space-1">
            {steps.map((complete, index) => (
              <span
                key={index}
                className={cn(
                  'h-1 w-3 rounded-full',
                  complete ? 'bg-brand' : 'bg-surface-level-4'
                )}
              />
            ))}
          </span>
          <Text
            as="span"
            variant="sm"
            color="secondary"
            className="tabular-nums"
            id={`${id}-progress`}
          >
            {done}/{steps.length} <span className="sr-only">complete</span>
          </Text>
        </span>
      </Button>
      <div id={id} hidden={!open} className="flex min-w-0 flex-col gap-space-1">
        {children}
      </div>
    </div>
  );
}
