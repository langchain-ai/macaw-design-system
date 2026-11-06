import type { ExtraProps } from 'react-markdown';

type HastElement = NonNullable<ExtraProps['node']>;
type HastChild = HastElement['children'][number];
type HastParent = { children: HastChild[] };

/** Marks where `trailingContent` renders inside the Markdown output. */
export const TRAILING_SLOT_ATTRIBUTE = 'data-markdown-trailing';

const BLOCK_TAG_NAMES = new Set([
  'blockquote',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
]);

const HTML_WHITESPACE = /^[\t\n\f\r ]*$/;

const isBlockElement = (node: HastChild | undefined) =>
  node?.type === 'element' && BLOCK_TAG_NAMES.has(node.tagName);

const isInterBlockWhitespace = (
  node: HastChild,
  index: number,
  siblings: HastChild[]
) =>
  node.type === 'text' &&
  HTML_WHITESPACE.test(node.value) &&
  (isBlockElement(siblings[index - 1]) || isBlockElement(siblings[index + 1]));

/**
 * Removes whitespace that only separates markup: the line endings remark
 * inserts between block elements, and the space after a task checkbox. Both
 * are invisible under normal white-space handling, but `whitespace-pre-wrap`
 * would render the line endings as blank lines and indent task text.
 */
function removeStructuralWhitespace(parent: HastParent) {
  parent.children = parent.children.filter(
    (child, index, siblings) => !isInterBlockWhitespace(child, index, siblings)
  );
  parent.children.forEach((child, index, siblings) => {
    const previous = siblings[index - 1];
    if (
      child.type === 'text' &&
      previous?.type === 'element' &&
      previous.tagName === 'input'
    ) {
      child.value = child.value.replace(/^[\t\n\f\r ]+/, '');
    }
    if (child.type === 'element') removeStructuralWhitespace(child);
  });
}

/** Keep generated footnote spacing out of consumer text-search offsets. */
function markFootnoteSpacing(parent: HastParent) {
  parent.children = parent.children.flatMap((child, index, siblings) => {
    const next = siblings[index + 1];
    if (
      child.type === 'text' &&
      child.value.endsWith(' ') &&
      next?.type === 'element' &&
      'dataFootnoteBackref' in next.properties
    ) {
      // remark appends this separator with the back-reference control.
      child.value = child.value.slice(0, -1);
      return [
        child,
        {
          type: 'element',
          tagName: 'span',
          properties: { 'data-search-ignore': '' },
          children: [{ type: 'text', value: ' ' }],
        } satisfies HastElement,
      ];
    }
    if (child.type === 'element') markFootnoteSpacing(child);
    return [child];
  });
}

/**
 * Appends a slot for `trailingContent` to the final paragraph so the content
 * continues that paragraph's text, or after the last block otherwise.
 */
function appendTrailingSlot(root: HastParent) {
  const last = root.children.at(-1);
  const target = last?.type === 'element' && last.tagName === 'p' ? last : root;
  target.children.push({
    type: 'element',
    tagName: 'span',
    properties: { [TRAILING_SLOT_ATTRIBUTE]: '' },
    children: [],
  });
}

export function rehypeMarkdownDisplay() {
  return (tree: HastParent) => {
    removeStructuralWhitespace(tree);
    markFootnoteSpacing(tree);
    appendTrailingSlot(tree);
  };
}

/**
 * Turns off CommonMark's raw HTML constructs. Raw HTML is never interpreted,
 * and parsing it would let a non-standard tag such as `<reasoning>` swallow
 * the Markdown that follows it up to the next blank line.
 * XML section mode or application adapters first convert those tags to
 * Markdown labels and blockquotes; disabling HTML does not change that output.
 */
export function remarkDisableRawHtml(this: unknown) {
  const data = (this as { data(): { micromarkExtensions?: unknown[] } }).data();
  (data.micromarkExtensions ??= []).push({
    disable: { null: ['htmlFlow', 'htmlText'] },
  });
}
