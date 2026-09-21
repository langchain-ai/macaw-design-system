import type {
  Language,
  LanguageSupport,
  foldNodeProp,
} from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { SyntaxNode, Tree } from '@lezer/common';
import type { Highlighter } from '@lezer/highlight';

import type { CMBundle } from '../../utils/lazy-codemirror-loader';
import { LANGUAGES } from './languages/languages';

export type FoldRange = { from: number; to: number };

export interface ParsedFile {
  file: {
    line: { from: number; to: number; classes: string }[];
    n: number;
    fold: FoldRange | null;
  }[];
  code: string;
}

function isUnfinished(node: SyntaxNode): boolean {
  const ch = node.lastChild;
  return !!(ch && ch.to === node.to && ch.type.isError);
}

const getOrCreateClassHighlighter = (() => {
  let classHighlighter: Highlighter | null = null;

  return (cm: CMBundle) => {
    if (classHighlighter != null) return classHighlighter;

    const { lezerTagHighlighter: tagHighlighter, lezerHighlightTags: tags } =
      cm;

    // Tailwind-friendly version of codemirror-theme-tokyo-night
    classHighlighter = tagHighlighter([
      {
        tag: tags.keyword,
        class: 'text-[#007197] dark:text-[#bb9af7]',
      },
      {
        tag: [tags.name, tags.deleted, tags.character, tags.macroName],
        class: 'text-[#3760bf] dark:text-[#c0caf5]',
      },
      {
        tag: [tags.propertyName],
        class: 'text-[#3760bf] dark:text-[#7aa2f7]',
      },
      {
        tag: [
          tags.processingInstruction,
          tags.string,
          tags.inserted,
          tags.content,
          tags.special(tags.string),
        ],
        class: 'text-[#587539] dark:text-[#9ece6a]',
      },
      {
        tag: [tags.function(tags.variableName), tags.labelName],
        class: 'text-[#3760bf] dark:text-[#7aa2f7]',
      },
      {
        tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
        class: 'text-[#3760bf] dark:text-[#bb9af7]',
      },
      {
        tag: [tags.definition(tags.name), tags.separator],
        class: 'text-[#3760bf] dark:text-[#c0caf5]',
      },
      {
        tag: [tags.className],
        class: 'text-[#3760bf] dark:text-[#c0caf5]',
      },
      {
        tag: [
          tags.number,
          tags.changed,
          tags.annotation,
          tags.modifier,
          tags.self,
          tags.namespace,
        ],
        class: 'text-[#b15c00] dark:text-[#ff9e64]',
      },
      {
        tag: [tags.typeName],
        class: 'text-[#007197] dark:text-[#2ac3de]',
      },
      {
        tag: [tags.operator, tags.operatorKeyword],
        class: 'text-[#007197] dark:text-[#bb9af7]',
      },
      {
        tag: [tags.url, tags.escape, tags.regexp, tags.link],
        class: 'text-[#587539] dark:text-[#b4f9f8]',
      },
      {
        tag: [tags.meta, tags.comment],
        class: 'text-[#848cb5] dark:text-[#565f89]',
      },
      {
        tag: tags.strong,
        class: 'font-bold',
      },
      {
        tag: tags.emphasis,
        class: 'italic',
      },
      {
        tag: tags.link,
        class: 'underline',
      },
      {
        tag: tags.heading,
        class: 'text-[#b15c00] font-semibold dark:text-[#89ddff]',
      },
      {
        tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
        class: 'text-[#3760bf] dark:text-[#c0caf5]',
      },
      {
        tag: tags.invalid,
        class: 'text-[#f52a65] dark:text-[#ff5370]',
      },
      {
        tag: tags.strikethrough,
        class: 'line-through',
      },
    ]);

    return classHighlighter;
  };
})();

function syntaxFolding(
  tree: Tree,
  text: string,
  editorState: EditorState,
  foldProp: typeof foldNodeProp,
  start: number,
  end: number
): FoldRange | null {
  if (tree.length < end) return null;

  const stack = tree.resolveInner(end, 1);
  let found: FoldRange | null = null;

  for (let cur: SyntaxNode | null = stack; cur; cur = cur.parent) {
    if (cur.to <= end || cur.from > end) continue;
    if (found && cur.from < start) break;

    const prop = cur.type.prop(foldProp) as (
      node: SyntaxNode,
      state: EditorState
    ) => FoldRange | null;

    if (
      prop &&
      (cur.to < tree.length - 50 ||
        tree.length === text.length ||
        !isUnfinished(cur))
    ) {
      const value = prop(cur, editorState);
      if (value && value.from <= end && value.from >= start && value.to > end) {
        found = value;
      }
    }
  }

  return found;
}

export const EMPTY_FILE: ParsedFile = { file: [], code: '' };

const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

class EditorAbortError extends Error {
  constructor() {
    super('Aborted');
    this.name = 'AbortError';
  }
}

async function parseNonBlocking(
  pkg: LanguageSupport | Language,
  code: string,
  options?: { signal?: AbortSignal }
) {
  const parse =
    'language' in pkg
      ? pkg.language.parser.startParse(code)
      : pkg.parser.startParse(code);

  let tree: Tree | null = null;
  let now = performance.now();
  for (;;) {
    tree = parse.advance();
    if (tree) break;

    if (options?.signal?.aborted) throw new EditorAbortError();
    if (performance.now() - now > 16) {
      await yieldToUI();
      now = performance.now();
    }
  }

  return tree;
}

// Serialize parses so CodeMirror parser state is never advanced concurrently.
let parseNonBlockingQueue: Promise<Tree> = Promise.resolve(null!);

function queueParse(
  pkg: LanguageSupport | Language,
  code: string,
  options?: {
    signal?: AbortSignal;
  }
) {
  const p = parseNonBlockingQueue.then(() =>
    parseNonBlocking(pkg, code, options)
  );
  // Keep the queue usable after a failed parse.
  parseNonBlockingQueue = p.catch(() => null!);
  return p;
}

export function convertFile(code: string | undefined): ParsedFile {
  if (!code) return EMPTY_FILE;

  const file: ParsedFile['file'] = [];
  let curr = 0;
  for (const line of code.split('\n')) {
    file.push({
      line: [{ from: curr, to: curr + line.length, classes: '' }],
      n: file.length + 1,
      fold: null,
    });

    curr += line.length + 1;
  }

  return { file, code };
}

export async function parseFile(
  cm: CMBundle,
  language: keyof typeof LANGUAGES,
  code: string | undefined,
  options?: {
    signal?: AbortSignal;
  }
): Promise<ParsedFile> {
  if (!code) return EMPTY_FILE;

  const { lezerHighlighTree: highlightTree, EditorState, foldNodeProp } = cm;
  // TODO: Make language loading, queueing, and highlighting cancellable; the
  // signal currently only interrupts Lezer parsing cooperatively.
  const pkg = await LANGUAGES[language];
  const tree = await queueParse(pkg, code, options);

  const editorState = EditorState.create({ doc: code });
  type Line = { from: number; to: number; classes: string }[];
  const file: { line: Line; n: number; fold: FoldRange | null }[] = [];
  let line: Line = [];

  let pos = 0;

  const pushToken = (from: number, to: number, classes: string) => {
    line.push({ from: pos + from, to: pos + to, classes });
  };
  const pushBreak = () => {
    let fold: FoldRange | null = null;
    if (line.length > 0) {
      const startLine = line.at(0)?.from ?? 0;
      let endLine = (line.at(-1)?.to ?? startLine) + 1;
      endLine = Math.min(endLine, code.length);
      fold = syntaxFolding(
        tree,
        code,
        editorState,
        foldNodeProp,
        startLine,
        endLine
      );
    }

    file.push({ line, n: file.length + 1, fold });
    line = [];
  };

  function writeTo(p: number, classes: string) {
    if (p <= pos) return;
    for (let text = code!.slice(pos, p), i = 0; ; ) {
      const nextBreak = text.indexOf('\n', i);
      const upto = nextBreak < 0 ? text.length : nextBreak;
      if (upto > i) pushToken(i, upto, classes);
      if (nextBreak < 0) break;
      pushBreak();
      i = nextBreak + 1;
    }
    pos = p;
  }

  highlightTree(
    tree,
    getOrCreateClassHighlighter(cm),
    (from, to, classes) => {
      writeTo(from, '');
      writeTo(to, classes);
    },
    0,
    code.length
  );
  writeTo(code.length, '');
  pushBreak();

  return { file, code };
}

export function getVisibleLines(
  data: ParsedFile,
  foldIdx: Set<number>
): ParsedFile['file'] {
  const ranges: FoldRange[] = [];

  for (const index of foldIdx) {
    const fold = data.file.at(index - 1)?.fold;
    if (!fold) continue;
    ranges.push({ from: fold.from, to: fold.to });
  }

  const visibleLines: ParsedFile['file'] = [];

  let pos = 0;
  data.file.forEach((item) => {
    const start = item.line.at(0)?.from ?? pos;
    const end = item.line.at(-1)?.to ?? start;

    const isRangeHit = ranges.some(
      (range) => start >= range.from && end <= range.to
    );

    if (!isRangeHit) visibleLines.push(item);
    pos = end + 1;
  });

  // Make sure that we don't hide everything
  if (visibleLines.length === 0 && data.file.length > 0) {
    visibleLines.push(data.file[0]);
  }

  return visibleLines;
}
