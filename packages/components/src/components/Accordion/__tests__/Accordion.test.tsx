import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Button } from '../../Button';
import { EmptyState } from '../../EmptyState';
import { Accordion, AccordionItem } from '../Accordion';

describe('Accordion', () => {
  it('names the section after its title', () => {
    render(
      <Accordion title="Members" description="People in this workspace.">
        <AccordionItem title="Dana Whitfield" />
      </Accordion>
    );

    expect(screen.getByRole('region', { name: 'Members' })).toHaveTextContent(
      'Dana Whitfield'
    );
    expect(screen.getByText('People in this workspace.')).toBeVisible();
  });

  it('renders no card when its children are all empty', () => {
    const { container } = render(
      <Accordion title="Members">
        <>
          {false}
          {null}
        </>
      </Accordion>
    );

    expect(container.querySelector('.border-default')).not.toBeInTheDocument();
  });

  it('renders other content, such as an empty state, inside its card', () => {
    render(
      <Accordion title="Members">
        <EmptyState
          title="No members yet"
          description="Invite teammates to this workspace."
          action={<Button>Invite members</Button>}
        />
      </Accordion>
    );

    const region = screen.getByRole('region', { name: 'Members' });
    const card = region.querySelector('.border-default');
    expect(card).toContainElement(screen.getByText('No members yet'));
    expect(
      screen.getByRole('button', { name: 'Invite members' })
    ).toBeVisible();
  });
});

describe('AccordionItem', () => {
  it('expands and collapses its contents', async () => {
    const onExpandedChange = vi.fn();
    const { user } = render(
      <AccordionItem
        title="Notifications"
        contents={<p>Email digests</p>}
        onExpandedChange={onExpandedChange}
      />
    );

    const toggle = screen.getByRole('button', { name: 'Show Notifications' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(
      screen.getByRole('button', { name: 'Hide Notifications' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Email digests')).toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    await user.click(
      screen.getByRole('button', { name: 'Hide Notifications' })
    );
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it('starts expanded with defaultExpanded', () => {
    render(
      <AccordionItem
        title="Notifications"
        defaultExpanded
        contents={<p>Email digests</p>}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Hide Notifications' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('also expands from its title', async () => {
    const { user } = render(
      <AccordionItem title="Notifications" contents={<p>Email digests</p>} />
    );

    await user.click(screen.getByText('Notifications'));

    expect(
      screen.getByRole('button', { name: 'Hide Notifications' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no toggle without contents', () => {
    render(<AccordionItem title="Sync" contents={false} />);

    expect(
      screen.queryByRole('button', { name: 'Show Sync' })
    ).not.toBeInTheDocument();
  });

  it('has no toggle when a fragment holds only empty contents', () => {
    render(
      <AccordionItem
        title="Sync"
        contents={
          <>
            {false}
            {null}
          </>
        }
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Show Sync' })
    ).not.toBeInTheDocument();
  });

  it('lists its actions in an overflow menu', async () => {
    const onRemove = vi.fn();
    const { user } = render(
      <AccordionItem
        title="Weekly digest"
        menuItems={[
          {
            label: 'Remove',
            description: 'Stops the digest for everyone',
            onSelect: onRemove,
            tone: 'destructive',
          },
        ]}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Weekly digest options' })
    );
    const item = await screen.findByRole('menuitem', { name: /Remove/ });
    expect(item).toHaveTextContent('Stops the digest for everyone');
    expect(screen.getByText('Remove')).toHaveClass('text-error-secondary');

    await user.click(item);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not run a disabled menu item', async () => {
    const onRotate = vi.fn();
    const { user } = render(
      <AccordionItem
        title="Production key"
        menuItems={[
          { label: 'Rename', onSelect: () => {} },
          { label: 'Rotate', onSelect: onRotate, disabled: true },
        ]}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Production key options' })
    );
    const rotate = await screen.findByRole('menuitem', { name: 'Rotate' });
    expect(rotate).toHaveAttribute('aria-disabled', 'true');
    await user.click(rotate);
    expect(onRotate).not.toHaveBeenCalled();
  });

  it('has no overflow menu for an empty list of items', () => {
    render(<AccordionItem title="Weekly digest" menuItems={[]} />);

    expect(
      screen.queryByRole('button', { name: 'Weekly digest options' })
    ).not.toBeInTheDocument();
  });
});
