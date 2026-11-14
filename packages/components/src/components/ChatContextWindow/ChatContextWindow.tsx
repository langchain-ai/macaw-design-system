import { useState } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { CircularProgress } from '../CircularProgress';
import { ProgressBar } from '../ProgressBar';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';

export interface ChatContextWindowProps {
  /** Tokens currently in context; null means usage is unavailable. */
  tokensUsed: number | null;
  /** Model capacity in tokens; omit when the provider does not report it. */
  contextWindow?: number | null;
  model?: string;
  /** Host-formatted cost, including currency, such as "$0.25". */
  totalCost?: string;
  disabled?: boolean;
  className?: string;
}

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const exact = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function ChatContextWindow({
  tokensUsed,
  contextWindow,
  model,
  totalCost,
  disabled = false,
  className,
}: ChatContextWindowProps) {
  const [open, setOpen] = useState(false);
  const used =
    tokensUsed != null && Number.isFinite(tokensUsed) && tokensUsed >= 0
      ? tokensUsed
      : null;
  const limit =
    contextWindow != null && Number.isFinite(contextWindow) && contextWindow > 0
      ? contextWindow
      : null;
  const ratio = used != null && limit != null ? used / limit : null;
  const percentage =
    ratio == null
      ? null
      : ratio < 1
        ? Math.min(99, Math.round(ratio * 100))
        : Math.round(ratio * 100);
  const intent =
    ratio != null && ratio >= 1
      ? 'error'
      : ratio != null && ratio >= 0.8
        ? 'warning'
        : 'brand';
  const status =
    used == null
      ? 'Token usage is unavailable.'
      : limit == null
        ? 'The context limit was not reported for this model.'
        : ratio! >= 1
          ? 'Context window full'
          : ratio! >= 0.8
            ? 'Context window nearly full'
            : 'Context window available';
  const label = `Context window: ${
    used == null
      ? 'usage unavailable'
      : `${exact.format(used)} tokens used${limit == null ? ', limit unknown' : ` of ${exact.format(limit)}, ${percentage}% used`}`
  }`;

  return (
    <Tooltip
      open={open && !disabled}
      onOpenChange={setOpen}
      disabled={disabled}
      align="end"
      tooltipClassName="w-72 max-w-[calc(100vw-2rem)] p-space-3"
      title={
        <div className="flex min-w-0 flex-col gap-space-3 text-primary">
          <div className="flex items-center justify-between gap-space-3">
            <Text variant="sm" weight="medium">
              Context window
            </Text>
            {percentage != null && (
              <Text variant="xs" color="secondary" className="tabular-nums">
                {percentage}% used
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-space-2">
            <div className="flex flex-wrap items-baseline gap-space-1 tabular-nums">
              <Text variant="h3" as="span">
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
                aria-label="Context window usage"
                aria-valuetext={label}
              />
            )}
            <Text
              variant="xs"
              className={cn(
                'text-secondary',
                intent === 'warning' && 'text-warning-secondary',
                intent === 'error' && 'text-error-secondary'
              )}
            >
              {status}
            </Text>
          </div>
          {(model || totalCost) && (
            <div className="flex flex-wrap items-center justify-between gap-space-2 border-t border-subtle pt-space-2">
              {model && (
                <Text
                  variant="xs"
                  color="secondary"
                  className="min-w-0 break-all"
                >
                  {model}
                </Text>
              )}
              {totalCost && (
                <Text
                  variant="xs"
                  color="secondary"
                  className="shrink-0 tabular-nums"
                >
                  {totalCost} total
                </Text>
              )}
            </div>
          )}
        </div>
      }
    >
      <Button
        type="button"
        size="sm"
        color="secondary"
        variant="plain"
        disabled={disabled}
        aria-label={label}
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        className={cn('w-6 shrink-0 rounded-full px-0', className)}
      >
        <span aria-hidden="true" className="flex items-center justify-center">
          <CircularProgress
            size={16}
            strokeWidth={2}
            segments={
              ratio == null
                ? []
                : [{ variant: intent, percentage: Math.min(ratio, 1) }]
            }
          />
        </span>
      </Button>
    </Tooltip>
  );
}
