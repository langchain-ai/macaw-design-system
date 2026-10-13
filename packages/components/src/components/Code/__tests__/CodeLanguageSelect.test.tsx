import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { CodeLanguageSelect } from '../CodeLanguageSelect';

describe('CodeLanguageSelect', () => {
  it('preserves unsupported language labels and allows choosing a supported language', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <CodeLanguageSelect value="rust" onChange={onChange} />
    );
    const trigger = screen.getByRole('combobox', { name: 'Code language' });

    expect(trigger).toHaveTextContent('rust');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'TypeScript' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('typescript');
  });

  it('displays the canonical label for an alias without changing its value', () => {
    const onChange = vi.fn();
    render(<CodeLanguageSelect value=" PY " onChange={onChange} />);

    expect(
      screen.getByRole('combobox', { name: 'Code language' })
    ).toHaveTextContent('Python');
    expect(onChange).not.toHaveBeenCalled();
  });
});
