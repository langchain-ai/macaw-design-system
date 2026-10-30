import { createRef } from 'react';

import { describe, expect, it, vi } from 'vitest';

import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
} from '..';
import { render, screen } from '../../../test-utils';
import { DropdownMenuItem } from '../../DropdownMenu';

describe('ChatConversationList', () => {
  it('moves focus between enabled rows with arrow keys, Home, and End', async () => {
    const { user } = render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem title="First" />
        <ChatConversationListItem title="Skipped" disabled />
        <ChatConversationListGroup title="Folder" defaultOpen>
          <ChatConversationListItem title="In folder" />
        </ChatConversationListGroup>
        <ChatConversationListGroup title="Closed folder">
          <ChatConversationListItem title="Hidden" />
        </ChatConversationListGroup>
        <ChatConversationListItem title="Last" />
      </ChatConversationList>
    );

    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Folder' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'In folder' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Closed folder' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('leaves modified arrow keys and the actions button to the browser', async () => {
    const { user } = render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem title="First" actions={{}} />
        <ChatConversationListItem title="Second" />
      </ChatConversationList>
    );

    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    const actions = screen.getByRole('button', { name: 'Actions for First' });
    expect(actions).toHaveFocus();
    // Radix opens the menu instead of the list moving to the next row.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeVisible();
    expect(
      // The open menu hides the rest of the page from assistive technology.
      screen.getByRole('button', { name: 'Second', hidden: true })
    ).not.toHaveFocus();
  });

  it('marks the selected row and describes unread and indicator state', () => {
    render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem title="Current" selected />
        <ChatConversationListItem
          title="Waiting"
          unread
          indicator={<span>Attention required</span>}
        />
      </ChatConversationList>
    );

    expect(screen.getByRole('list', { name: 'Conversations' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Current' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Waiting' })
    ).toHaveAccessibleDescription('Unread Attention required');
  });

  it('shows a loading status in place of the list and footer', () => {
    render(
      <ChatConversationList
        aria-label="Conversations"
        loading
        footer={<button type="button">Load more</button>}
      >
        <ChatConversationListItem title="Cached" />
      </ChatConversationList>
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading Conversations'
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('Load more')).not.toBeInTheDocument();
  });

  it('shows the empty state, or the error in its place', () => {
    const { rerender } = render(
      <ChatConversationList aria-label="Conversations" />
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'No conversations yet'
    );

    rerender(
      <ChatConversationList
        aria-label="Conversations"
        errorContent="Could not load conversations."
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not load conversations.'
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('detects empty arrays and fragments and updates when rows arrive', () => {
    const { rerender } = render(
      <ChatConversationList aria-label="Conversations">
        <>
          {[]}
          {null}
          {false}
          <>{undefined}</>
        </>
      </ChatConversationList>
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'No conversations yet'
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    rerender(
      <ChatConversationList aria-label="Conversations">
        <>
          <ChatConversationListItem title="New conversation" />
        </>
      </ChatConversationList>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'New conversation' })
    ).toBeVisible();

    rerender(
      <ChatConversationList aria-label="Conversations">
        {[]}
      </ChatConversationList>
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'No conversations yet'
    );
  });

  it('keeps cached items and the footer below an error', () => {
    render(
      <ChatConversationList
        aria-label="Conversations"
        errorContent="Could not refresh."
        footer={<button type="button">Load more</button>}
      >
        <ChatConversationListItem title="Cached" />
      </ChatConversationList>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Could not refresh.');
    expect(screen.getByRole('button', { name: 'Cached' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Load more' })).toBeVisible();
  });
});

describe('ChatConversationListItem', () => {
  it('passes native props and the ref to the conversation button', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { user } = render(
      <ChatConversationListItem
        ref={ref}
        title="Release planning"
        onClick={onClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Release planning' });
    expect(ref.current).toBe(button);
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('runs the default menu actions and disables missing ones', async () => {
    const onRename = vi.fn();
    const { user } = render(
      <ChatConversationListItem
        title="Release planning"
        actions={{ onRename, pinned: true }}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Actions for Release planning' })
    );
    expect(screen.getByRole('menuitem', { name: 'Unpin' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('replaces the default menu with custom items', async () => {
    const { user } = render(
      <ChatConversationListItem
        title="Research summary"
        actions={{ items: <DropdownMenuItem>Mark as read</DropdownMenuItem> }}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Actions for Research summary' })
    );
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(
      screen.getByRole('menuitem', { name: 'Mark as read' })
    ).toBeVisible();
  });

  it('closes its menu when disabled and keeps it closed when re-enabled', async () => {
    const { user, rerender } = render(
      <ChatConversationListItem title="Release planning" actions={{}} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Actions for Release planning' })
    );
    expect(screen.getByRole('menu')).toBeVisible();

    rerender(
      <ChatConversationListItem
        title="Release planning"
        actions={{}}
        disabled
      />
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Actions for Release planning' })
    ).toBeDisabled();

    rerender(
      <ChatConversationListItem title="Release planning" actions={{}} />
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('ChatConversationListGroup', () => {
  it('expands and collapses its items', async () => {
    const onOpenChange = vi.fn();
    const { user } = render(
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListGroup title="Design" onOpenChange={onOpenChange}>
          <ChatConversationListItem title="Tokens" />
        </ChatConversationListGroup>
      </ChatConversationList>
    );

    const toggle = screen.getByRole('button', { name: 'Design' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Tokens' })).toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list', { name: 'Design' })).toContainElement(
      screen.getByRole('button', { name: 'Tokens' })
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('follows a controlled open prop', async () => {
    const onOpenChange = vi.fn();
    const { user } = render(
      <ChatConversationListGroup
        title="Design"
        open
        onOpenChange={onOpenChange}
      >
        <ChatConversationListItem title="Tokens" />
      </ChatConversationListGroup>
    );

    await user.click(screen.getByRole('button', { name: 'Design' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: 'Tokens' })).toBeVisible();
  });

  it('offers rename and delete actions', async () => {
    const onDelete = vi.fn();
    const { user } = render(
      <ChatConversationListGroup title="Design" actions={{ onDelete }} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Actions for Design' })
    );
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables its toggle and actions', () => {
    render(<ChatConversationListGroup title="Design" disabled actions={{}} />);

    expect(screen.getByRole('button', { name: 'Design' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Actions for Design' })
    ).toBeDisabled();
  });

  it('reports nesting as an error', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ChatConversationListGroup title="Outer" defaultOpen>
        <ChatConversationListGroup title="Inner" />
      </ChatConversationListGroup>
    );

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('cannot be nested')
    );
    consoleError.mockRestore();
  });
});
