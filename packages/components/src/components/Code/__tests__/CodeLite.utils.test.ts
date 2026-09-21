import { describe, expect, it } from 'vitest';

import { loadCodeMirror } from '../../../utils/lazy-codemirror-loader';
import {
  EMPTY_FILE,
  type ParsedFile,
  convertFile,
  getVisibleLines,
  parseFile,
} from '../CodeLite.utils';

const createExpectLine = () => {
  let lastTo = -1;
  return (
    tokens: [string, string | ReturnType<typeof expect.stringContaining>][]
  ) => {
    lastTo += 1;
    return tokens.reduce(
      (acc, [text, classes]) => {
        acc.push({ from: lastTo, to: lastTo + text.length, classes });
        lastTo += text.length;
        return acc;
      },
      [] as { from: number; to: number; classes: string }[]
    );
  };
};

describe('convertFile', () => {
  it('returns EMPTY_FILE for undefined', () => {
    expect(convertFile(undefined)).toBe(EMPTY_FILE);
  });

  it('returns EMPTY_FILE for empty string', () => {
    expect(convertFile('')).toBe(EMPTY_FILE);
  });

  it('splits single-line code', () => {
    const result = convertFile('hello');
    expect(result.code).toBe('hello');
    expect(result.file).toHaveLength(1);
    expect(result.file[0]).toEqual({
      line: [{ from: 0, to: 5, classes: '' }],
      n: 1,
      fold: null,
    });
  });

  it('splits multi-line code with correct offsets', () => {
    const result = convertFile('ab\ncd\nef');
    expect(result.file).toHaveLength(3);
    expect(result.file.map((l) => l.n)).toEqual([1, 2, 3]);
    expect(result.file[1].line[0]).toEqual({ from: 3, to: 5, classes: '' });
  });
});

describe('getVisibleLines', () => {
  const makeParsed = (): ParsedFile => ({
    code: 'line1\nline2\nline3\nline4',
    file: [
      {
        line: [{ from: 0, to: 5, classes: '' }],
        n: 1,
        fold: { from: 6, to: 17 },
      },
      { line: [{ from: 6, to: 11, classes: '' }], n: 2, fold: null },
      { line: [{ from: 12, to: 17, classes: '' }], n: 3, fold: null },
      { line: [{ from: 18, to: 23, classes: '' }], n: 4, fold: null },
    ],
  });

  it('returns all lines when no folds active', () => {
    const data = makeParsed();
    expect(getVisibleLines(data, new Set())).toHaveLength(4);
  });

  it('hides lines within a fold range', () => {
    const data = makeParsed();
    const visible = getVisibleLines(data, new Set([1]));
    const visibleNs = visible.map((l) => l.n);
    expect(visibleNs).toContain(1);
    expect(visibleNs).toContain(4);
    expect(visibleNs).not.toContain(2);
    expect(visibleNs).not.toContain(3);
  });

  it('never returns empty when file has lines', () => {
    const data: ParsedFile = {
      code: 'x',
      file: [
        {
          line: [{ from: 0, to: 1, classes: '' }],
          n: 1,
          fold: { from: 0, to: 1 },
        },
      ],
    };
    const visible = getVisibleLines(data, new Set([1]));
    expect(visible.length).toBeGreaterThanOrEqual(1);
  });
});

describe('parseFile', async () => {
  const cm = await loadCodeMirror();
  it('returns EMPTY_FILE for undefined', async () => {
    expect(await parseFile(cm, 'python', undefined)).toBe(EMPTY_FILE);
  });

  it('produces one file entry per line', async () => {
    const result = await parseFile(cm, 'python', 'hello = 1\nworld = 2');
    const line = createExpectLine();

    expect(result.file).toMatchObject([
      {
        n: 1,
        line: line([
          ['hello', expect.stringContaining('text')],
          [' ', ''],
          ['=', expect.stringContaining('text')],
          [' ', ''],
          ['1', expect.stringContaining('text')],
        ]),
      },
      {
        n: 2,
        line: line([
          ['world', expect.stringContaining('text')],
          [' ', ''],
          ['=', expect.stringContaining('text')],
          [' ', ''],
          ['2', expect.stringContaining('text')],
        ]),
      },
    ]);
  });
});
