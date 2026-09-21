import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TypeaheadDefaultTag } from '../TypeaheadParts';

describe('Typeahead tag removal', () => {
  it.each(['{Enter}', ' '])(
    'supports keyboard removal with %s',
    async (key) => {
      const onRemove = vi.fn();
      const user = userEvent.setup();
      render(
        <TypeaheadDefaultTag
          selected="Alpha"
          size="md"
          index={0}
          disabled={false}
          getLabel={String}
          getValue={String}
          onRemove={onRemove}
        />
      );
      await user.tab();
      expect(
        screen.getByRole('button', { name: 'Remove Alpha' })
      ).toHaveFocus();
      await user.keyboard(key);
      expect(onRemove).toHaveBeenCalledOnce();
    }
  );

  it('does not offer removal when disabled', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <TypeaheadDefaultTag
        selected="Alpha"
        size="md"
        index={0}
        disabled
        getLabel={String}
        getValue={String}
        onRemove={onRemove}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    await user.click(screen.getByText('Alpha'));
    expect(onRemove).not.toHaveBeenCalled();
  });
});
