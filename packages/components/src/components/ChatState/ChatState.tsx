import { type ReactNode, useId } from 'react';

import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { PauseCircleIcon } from '@phosphor-icons/react/dist/ssr/PauseCircle';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import { cn } from '../../utils/cn';
import { VISUAL_ELEMENT_SIZES } from '../../utils/componentSizes';
import { Text } from '../Text';
import { LoadingIndicator, type ThinkingStateProps } from '../ThinkingState';
import { ChatStateTimer } from './ChatStateTimer';

export type ChatStateStatus =
  | 'pending'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'interrupted'
  | 'canceled'
  | 'input-required';

const STATIC_STATES = {
  pending: {
    label: 'Pending',
    icon: ClockIcon,
    iconClassName: 'text-icon-tertiary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircleIcon,
    iconClassName: 'text-icon-success',
  },
  failed: {
    label: 'Failed',
    icon: WarningCircleIcon,
    iconClassName: 'text-icon-error',
  },
  interrupted: {
    label: 'Interrupted',
    icon: PauseCircleIcon,
    iconClassName: 'text-icon-warning',
  },
  canceled: {
    label: 'Canceled',
    icon: ProhibitIcon,
    iconClassName: 'text-icon-tertiary',
  },
  'input-required': {
    label: 'Needs input',
    icon: QuestionIcon,
    iconClassName: 'text-icon-warning',
  },
} satisfies Record<
  Exclude<ChatStateStatus, 'streaming'>,
  { label: string; icon: typeof CheckCircleIcon; iconClassName: string }
>;

export interface ChatStateProps {
  status: ChatStateStatus;
  variant?: 'default' | 'simple';
  /** Visible in default; accessible name in simple. Parents own tooltips. */
  label?: ReactNode;
  /** Defaults to true in simple and false in default. */
  showElapsed?: boolean;
  /** Host-supplied duration takes precedence over the internal streaming clock. */
  elapsedMs?: number;
  timerPrecision?: ThinkingStateProps['timerPrecision'];
  className?: string;
}

export function ChatState({
  status,
  variant = 'default',
  label,
  showElapsed = variant === 'simple',
  elapsedMs,
  timerPrecision = 'seconds',
  className,
}: ChatStateProps) {
  const labelId = useId();
  const simple = variant === 'simple';
  const presentation = status === 'streaming' ? null : STATIC_STATES[status];
  const StatusIcon = presentation?.icon;
  const defaultLabel = presentation?.label ?? 'Streaming';
  const stateLabel = simple
    ? label || defaultLabel
    : label === undefined
      ? defaultLabel
      : label;

  const statusContent = (
    <span
      className={cn(
        'inline-flex min-w-0 items-center',
        status === 'streaming' ? 'gap-space-2' : 'gap-space-1'
      )}
    >
      {status === 'streaming' ? (
        <LoadingIndicator size="xs" tone="neutral" />
      ) : StatusIcon ? (
        <StatusIcon
          size={12}
          weight="regular"
          aria-hidden="true"
          className={cn(
            'shrink-0',
            VISUAL_ELEMENT_SIZES.xs.className,
            presentation?.iconClassName
          )}
        />
      ) : null}
      <Text
        id={simple ? labelId : undefined}
        as="span"
        variant="xs"
        weight="normal"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          simple
            ? 'sr-only'
            : 'inline-flex min-w-0 items-center break-words leading-4 tracking-normal',
          status === 'failed' ? 'text-error-secondary' : 'text-secondary'
        )}
      >
        {stateLabel}
      </Text>
    </span>
  );

  const compactStatus = (
    <span
      role="group"
      aria-labelledby={labelId}
      className="inline-flex shrink-0 items-center"
    >
      {statusContent}
    </span>
  );

  return (
    <div
      className={cn(
        'inline-flex min-h-5 max-w-full items-center gap-space-2 align-middle font-sans',
        simple && 'gap-space-1',
        className
      )}
    >
      {simple ? compactStatus : statusContent}
      <ChatStateTimer
        visible={showElapsed}
        elapsedMs={elapsedMs}
        precision={simple ? 'seconds' : timerPrecision}
        format={simple ? 'seconds' : 'duration'}
        running={status === 'streaming'}
      />
    </div>
  );
}
