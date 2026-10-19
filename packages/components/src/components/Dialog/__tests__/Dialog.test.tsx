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
});

function NestedEditor() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [name, setName] = useState('Draft');
  return (
    <ModalProvider>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent
          title="Preferences"
          description="Application preferences"
        >
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
    </ModalProvider>
  );
}

it('reuses the second layer for a pane confirmation and restores its draft', async () => {
  const { user } = render(<NestedEditor />);
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
