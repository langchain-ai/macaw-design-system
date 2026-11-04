import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import {
  ChatRichContent,
  ChatRichContentFallback,
  type ChatRichContentState,
} from '..';
import { act, render, screen } from '../../../test-utils';
import { Input } from '../../Input';

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return {
    promise,
    async settle() {
      await act(async () => {
        resolve();
        await promise;
      });
    },
  };
}

function HostExample({ save }: { save?: (value: string) => Promise<void> }) {
  const [draft, setDraft] = useState('');
  const [accepted, setAccepted] = useState<string>();
  const [state, setState] = useState<ChatRichContentState>('unanswered');

  async function submit(action: (value: string) => Promise<void>) {
    try {
      await action(draft);
      setAccepted(draft);
      setState('submitted');
    } catch (error) {
      setState('submission-failed');
      throw error;
    }
  }

  return (
    <ChatRichContent
      title="Name your agent"
      state={state}
      onSubmit={save ? () => submit(save) : undefined}
    >
      {({ disabled }) => (
        <Input
          label="Name"
          value={accepted ?? draft}
          onChange={setDraft}
          debounceMs={0}
          disabled={disabled}
        />
      )}
    </ChatRichContent>
  );
}

function ApprovalHost({ save }: { save: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [state, setState] = useState<ChatRichContentState>('unanswered');
  return (
    <ChatRichContent
      variant="approval"
      title="Review changes"
      state={state}
      onApprove={() => setState('approved')}
      onReject={async (value) => {
        try {
          await save(value);
          setState('rejected');
        } catch (error) {
          setState('submission-failed');
          throw error;
        }
      }}
      rejectionReason={{ value: reason, onChange: setReason }}
    />
  );
}

const reasonField = () =>
  screen.getByRole('textbox', { name: /rejection reason/i });

describe('ChatRichContent', () => {
  it('provides an inert fallback for adapters', () => {
    render(<ChatRichContentFallback />);
    expect(screen.getByText('This content is unavailable.')).toBeVisible();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('blocks duplicate submission until the host confirms the outcome', async () => {
    const request = deferred();
    const onSubmit = vi.fn().mockReturnValue(request.promise);
    const { user, rerender } = render(
      <ChatRichContent title="Continue?" onSubmit={onSubmit} />
    );
    await user.dblClick(
      screen.getByRole('button', { name: 'Submit response' })
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Submitting response…'
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await request.settle();
    expect(screen.getByRole('button')).toBeDisabled();
    await user.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    rerender(
      <ChatRichContent
        title="Continue?"
        state="submitted"
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Response submitted');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<ChatRichContent title="Continue?" onSubmit={onSubmit} />);
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('keeps drafts after failure and retries through the submit callback when available', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValue(undefined);
    const { user, rerender } = render(<HostExample save={save} />);
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Research');
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not submit your response.'
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Research'
    );
    rerender(<HostExample />);
    expect(
      screen.getByRole('button', { name: 'Retry response' })
    ).toBeDisabled();
    rerender(<HostExample save={save} />);
    await user.click(screen.getByRole('button', { name: 'Retry response' }));
    expect(await screen.findByText('Response submitted')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith('Research');
  });

  it('connects host validation to the field and permits a corrected response', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Invalid'))
      .mockResolvedValue(undefined);
    const card = (state: ChatRichContentState) => (
      <ChatRichContent
        title="Agent instructions"
        state={state}
        message="Add instructions before continuing."
        onSubmit={onSubmit}
      >
        {({ disabled, isError, errorId }) => (
          <Input
            aria-label="Instructions"
            value=""
            onChange={() => {}}
            disabled={disabled}
            isError={isError}
            aria-describedby={errorId}
          />
        )}
      </ChatRichContent>
    );
    const { user, rerender } = render(card('unanswered'));
    const field = screen.getByRole('textbox', { name: 'Instructions' });
    expect(field).not.toHaveAccessibleDescription();
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    rerender(card('validation-error'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add instructions before continuing.'
    );
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription(
      'Add instructions before continuing.'
    );
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it.each([
    'submitting',
    'expired',
    'disabled',
  ] satisfies ChatRichContentState[])(
    'disables fields, submit, and skip in %s state',
    async (state) => {
      const onSubmit = vi.fn();
      const onSkip = vi.fn();
      const { user } = render(
        <ChatRichContent
          title="Agent instructions"
          state={state}
          onSubmit={onSubmit}
          onSkip={onSkip}
        >
          {({ disabled }) => (
            <Input
              aria-label="Instructions"
              onChange={() => {}}
              disabled={disabled}
            />
          )}
        </ChatRichContent>
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
      for (const name of ['Skip', 'Submit response']) {
        const button = screen.getByRole('button', { name });
        expect(button).toBeDisabled();
        await user.click(button);
      }
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onSkip).not.toHaveBeenCalled();
    }
  );

  it.each(['submitted', 'read-only'] satisfies ChatRichContentState[])(
    'shows a %s response without actions',
    (state) => {
      render(
        <ChatRichContent
          title="Agent instructions"
          state={state}
          onSubmit={vi.fn()}
          onSkip={vi.fn()}
        >
          {({ disabled }) => (
            <Input
              aria-label="Instructions"
              onChange={() => {}}
              disabled={disabled}
            />
          )}
        </ChatRichContent>
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    }
  );

  describe('approval', () => {
    it('associates rejection validation with the editable reason field', () => {
      render(
        <ChatRichContent
          variant="approval"
          title="Review changes"
          state="validation-error"
          message="Explain which change needs revision."
          onReject={() => {}}
          rejectionReason={{ value: '', onChange: () => {} }}
        />
      );
      expect(reasonField()).toBeEnabled();
      expect(reasonField()).toBeInvalid();
      expect(reasonField()).toHaveAccessibleDescription(
        'Explain which change needs revision.'
      );
    });

    it.each([
      { from: 'unanswered', action: 'Reject', pending: 'Rejecting request…' },
      {
        from: 'submission-failed',
        action: 'Approve',
        pending: 'Submitting response…',
      },
      {
        from: 'validation-error',
        action: 'Reject',
        pending: 'Rejecting request…',
      },
    ] satisfies {
      from: ChatRichContentState;
      action: 'Approve' | 'Reject';
      pending: string;
    }[])(
      'locks both decisions from $from until the host confirms $action',
      async ({ from, action, pending }) => {
        const onDecide = vi.fn().mockResolvedValue(undefined);
        const card = (state: ChatRichContentState) => (
          <ChatRichContent
            variant="approval"
            title="Review changes"
            state={state}
            onApprove={onDecide}
            onReject={onDecide}
          />
        );
        const expectLocked = () => {
          expect(
            screen.getByRole('button', { name: 'Approve' })
          ).toBeDisabled();
          expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
        };
        const { user, rerender } = render(card(from));
        await user.dblClick(screen.getByRole('button', { name: action }));
        expect(screen.getByRole('status')).toHaveTextContent(pending);
        expectLocked();
        rerender(card('submitting'));
        expectLocked();
        // The callback resolved, but the starting state is not confirmation.
        rerender(card(from));
        expectLocked();
        await user.click(screen.getByRole('button', { name: 'Approve' }));
        await user.click(screen.getByRole('button', { name: 'Reject' }));
        expect(onDecide).toHaveBeenCalledTimes(1);

        const outcome = action === 'Approve' ? 'Approved' : 'Rejected';
        rerender(card(action === 'Approve' ? 'approved' : 'rejected'));
        expect(screen.getByRole('status')).toHaveTextContent(outcome);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        rerender(card('unanswered'));
        await user.click(screen.getByRole('button', { name: action }));
        expect(onDecide).toHaveBeenCalledTimes(2);
      }
    );

    it('allows reject-only cards to edit child controls without enabling approval', async () => {
      const reject = vi.fn();
      function RejectOnlyExample() {
        const [draft, setDraft] = useState('');
        const [state, setState] = useState<ChatRichContentState>('unanswered');
        return (
          <ChatRichContent
            variant="approval"
            title="Review changes"
            state={state}
            onReject={() => {
              reject(draft);
              setState('rejected');
            }}
          >
            {({ disabled }) => (
              <Input
                label="Requested changes"
                value={draft}
                onChange={setDraft}
                debounceMs={0}
                disabled={disabled}
              />
            )}
          </ChatRichContent>
        );
      }
      const { user } = render(<RejectOnlyExample />);
      const input = screen.getByRole('textbox', { name: 'Requested changes' });
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      await user.type(input, 'Preserve the existing format.');
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(reject).toHaveBeenCalledWith('Preserve the existing format.');
      expect(input).toBeDisabled();
    });

    it('rejects without a reason and hides the empty field afterward', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      const { user } = render(<ApprovalHost save={save} />);
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Rejected');
      expect(save).toHaveBeenCalledWith('');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('keeps the reason through repeated failures and shows it read-only once rejected', async () => {
      const save = vi
        .fn()
        .mockRejectedValueOnce(new Error('Save failed'))
        .mockRejectedValueOnce(new Error('Save failed again'))
        .mockResolvedValue(undefined);
      const { user } = render(<ApprovalHost save={save} />);
      const reason = 'Keep the original wording.';
      await user.type(reasonField(), reason);
      // The second failure lands on the same error state, so the thrown
      // error is what releases the lock.
      for (const attempt of [1, 2]) {
        await user.click(screen.getByRole('button', { name: 'Reject' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Could not submit your response.'
        );
        expect(reasonField()).toHaveValue(reason);
        expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
        expect(save).toHaveBeenCalledTimes(attempt);
      }
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Rejected');
      expect(save).toHaveBeenLastCalledWith(reason);
      expect(reasonField()).toHaveValue(reason);
      expect(reasonField()).toBeDisabled();
    });

    it('hides the unused rejection draft after approval', async () => {
      const save = vi.fn();
      const { user } = render(<ApprovalHost save={save} />);
      await user.type(reasonField(), 'A draft reason');
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Approved');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(save).not.toHaveBeenCalled();
    });

    it('guards pending undo and restores actions with the rejection draft', async () => {
      const request = deferred();
      const undo = vi.fn().mockReturnValue(request.promise);
      function UndoExample() {
        const [state, setState] = useState<ChatRichContentState>('unanswered');
        const [reason, setReason] = useState('Keep the original wording.');
        return (
          <ChatRichContent
            variant="approval"
            title="Review changes"
            state={state}
            onApprove={() => setState('approved')}
            onReject={() => setState('rejected')}
            onUndo={async () => {
              await undo();
              setState('unanswered');
            }}
            rejectionReason={{ value: reason, onChange: setReason }}
          />
        );
      }
      const { user } = render(<UndoExample />);
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      await user.dblClick(screen.getByRole('button', { name: 'Undo' }));
      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
      expect(undo).toHaveBeenCalledTimes(1);
      await request.settle();
      expect(reasonField()).toHaveValue('Keep the original wording.');
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      await user.click(screen.getByRole('button', { name: 'Undo' }));
      expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
      expect(reasonField()).toHaveValue('Keep the original wording.');
    });
  });

  describe('questions', () => {
    it('skips only one question on a double-click when the host advances immediately', async () => {
      const onSkip = vi.fn();
      function StepsExample() {
        const [current, setCurrent] = useState(1);
        return (
          <ChatRichContent
            title={`Question ${current}`}
            navigation={{ current, total: 3, onChange: setCurrent }}
            onSkip={() => {
              onSkip(current);
              setCurrent(current + 1);
            }}
          />
        );
      }
      const { user } = render(<StepsExample />);
      await user.dblClick(screen.getByRole('button', { name: 'Skip' }));
      expect(onSkip).toHaveBeenCalledExactlyOnceWith(1);
      expect(screen.getByText('2 of 3')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Skip' }));
      expect(onSkip).toHaveBeenLastCalledWith(2);
    });

    it('keeps answers editable through Next and only submits on the final step', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      function StepsExample() {
        const [current, setCurrent] = useState(1);
        const [value, setValue] = useState('');
        const [submitted, setSubmitted] = useState(false);
        return (
          <ChatRichContent
            title="Agent details"
            state={submitted ? 'submitted' : 'unanswered'}
            navigation={{ current, total: 2, onChange: setCurrent }}
            onNext={current === 1 ? () => setCurrent(2) : undefined}
            onSubmit={async () => {
              await save(value);
              setSubmitted(true);
            }}
          >
            {({ disabled }) => (
              <Input
                label="Answer"
                value={value}
                onChange={setValue}
                disabled={disabled}
                debounceMs={0}
              />
            )}
          </ChatRichContent>
        );
      }
      const { user } = render(<StepsExample />);
      expect(
        screen.queryByRole('button', { name: 'Submit response' })
      ).not.toBeInTheDocument();
      await user.type(
        screen.getByRole('textbox', { name: 'Answer' }),
        'Research{Enter}'
      );
      expect(screen.getByText('2 of 2')).toBeVisible();
      await user.click(
        screen.getByRole('button', { name: 'Previous question' })
      );
      await user.type(
        screen.getByRole('textbox', { name: 'Answer' }),
        ' assistant'
      );
      await user.click(screen.getByRole('button', { name: /^Next$/ }));
      expect(save).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Submit response' }));
      expect(save).toHaveBeenCalledExactlyOnceWith('Research assistant');
      expect(screen.getByRole('textbox', { name: 'Answer' })).toBeDisabled();
      expect(screen.getByRole('status')).toHaveTextContent(
        'Response submitted'
      );
    });

    // With two questions the second click would land on Submit; with three,
    // on Next again.
    it.each([2, 3])(
      'advances one question per double-click in a %i-question form',
      async (total) => {
        const onSubmit = vi.fn();
        function StepsExample() {
          const [current, setCurrent] = useState(1);
          return (
            <ChatRichContent
              title={`Question ${current}`}
              navigation={{ current, total, onChange: setCurrent }}
              onNext={
                current < total ? () => setCurrent(current + 1) : undefined
              }
              onSubmit={onSubmit}
            />
          );
        }
        const { user } = render(<StepsExample />);
        await user.dblClick(screen.getByRole('button', { name: /^Next$/ }));
        expect(screen.getByText(`2 of ${total}`)).toBeVisible();
        expect(onSubmit).not.toHaveBeenCalled();
      }
    );

    it('locks skip, submit, and navigation while skipping', async () => {
      const request = deferred();
      const onSkip = vi.fn().mockReturnValue(request.promise);
      const onSubmit = vi.fn();
      const onChange = vi.fn();
      const { user } = render(
        <ChatRichContent
          title="Optional question"
          onSkip={onSkip}
          onSubmit={onSubmit}
          navigation={{ current: 2, total: 3, onChange }}
        />
      );
      await user.dblClick(screen.getByRole('button', { name: 'Skip' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Skipping question…'
      );
      for (const name of [
        'Skip',
        'Submit response',
        'Previous question',
        'Next question',
      ]) {
        expect(screen.getByRole('button', { name })).toBeDisabled();
      }
      await user.click(screen.getByRole('button', { name: 'Submit response' }));
      await user.click(screen.getByRole('button', { name: 'Next question' }));
      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();

      // Skipping needs no host confirmation, so the card unlocks right away.
      await request.settle();
      expect(
        screen.getByRole('button', { name: 'Next question' })
      ).toBeEnabled();
      await user.click(screen.getByRole('button', { name: 'Submit response' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('allows controlled history navigation within the question bounds', async () => {
      function QuestionExample() {
        const [current, setCurrent] = useState(1);
        return (
          <ChatRichContent
            title="Saved questions"
            state="submitted"
            navigation={{ current, total: 3, onChange: setCurrent }}
          />
        );
      }
      const { user } = render(<QuestionExample />);
      const previous = screen.getByRole('button', {
        name: 'Previous question',
      });
      const next = screen.getByRole('button', { name: 'Next question' });
      expect(previous).toBeDisabled();
      await user.click(next);
      await user.click(next);
      expect(screen.getByText('3 of 3')).toBeVisible();
      expect(next).toBeDisabled();
      await user.click(previous);
      expect(screen.getByText('2 of 3')).toBeVisible();
    });
  });
});
