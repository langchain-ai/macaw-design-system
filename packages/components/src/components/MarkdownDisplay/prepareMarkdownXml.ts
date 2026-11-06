import { MAX_TEXT_LENGTH } from '../Code/constants';

const CDATA_OPEN = '<![CDATA[';
const CDATA_CLOSE = ']]>';

// Matches a block-level opening tag (the entire trimmed line is just a tag,
// optionally followed by the CDATA open marker, as in <tag><![CDATA[).
// Captures self-closing tags (<tag /> or <tag/>) as well as normal opening tags.
const BLOCK_OPEN_TAG =
  /^<([a-zA-Z][a-zA-Z0-9_-]*)(\s[^>]*)?\s*\/?>(?:<!\[CDATA\[)?$/;
const BLOCK_SELF_CLOSING_TAG = /\/\s*>$/;
// A close tag may share its line with the CDATA close marker, as in ]]></tag>.
const BLOCK_CLOSE_TAG = /^(?:\]\]>)?<\/([a-zA-Z][a-zA-Z0-9_-]*)>$/;

/**
 * Indices of block-level opening tags that have their own matching close tag.
 * A close pairs with the nearest open of the same name; opens left above it are
 * unclosed. Lets void-element names (e.g. <input>...</input>) nest as wrappers.
 */
function findClosedOpenTags(lines: string[]): Set<number> {
  const closed = new Set<number>();
  const stack: { name: string; index: number }[] = [];
  let inFencedCodeBlock = false;
  let inCdata = false;
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    // A CDATA body is literal text, so a tag inside it neither opens nor closes.
    if (inCdata) {
      if (!trimmed.startsWith(CDATA_CLOSE)) continue;
      inCdata = false;
    }
    if (trimmed.startsWith('```')) {
      inFencedCodeBlock = !inFencedCodeBlock;
      continue;
    }
    if (inFencedCodeBlock) continue;
    const openName = trimmed.match(BLOCK_OPEN_TAG)?.[1];
    if (openName && !BLOCK_SELF_CLOSING_TAG.test(trimmed)) {
      stack.push({ name: openName.toLowerCase(), index });
      inCdata = trimmed.endsWith(CDATA_OPEN);
      continue;
    }
    const closeName = trimmed.match(BLOCK_CLOSE_TAG)?.[1].toLowerCase();
    if (!closeName) continue;
    let match = stack.length - 1;
    while (match >= 0 && stack[match].name !== closeName) match--;
    if (match === -1) continue;
    closed.add(stack[match].index);
    stack.length = match;
  }
  return closed;
}

// Standard HTML alone does not activate XML section handling.
// Non-standard tags (e.g. <example>, <reasoning>) are treated as HTML blocks by the
// CommonMark parser, which causes remark to swallow the inner content as raw HTML
// instead of parsing it as markdown. We pre-process them out so the inner text renders
// with proper styling.
const STANDARD_HTML_ELEMENTS = new Set([
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
]);

const INLINE_TAG = /<\/?[a-zA-Z][a-zA-Z0-9_-]*(\s[^>]*)?>/g;

function replaceInlineTags(line: string): string {
  let result = '';
  let lastIndex = 0;
  for (const match of line.matchAll(INLINE_TAG)) {
    const start = match.index ?? 0;
    result += line
      .slice(lastIndex, start)
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    if (!match[0].startsWith('</')) {
      const name = match[0].match(/^<([a-zA-Z][a-zA-Z0-9_-]*)/)?.[1];
      if (name) result += `**[${name}]** `;
    }
    lastIndex = start + match[0].length;
  }
  return (
    result +
    line.slice(lastIndex).replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  );
}

const INLINE_CODE = /`[^`]*`/g;

// Markdown keeps a code span's characters as typed but decodes entities in
// prose, so only the text between code spans is escaped.
function escapeOutsideCode(text: string): string {
  const escape = (s: string) =>
    s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  let result = '';
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_CODE)) {
    const start = match.index ?? 0;
    result += escape(text.slice(lastIndex, start)) + match[0];
    lastIndex = start + match[0].length;
  }
  return result + escape(text.slice(lastIndex));
}

// HTML void elements never have a closing tag, so they must not be pushed onto
// the tag stack — otherwise they would permanently corrupt the nesting depth.
const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Returns true if the content contains at least one non-standard block-level tag. */
function hasCustomXmlTags(content: string): boolean {
  let inFencedCodeBlock = false;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFencedCodeBlock = !inFencedCodeBlock;
      continue;
    }
    if (inFencedCodeBlock) continue;
    const match = trimmed.match(BLOCK_OPEN_TAG);
    if (match && !STANDARD_HTML_ELEMENTS.has(match[1].toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * When the content contains custom XML tags (non-standard HTML), treat ALL
 * block-level tags as XML structure — including standard HTML elements like
 * `<input>` or `<div>` that may appear alongside custom tags.
 *
 * Processes line by line with a tag stack to track nesting depth. Opening
 * tags become bold `**[tagname]**` labels; content lines are prefixed with
 * blockquote markers (`>`) per nesting level. Inline tags are stripped.
 *
 * If no custom XML tags are detected the content is returned unchanged so
 * literal-tag rendering is unaffected. Oversized input is left unchanged for
 * the plain-text fallback. This helper can also prepare text for a search index.
 */
export function prepareMarkdownXml(content: string): string {
  if (content.length > MAX_TEXT_LENGTH || !hasCustomXmlTags(content))
    return content;

  const lines = content.split('\n');
  const output: string[] = [];
  const tagStack: string[] = [];
  let inFencedCodeBlock = false;
  let inCdata = false;
  const closedOpenTags = findClosedOpenTags(lines);

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();

    // A CDATA body is literal text: no tag in it becomes a label or a nested
    // section. The producer splits any ']]>' in the text into two CDATA
    // sections, so that seam is joined back before display. Markdown shows a
    // fence's text as typed, so only lines outside a fence are escaped, and a
    // fence left open in the body ends with the body.
    if (inCdata) {
      if (trimmed.startsWith(CDATA_CLOSE)) {
        inCdata = false;
        inFencedCodeBlock = false;
        if (trimmed === CDATA_CLOSE) continue;
      } else {
        const depth = tagStack.length;
        const prefix = '> '.repeat(depth);
        const joined = line.replaceAll(`${CDATA_CLOSE}${CDATA_OPEN}`, '');
        const isFence = joined.trim().startsWith('```');
        const literal =
          isFence || inFencedCodeBlock ? joined : escapeOutsideCode(joined);
        if (isFence) inFencedCodeBlock = !inFencedCodeBlock;
        output.push(trimmed === '' ? prefix.trimEnd() : `${prefix}${literal}`);
        continue;
      }
    }

    // Toggle fenced code block state. Lines inside code blocks are passed
    // through unchanged so tags in code examples are not transformed.
    if (trimmed.startsWith('```')) {
      inFencedCodeBlock = !inFencedCodeBlock;
      const depth = tagStack.length;
      output.push(depth > 0 ? `${'> '.repeat(depth)}${line}` : line);
      continue;
    }
    if (inFencedCodeBlock) {
      const depth = tagStack.length;
      output.push(depth > 0 ? `${'> '.repeat(depth)}${line}` : line);
      continue;
    }

    const openMatch = trimmed.match(BLOCK_OPEN_TAG);
    if (openMatch) {
      const tagName = openMatch[1];
      const isSelfClosing =
        BLOCK_SELF_CLOSING_TAG.test(trimmed) ||
        (HTML_VOID_ELEMENTS.has(tagName.toLowerCase()) &&
          !closedOpenTags.has(index));
      if (isSelfClosing) {
        // Self-closing and void elements have no closing tag — emit label at
        // current depth without pushing onto the stack.
        const depth = tagStack.length;
        const prefix = depth > 0 ? '> '.repeat(depth) : '';
        output.push(`${prefix}**[${tagName}]**`);
        continue;
      }
      // Push first so the label is at the new depth — inside its own blockquote,
      // visually connected to the content that follows.
      tagStack.push(tagName);
      const depth = tagStack.length;
      const prefix = '> '.repeat(depth);
      // Blank separator at the parent depth before nested labels keeps sections distinct
      if (depth > 1) {
        output.push('> '.repeat(depth - 1).trimEnd());
      }
      output.push(`${prefix}**[${tagName}]**`);
      inCdata = trimmed.endsWith(CDATA_OPEN);
      continue;
    }

    const closeMatch = trimmed.match(BLOCK_CLOSE_TAG);
    if (closeMatch) {
      if (
        tagStack.length > 0 &&
        tagStack[tagStack.length - 1].toLowerCase() ===
          closeMatch[1].toLowerCase()
      ) {
        tagStack.pop();
      }
      // Blank line to visually close the section; use parent-depth prefix if still nested
      output.push(
        tagStack.length > 0 ? '> '.repeat(tagStack.length).trimEnd() : ''
      );
      continue;
    }

    const depth = tagStack.length;
    // Closing inline tags are dropped; opening inline tags become bold labels.
    // The replacement never returns any portion of the original matched tag —
    // only the extracted tag name wrapped in markdown bold syntax — so no raw
    // HTML can appear in the output from this substitution.
    const stripped = replaceInlineTags(line);
    if (depth > 0) {
      const prefix = '> '.repeat(depth);
      // Blank lines inside blockquotes need the prefix to maintain context
      output.push(trimmed === '' ? prefix.trimEnd() : `${prefix}${stripped}`);
    } else {
      output.push(stripped);
    }
  }

  return output.join('\n');
}
