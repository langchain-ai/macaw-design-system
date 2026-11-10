import type { ChatToolCallStatus } from '../ChatToolCall';

/** Render-ready presentation data for a delegated agent run. */
export interface ChatSubagentModel {
  /** Stable ID, such as the ID of the tool call that started the subagent. */
  id: string;
  /** The subagent's type or name, such as "researcher". */
  name: string;
  /** The task the subagent was given. */
  task?: string;
  /** The lifecycle of the call that runs the subagent. */
  status: ChatToolCallStatus;
  /** Measured duration; takes precedence over the running clock. */
  elapsedMs?: number;
  /** Wall-clock start, so the running clock survives remounts. */
  startedAt?: Date | number;
}
