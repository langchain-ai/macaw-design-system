import { afterEach, describe, expect, it, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import { CodeLite } from '../CodeLite';

describe('CodeLite', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders lines with gutter numbers', () => {
    render(<CodeLite value={'a\nb'} language="python" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('hides gutter when showGutter is false', async () => {
    render(<CodeLite value={'hello'} language="python" showGutter={false} />);
    expect(await screen.findByText('hello')).toBeVisible();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('highlights matching code text', async () => {
    render(
      <CodeLite
        value={'model: "openai/gpt-4"'}
        language="typescript"
        highlightText="openai/gpt-4"
      />
    );

    expect(await screen.findByText('openai/gpt-4')).toHaveAttribute(
      'data-code-highlight'
    );
  });

  it('renders children alongside the table', async () => {
    render(
      <CodeLite value={'x'} language="python">
        <div data-testid="child">extra</div>
      </CodeLite>
    );
    expect(await screen.findByTestId('child')).toBeVisible();
  });

  it('keeps the toolbar opt-in', () => {
    render(<CodeLite value="result" language="plaintext" />);
    expect(screen.getByText('result')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /copy/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Code block' })
    ).not.toBeInTheDocument();
  });

  it('renders plaintext literally and preserves indentation', () => {
    render(
      <CodeLite
        value={'<img src="x" alt="Injected">\n  indented'}
        language="plaintext"
        variant="block"
        showGutter={false}
      />
    );
    expect(screen.getByText('<img src="x" alt="Injected">')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'indented' }).textContent).toBe(
      '  indented'
    );
  });

  it('copies the current value after content updates', async () => {
    vi.stubGlobal('isSecureContext', true);
    const { user, rerender } = render(
      <CodeLite
        value="First line"
        language="plaintext"
        variant="block"
        label="output.txt"
      />
    );
    expect(screen.getByText('output.txt')).toBeVisible();
    const updated = 'First line\n  Second line';
    rerender(
      <CodeLite
        value={updated}
        language="plaintext"
        variant="block"
        label="output.txt"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await navigator.clipboard.readText()).toBe(updated);
  });

  it.each([false, true])(
    'names the block region from its label (virtualize=%s)',
    (virtualize) => {
      const { rerender } = render(
        <CodeLite
          value="result"
          language="plaintext"
          variant="block"
          label="output.txt"
          virtualize={virtualize}
        />
      );
      expect(screen.getByRole('region', { name: 'output.txt' })).toBeVisible();

      for (const label of [undefined, '', '   ']) {
        rerender(
          <CodeLite
            value="result"
            language="plaintext"
            variant="block"
            label={label}
            virtualize={virtualize}
          />
        );
        expect(
          screen.getByRole('region', { name: 'Code block' })
        ).toBeVisible();
      }
    }
  );

  it('allows keyboard focus to reach the code scroll region', async () => {
    const { user } = render(
      <CodeLite
        value="A long line"
        language="plaintext"
        variant="block"
        wrapLines={false}
      />
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('region', { name: 'Code block' })).toHaveFocus();
  });

  it('replaces the default toolbar and supports hiding it', () => {
    const { rerender } = render(
      <CodeLite
        value="result"
        language="plaintext"
        variant="block"
        toolbar={<Button>Download result</Button>}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Download result' })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /copy/i })
    ).not.toBeInTheDocument();
    rerender(
      <CodeLite
        value="result"
        language="plaintext"
        variant="block"
        toolbar={null}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Code block' })).getByText(
        'result'
      )
    ).toBeVisible();
  });

  it('shows an unchanged diff and preserves its children', async () => {
    render(
      <CodeLite variant="diff" oldString="hello" newString="hello">
        <p>Review complete</p>
      </CodeLite>
    );
    expect(await screen.findByText('No changes')).toBeVisible();
    expect(screen.getByText('Review complete')).toBeVisible();
  });

  it('switches between code and diff previews', async () => {
    const { rerender } = render(
      <CodeLite value="original" language="python" />
    );
    expect(await screen.findByText('original')).toBeVisible();

    rerender(<CodeLite variant="diff" oldString="same" newString="same" />);
    expect(await screen.findByText('No changes')).toBeVisible();
    expect(screen.queryByText('original')).not.toBeInTheDocument();

    rerender(<CodeLite value="updated" language="python" />);
    expect(await screen.findByText('updated')).toBeVisible();
    expect(screen.queryByText('No changes')).not.toBeInTheDocument();
  });

  it('exposes code lines separately from gutters for document search', async () => {
    render(<CodeLite value={'hello\nworld'} language="python" />);
    await screen.findByText('world');

    expect(screen.getByRole('table')).toHaveAttribute('data-code-lite');
    const cells = screen.getAllByRole('cell');
    const lines = cells.filter((cell) => cell.hasAttribute('data-code-line'));
    expect(lines.map((cell) => cell.textContent).join('\n')).toBe(
      'hello\nworld'
    );
    const gutters = cells.filter((cell) =>
      cell.hasAttribute('data-search-ignore')
    );
    expect(gutters.map((cell) => cell.textContent)).toEqual(['1', '2']);
  });
});
