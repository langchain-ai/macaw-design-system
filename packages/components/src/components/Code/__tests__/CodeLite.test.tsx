import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { CodeLite } from '../CodeLite';

describe('CodeLite', () => {
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
