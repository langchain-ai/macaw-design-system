import type { ReactNode } from 'react';

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type ChatMessageStatus =
  | 'idle'
  | 'queued'
  | 'submitting'
  | 'streaming'
  | 'interrupted'
  | 'failed'
  | 'stopped'
  | 'completed';

export type ChatMessageContentBlock = {
  /** Stable within a message, including while its content streams. */
  id: string;
  appearance?: 'plain' | 'bubble';
} & (
  | { type: 'text'; text: string }
  | {
      type: 'custom';
      /** Host-rendered Markdown, attachments, tools, or rich content. */
      content: ReactNode;
    }
);

export interface ChatMessageIdentity {
  name: string;
}

export interface ChatMessageAction {
  onClick: () => void;
  label?: string;
  /** A host-specific reason disables the action and describes why. */
  disabledReason?: string;
}

export interface ChatMessageActionCapabilities {
  copy?: ChatMessageAction;
  edit?: ChatMessageAction;
  retry?: ChatMessageAction;
}

/** Render-ready presentation data; product payloads and parsing stay in adapters. */
export interface ChatMessageModel {
  id: string;
  role: ChatMessageRole;
  status: ChatMessageStatus;
  readOnly?: boolean;
  identity?: ChatMessageIdentity;
  content: readonly ChatMessageContentBlock[];
}
