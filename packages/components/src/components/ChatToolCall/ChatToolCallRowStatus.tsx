import { createContext, useContext } from 'react';

import { ChatState, type ChatStateStatus } from '../ChatState';
import { ChatStateTimer } from '../ChatState/ChatStateTimer';

/** True inside a `ChatToolCallGroup` that shows the combined status itself. */
export const ChatToolCallGroupStatusContext = createContext(false);

interface ChatToolCallRowStatusProps {
  status: ChatStateStatus;
  label?: string;
  elapsedMs?: number;
}

/**
 * Row status. When the group header carries the combined status, rows skip
 * the success check and show only the timer while running.
 */
export function ChatToolCallRowStatus({
  status,
  label,
  elapsedMs,
}: ChatToolCallRowStatusProps) {
  const groupShowsStatus = useContext(ChatToolCallGroupStatusContext);

  if (groupShowsStatus && status === 'completed') return null;
  if (groupShowsStatus && status === 'streaming') {
    return (
      <ChatStateTimer
        visible
        running
        elapsedMs={elapsedMs}
        precision="seconds"
        format="seconds"
      />
    );
  }
  return (
    <ChatState
      variant="simple"
      label={label}
      status={status}
      showElapsed={status === 'streaming'}
      elapsedMs={elapsedMs}
    />
  );
}
