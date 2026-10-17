import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../test-utils';
import UnsavedChangesDialog from '../UnsavedChangesDialog';

const props = {
  isOpen: true,
  title: 'Save your changes?',
  description: 'You have unsaved changes.',
};

describe('UnsavedChangesDialog', () => {
  it('blocks dismissal, discard and duplicate saves until saving completes', async () => {
    let resolveSave!: () => void;
    const save = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const onConfirm = vi.fn(() => save);
    const onClose = vi.fn();
    const onDiscard = vi.fn();
    const { user } = render(
      <UnsavedChangesDialog
        {...props}
        onConfirm={onConfirm}
        onClose={onClose}
        onDiscard={onDiscard}
      />
    );

    await user.dblClick(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
    await user.keyboard('{Escape}');
    fireEvent.pointerDown(document.body);
    expect(onClose).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();

    resolveSave();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it.each([new Error('Save failed'), 'failure'])(
    'keeps failed saves retryable: %s',
    async (error) => {
      const onConfirm = vi
        .fn<() => Promise<void>>()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce();
      const onClose = vi.fn();
      const { user } = render(
        <UnsavedChangesDialog
          {...props}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        error instanceof Error
          ? error.message
          : "We couldn't save your changes. Try again."
      );
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      expect(onConfirm).toHaveBeenCalledTimes(2);
    }
  );
});
