import { describe, expect, test } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { MarkdownDisplay } from '../MarkdownDisplay';

describe('MarkdownDisplay', () => {
  test('renders GFM content with safe links and task controls', () => {
    render(
      <MarkdownDisplay
        content={[
          '# Heading',
          '',
          '~~Removed~~ and [docs](https://docs.langchain.com).',
          '',
          '- [x] Complete',
          '- [ ] Open',
          '',
          '| Name | Value |',
          '| --- | --- |',
          '| Macaw | Ready |',
        ].join('\n')}
      />
    );

    expect(screen.getByRole('heading', { name: 'Heading' })).toBeVisible();
    expect(screen.getByText('Removed').closest('del')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute(
      'target',
      '_blank'
    );
    expect(screen.getByRole('checkbox', { name: 'Completed' })).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: 'Not completed' })
    ).toBeDisabled();
    expect(within(screen.getByRole('table')).getByText('Ready')).toBeVisible();
  });

  test('renders inline and fenced code with Macaw code presentation', () => {
    render(
      <MarkdownDisplay
        content={'Use `inline()` here.\n\n```typescript\nconst value = 1;\n```'}
      />
    );

    expect(screen.getByText('inline()')).toHaveClass('font-mono');
    expect(
      screen.getByRole('region', { name: 'typescript' })
    ).toHaveTextContent('const value = 1;');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeVisible();
  });

  test('allows component overrides and composes content slots', () => {
    render(
      <MarkdownDisplay
        content="Paragraph"
        components={{
          p: ({ children }) => <p data-testid="custom-paragraph">{children}</p>,
        }}
        trailingContent={<span>Trailing</span>}
        afterContent={<div>After</div>}
      />
    );

    expect(screen.getByTestId('custom-paragraph')).toHaveTextContent(
      'Paragraph'
    );
    expect(screen.getByText('Trailing')).toBeVisible();
    expect(screen.getByText('After')).toBeVisible();
  });

  test('does not interpret raw HTML', () => {
    const { container } = render(
      <MarkdownDisplay content={'<img src="x" onerror="alert(1)">'} />
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('<img src="x" onerror="alert(1)">');
  });

  test('does not render unsafe link or image URLs', () => {
    const { container } = render(
      <MarkdownDisplay
        content={
          '[unsafe](javascript:alert(1)) ![unsafe image](javascript:alert(1))'
        }
      />
    );

    expect(
      screen.queryByRole('link', { name: 'unsafe' })
    ).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('unsafe image')).toBeVisible();
  });

  test('uses linkified plain text for oversized content', () => {
    render(
      <MarkdownDisplay
        content={`https://docs.langchain.com ${'a'.repeat(20_000)}`}
        fullLength
      />
    );

    expect(
      screen.getByRole('img', {
        name: 'Shown as plain text because this block is too large for Markdown.',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'https://docs.langchain.com' })
    ).toBeVisible();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('uses the common component name marker', () => {
    const { container } = render(<MarkdownDisplay content="Hello" />);

    expect(container.firstChild).toHaveAttribute(
      'data-component',
      'Macaw-MarkdownDisplay'
    );
  });
});
