import { describe, expect, test } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { PREPARED_XML, XML_SOURCE } from './xmlCompatibilitySample';

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
    expect(screen.getByRole('checkbox', { name: 'Complete' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Open' })).not.toBeChecked();
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeEnabled();
      expect(checkbox).toHaveAttribute('aria-readonly', 'true');
      expect(checkbox).toHaveAttribute('tabindex', '-1');
      checkbox.click();
    }
    expect(screen.getByRole('checkbox', { name: 'Complete' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Open' })).not.toBeChecked();
    expect(within(screen.getByRole('table')).getByText('Ready')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Table' })).toHaveAttribute(
      'tabindex',
      '0'
    );
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

  test('repairs partial formatting only while streaming', () => {
    const { container, rerender } = render(
      <MarkdownDisplay content="A **streaming response" isStreaming />
    );
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByText('streaming response').closest('strong')
    ).toBeVisible();

    rerender(
      <MarkdownDisplay
        content="A **streaming response** with `code"
        isStreaming
      />
    );
    expect(screen.getByText('code').closest('code')).toBeVisible();

    rerender(<MarkdownDisplay content="A **streaming response** with `code" />);
    expect(container.firstChild).not.toHaveAttribute('aria-busy');
    expect(container.querySelector('code')).toBeNull();
    expect(container).toHaveTextContent('with `code');
  });

  test('keeps partial link and image destinations inert until complete', () => {
    const { container, rerender } = render(
      <MarkdownDisplay
        content="Read [the docs](https://docs.lang"
        isStreaming
      />
    );
    expect(container).toHaveTextContent('Read the docs');
    expect(screen.queryByRole('link')).toBeNull();

    rerender(
      <MarkdownDisplay
        content="Read [the docs](https://docs.langchain.com)"
        isStreaming
      />
    );
    expect(screen.getByRole('link', { name: 'the docs' })).toHaveAttribute(
      'href',
      'https://docs.langchain.com'
    );

    rerender(
      <MarkdownDisplay
        content="![A diagram](https://example.com/part"
        isStreaming
        loadImages
      />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();

    rerender(
      <MarkdownDisplay content="[unsafe](javascript:alert(1))" isStreaming />
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  test('updates an open code fence without remounting the code region', () => {
    const { rerender } = render(
      <MarkdownDisplay
        content={'```text\nconst value = "**literal'}
        isStreaming
      />
    );
    const region = screen.getByRole('region', { name: 'text' });
    expect(region).toHaveTextContent('const value = "**literal');

    rerender(
      <MarkdownDisplay content={'```text\nconst value = "**literal**";\n```'} />
    );
    expect(screen.getByRole('region', { name: 'text' })).toBe(region);
    expect(region).toHaveTextContent('const value = "**literal**";');
  });

  test('preserves literal XML and dollar signs while streaming', () => {
    const content = 'Price $$5 and <reasoning';
    const { container } = render(
      <MarkdownDisplay content={content} isStreaming />
    );
    expect(container).toHaveTextContent(content);
    expect(container.querySelector('reasoning')).toBeNull();
  });

  test('does not interpret raw HTML', () => {
    const { container } = render(
      <MarkdownDisplay content={'<img src="x" onerror="alert(1)">'} />
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('<img src="x" onerror="alert(1)">');
  });

  test('keeps Markdown inside raw XML tags visible without interpreting HTML', () => {
    const { container } = render(<MarkdownDisplay content={XML_SOURCE} />);

    expect(screen.getByRole('heading', { name: 'Plan' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Answer' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'docs' })).toBeVisible();
    expect(container).toHaveTextContent('<reasoning>');
    expect(container.querySelector('reasoning')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  test('preserves Run Details XML labels and nesting after application preprocessing', () => {
    const { container } = render(<MarkdownDisplay content={PREPARED_XML} />);

    const reasoning = screen.getByText('[reasoning]').closest('blockquote');
    const input = screen.getByText('[input]').closest('blockquote');
    expect(reasoning).toContainElement(input);
    expect(input).toHaveTextContent('[example] Nested content');
    expect(reasoning).toContainElement(
      screen.getByRole('heading', { name: 'Plan' })
    );
    expect(reasoning).not.toContainElement(
      screen.getByRole('heading', { name: 'Answer' })
    );
    expect(screen.getByRole('region', { name: 'xml' })).toHaveTextContent(
      '<reasoning>Keep code literal</reasoning>'
    );
    expect(container.querySelector('reasoning')).toBeNull();
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

  test('keeps oversized streaming content unchanged in the plain-text fallback', () => {
    const content = `**${'a'.repeat(20_000)}`;
    const { container } = render(
      <MarkdownDisplay content={content} isStreaming fullLength />
    );
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveTextContent(content);
    expect(container.querySelector('strong')).toBeNull();
  });

  test('uses the common component name marker', () => {
    const { container } = render(<MarkdownDisplay content="Hello" />);

    expect(container.firstChild).toHaveAttribute(
      'data-component',
      'Macaw-MarkdownDisplay'
    );
  });
});
