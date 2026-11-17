import { useState, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { CircularProgress } from '../CircularProgress';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { ProgressBar } from '../ProgressBar';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';

export interface ChatContextWindowPopoverProps {
  /** Current context occupancy, not cumulative billed tokens. Null means unavailable. */
  tokensUsed: number | null;
  /** Effective model capacity; omit when the provider does not report it. */
  contextWindow?: number | null;
  model?: string;
  /** Fraction at which to warn, from 0 to 1. Defaults to 0.8. */
  warningThreshold?: number;
  /** Replaces the default guidance, e.g. an estimate or automatic compaction policy. */
  description?: string;
  /** Product-owned details, such as token breakdowns or session cost. */
  children?: ReactNode;
  /** Optional actions or status, e.g. compact, retry, or ThinkingState. */
  footer?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const exact = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function validTokens(value: number | null | undefined) {
  return value != null && Number.isFinite(value) && value >= 0 ? value : null;
}

/** Shared context-usage presentation; apps own data, additional content, and actions. */
export function ChatContextWindowPopover({
  tokensUsed,
  contextWindow,
  model,
  warningThreshold = 0.8,
  description,
  children,
  footer,
  disabled = false,
  className,
}: ChatContextWindowPopoverProps) {
  const [open, setOpen] = useState(false);
  const used = validTokens(tokensUsed);
  const limit = validTokens(contextWindow) || null;
  const ratio = used != null && limit != null ? used / limit : null;
  const threshold = Number.isFinite(warningThreshold)
    ? Math.min(1, Math.max(0, warningThreshold))
    : 0.8;
  const isFull = ratio != null && ratio >= 1;
  const isNearLimit = ratio != null && ratio >= threshold;
  const intent = isFull ? 'error' : isNearLimit ? 'warning' : 'neutral';
  // Rounding must not claim the window is full before it is.
  const percentage =
    ratio == null
      ? null
      : Math.min(isFull ? Infinity : 99, Math.round(ratio * 100));
  const status =
    used == null
      ? 'Token usage is unavailable.'
      : limit == null
        ? 'The provider has not reported a context limit.'
        : isFull
          ? 'Context limit reached'
          : isNearLimit
            ? 'Context nearly full'
            : `${compact.format(limit - used)} tokens remaining`;
  const label = `Context window: ${
    used == null
      ? 'usage unavailable'
      : `${exact.format(used)} tokens used${limit == null ? ', limit unknown' : ` of ${exact.format(limit)}, ${percentage}% used`}`
  }`;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <Tooltip
        title={
          percentage == null ? 'Context usage' : `Context: ${percentage}% used`
        }
        disabled={disabled}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            color="secondary"
            variant="plain"
            disabled={disabled}
            aria-label={label}
            className={cn('w-6 shrink-0 px-0', className)}
          >
            <CircularProgress
              size={16}
              strokeWidth={2}
              segments={
                ratio == null
                  ? []
                  : [{ variant: intent, percentage: Math.min(ratio, 1) }]
              }
            />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        aria-label="Context window"
        className="flex w-72 max-w-[calc(100vw-1.5rem)] flex-col gap-space-4 text-primary"
      >
        <div className="flex flex-col gap-space-3">
          <div className="flex items-center justify-between gap-space-3">
            <Text variant="sm" weight="medium">
              Context Window
            </Text>
            {percentage != null && (
              <Text variant="xs" color="secondary" className="tabular-nums">
                {percentage}% used
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-space-2">
            <div className="flex flex-wrap items-baseline gap-space-1 tabular-nums">
              <Text variant="h2" as="span">
                {used == null ? '—' : compact.format(used)}
              </Text>
              <Text variant="xs" color="secondary">
                {limit == null
                  ? 'tokens used'
                  : `/ ${compact.format(limit)} tokens`}
              </Text>
            </div>
            {ratio != null && (
              <ProgressBar
                value={Math.min(ratio, 1)}
                max={1}
                size="sm"
                color={intent}
                fill="solid"
                aria-label="Context window usage"
                aria-valuetext={label}
              />
            )}
            <Text
              variant="xs"
              className={cn(
                'leading-normal text-secondary',
                isNearLimit && 'text-warning-primary',
                isFull && 'text-error-secondary'
              )}
            >
              {description ?? status}
            </Text>
          </div>
        </div>
        {children}
        {model && (
          <dl className="border-t border-subtle pt-space-3">
            <div className="flex items-baseline justify-between gap-space-4">
              <dt className="shrink-0">
                <Text variant="xs" color="secondary">
                  Model
                </Text>
              </dt>
              <dd className="min-w-0 text-right">
                <Text
                  variant="xs"
                  as="div"
                  className="leading-normal break-words tabular-nums [overflow-wrap:anywhere]"
                >
                  {model}
                </Text>
              </dd>
            </div>
          </dl>
        )}
        {footer && (
          <div className="border-t border-subtle pt-space-3">{footer}</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
