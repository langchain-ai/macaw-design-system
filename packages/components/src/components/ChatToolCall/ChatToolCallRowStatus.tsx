import { cn } from '../../utils/cn';
import { ChatState, type ChatStateStatus } from '../ChatState';

interface ChatToolCallRowStatusProps {
  status: ChatStateStatus;
  label?: string;
  elapsedMs?: number;
  /** Inside a group, the header shows the running indicator instead. */
  inGroup: boolean;
}

/**
 * Success, and the running indicator inside a group, are hidden visually but
 * stay mounted, so the live region keeps announcing each status change.
 */
export function ChatToolCallRowStatus({
  status,
  label,
  elapsedMs,
  inGroup,
}: ChatToolCallRowStatusProps) {
  const hidesIndicator = inGroup && status === 'streaming';
  return (
    <span
      data-indicator={hidesIndicator ? 'hidden' : undefined}
      className={cn(
        'inline-flex items-center',
        status === 'completed' && 'sr-only',
        // Important: LoadingIndicator's display comes from unlayered module CSS.
        hidesIndicator && '[&_[data-animated]]:hidden!'
      )}
    >
      <ChatState
        variant="simple"
        label={label}
        status={status}
        showElapsed={status === 'streaming'}
        elapsedMs={elapsedMs}
      />
    </span>
  );
}
