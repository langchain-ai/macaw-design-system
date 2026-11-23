/**
 * Run Details DOM search contract from LangChainPlus
 * dec09b917fddc52c73c7cba750869d432adaff64, Pages/Run/components-next/find/domSearch.ts.
 * Kept independent of the renderer so markup changes cannot silently shift
 * text-search offsets. The captured cases use that revision's searchableText.
 */
type Segment = { text: string; node?: Text; offset?: number };
const ignored =
  '[data-search-ignore], [aria-hidden="true"], [data-footnote-ref], [data-footnote-backref], .sr-only, button, input, script, style';

/** Serialize renderer-owned text, retaining a mapping back to each DOM text node. */
export function readSearchableDom(root: HTMLElement) {
  function join(parts: Segment[][], separator: string): Segment[] {
    return parts
      .filter((part) => part.some(({ text }) => text.length > 0))
      .flatMap((part, index) =>
        index && separator ? [{ text: separator }, ...part] : part
      );
  }
  function read(node: Node): Segment[] {
    if (node instanceof Text) return [{ text: node.data, node, offset: 0 }];
    if (!(node instanceof HTMLElement) || node.matches(ignored)) return [];
    if (node.tagName === 'BR') return [{ text: '\n' }];
    if (node.hasAttribute('data-search-code')) {
      const code = node.querySelector<HTMLElement>('[data-code-lite]');
      const parts = code
        ? Array.from(
            code.querySelectorAll<HTMLElement>('[data-code-line]')
          ).flatMap((line, index) => {
            const parts = read(line);
            if (parts.map(({ text }) => text).join('') === '\n')
              parts.forEach((part) => {
                part.text = '';
              });
            return index ? [{ text: '\n' }, ...parts] : parts;
          })
        : Array.from(node.childNodes).flatMap(read);
      // ReactMarkdown adds one terminal newline to fenced code contents.
      const last = [...parts].reverse().find((part) => part.text.length > 0);
      if (last?.text.endsWith('\n')) last.text = last.text.slice(0, -1);
      return parts;
    }
    const kind =
      node.dataset.searchKind ??
      (/^(TABLE|TBODY|THEAD|TFOOT|UL|OL|LI|BLOCKQUOTE)$/.test(node.tagName)
        ? 'container'
        : node.tagName === 'TR'
          ? 'row'
          : undefined);
    const separator = kind === 'row' ? '\t' : kind === 'container' ? '\n' : '';
    const children = Array.from(node.childNodes).filter(
      (child) => !(separator && child instanceof Text && !child.data.trim())
    );
    if (kind !== 'container') return join(children.map(read), separator);
    let previousBlock = false;
    const result: Segment[] = [];
    for (const child of children) {
      const parts = read(child);
      if (!parts.some(({ text }) => text.length > 0)) continue;
      const block =
        child instanceof HTMLElement &&
        (child.hasAttribute('data-search-block') ||
          /^(H[1-6]|P|UL|OL|LI|BLOCKQUOTE|TABLE|THEAD|TBODY|TFOOT|TR|SECTION)$/.test(
            child.tagName
          ));
      if (result.length && (block || previousBlock))
        result.push({ text: '\n' });
      result.push(...parts);
      previousBlock = block;
    }
    return result;
  }
  const segments = read(root);
  return { text: segments.map(({ text }) => text).join(''), segments };
}

export function findDomRange(
  root: HTMLElement,
  expected: string,
  query: string,
  occurrence: number
): Range | undefined {
  if (!query) return;
  const { text, segments } = readSearchableDom(root);
  const pattern = new RegExp(
    query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'giu'
  );
  let match: RegExpExecArray | null = null;
  for (let index = 0; index <= occurrence; index++) {
    match = pattern.exec(expected);
    if (!match) return;
  }
  if (!match) return;
  const start = match.index;
  const end = start + match[0].length;
  // A changed or truncated tail cannot invalidate an already-rendered match.
  // Verify the prefix through this occurrence so earlier differences cannot
  // shift the selection to a different occurrence.
  if (text.slice(0, end) !== expected.slice(0, end)) return;
  let position = 0;
  let range: Range | undefined;
  for (const segment of segments) {
    const next = position + segment.text.length;
    if (segment.node && next > start && position < end) {
      if (!range) {
        range = document.createRange();
        range.setStart(
          segment.node,
          (segment.offset ?? 0) + Math.max(0, start - position)
        );
      }
      range.setEnd(
        segment.node,
        (segment.offset ?? 0) + Math.min(segment.text.length, end - position)
      );
    }
    position = next;
  }
  return range;
}
