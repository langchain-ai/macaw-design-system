import { useState } from 'react';

import {
  ChatRichContent,
  ChatRichContentChoices,
  type ChatRichContentChoicesProps,
  type ChatRichContentChoicesValue,
} from '..';
import { render, screen } from '../../../test-utils';

const options = [
  { value: 'each', label: 'Each change' },
  { value: 'custom', label: 'Final summary' },
];

function ChoicesHost({
  mode,
  allowCustom = true,
  onSubmit,
}: {
  mode: ChatRichContentChoicesProps['mode'];
  allowCustom?: boolean;
  onSubmit?: (value: ChatRichContentChoicesValue) => void;
}) {
  const [value, setValue] = useState<ChatRichContentChoicesValue>({
    selected: ['each'],
  });
  const [submitted, setSubmitted] = useState(false);
  return (
    <ChatRichContent
      title="Review preferences"
      state={submitted ? 'submitted' : 'unanswered'}
      onSubmit={() => {
        onSubmit?.(value);
        setSubmitted(true);
      }}
    >
      {({ disabled }) => (
        <ChatRichContentChoices
          aria-label="Review preferences"
          mode={mode}
          options={options}
          value={value}
          onChange={setValue}
          allowCustom={allowCustom}
          disabled={disabled}
        />
      )}
    </ChatRichContent>
  );
}

describe('ChatRichContentChoices', () => {
  it('keeps custom radio answers exclusive and restores their draft without submitting', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<ChoicesHost mode="single" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('radio', { name: 'Something else…' }));
    expect(
      screen.getByRole('radio', { name: 'Each change' })
    ).not.toBeChecked();
    expect(
      screen.getByRole('textbox', { name: /Something else/ })
    ).toHaveFocus();
    await user.type(
      screen.getByRole('textbox', { name: /Something else/ }),
      'Review weekly'
    );

    await user.click(screen.getByRole('radio', { name: 'Final summary' }));
    expect(screen.getByRole('radio', { name: 'Final summary' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Something else…' })
    ).not.toBeChecked();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Something else…' }));
    expect(
      screen.getByRole('radio', { name: 'Final summary' })
    ).not.toBeChecked();
    expect(screen.getByRole('textbox', { name: /Something else/ })).toHaveValue(
      'Review weekly'
    );
    expect(
      screen.getByRole('textbox', { name: /Something else/ })
    ).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('adds custom checkbox answers and keeps submitted controls checked and disabled', async () => {
    const onSubmit = vi.fn();
    const { user } = render(
      <ChoicesHost mode="multiple" onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Something else…' }));
    await user.type(
      screen.getByRole('textbox', { name: /Something else/ }),
      'Audit usage'
    );
    await user.click(screen.getByRole('checkbox', { name: 'Final summary' }));
    expect(screen.getByRole('checkbox', { name: 'Each change' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Something else…' })
    ).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Something else…' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Something else…' }));
    expect(screen.getByRole('textbox', { name: /Something else/ })).toHaveValue(
      'Audit usage'
    );

    await user.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(onSubmit).toHaveBeenCalledWith({
      selected: ['each', 'custom'],
      custom: { selected: true, text: 'Audit usage' },
    });
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeDisabled();
    }
    expect(
      screen.getByRole('textbox', { name: /Something else/ })
    ).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Something else/ })).toHaveValue(
      'Audit usage'
    );
  });

  const modes: ChatRichContentChoicesProps['mode'][] = ['single', 'multiple'];

  it.each(modes)(
    'only offers a custom answer when enabled in %s mode',
    (mode) => {
      render(<ChoicesHost mode={mode} allowCustom={false} />);
      expect(screen.queryByText('Something else…')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    }
  );

  it.each(modes)(
    'displays saved custom answers without taking focus in %s mode',
    (mode) => {
      render(
        <ChatRichContentChoices
          aria-label="Review preferences"
          mode={mode}
          options={options}
          value={{
            selected: [],
            custom: { selected: true, text: 'Review weekly' },
          }}
          onChange={() => {}}
          allowCustom
          disabled
        />
      );
      const input = screen.getByRole('textbox', { name: /Something else/ });
      expect(input).toHaveValue('Review weekly');
      expect(input).toBeDisabled();
      expect(input).not.toHaveFocus();
    }
  );
});
