export type ChatToolCallStatus =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'input-required';

export interface ChatToolCallModel {
  id: string;
  name: string;
  status: ChatToolCallStatus;
  args?: unknown;
  result?: unknown;
  error?: unknown;
  elapsedMs?: number;
}
