import { describe, expect, test } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { MarkdownDisplay } from '../MarkdownDisplay';
import { prepareMarkdownXml } from '../prepareMarkdownXml';
import {
  CDATA_SOURCE,
  PREPARED_XML,
  XML_SOURCE,
} from './xmlCompatibilitySample';

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

  test('renders raw Run Details XML as labeled sections when enabled', () => {
    const { container } = render(
      <MarkdownDisplay content={XML_SOURCE} xmlTags="sections" />
    );
    expect(prepareMarkdownXml(XML_SOURCE)).toBe(PREPARED_XML);
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
    expect(container.querySelector('reasoning, input')).toBeNull();
  });

  test('keeps CDATA payload tags, entities, code, and split terminators literal', () => {
    const { container } = render(
      <MarkdownDisplay content={CDATA_SOURCE} xmlTags="sections" />
    );
    const input = screen.getByText('[input]').closest('blockquote');
    expect(input).toContainElement(
      screen.getByRole('heading', { name: 'Payload' })
    );
    expect(input).toHaveTextContent(
      'Literal <reasoning>do not relabel</reasoning> & &lt;tag&gt;.'
    );
    expect(input).toHaveTextContent('Split terminator: ]]>.');
    expect(screen.getByText('<tool> & value').closest('code')).toBeVisible();
    expect(screen.getByRole('region', { name: 'xml' })).toHaveTextContent(
      '<tool>fenced & literal</tool>'
    );
    expect(screen.getAllByText('[reasoning]')).toHaveLength(1);
    expect(input).not.toContainElement(screen.getByText('[reasoning]'));
    expect(container.querySelector('reasoning, tool, input')).toBeNull();
  });

  test('preserves section depth across void, self-closing, and mixed-case tags', () => {
    render(
      <MarkdownDisplay
        xmlTags="sections"
        content={
          '<Thinking>\nStep 1\n<br>\n<separator/>\n<input>\nNested\n</input>\nStep 2\n</thinking>\nAfter'
        }
      />
    );
    const thinking = screen.getByText('[Thinking]').closest('blockquote');
    const input = screen.getByText('[input]').closest('blockquote');
    expect(thinking).toContainElement(input);
    expect(input).toHaveTextContent('Nested');
    expect(input).not.toHaveTextContent('Step 2');
    expect(thinking).toHaveTextContent('Step 2');
    expect(thinking).not.toHaveTextContent('After');
  });

  test('preserves inline code and native blockquote structure in XML section mode', () => {
    render(
      <MarkdownDisplay
        xmlTags="sections"
        content={[
          '<reasoning>',
          'Use `x => x < 2` here.',
          '',
          '> Inside quote with ``a`<b>``.',
          '</reasoning>',
          'After the section.',
          '',
          '> Outside quote with `a<b>`.',
        ].join('\n')}
      />
    );
    const reasoning = screen.getByText('[reasoning]').closest('blockquote');
    const inside = screen.getByText('a`<b>').closest('blockquote');
    const outside = screen.getByText('a<b>').closest('blockquote');
    for (const code of ['x => x < 2', 'a`<b>', 'a<b>']) {
      expect(screen.getByText(code).tagName).toBe('CODE');
    }
    expect(inside).not.toBe(reasoning);
    expect(reasoning).toContainElement(inside);
    expect(outside).toBeVisible();
    expect(reasoning).not.toContainElement(outside);
  });

  test('keeps HTML inert and does not activate sections for code-only XML', () => {
    const { container, rerender } = render(
      <MarkdownDisplay
        xmlTags="sections"
        content={'<example>\n<scr</script>ipt>alert(1)</script>\n</example>'}
      />
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container).toHaveTextContent('<script>alert(1)');
    rerender(
      <MarkdownDisplay
        xmlTags="sections"
        content={'```xml\n<reasoning>\ncode only\n</reasoning>\n```'}
      />
    );
    expect(screen.queryByText('[reasoning]')).toBeNull();
    expect(screen.getByRole('region', { name: 'xml' })).toHaveTextContent(
      '<reasoning>'
    );
    rerender(
      <MarkdownDisplay
        xmlTags="sections"
        content={'<img src="x" onerror="alert(1)">'}
      />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('<img src="x" onerror="alert(1)">');
  });

  test('supports streaming XML sections without rewriting oversized input', () => {
    const { container, rerender } = render(
      <MarkdownDisplay
        xmlTags="sections"
        isStreaming
        content={'<reasoning>\nA **partial response'}
      />
    );
    expect(screen.getByText('[reasoning]')).toBeVisible();
    expect(
      screen.getByText('partial response').closest('strong')
    ).toBeVisible();
    const long = '<reasoning>\n' + 'a'.repeat(20_000) + '\n</reasoning>';
    rerender(
      <MarkdownDisplay
        xmlTags="sections"
        isStreaming
        content={long}
        fullLength
      />
    );
    expect(prepareMarkdownXml(long)).toBe(long);
    expect(container).toHaveTextContent('<reasoning>');
    expect(screen.queryByText('[reasoning]')).toBeNull();
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

  test('renders Markdown past the default limit when maxMarkdownLength allows it', () => {
    render(
      <MarkdownDisplay
        content={`# Long answer\n\n${'a'.repeat(20_000)}`}
        maxMarkdownLength={Infinity}
      />
    );

    expect(screen.getByRole('heading', { name: 'Long answer' })).toBeVisible();
    expect(
      screen.queryByRole('img', {
        name: 'Shown as plain text because this block is too large for Markdown.',
      })
    ).not.toBeInTheDocument();
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

test('composes trusted plugins with GFM, literal HTML, and trailing content', () => {
  function remarkHeading() {
    return (tree: { children: { type: string; depth?: number }[] }) => {
      for (const child of tree.children) {
        if (child.type === 'heading') child.depth = 2;
      }
    };
  }
  function rehypeParagraph() {
    return (tree: {
      children: {
        type: string;
        tagName?: string;
        properties?: Record<string, unknown>;
      }[];
    }) => {
      for (const child of tree.children) {
        if (child.tagName === 'p')
          child.properties = { ...child.properties, id: 'plugin-paragraph' };
      }
    };
  }
  const { container } = render(
    <MarkdownDisplay
      content={'# Heading\n\n~~Removed~~ <script>alert(1)</script>'}
      remarkPlugins={[remarkHeading]}
      rehypePlugins={[rehypeParagraph]}
      trailingContent={<span>Trailing</span>}
    />
  );
  expect(
    screen.getByRole('heading', { level: 2, name: 'Heading' })
  ).toBeVisible();
  expect(screen.getByText('Removed').closest('del')).toBeInTheDocument();
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('#plugin-paragraph')).toHaveTextContent(
    '<script>alert(1)</script>Trailing'
  );
});

test('skips custom plugins for oversized plain text', () => {
  const plugin = vi.fn(() => () => undefined);
  render(
    <MarkdownDisplay
      content="Oversized content"
      maxMarkdownLength={1}
      remarkPlugins={[plugin]}
      rehypePlugins={[plugin]}
    />
  );
  expect(plugin).not.toHaveBeenCalled();
});

test('delegates selected fenced languages while retaining the default code fallback', () => {
  type Node = {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: Node[];
  };
  // Splits code text into elements, as a highlighting plugin would.
  function rehypeSpanCode() {
    const wrap = (node: Node, inCode: boolean) => {
      node.children = node.children?.map((child) => {
        if (inCode && child.type === 'text') {
          return {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [child],
          };
        }
        wrap(child, inCode || child.tagName === 'code');
        return child;
      });
    };
    return (tree: Node) => wrap(tree, false);
  }
  const { container } = render(
    <MarkdownDisplay
      content={
        '```mermaid\ngraph TD; A-->B\n```\n\n```sql\nSELECT 1;\n```\n\n```typescript\nconst value = 1;\n```'
      }
      rehypePlugins={[rehypeSpanCode]}
      renderCodeBlock={({ code, language }) =>
        language === 'sql'
          ? null
          : language === 'mermaid' && (
              <figure aria-label="Diagram">{code}</figure>
            )
      }
    />
  );
  expect(screen.getByRole('figure', { name: 'Diagram' }).textContent).toBe(
    'graph TD; A-->B'
  );
  // `false` from the `&&` keeps the default block for other languages.
  expect(screen.getByRole('region', { name: 'typescript' })).toHaveTextContent(
    'const value = 1;'
  );
  // `null` omits the block, wrapper included.
  expect(screen.queryByText(/SELECT/)).not.toBeInTheDocument();
  expect(container.querySelectorAll('[data-search-code]')).toHaveLength(2);
  expect(screen.getAllByRole('button', { name: 'Copy code' })).toHaveLength(1);
});
