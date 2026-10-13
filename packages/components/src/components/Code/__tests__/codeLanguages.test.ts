import { describe, expect, it } from 'vitest';

import { resolveCodeLanguage } from '../codeLanguages';

describe('resolveCodeLanguage', () => {
  it('normalizes Markdown language aliases and casing', () => {
    expect(resolveCodeLanguage(' PY ')).toBe('python');
    expect(resolveCodeLanguage('bash')).toBe('shell');
    expect(resolveCodeLanguage('yml')).toBe('yaml');
    expect(resolveCodeLanguage('js')).toBe('javascript');
    expect(resolveCodeLanguage('ts')).toBe('typescript');
  });

  it('distinguishes unlabelled code from unsupported languages', () => {
    expect(resolveCodeLanguage('')).toBe('plaintext');
    expect(resolveCodeLanguage('rust')).toBeUndefined();
    expect(resolveCodeLanguage('custom-language')).toBeUndefined();
  });
});
