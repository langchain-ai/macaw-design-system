import { Fragment, useState } from 'react';

import { ChatRichContent, type ChatRichContentState } from '../ChatRichContent';
import type { ChatToolCallModel } from '../ChatToolCall';
import { CodeLite } from '../Code/CodeLite';
import { Textarea } from '../Textarea';
import type {
  ChatThreadActionRequest,
  ChatThreadDecision,
  ChatThreadInterrupt,
} from './ChatThread.types';
import { errorText, present, useThread } from './ChatThreadContext';
import { toHumanInTheLoopResponse } from './interrupts';

function argsText(args: Record<string, unknown>) {
  return JSON.stringify(args, null, 2);
}

function shortDescription(description: string | undefined) {
  return description && description.length <= 140 && !description.includes('\n')
    ? description
    : undefined;
}

interface DecisionState {
  decision?: ChatThreadDecision;
  submitting: boolean;
  failure?: string;
  remaining: number;
}

function ApprovalRequest({
  request,
  fallbackId,
  state,
  onDecide,
  onUndo,
}: {
  request: ChatThreadActionRequest;
  fallbackId: string;
  state: DecisionState;
  onDecide: (decision: ChatThreadDecision) => Promise<void>;
  onUndo: () => void;
}) {
  const { tools } = useThread();
  const [reason, setReason] = useState('');
  const [reply, setReply] = useState('');
  const [draftArgs, setDraftArgs] = useState(() => argsText(request.args));
  const [argsError, setArgsError] = useState<string>();
  const toolCall: ChatToolCallModel = {
    id: request.toolCallId ?? fallbackId,
    name: request.name,
    status: 'input-required',
    args: request.args,
  };
  const presentation = present(tools, toolCall);
  const props = presentation.kind === 'row' ? presentation.props : {};
  const label = props.label ?? request.name;
  const title =
    typeof props.summary === 'string' ? `${label}: ${props.summary}` : label;
  const allowed = new Set(request.allowedDecisions);
  const description =
    shortDescription(request.description) ??
    'The agent is waiting for your approval to run this.';

  let cardState: ChatRichContentState = 'unanswered';
  let message: string | undefined;
  if (state.submitting) cardState = 'submitting';
  else if (state.failure) {
    cardState = 'submission-failed';
    message = state.failure;
  } else if (argsError) {
    cardState = 'validation-error';
    message = argsError;
  } else if (state.decision) {
    cardState = state.decision.type === 'reject' ? 'rejected' : 'approved';
    if (state.remaining > 0) {
      message = `${cardState === 'rejected' ? 'Rejected' : 'Approved'} · waiting for ${state.remaining} more ${state.remaining === 1 ? 'decision' : 'decisions'}`;
    }
  }

  if (allowed.has('respond') && !allowed.has('approve')) {
    return (
      <ChatRichContent
        title={title}
        description={
          shortDescription(request.description) ??
          'The agent asked for your reply.'
        }
        state={
          state.submitting
            ? 'submitting'
            : state.failure
              ? 'submission-failed'
              : state.decision
                ? 'submitted'
                : 'unanswered'
        }
        message={state.failure}
        submitLabel="Send reply"
        onSubmit={() => onDecide({ type: 'respond', message: reply.trim() })}
      >
        {({ disabled, isError, errorId }) => (
          <Textarea
            label="Reply"
            value={reply}
            onChange={setReply}
            rows={3}
            resize="vertical"
            disabled={disabled}
            isError={isError}
            aria-describedby={errorId}
          />
        )}
      </ChatRichContent>
    );
  }

  return (
    <ChatRichContent
      variant="approval"
      title={title}
      description={description}
      state={cardState}
      message={message}
      onApprove={
        allowed.has('approve') ? () => onDecide({ type: 'approve' }) : undefined
      }
      onReject={
        allowed.has('reject')
          ? (text) =>
              onDecide({ type: 'reject', message: text.trim() || undefined })
          : undefined
      }
      rejectionReason={
        allowed.has('reject')
          ? { value: reason, onChange: setReason }
          : undefined
      }
      onUndo={state.submitting ? undefined : onUndo}
      edit={
        allowed.has('edit')
          ? {
              label: 'Edit',
              submitLabel: 'Approve with edits',
              content: ({ disabled, isError, errorId }) => (
                <Textarea
                  label="Arguments"
                  value={draftArgs}
                  onChange={(value) => {
                    setDraftArgs(value);
                    setArgsError(undefined);
                  }}
                  rows={6}
                  resize="vertical"
                  className="font-mono"
                  disabled={disabled}
                  isError={isError}
                  aria-describedby={errorId}
                />
              ),
              onSubmit: async () => {
                let parsed: unknown;
                try {
                  parsed = JSON.parse(draftArgs);
                } catch {
                  parsed = undefined;
                }
                if (
                  typeof parsed !== 'object' ||
                  parsed === null ||
                  Array.isArray(parsed)
                ) {
                  setArgsError('Enter the arguments as a JSON object.');
                  throw new Error('Invalid arguments');
                }
                await onDecide({
                  type: 'edit',
                  args: parsed as Record<string, unknown>,
                });
              },
            }
          : undefined
      }
    >
      {props.children ?? (
        <CodeLite
          value={argsText(request.args)}
          language="json"
          variant="block"
          label="Arguments"
        />
      )}
    </ChatRichContent>
  );
}

function OtherInterrupt({
  interrupt,
}: {
  interrupt: Extract<ChatThreadInterrupt, { kind: 'other' }>;
}) {
  const { thread } = useThread();
  const [response, setResponse] = useState('');
  const [state, setState] = useState<ChatRichContentState>('unanswered');
  const [failure, setFailure] = useState<string>();
  const question =
    typeof interrupt.value === 'string' ? interrupt.value : undefined;
  return (
    <ChatRichContent
      title={
        question && question.length <= 140
          ? question
          : 'The agent needs your input'
      }
      description="Your response resumes the run."
      state={state}
      message={failure}
      submitLabel="Send"
      onSubmit={async () => {
        setState('submitting');
        try {
          await thread.actions.resume({ [interrupt.id]: response });
          setState('submitted');
        } catch (error) {
          setFailure(errorText(error));
          setState('submission-failed');
          throw error;
        }
      }}
    >
      {({ disabled, isError, errorId }) => (
        <>
          {question === undefined && interrupt.value !== undefined && (
            <CodeLite
              value={JSON.stringify(interrupt.value, null, 2)}
              language="json"
              variant="block"
              label="Request"
            />
          )}
          <Textarea
            label="Response"
            value={response}
            onChange={setResponse}
            rows={3}
            resize="vertical"
            disabled={disabled}
            isError={isError}
            aria-describedby={errorId}
          />
        </>
      )}
    </ChatRichContent>
  );
}

export function InterruptRequests() {
  const { thread, renderInterrupt } = useThread();
  const { interrupts } = thread.model;
  const [decisions, setDecisions] = useState<
    Record<string, (ChatThreadDecision | undefined)[]>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string>();
  // A new set of interrupts starts with a clean slate.
  const key = interrupts.map((interrupt) => interrupt.id).join('|');
  const [decisionsFor, setDecisionsFor] = useState(key);
  if (decisionsFor !== key) {
    setDecisionsFor(key);
    setDecisions({});
    setSubmitting(false);
    setFailure(undefined);
  }
  const custom = new Map(
    interrupts.map((interrupt) => [
      interrupt.id,
      renderInterrupt?.(interrupt, thread),
    ])
  );
  // A host that renders an approval itself also resumes it, so the built-in
  // cards batch only the approvals they show.
  const approvals = interrupts.filter(
    (
      interrupt
    ): interrupt is Extract<ChatThreadInterrupt, { kind: 'approval' }> =>
      interrupt.kind === 'approval' && custom.get(interrupt.id) === undefined
  );
  const total = approvals.reduce(
    (sum, interrupt) => sum + interrupt.requests.length,
    0
  );
  const decided = approvals.reduce(
    (sum, interrupt) =>
      sum +
      interrupt.requests.filter((_, index) => decisions[interrupt.id]?.[index])
        .length,
    0
  );

  async function decide(
    interruptId: string,
    index: number,
    decision: ChatThreadDecision
  ) {
    const current = [...(decisions[interruptId] ?? [])];
    current[index] = decision;
    const next = { ...decisions, [interruptId]: current };
    setDecisions(next);
    setFailure(undefined);
    const complete = approvals.every((interrupt) =>
      interrupt.requests.every(
        (_, requestIndex) => next[interrupt.id]?.[requestIndex]
      )
    );
    // Requests paused together resume together, once each has a decision.
    if (!complete) return;
    setSubmitting(true);
    try {
      await thread.actions.resume(
        Object.fromEntries(
          approvals.map((interrupt) => [
            interrupt.id,
            toHumanInTheLoopResponse(
              interrupt,
              next[interrupt.id] as ChatThreadDecision[]
            ),
          ])
        )
      );
    } catch (error) {
      setFailure(errorText(error));
      setSubmitting(false);
      throw error;
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      {interrupts.map((interrupt) => {
        const rendered = custom.get(interrupt.id);
        if (rendered !== undefined)
          return <Fragment key={interrupt.id}>{rendered}</Fragment>;
        if (interrupt.kind === 'other') {
          return <OtherInterrupt key={interrupt.id} interrupt={interrupt} />;
        }
        return interrupt.requests.map((request, index) => (
          <ApprovalRequest
            key={`${interrupt.id}:${index}`}
            request={request}
            fallbackId={`${interrupt.id}:${index}`}
            state={{
              decision: decisions[interrupt.id]?.[index],
              submitting,
              failure,
              remaining: total - decided,
            }}
            onDecide={(decision) => decide(interrupt.id, index, decision)}
            onUndo={() =>
              setDecisions((current) => {
                const list = [...(current[interrupt.id] ?? [])];
                list[index] = undefined;
                return { ...current, [interrupt.id]: list };
              })
            }
          />
        ));
      })}
    </div>
  );
}
