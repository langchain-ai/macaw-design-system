import { useId, useLayoutEffect, useRef, useState } from 'react';

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowCounterClockwise';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import type {
  ChatRichContentFallbackProps,
  ChatRichContentProps,
  ChatRichContentState,
} from './ChatRichContent.types';

const containerClassName =
  'flex w-full min-w-0 flex-col gap-space-4 rounded-xl border border-subtle bg-elevated p-space-4 transition-colors duration-normal [overflow-wrap:anywhere] focus-within:border-focus motion-reduce:transition-none';

const stateMessages: Record<ChatRichContentState, string | undefined> = {
  unanswered: undefined,
  submitting: 'Submitting response…',
  submitted: 'Response submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  'submission-failed': 'Could not submit your response.',
  'validation-error': 'Check your response below.',
  expired: 'This request has expired.',
  disabled: 'Responding is unavailable.',
  'read-only': 'Read-only response',
};

export function ChatRichContent(props: ChatRichContentProps) {
  const {
    title,
    description,
    state = 'unanswered',
    message,
    children,
    className,
  } = props;
  const approval = props.variant === 'approval' ? props : undefined;
  const form = props.variant !== 'approval' ? props : undefined;
  const { onNext, onSkip, skipLabel = 'Skip', navigation } = form ?? {};
  const {
    onReject,
    onUndo,
    rejectLabel = 'Reject',
    rejectionReason,
  } = approval ?? {};
  const submitAction = approval ? approval.onApprove : form?.onSubmit;
  const id = useId();
  const currentQuestion = navigation?.current ?? 1;
  const [questionTransition, setQuestionTransition] = useState({
    current: currentQuestion,
    direction: 0,
  });
  useLayoutEffect(() => {
    setQuestionTransition((previous) =>
      previous.current === currentQuestion
        ? previous
        : {
            current: currentQuestion,
            direction: currentQuestion > previous.current ? 1 : -1,
          }
    );
  }, [currentQuestion]);
  const questionAnimation =
    navigation &&
    navigation.total > 1 &&
    questionTransition.direction !== 0 &&
    cn(
      'duration-normal ease-out animate-in fade-in motion-reduce:animate-none',
      questionTransition.direction > 0
        ? 'slide-in-from-right-4'
        : 'slide-in-from-left-4'
    );
  const submitGuard = useRef(false);
  const [submission, setSubmission] = useState<
    'pending' | 'rejecting' | 'skipping' | 'undoing'
  >();
  const [awaitingConfirmationFrom, setAwaitingConfirmationFrom] =
    useState<ChatRichContentState>();
  useLayoutEffect(() => {
    if (
      awaitingConfirmationFrom !== undefined &&
      state !== awaitingConfirmationFrom &&
      state !== 'submitting'
    ) {
      submitGuard.current = false;
      setSubmission(undefined);
      setAwaitingConfirmationFrom(undefined);
    }
  }, [awaitingConfirmationFrom, state]);
  const nextAction = state === 'submission-failed' ? undefined : onNext;
  const editable =
    state === 'unanswered' ||
    state === 'validation-error' ||
    state === 'submission-failed';
  const pending = submission !== undefined;
  const displayState = pending && editable ? 'submitting' : state;
  const hasDecision = state === 'approved' || state === 'rejected';
  const readOnly =
    state === 'submitted' || hasDecision || state === 'read-only';
  const actionsDisabled = !editable || pending;
  const disabled =
    actionsDisabled || (!nextAction && !submitAction && !onReject);
  const submitDisabled = actionsDisabled || (!nextAction && !submitAction);
  const navigationDisabled =
    pending || state === 'submitting' || state === 'disabled';
  const isError =
    displayState === 'submission-failed' || displayState === 'validation-error';
  const statusMessage =
    submission === 'skipping' && editable
      ? 'Skipping question…'
      : submission === 'rejecting' && displayState === 'submitting'
        ? 'Rejecting request…'
        : displayState === state
          ? (message ?? stateMessages[state])
          : stateMessages[displayState];

  async function handleAction(
    callback: (() => void | Promise<void>) | undefined,
    progress: 'pending' | 'rejecting' | 'skipping' | 'undoing'
  ) {
    if (
      !callback ||
      submitGuard.current ||
      (progress === 'undoing' ? !hasDecision : !editable)
    )
      return;
    // Guard synchronously; Enter and click may arrive before React rerenders.
    submitGuard.current = true;
    setSubmission(progress);
    try {
      await callback();
      if (progress === 'pending' || progress === 'rejecting') {
        // A retry's existing error is not confirmation of this attempt.
        setAwaitingConfirmationFrom(state);
      } else {
        submitGuard.current = false;
        setSubmission(undefined);
      }
    } catch {
      // The host supplies the validation/failure state and preserves its draft.
      submitGuard.current = false;
      setSubmission(undefined);
    }
  }

  function changeQuestion(current: number) {
    if (
      !navigation ||
      navigationDisabled ||
      submitGuard.current ||
      current < 1 ||
      current > navigation.total
    )
      return;
    navigation.onChange(current);
  }

  return (
    <form
      noValidate
      aria-labelledby={`${id}-title`}
      aria-describedby={statusMessage ? `${id}-status` : undefined}
      data-state={displayState}
      className={cn(containerClassName, className)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (nextAction) {
          if (!submitDisabled && !submitGuard.current) nextAction();
          return;
        }
        void handleAction(submitAction, 'pending');
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-space-3">
        <div
          key={currentQuestion}
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-space-1',
            questionAnimation
          )}
        >
          <Text id={`${id}-title`} variant="sm" weight="semibold">
            {title}
          </Text>
          {description && (
            <Text variant="xs" color="tertiary">
              {description}
            </Text>
          )}
        </div>
        {navigation && navigation.total > 1 && (
          <nav
            aria-label="Questions"
            className="flex shrink-0 items-center gap-space-1"
          >
            <IconButton
              type="button"
              icon={CaretLeftIcon}
              iconWeight="regular"
              size="sm"
              color="secondary"
              variant="plain"
              label="Previous question"
              disabled={navigationDisabled || navigation.current <= 1}
              onClick={() => changeQuestion(navigation.current - 1)}
            />
            <Text
              as="span"
              variant="xs"
              color="tertiary"
              aria-live="polite"
              aria-atomic="true"
              className="whitespace-nowrap tabular-nums"
            >
              {navigation.current} of {navigation.total}
            </Text>
            <IconButton
              type="button"
              icon={CaretRightIcon}
              iconWeight="regular"
              size="sm"
              color="secondary"
              variant="plain"
              label="Next question"
              disabled={
                navigationDisabled || navigation.current >= navigation.total
              }
              onClick={() => changeQuestion(navigation.current + 1)}
            />
          </nav>
        )}
      </div>
      {children != null && (
        <fieldset
          key={currentQuestion}
          disabled={disabled}
          aria-busy={pending || displayState === 'submitting'}
          className={cn(
            'm-0 flex min-w-0 flex-col gap-space-4 border-0 p-0',
            questionAnimation
          )}
        >
          {typeof children === 'function' ? children({ disabled }) : children}
        </fieldset>
      )}
      {rejectionReason &&
        state !== 'submitted' &&
        state !== 'approved' &&
        (!readOnly || rejectionReason.value) && (
          <Textarea
            label={
              readOnly ? 'Rejection Reason' : 'Rejection Reason (Optional)'
            }
            placeholder="What should the agent change?"
            size="md"
            rows={2}
            resize="vertical"
            value={rejectionReason.value}
            onChange={rejectionReason.onChange}
            disabled={actionsDisabled || !onReject}
          />
        )}
      {(!readOnly || statusMessage || (hasDecision && onUndo)) && (
        <div className="flex flex-wrap items-center justify-end gap-space-2">
          {hasDecision && onUndo && (
            <Button
              type="button"
              size="sm"
              color="secondary"
              variant="plain"
              leftDecorator={ArrowCounterClockwiseIcon}
              className="mr-auto"
              disabled={pending}
              loading={submission === 'undoing'}
              onClick={() => {
                void handleAction(onUndo, 'undoing');
              }}
            >
              Undo
            </Button>
          )}
          <Text
            id={`${id}-status`}
            role={isError ? 'alert' : 'status'}
            aria-atomic="true"
            variant="sm"
            className={cn(
              'flex min-w-0 flex-1 items-center gap-space-1 text-tertiary',
              hasDecision && 'justify-end',
              isError && 'text-error-primary',
              !statusMessage && 'sr-only'
            )}
          >
            {(state === 'submitted' || state === 'approved') && (
              <Icon
                icon={CheckIcon}
                aria-hidden
                size="md"
                weight="regular"
                className="text-success-primary"
              />
            )}
            {state === 'rejected' && (
              <Icon icon={XIcon} aria-hidden size="md" weight="regular" />
            )}
            <span className="min-w-0">{statusMessage}</span>
          </Text>
          {!readOnly && onSkip && (
            <Button
              type="button"
              size="sm"
              color="secondary"
              variant="plain"
              disabled={actionsDisabled}
              loading={submission === 'skipping'}
              onClick={() => {
                void handleAction(onSkip, 'skipping');
              }}
            >
              {skipLabel}
            </Button>
          )}
          {!readOnly && onReject && (
            <Button
              type="button"
              size="sm"
              color="secondary"
              variant="outlined"
              disabled={actionsDisabled}
              loading={submission === 'rejecting'}
              onClick={() => {
                void handleAction(
                  () => onReject(rejectionReason?.value ?? ''),
                  'rejecting'
                );
              }}
            >
              {rejectLabel}
            </Button>
          )}
          {!readOnly && (
            <Button
              type="submit"
              size="sm"
              color="primary"
              variant={nextAction || approval ? 'outlined' : 'normal'}
              disabled={submitDisabled}
              onClick={(event) => {
                if (event.detail > 1) event.preventDefault();
              }}
              loading={
                displayState === 'submitting' &&
                submission !== 'skipping' &&
                submission !== 'rejecting'
              }
            >
              {nextAction
                ? 'Next'
                : approval
                  ? (approval.approveLabel ?? 'Approve')
                  : state === 'submission-failed'
                    ? 'Retry response'
                    : (form?.submitLabel ?? 'Submit response')}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

/** Use after the host adapter rejects a block. Inert unless the host supplies actions. */
export function ChatRichContentFallback({
  actions,
}: ChatRichContentFallbackProps) {
  return (
    <div className={containerClassName}>
      <div className="flex flex-wrap items-center gap-space-2">
        <Text variant="sm" color="secondary" className="min-w-0 flex-1">
          This content is unavailable.
        </Text>
        {actions != null && (
          <div className="flex flex-wrap items-center justify-end gap-space-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
