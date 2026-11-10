import { renderHook } from '@testing-library/react';

import { LangGraphChat, useChatThread } from '..';
import {
  awaitingApprovalState,
  completedState,
  emptyState,
  staticStream,
} from '../../../stories/fakeAgentStream';
import { act, render, screen, within } from '../../../test-utils';

function approvalInterrupt(casing: 'camel' | 'snake', requests: number) {
  const actions = Array.from({ length: requests }, (_, index) => ({
    name: 'edit_file',
    args: { file_path: `file-${index}.md`, old_string: 'a', new_string: 'b' },
  }));
  return casing === 'camel'
    ? {
        id: 'approval-1',
        value: {
          actionRequests: actions,
          reviewConfigs: [
            {
              actionName: 'edit_file',
              allowedDecisions: ['approve', 'edit', 'reject'],
            },
          ],
        },
      }
    : {
        id: 'approval-1',
        value: {
          action_requests: actions,
          review_configs: [
            {
              action_name: 'edit_file',
              allowed_decisions: ['approve', 'edit', 'reject'],
            },
          ],
        },
      };
}

describe('useChatThread actions', () => {
  it('sends a message, and queues it while a run is active', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useChatThread(staticStream({ ...emptyState, isLoading }, { submit })),
      { initialProps: { isLoading: false } }
    );

    await act(() => result.current.actions.send('Hello'));
    expect(submit).toHaveBeenLastCalledWith(
      { messages: [{ type: 'human', content: 'Hello' }] },
      undefined
    );

    rerender({ isLoading: true });
    await act(() => result.current.actions.send('And then?'));
    expect(submit).toHaveBeenLastCalledWith(
      { messages: [{ type: 'human', content: 'And then?' }] },
      { multitaskStrategy: 'enqueue' }
    );
  });

  it('reports a pending stop until the stream settles it', async () => {
    let settle = () => {};
    const stop = vi.fn(
      () =>
        new Promise<void>((done) => {
          settle = done;
        })
    );
    const { result } = renderHook(() =>
      useChatThread(staticStream({ ...emptyState, isLoading: true }, { stop }))
    );

    let stopping: Promise<void> = Promise.resolve();
    act(() => {
      stopping = result.current.actions.stop();
    });
    expect(result.current.stopping).toBe(true);
    await act(async () => {
      settle();
      await stopping;
    });
    expect(result.current.stopping).toBe(false);
  });

  it('forks from a checkpoint ID on 1.x and a checkpoint object on 0.3.x', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const current = renderHook(() =>
      useChatThread(staticStream(emptyState, { submit }))
    );
    await act(() =>
      current.result.current.actions.fork('Edited', 'checkpoint-1')
    );
    expect(submit).toHaveBeenLastCalledWith(
      { messages: [{ type: 'human', content: 'Edited' }] },
      { forkFrom: 'checkpoint-1' }
    );

    const legacyStream = {
      ...staticStream(emptyState, { submit }),
      getMessagesMetadata: () => undefined,
    };
    const legacy = renderHook(() => useChatThread(legacyStream));
    await act(() =>
      legacy.result.current.actions.fork('Edited', { checkpoint_id: 'c1' })
    );
    expect(submit).toHaveBeenLastCalledWith(
      { messages: [{ type: 'human', content: 'Edited' }] },
      { checkpoint: { checkpoint_id: 'c1' } }
    );
  });

  it('resumes interrupts paused together in one command', async () => {
    const respondAll = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useChatThread(
        staticStream(
          {
            ...emptyState,
            interrupts: [
              { id: 'a', value: 'first' },
              { id: 'b', value: 'second' },
            ],
          },
          { respondAll }
        )
      )
    );
    await act(() => result.current.actions.resume({ a: 'yes', b: 'no' }));
    expect(respondAll).toHaveBeenCalledWith({ a: 'yes', b: 'no' });
  });

  it('resumes through submit on a stream without respond', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const stream = staticStream(
      { ...emptyState, interrupts: [approvalInterrupt('snake', 1)] },
      { submit }
    );
    delete (stream as { respond?: unknown }).respond;
    const { result } = renderHook(() => useChatThread(stream));

    await act(() =>
      result.current.actions.respond('approval-1', [
        { type: 'edit', args: { file_path: 'other.md' } },
      ])
    );
    expect(submit).toHaveBeenCalledWith(null, {
      command: {
        resume: {
          decisions: [
            {
              type: 'edit',
              edited_action: {
                name: 'edit_file',
                args: { file_path: 'other.md' },
              },
            },
          ],
        },
      },
    });
  });
});

describe('LangGraphChat', () => {
  it('summarizes finished work and opens it on request', async () => {
    const { user } = render(
      <LangGraphChat stream={staticStream(completedState)} />
    );
    const summary = screen.getByRole('button', { name: '4 actions' });

    expect(summary).toHaveAttribute('aria-expanded', 'false');
    await user.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('group', { name: 'researcher subagent' })
    ).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
  });

  it('approves a pending request with the interrupt ID', async () => {
    const respond = vi.fn().mockResolvedValue(undefined);
    const { user } = render(
      <LangGraphChat
        stream={staticStream(awaitingApprovalState, { respond })}
      />
    );

    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(respond).toHaveBeenCalledWith(
      { decisions: [{ type: 'approve' }] },
      { interruptId: 'approval-1' }
    );
  });

  it('approves with edited arguments in the graph’s casing', async () => {
    const respond = vi.fn().mockResolvedValue(undefined);
    const { user } = render(
      <LangGraphChat
        stream={staticStream(
          { ...emptyState, interrupts: [approvalInterrupt('camel', 1)] },
          { respond }
        )}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const field = screen.getByRole('textbox', { name: 'Arguments' });
    await user.clear(field);
    await user.type(field, '{{"file_path": "notes.md"}');
    await user.click(
      screen.getByRole('button', { name: 'Approve with edits' })
    );

    expect(respond).toHaveBeenCalledWith(
      {
        decisions: [
          {
            type: 'edit',
            editedAction: {
              name: 'edit_file',
              args: { file_path: 'notes.md' },
            },
          },
        ],
      },
      { interruptId: 'approval-1' }
    );
  });

  it('keeps invalid edited arguments in the card', async () => {
    const respond = vi.fn();
    const { user } = render(
      <LangGraphChat
        stream={staticStream(
          { ...emptyState, interrupts: [approvalInterrupt('camel', 1)] },
          { respond }
        )}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const field = screen.getByRole('textbox', { name: 'Arguments' });
    await user.clear(field);
    await user.type(field, 'not json');
    await user.click(
      screen.getByRole('button', { name: 'Approve with edits' })
    );

    expect(respond).not.toHaveBeenCalled();
    expect(field).toHaveAccessibleDescription(
      'Enter the arguments as a JSON object.'
    );
  });

  it('waits for every request paused together before resuming', async () => {
    const respond = vi.fn().mockResolvedValue(undefined);
    const { user } = render(
      <LangGraphChat
        stream={staticStream(
          { ...emptyState, interrupts: [approvalInterrupt('snake', 2)] },
          { respond }
        )}
      />
    );
    const [first, second] = screen.getAllByRole('form');

    await user.click(within(first).getByRole('button', { name: 'Approve' }));
    expect(respond).not.toHaveBeenCalled();
    expect(first).toHaveTextContent('waiting for 1 more decision');

    await user.click(within(second).getByRole('button', { name: 'Reject' }));
    expect(respond).toHaveBeenCalledOnce();
    expect(respond).toHaveBeenCalledWith(
      { decisions: [{ type: 'approve' }, { type: 'reject' }] },
      { interruptId: 'approval-1' }
    );
  });

  it('stops a run from an empty composer', async () => {
    const stop = vi.fn().mockResolvedValue(undefined);
    const { user } = render(
      <LangGraphChat
        stream={staticStream({ ...completedState, isLoading: true }, { stop })}
      />
    );
    await user.click(
      await screen.findByRole('button', { name: 'Stop response' })
    );
    expect(stop).toHaveBeenCalledOnce();
  });

  it('cancels a queued message through the submission queue', async () => {
    const cancel = vi.fn().mockResolvedValue(true);
    const { user } = render(
      <LangGraphChat
        stream={staticStream({ ...completedState, isLoading: true })}
        selectors={{
          useSubmissionQueue: () => ({
            entries: [
              {
                id: 'queued-1',
                values: {
                  messages: [
                    { type: 'human', content: 'Then compare retrievers.' },
                  ],
                },
              },
            ],
            cancel,
          }),
        }}
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Cancel queued message' })
    );
    expect(cancel).toHaveBeenCalledWith('queued-1');
  });

  it('presents tools by name from their original messages and hides the ones a host returns null for', async () => {
    const { user } = render(
      <LangGraphChat
        stream={staticStream({
          ...emptyState,
          messages: [
            { id: 'h1', type: 'human', content: 'Go' },
            {
              id: 'a1',
              type: 'ai',
              content: '',
              tool_calls: [
                { id: 'search', name: 'web_search', args: { query: 'docs' } },
                { id: 'internal', name: 'log_metric', args: {} },
              ],
            },
            {
              id: 'r1',
              type: 'tool',
              tool_call_id: 'search',
              content: 'Found docs.',
              artifact: { hits: 3 },
            },
          ],
        })}
        tools={{
          // Renderers can read fields Macaw doesn't map, like a tool artifact.
          web_search: (_toolCall, source) => {
            const result = source?.result as
              | { artifact?: { hits: number } }
              | undefined;
            return {
              label: 'Web search',
              summary: `${result?.artifact?.hits ?? 0} hits`,
            };
          },
          log_metric: () => null,
        }}
      />
    );
    // The hidden call doesn't count toward the summary either.
    await user.click(screen.getByRole('button', { name: '1 action' }));
    expect(
      screen.getByRole('group', { name: 'Web search tool call' })
    ).toBeVisible();
    expect(screen.getByText('3 hits')).toBeVisible();
    expect(screen.queryByText('log_metric')).toBeNull();
  });
});
