import type { ReactNode } from 'react';

export type ChatRichContentState =
  | 'unanswered'
  | 'submitting'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'submission-failed'
  | 'validation-error'
  | 'expired'
  | 'disabled'
  | 'read-only';

export interface ChatRichContentRendererContext {
  disabled: boolean;
}

/** Hosts compose existing controls or adapt one product card at a time. */
export type ChatRichContentRenderer = (
  context: ChatRichContentRendererContext
) => ReactNode;

export interface ChatRichContentNavigation {
  /** One-based position; keep the container mounted and preserve values when switching. */
  current: number;
  total: number;
  onChange: (current: number) => void;
}

interface ChatRichContentBaseProps {
  title: string;
  description?: string;
  /**
   * Decisions stay pending until state changes from the attempt's starting state,
   * excluding submitting. Throw from the callback when a retry fails with the same
   * error state. Set unanswered after confirmation to reopen; key by request ID
   * for a new request.
   */
  state?: ChatRichContentState;
  /** Host-provided validation, failure, or availability explanation. */
  message?: string;
  children?: ReactNode | ChatRichContentRenderer;
  className?: string;
}

interface ChatRichContentFormProps extends ChatRichContentBaseProps {
  variant?: 'form';
  submitLabel?: string;
  skipLabel?: string;
  /** Shows Next instead of Submit; the host validates and advances without accepting answers. */
  onNext?: () => void;
  /** The host saves the response and sets submitted or an error state. */
  onSubmit?: () => void | Promise<void>;
  /** Advances or marks skipped without accepting the response; set read-only state for a final skip. */
  onSkip?: () => void | Promise<void>;
  navigation?: ChatRichContentNavigation;
}

interface ChatRichContentApprovalProps extends ChatRichContentBaseProps {
  variant: 'approval';
  approveLabel?: string;
  rejectLabel?: string;
  /** The host saves the decision and sets approved or an error state. */
  onApprove?: () => void | Promise<void>;
  /** Receives the reason unchanged, or an empty string. The host saves and sets rejected or an error state. */
  onReject?: (reason: string) => void | Promise<void>;
  /** Set unanswered after undo succeeds; preserve the decision and show a message on failure. */
  onUndo?: () => void | Promise<void>;
  /** Opt into a reason field within the card; the host owns the draft and any validation. */
  rejectionReason?: {
    value: string;
    onChange: (value: string) => void;
  };
}

export type ChatRichContentProps =
  | ChatRichContentFormProps
  | ChatRichContentApprovalProps;

export interface ChatRichContentFallbackProps {
  /** Optional recovery controls; the host decides whether reloading or skipping is available. */
  actions?: ReactNode;
}

export interface ChatRichContentChoicesValue {
  /** At most one option in single-choice mode. */
  selected: string[];
  /** Keep deselected text as a draft; the host excludes it from submission. */
  custom?: { selected: boolean; text: string };
}

export interface ChatRichContentChoicesProps {
  mode: 'single' | 'multiple';
  options: { value: string; label: string }[];
  value: ChatRichContentChoicesValue;
  onChange: (value: ChatRichContentChoicesValue) => void;
  'aria-label': string;
  allowCustom?: boolean;
  disabled?: boolean;
  isError?: boolean;
}
