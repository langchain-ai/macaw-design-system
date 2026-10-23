import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
} from '..';
import { render, screen } from '../../../test-utils';

describe('ChatConversationList', () => {
  it('navigates enabled rows and open folders without changing the selected conversation', async () => {
    const select = vi.fn();
    const { user } = render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem title="First" selected onClick={select} />
        <ChatConversationListItem title="Unavailable" disabled />
        <ChatConversationListGroup title="Folder" defaultOpen>
          <ChatConversationListItem title="Inside folder" />
        </ChatConversationListGroup>
        <ChatConversationListItem title="Last" />
      </ChatConversationList>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Folder' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Inside folder' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    expect(select).not.toHaveBeenCalled();
  });

  it('keeps item actions separate from conversation selection', async () => {
    const select = vi.fn();
    const remove = vi.fn();
    const { user } = render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem
          title="Weekend plans"
          onClick={select}
          actions={{ onDelete: remove }}
        />
      </ChatConversationList>
    );

    await user.click(screen.getByRole('button', { name: /actions/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(remove).toHaveBeenCalledOnce();
    expect(select).not.toHaveBeenCalled();
  });
});
