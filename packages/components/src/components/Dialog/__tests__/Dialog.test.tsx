import { describe, expect, it } from 'vitest';

import { Dialog, DialogContent } from '..';
import { render, screen } from '../../../test-utils';

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
