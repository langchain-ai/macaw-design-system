import { useState } from 'react';

import {
  ChatRichContent,
  ChatRichContentFallback,
  type ChatRichContentState,
} from '..';
import { act, render, screen } from '../../../test-utils';
import { Checkbox } from '../../Checkbox';
import { Input } from '../../Input';
import { Text } from '../../Text';

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

describe('ChatRichContent', () => {
  it('renders host content and escapes the title', () => {
    const title = '<img src=x onerror=alert(1) />';
    render(
      <ChatRichContent title={title}>
        <Text>Host content</Text>
      </ChatRichContent>
    );
    expect(screen.getByText(title)).toBeVisible();
    expect(screen.getByText('Host content')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('provides an inert fallback for adapters', () => {
    render(<ChatRichContentFallback />);
    expect(screen.getByText('This content is unavailable.')).toBeVisible();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('blocks duplicate submission until the host confirms the outcome', async () => {
    let accept = () => {};
    const request = new Promise<void>((resolve) => {
      accept = resolve;
    });
    const onSubmit = vi.fn().mockReturnValue(request);
    const { user, rerender } = render(
      <ChatRichContent title="Continue?" onSubmit={onSubmit} />
    );
    const status = screen.getByRole('status');
    await user.dblClick(
      screen.getByRole('button', { name: 'Submit response' })
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Submitting response…'
    );
    expect(screen.getByRole('status')).toBe(status);
    expect(status.closest('[aria-busy="true"]')).toBeNull();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => {
      accept();
      await request;
    });
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
    expect(screen.getByRole('status')).toBe(status);
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
    expect(
      screen.getByRole('button', { name: 'Retry response' })
    ).toBeEnabled();
    rerender(<HostExample />);
    expect(
      screen.getByRole('button', { name: 'Retry response' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retry response' }));
    expect(save).toHaveBeenCalledTimes(1);
    rerender(<HostExample save={save} />);
    await user.click(screen.getByRole('button', { name: 'Retry response' }));
    expect(await screen.findByText('Response submitted')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Research'
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    expect(save).toHaveBeenLastCalledWith('Research');
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('locks both decisions during rejection and until the host confirms the outcome', async () => {
    let reject = () => {};
    const request = new Promise<void>((resolve) => {
      reject = resolve;
    });
    const onReject = vi.fn().mockReturnValue(request);
    const onApprove = vi.fn();
    const { user, rerender } = render(
      <ChatRichContent
        variant="approval"
        title="Review changes"
        onApprove={onApprove}
        onReject={onReject}
      />
    );
    await user.dblClick(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('status')).toHaveTextContent('Rejecting request…');
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledWith('');
    await act(async () => {
      reject();
      await request;
    });
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).not.toHaveBeenCalled();
    rerender(
      <ChatRichContent
        variant="approval"
        title="Review changes"
        state="rejected"
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Rejected');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

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
    expect(input).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    await user.type(input, 'Preserve the existing format.');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(reject).toHaveBeenCalledWith('Preserve the existing format.');
    expect(screen.getByRole('status')).toHaveTextContent('Rejected');
    expect(input).toBeDisabled();
  });

  it.each(['', 'Keep the original wording.'])(
    'rejects with an optional reason: %j',
    async (reason) => {
      const save = vi.fn().mockResolvedValue(undefined);
      const { user } = render(<ApprovalHost save={save} />);
      if (reason) {
        await user.type(
          screen.getByRole('textbox', { name: /rejection reason/i }),
          reason
        );
      }
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Rejected');
      expect(save).toHaveBeenCalledWith(reason);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      if (reason) {
        expect(
          screen.getByRole('textbox', { name: /rejection reason/i })
        ).toHaveValue(reason);
        expect(
          screen.getByRole('textbox', { name: /rejection reason/i })
        ).toBeDisabled();
      } else {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      }
    }
  );

  it('retains the reason after consecutive failures and retries rejection without approving', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockRejectedValueOnce(new Error('Save failed again'))
      .mockResolvedValue(undefined);
    const { user } = render(<ApprovalHost save={save} />);
    const reason = 'Keep the original wording.';
    await user.type(
      screen.getByRole('textbox', { name: /rejection reason/i }),
      reason
    );
    for (const attempt of [1, 2]) {
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Could not submit your response.'
      );
      expect(
        screen.getByRole('textbox', { name: /rejection reason/i })
      ).toHaveValue(reason);
      expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
      expect(save).toHaveBeenCalledTimes(attempt);
    }
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Rejected');
    expect(save).toHaveBeenLastCalledWith(reason);
    expect(save).toHaveBeenCalledTimes(3);
  });

  it('hides the unused rejection draft after approval', async () => {
    const save = vi.fn();
    const { user } = render(<ApprovalHost save={save} />);
    await user.type(
      screen.getByRole('textbox', { name: /rejection reason/i }),
      'A draft reason'
    );
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Approved');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  const unavailable: ChatRichContentState[] = [
    'submitting',
    'expired',
    'disabled',
    'submitted',
    'read-only',
  ];
  it.each(unavailable)('blocks actions in %s state', async (state) => {
    const onSubmit = vi.fn();
    const { user } = render(
      <ChatRichContent
        title="Agent instructions"
        state={state}
        onSubmit={onSubmit}
      >
        {({ disabled }) => (
          <Input
            label="Instructions"
            value="Draft"
            onChange={() => {}}
            disabled={disabled}
          />
        )}
      </ChatRichContent>
    );
    if (
      state === 'submitted' ||
      state === 'approved' ||
      state === 'rejected' ||
      state === 'read-only'
    ) {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('button')).toBeDisabled();
      await user.click(screen.getByRole('button'));
    }
    expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue(
      'Draft'
    );
    expect(
      screen.getByRole('textbox', { name: 'Instructions' })
    ).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps submitted checkboxes checked and disabled', async () => {
    function ChoiceExample() {
      const [checked, setChecked] = useState(false);
      const [accepted, setAccepted] = useState<boolean>();
      return (
        <ChatRichContent
          title="Choose a task"
          state={accepted === undefined ? 'unanswered' : 'submitted'}
          onSubmit={() => {
            setAccepted(checked);
          }}
        >
          {({ disabled }) => (
            <Checkbox
              label="Research"
              checked={accepted ?? checked}
              disabled={disabled}
              onCheckedChange={(value) => setChecked(value === true)}
            />
          )}
        </ChatRichContent>
      );
    }
    const { user } = render(<ChoiceExample />);
    await user.click(screen.getByRole('checkbox', { name: 'Research' }));
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(await screen.findByText('Response submitted')).toBeVisible();
    const checkbox = screen.getByRole('checkbox', { name: 'Research' });
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(
      screen.queryByRole('button', { name: 'Submit response' })
    ).not.toBeInTheDocument();
  });

  it('presents host validation and permits a corrected response', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Invalid'))
      .mockResolvedValue(undefined);
    const { user, rerender } = render(
      <ChatRichContent title="Agent instructions" onSubmit={onSubmit} />
    );
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    rerender(
      <ChatRichContent
        title="Agent instructions"
        state="validation-error"
        message="Add instructions before continuing."
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add instructions before continuing.'
    );
    expect(screen.getByRole('button')).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['unanswered', 'approved'],
    ['unanswered', 'rejected'],
    ['submission-failed', 'approved'],
    ['submission-failed', 'rejected'],
    ['validation-error', 'approved'],
    ['validation-error', 'rejected'],
  ] satisfies [ChatRichContentState, ChatRichContentState][])(
    'locks a decision from %s until %s confirmation and allows reopening',
    async (initialState, decision) => {
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
      const { user, rerender } = render(card(initialState));
      const action = decision === 'approved' ? 'Approve' : 'Reject';
      await user.click(screen.getByRole('button', { name: action }));
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
      rerender(card('submitting'));
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
      rerender(card(initialState));
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      await user.click(screen.getByRole('button', { name: 'Reject' }));
      expect(onDecide).toHaveBeenCalledTimes(1);
      rerender(card(decision));
      expect(screen.getByRole('status')).toHaveTextContent(
        decision === 'approved' ? 'Approved' : 'Rejected'
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      rerender(card('unanswered'));
      expect(screen.getByRole('button', { name: action })).toBeEnabled();
      await user.click(screen.getByRole('button', { name: action }));
      expect(onDecide).toHaveBeenCalledTimes(2);
    }
  );

  it.each([
    'submission-failed',
    'validation-error',
  ] satisfies ChatRichContentState[])(
    'allows the host to reset a pending retry from %s to unanswered',
    async (initialState) => {
      const onApprove = vi.fn().mockResolvedValue(undefined);
      const card = (state: ChatRichContentState) => (
        <ChatRichContent
          variant="approval"
          title="Review changes"
          state={state}
          onApprove={onApprove}
        />
      );
      const { user, rerender } = render(card(initialState));
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      rerender(card('unanswered'));
      expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      expect(onApprove).toHaveBeenCalledTimes(2);
    }
  );

  it('guards pending undo and restores actions with the rejection draft', async () => {
    let finishUndo = () => {};
    const request = new Promise<void>((resolve) => {
      finishUndo = resolve;
    });
    const undo = vi.fn().mockReturnValue(request);
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
    expect(screen.getByRole('status')).toHaveTextContent('Rejected');
    await user.dblClick(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(undo).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishUndo();
      await request;
    });
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
    expect(
      screen.getByRole('textbox', { name: /rejection reason/i })
    ).toHaveValue('Keep the original wording.');
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('status')).toHaveTextContent('Approved');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    expect(
      screen.getByRole('textbox', { name: /rejection reason/i })
    ).toHaveValue('Keep the original wording.');
  });

  it('allows an explicit final submission after skipping the last question', async () => {
    const onSkip = vi.fn().mockResolvedValue(undefined);
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = render(
      <ChatRichContent
        title="Optional question"
        onSkip={onSkip}
        onSubmit={onSubmit}
      />
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Skip' })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Submit response' })
    ).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    await user.dblClick(
      screen.getByRole('button', { name: 'Submit response' })
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
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
    expect(screen.getByRole('button', { name: /^Next$/ })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Submit response' })
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', { name: 'Answer' }),
      'Research{Enter}'
    );
    expect(screen.getByText('2 of 2')).toBeVisible();
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Previous question' }));
    expect(screen.getByRole('textbox', { name: 'Answer' })).toHaveValue(
      'Research'
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Answer' }),
      ' assistant'
    );
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith('Research assistant');
    expect(screen.getByRole('textbox', { name: 'Answer' })).toHaveValue(
      'Research assistant'
    );
    expect(screen.getByRole('textbox', { name: 'Answer' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Response submitted');
  });

  it.each([2, 3])(
    'advances only once on a double-click in a %i-question form with saved answers',
    async (total) => {
      function SavedAnswersExample() {
        const [current, setCurrent] = useState(1);
        const [submitted, setSubmitted] = useState(false);
        const answers = ['Research', 'Summarize documents', 'Cite sources'];
        return (
          <ChatRichContent
            title={`Question ${current}`}
            state={submitted ? 'submitted' : 'unanswered'}
            navigation={{ current, total, onChange: setCurrent }}
            onNext={current < total ? () => setCurrent(current + 1) : undefined}
            onSubmit={() => setSubmitted(true)}
          >
            {({ disabled }) => (
              <Input
                aria-label="Answer"
                value={answers[current - 1] ?? ''}
                onChange={() => {}}
                disabled={disabled}
              />
            )}
          </ChatRichContent>
        );
      }

      const { user } = render(<SavedAnswersExample />);
      await user.dblClick(screen.getByRole('button', { name: /^Next$/ }));

      expect(screen.getByText(`2 of ${total}`)).toBeVisible();
      expect(screen.getByRole('textbox', { name: 'Answer' })).toHaveValue(
        'Summarize documents'
      );
      expect(screen.getByRole('textbox', { name: 'Answer' })).toBeEnabled();
      expect(screen.queryByText('Response submitted')).not.toBeInTheDocument();

      if (total === 3) {
        await user.click(screen.getByRole('button', { name: /^Next$/ }));
        expect(screen.getByText('3 of 3')).toBeVisible();
      }
      await user.click(screen.getByRole('button', { name: 'Submit response' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Response submitted'
      );
      expect(screen.getByRole('textbox', { name: 'Answer' })).toBeDisabled();
    }
  );

  it('locks skip, submit, and navigation while skipping', async () => {
    let finish = () => {};
    const request = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onSkip = vi.fn().mockReturnValue(request);
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
    expect(screen.getByRole('status')).toHaveTextContent('Skipping question…');
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
    await act(async () => {
      finish();
      await request;
    });
    expect(screen.getByRole('button', { name: 'Skip' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next question' })).toBeEnabled();
  });

  it.each(unavailable)('prevents skipping in %s state', async (state) => {
    const onSkip = vi.fn();
    const { user } = render(
      <ChatRichContent
        title="Optional question"
        state={state}
        onSkip={onSkip}
      />
    );
    if (state === 'submitted' || state === 'read-only') {
      expect(
        screen.queryByRole('button', { name: 'Skip' })
      ).not.toBeInTheDocument();
    } else {
      const skip = screen.getByRole('button', { name: 'Skip' });
      expect(skip).toBeDisabled();
      await user.click(skip);
    }
    expect(onSkip).not.toHaveBeenCalled();
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
    expect(screen.getByText('1 of 3')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Previous question' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByText('2 of 3')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByText('3 of 3')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Next question' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Previous question' }));
    expect(screen.getByText('2 of 3')).toBeVisible();
  });
});
