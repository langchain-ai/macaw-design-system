import { cn } from '../../utils/cn';
import { ChatState, type ChatStateStatus } from '../ChatState';

interface ChatToolCallRowStatusProps {
  status: ChatStateStatus;
  label?: string;
  elapsedMs?: number;
  startedAt?: Date | number;
  /** Inside a group, the header shows the running indicator instead. */
  inGroup: boolean;
}

/**
 * Success is hidden visually but stays mounted, so the live region still
 * announces the change.
 */
export function ChatToolCallRowStatus({
  status,
  label,
  elapsedMs,
  startedAt,
  inGroup,
}: ChatToolCallRowStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        status === 'completed' && 'sr-only'
      )}
    >
      <ChatState
        variant="simple"
        label={label}
        status={status}
        showElapsed={status === 'streaming'}
        showIndicator={!inGroup}
        elapsedMs={elapsedMs}
        startedAt={startedAt}
      />
    </span>
  );
}
