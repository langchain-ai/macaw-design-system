import { useState } from 'react';

import { describe, expect, it } from 'vitest';

import { Dialog, DialogContent, ModalProvider } from '..';
import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { Pane } from '../../Pane';

describe('DialogContent', () => {
  it('renders its built-in title as the dialog heading', () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent title="Dialog title" description="Dialog description">
          Dialog body
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('dialog', { name: 'Dialog title' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Dialog title' })).toBeVisible();
  });

  it('forwards data attributes to the dialog element', () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent title="Dialog title" data-analytics-id="example-dialog">
          Dialog body
        </DialogContent>
      </Dialog>
    );

    expect(
      screen.getByRole('dialog', { name: 'Dialog title' })
    ).toHaveAttribute('data-analytics-id', 'example-dialog');
  });
});

function NestedEditor() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [name, setName] = useState('Draft');
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent title="Preferences" description="Application preferences">
        <Button onClick={() => setEditorOpen(true)}>Edit profile</Button>
        <Pane
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          title="Profile"
          description="Edit your profile"
          requireConfirmationOnClose
        >
          <Input label="Name" value={name} onChange={setName} />
        </Pane>
      </DialogContent>
    </Dialog>
  );
}

it('reuses the second layer for a pane confirmation and restores its draft', async () => {
  const { user } = render(<NestedEditor />, { wrapper: ModalProvider });
  await user.click(screen.getByRole('button', { name: 'Edit profile' }));
  await user.type(screen.getByRole('textbox', { name: 'Name' }), ' changes');
  await user.click(
    within(screen.getByRole('dialog', { name: 'Profile' })).getByRole(
      'button',
      { name: 'Close' }
    )
  );
  expect(
    await screen.findByRole('dialog', { name: 'Unsaved Changes' })
  ).toBeVisible();
  expect(
    screen.queryByRole('dialog', { name: 'Profile' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
    'Draft changes'
  );
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Exit' }));
  expect(
    screen.queryByRole('dialog', { name: 'Profile' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Preferences' })).toBeVisible();
});

it('stacks a pane confirmation above its content without ModalProvider', async () => {
  const { user } = render(<NestedEditor />);
  await user.click(screen.getByRole('button', { name: 'Edit profile' }));
  const pane = screen.getByRole('dialog', { name: 'Profile' });
  await user.click(within(pane).getByRole('button', { name: 'Close' }));
  const confirmation = await screen.findByRole('dialog', {
    name: 'Unsaved Changes',
  });
  const backdrop = confirmation.previousElementSibling as HTMLElement;
  expect(Number(backdrop.style.zIndex)).toBeGreaterThan(
    Number(pane.style.zIndex)
  );
  expect(Number(confirmation.style.zIndex)).toBeGreaterThan(
    Number(backdrop.style.zIndex)
  );
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('dialog', { name: 'Profile' })).toBeVisible();
});
