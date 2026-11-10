import {
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react';

import type { ChatSubagentModel } from '../ChatSubagent';
import type { ChatToolCallModel } from '../ChatToolCall';
import type {
  ChatThreadInterrupt,
  ChatThreadPart,
  ChatThreadToolPresentation,
  ChatThreadToolRenderer,
} from './ChatThread.types';
import type { ChatThreadState } from './useChatThread';

export interface ThreadContextValue {
  thread: ChatThreadState;
  tools: Record<string, ChatThreadToolRenderer>;
  agentName?: string;
  renderInterrupt?: (
    interrupt: ChatThreadInterrupt,
    thread: ChatThreadState
  ) => ReactNode | undefined;
  onOpenSubagent?: (subagent: ChatSubagentModel) => void;
}

export const ThreadContext = createContext<ThreadContextValue | null>(null);

export function useThread() {
  const context = useContext(ThreadContext);
  if (!context) throw new Error('Chat thread parts must be inside ChatThread.');
  return context;
}

export type ToolPresentation =
  | { kind: 'row'; props: ChatThreadToolPresentation }
  | { kind: 'element'; element: ReactElement }
  | { kind: 'hidden' };

export function present(
  tools: Record<string, ChatThreadToolRenderer>,
  toolCall: ChatToolCallModel
): ToolPresentation {
  const output = tools[toolCall.name]?.(toolCall);
  if (output === undefined) return { kind: 'row', props: {} };
  if (output === null) return { kind: 'hidden' };
  if (isValidElement(output)) return { kind: 'element', element: output };
  return { kind: 'row', props: output };
}

export function plainText(text: string) {
  // Results preview in a few lines, so drop Markdown syntax that would show.
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function errorText(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : 'Could not send your response.';
}

/** Work comes before the answer: everything up to the last non-text part. */
export function splitParts(parts: ChatThreadPart[]) {
  let lastWork = -1;
  parts.forEach((part, index) => {
    if (part.type !== 'text') lastWork = index;
  });
  return {
    work: parts.slice(0, lastWork + 1),
    answer: parts.slice(lastWork + 1),
  };
}
