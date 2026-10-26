import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { DropdownMenuItem } from '../../DropdownMenu';
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
        menuItems={
          <DropdownMenuItem onSelect={onRemove}>Remove</DropdownMenuItem>
        }
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Weekly digest options' })
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
