import { useEffect } from 'react';

import { ChatSubagent, type ChatSubagentModel } from '..';
import { render, screen, within } from '../../../test-utils';
import { ChatToolCall, ChatToolCallGroup } from '../../ChatToolCall';

const researcher: ChatSubagentModel = {
  id: 'call-1',
  name: 'researcher',
  task: 'Find recent papers on retrieval',
  status: 'running',
};

describe('ChatSubagent', () => {
  it('names the subagent and describes its task and current step', () => {
    render(<ChatSubagent subagent={researcher} activity="Searching the web" />);
    const card = screen.getByRole('group', { name: 'researcher subagent' });

    expect(
      within(card).getByText('Find recent papers on retrieval')
    ).toBeVisible();
    expect(within(card).getByText('Searching the web')).toBeVisible();
    expect(within(card).getByRole('status')).toHaveTextContent('Running');
  });

  it('swaps the current step for the result once the subagent finishes', () => {
    const { rerender } = render(
      <ChatSubagent
        subagent={researcher}
        activity="Searching the web"
        result="Found 4 papers"
      />
    );
    expect(screen.queryByText('Found 4 papers')).toBeNull();

    rerender(
      <ChatSubagent
        subagent={{ ...researcher, status: 'succeeded', elapsedMs: 12_000 }}
        activity="Searching the web"
        result="Found 4 papers"
      />
    );
    expect(screen.queryByText('Searching the web')).toBeNull();
    expect(screen.getByText('Found 4 papers')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Completed');
    expect(screen.getByRole('timer')).toHaveTextContent('12s');
  });

  it('mounts details only while expanded so hosts can subscribe lazily', async () => {
    const subscriptions: string[] = [];
    function SubagentStream() {
      useEffect(() => {
        subscriptions.push('open');
        return () => {
          subscriptions.push('close');
        };
      }, []);
      return <p>Subagent messages</p>;
    }
    const { user } = render(
      <ChatSubagent subagent={researcher}>
        <SubagentStream />
      </ChatSubagent>
    );
    const toggle = screen.getByRole('button', {
      name: 'Details for researcher',
    });

    expect(subscriptions).toEqual([]);
    expect(toggle).toHaveAccessibleDescription(
      'Find recent papers on retrieval'
    );
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Subagent messages')).toBeVisible();
    expect(subscriptions).toEqual(['open']);

    await user.click(toggle);
    expect(screen.queryByText('Subagent messages')).toBeNull();
    expect(subscriptions).toEqual(['open', 'close']);
  });

  it('leaves opening the full thread to the host', async () => {
    const onOpen = vi.fn();
    const { user } = render(
      <ChatSubagent subagent={researcher} onOpen={onOpen}>
        <p>Subagent messages</p>
      </ChatSubagent>
    );

    await user.click(screen.getByRole('button', { name: 'Open subagent' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: 'Details for researcher' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('counts toward a surrounding tool call group', () => {
    const group = (status: ChatSubagentModel['status']) => (
      <ChatToolCallGroup label="Worked on the request" defaultExpanded>
        <ChatToolCall
          toolCall={{ id: 'a', name: 'search', status: 'succeeded' }}
        />
        <ChatSubagent subagent={{ ...researcher, status }} />
      </ChatToolCallGroup>
    );
    const { rerender } = render(group('running'));
    const header = () =>
      screen.getByRole('button', { name: 'Worked on the request' })
        .parentElement!;
    expect(within(header()).getByRole('status')).toHaveTextContent('Streaming');

    rerender(group('succeeded'));
    expect(within(header()).getByRole('status')).toHaveTextContent('Completed');
  });
});
