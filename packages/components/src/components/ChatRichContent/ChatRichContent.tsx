import { useContext, useId, useLayoutEffect, useRef, useState } from 'react';

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowCounterClockwise';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatComposerContext } from '../ChatComposer/ChatComposerContext';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { Textarea } from '../Textarea';
import type {
  ChatRichContentFallbackProps,
  ChatRichContentProps,
  ChatRichContentState,
} from './ChatRichContent.types';
import { ChatRichContentCollapsible } from './ChatRichContentCollapsible';
import { ChatRichContentQuestionNav } from './ChatRichContentQuestionNav';
import { ChatRichContentStatus } from './ChatRichContentStatus';

const containerClassName =
  'flex w-full min-w-0 flex-col gap-space-3 rounded-xl border border-subtle bg-elevated p-space-4 transition-colors duration-normal [overflow-wrap:anywhere] focus-within:border-focus motion-reduce:transition-none';

const stateMessages: Record<ChatRichContentState, string | undefined> = {
  unanswered: undefined,
  submitting: 'Submitting response…',
  submitted: 'Response submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  'submission-failed': 'Could not submit your response.',
  'validation-error': 'Check your response.',
  expired: 'This request has expired.',
  disabled: 'Responding is unavailable.',
  'read-only': 'Read-only response',
};

export function ChatRichContent(props: ChatRichContentProps) {
  const {
    presentation = 'block',
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    title,
    description,
    state = 'unanswered',
    message,
    children,
    className,
  } = props;
  const isDrawer = presentation === 'drawer';
  const Container = isDrawer ? 'section' : 'form';
  const approval = props.variant === 'approval' ? props : undefined;
  const form = props.variant !== 'approval' ? props : undefined;
  const {
    onNext,
    onSkip,
    skipLabel = 'Skip',
    hintLabel = children == null
      ? 'Type your answer below'
      : 'Or type your own answer below',
    navigation,
  } = form ?? {};
  const {
    onReject,
    onUndo,
    rejectLabel = 'Reject',
    rejectionReason,
    edit,
  } = approval ?? {};
  // Drawers submit through the composer, so editing stays in block cards.
  const editConfig = isDrawer ? undefined : edit;
  const [editing, setEditing] = useState(false);
  // The body crossfades between the request and its edit fields once toggled.
  const [editToggled, setEditToggled] = useState(false);
  const isEditing = editing && editConfig !== undefined;
  const bodyContent = isEditing ? editConfig.content : children;
  const submitAction = isEditing
    ? editConfig.onSubmit
    : approval
      ? approval.onApprove
      : form?.onSubmit;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<'fields' | 'edit' | null>(null);
  // Entering edit mode moves focus to the first field; Cancel returns it to Edit.
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === 'edit') {
      editButtonRef.current?.focus();
      return;
    }
    fieldsetRef.current
      ?.querySelector<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], button, [tabindex]:not([tabindex="-1"])'
      )
      ?.focus();
  });
  const id = useId();
  const currentQuestion = navigation?.current ?? 1;
  const [questionTransition, setQuestionTransition] = useState({
    current: currentQuestion,
    direction: 0,
  });
  if (questionTransition.current !== currentQuestion) {
    setQuestionTransition({
      current: currentQuestion,
      direction: currentQuestion > questionTransition.current ? 1 : -1,
    });
  }
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
  // A saved decision ends editing; undoing it returns to the original request.
  if (editing && !editable) setEditing(false);
  const pending = submission !== undefined;
  const displayState = pending && editable ? 'submitting' : state;
  const hasDecision = state === 'approved' || state === 'rejected';
  const readOnly =
    state === 'submitted' || hasDecision || state === 'read-only';
  const composerDisabled = useContext(ChatComposerContext)?.disabled ?? false;
  const actionsDisabled = !editable || pending || composerDisabled;
  const disabled =
    actionsDisabled || (!isDrawer && !nextAction && !submitAction && !onReject);
  const submitDisabled = actionsDisabled || (!nextAction && !submitAction);
  const navigationDisabled =
    pending ||
    composerDisabled ||
    state === 'submitting' ||
    state === 'disabled';
  const isError =
    displayState === 'submission-failed' || displayState === 'validation-error';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  // Errors stay visible so a collapsed drawer cannot hide why submission failed.
  const expanded = !isDrawer || isError || open;
  const errorExpansionRequested = useRef(false);
  // Stay open once the error clears so the choices remain while the answer is fixed.
  useLayoutEffect(() => {
    if (!isDrawer || !isError || open) {
      errorExpansionRequested.current = false;
      return;
    }
    // A controlled host may decline this request. Do not notify it again on
    // every render (including renders caused by its own onOpenChange handler).
    if (errorExpansionRequested.current) return;
    errorExpansionRequested.current = true;
    setUncontrolledOpen(true);
    onOpenChange?.(true);
  }, [isDrawer, isError, open, onOpenChange]);
  const statusMessage =
    submission === 'skipping' && editable
      ? 'Skipping question…'
      : submission === 'rejecting' && displayState === 'submitting'
        ? 'Rejecting request…'
        : displayState === state
          ? (message ?? stateMessages[state])
          : stateMessages[displayState];
  const errorId = isError ? `${id}-status` : undefined;
  // The composer below owns the answer in a drawer, so the footer says so
  // beside Skip; status feedback takes its place.
  const footerHint =
    isDrawer && form && !readOnly && !composerDisabled && !statusMessage
      ? hintLabel
      : undefined;
  const canUndo = hasDecision && onUndo !== undefined;
  // Block cards always render a submit button; drawers only render Skip/Reject.
  const hasFooterActions = !readOnly && (!isDrawer || onSkip || onReject);
  const showFooter = Boolean(
    statusMessage || footerHint || canUndo || hasFooterActions
  );

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

  function renderSecondaryActions(size: 'xs' | 'sm') {
    if (isEditing) {
      return (
        <Button
          type="button"
          size={size}
          color="secondary"
          variant="plain"
          disabled={pending}
          onClick={() => {
            pendingFocus.current = 'edit';
            setEditToggled(true);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      );
    }
    return (
      <>
        {editConfig && (
          <Button
            ref={editButtonRef}
            type="button"
            size={size}
            color="secondary"
            variant="plain"
            disabled={actionsDisabled}
            onClick={() => {
              pendingFocus.current = 'fields';
              setEditToggled(true);
              setEditing(true);
            }}
          >
            {editConfig.label ?? 'Edit'}
          </Button>
        )}
        {onSkip && (
          <Button
            type="button"
            size={size}
            color="secondary"
            variant="plain"
            disabled={actionsDisabled}
            loading={submission === 'skipping'}
            onClick={(event) => {
              if (event.detail > 1) return;
              void handleAction(onSkip, 'skipping');
            }}
          >
            {skipLabel}
          </Button>
        )}
        {onReject && (
          <Button
            type="button"
            size={size}
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
      </>
    );
  }

  function toggleOpen() {
    const next = !expanded;
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Container
      noValidate={isDrawer ? undefined : true}
      aria-labelledby={`${id}-title`}
      aria-describedby={statusMessage ? `${id}-status` : undefined}
      aria-busy={pending || state === 'submitting'}
      data-state={displayState}
      className={cn(
        containerClassName,
        isDrawer && 'gap-0 rounded-none border-0 bg-transparent py-space-3',
        className
      )}
      onSubmit={
        isDrawer
          ? undefined
          : (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (nextAction) {
                if (!submitDisabled && !submitGuard.current) nextAction();
                return;
              }
              void handleAction(submitAction, 'pending');
            }
      }
    >
      <div className="flex min-w-0 flex-col">
        <div
          className={cn(
            'flex justify-between gap-space-2',
            expanded ? 'items-start' : 'items-center',
            !isDrawer && 'flex-wrap'
          )}
        >
          <Text
            key={currentQuestion}
            id={`${id}-title`}
            variant="sm"
            weight="semibold"
            className={cn(
              'min-w-0 flex-1',
              expanded ? 'text-pretty' : 'truncate',
              questionAnimation
            )}
          >
            {title}
          </Text>
          {/* A collapsed drawer keeps its status in the header. */}
          {!expanded && statusMessage && (
            <ChatRichContentStatus
              id={`${id}-status`}
              live
              compact
              state={state}
              isError={isError}
            >
              {statusMessage}
            </ChatRichContentStatus>
          )}
          {!expanded && !statusMessage && !readOnly && (onSkip || onReject) && (
            <div className="flex shrink-0 items-center gap-space-1">
              {renderSecondaryActions('xs')}
            </div>
          )}
          {/* One title line tall (same text classes as Text sm) so controls
              center on the title's first line when it wraps. */}
          <div className="flex h-[1lh] shrink-0 items-center gap-space-2 text-xs leading-tight empty:hidden">
            {expanded && navigation && navigation.total > 1 && (
              <ChatRichContentQuestionNav
                title={title}
                current={navigation.current}
                total={navigation.total}
                disabled={navigationDisabled}
                onChange={changeQuestion}
              />
            )}
            {/* Errors force the drawer open, so there is nothing to toggle. */}
            {isDrawer && !isError && (
              <IconButton
                type="button"
                icon={CaretDownIcon}
                // Heavier than the pager's carets so the two controls read apart.
                iconWeight="bold"
                size="xxs"
                color="secondary"
                variant="plain"
                label={expanded ? 'Collapse question' : 'Expand question'}
                aria-expanded={expanded}
                aria-controls={`${id}-body`}
                className={cn(
                  'shrink-0 [&_svg]:transition-transform [&_svg]:duration-normal [&_svg]:ease-out motion-reduce:[&_svg]:transition-none',
                  expanded && '[&_svg]:rotate-180'
                )}
                onClick={toggleOpen}
              />
            )}
          </div>
        </div>
        {description && (
          <ChatRichContentCollapsible open={expanded}>
            <Text
              key={currentQuestion}
              variant="xs"
              color="tertiary"
              className={cn('pt-space-1 text-pretty', questionAnimation)}
            >
              {description}
            </Text>
          </ChatRichContentCollapsible>
        )}
      </div>
      <ChatRichContentCollapsible
        id={`${id}-body`}
        open={expanded}
        disabled={!isDrawer}
        className={cn(
          isDrawer && (children == null ? 'pt-space-1' : 'pt-space-4')
        )}
      >
        {bodyContent != null && (
          <fieldset
            key={`${currentQuestion}-${isEditing ? 'edit' : 'review'}`}
            ref={fieldsetRef}
            disabled={disabled}
            aria-label={
              isEditing
                ? `${editConfig.label ?? 'Edit'} ${title}`.trim()
                : undefined
            }
            className={cn(
              'm-0 flex min-w-0 flex-col gap-space-4 border-0 p-0',
              questionAnimation,
              editToggled &&
                'duration-normal ease-[cubic-bezier(0.32,0.72,0,1)] animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none'
            )}
          >
            {typeof bodyContent === 'function'
              ? bodyContent({ disabled, isError, errorId })
              : bodyContent}
          </fieldset>
        )}
        {rejectionReason &&
          !isEditing &&
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
              isError={isError}
              aria-describedby={errorId}
            />
          )}
        {showFooter && (
          <div className="flex flex-wrap items-center justify-end gap-space-2">
            {canUndo && (
              <Button
                type="button"
                size="sm"
                color="secondary"
                variant="plain"
                leftDecorator={ArrowCounterClockwiseIcon}
                className="mr-auto"
                disabled={pending || composerDisabled}
                loading={submission === 'undoing'}
                onClick={() => {
                  void handleAction(onUndo, 'undoing');
                }}
              >
                Undo
              </Button>
            )}
            {footerHint && (
              <Text
                variant="xs"
                color="tertiary"
                className="min-w-0 flex-1 text-pretty"
              >
                {footerHint}
              </Text>
            )}
            {/* Stays mounted while collapsed so the body height animates. */}
            {statusMessage && (
              <ChatRichContentStatus
                id={`${id}-status`}
                live={expanded}
                compact={false}
                state={state}
                isError={isError}
              >
                {statusMessage}
              </ChatRichContentStatus>
            )}
            {!readOnly && renderSecondaryActions('sm')}
            {!readOnly && !isDrawer && (
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
                  : isEditing
                    ? (editConfig.submitLabel ?? 'Approve with edits')
                    : approval
                      ? (approval.approveLabel ?? 'Approve')
                      : state === 'submission-failed'
                        ? 'Retry response'
                        : (form?.submitLabel ?? 'Submit response')}
              </Button>
            )}
          </div>
        )}
      </ChatRichContentCollapsible>
    </Container>
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
