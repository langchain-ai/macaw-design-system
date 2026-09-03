import { describe, expect, it } from 'vitest';

import { prettifyErrorPayload } from '../prettify-error-payload';

const stripWs = (s: string) => s.replace(/\s/g, '');

describe('prettifyErrorPayload', () => {
  it('leaves plain prose unchanged', () => {
    const input = 'Too many requests. Please try again later.';
    expect(prettifyErrorPayload(input)).toBe(input);
  });

  it('leaves prose with casual parentheses inline', () => {
    const input = 'Request failed (status 500) after 3 retries';
    expect(prettifyErrorPayload(input)).toBe(input);
  });

  it('returns empty string unchanged', () => {
    expect(prettifyErrorPayload('')).toBe('');
  });

  it('keeps flat lists without structural signals inline', () => {
    const input = '[1, 2, 3]';
    expect(prettifyErrorPayload(input)).toBe(input);
  });

  it('expands a JSON object onto indented lines', () => {
    const input = '{"name":"message_user","args":{"questions":["hi"]}}';
    const out = prettifyErrorPayload(input);
    expect(out).toContain('\n');
    expect(out).toContain('  "name":"message_user"');
    // No non-whitespace character is added or dropped.
    expect(stripWs(out)).toBe(stripWs(input));
  });

  it('expands a nested Python repr (GraphInterrupt) readably', () => {
    const input =
      "GraphInterrupt((Interrupt(value={'action_requests': [{'name': 'message_user', 'args': {'questions': ['Which usernames?'], 'suggested_answers': [[]]}}], 'review_configs': [{'action_name': 'message_user', 'allowed_decisions': ['respond']}]}, id='abc123'),))";
    const out = prettifyErrorPayload(input);

    // Reformatted across multiple lines and indented.
    expect(out.split('\n').length).toBeGreaterThan(5);
    expect(out.startsWith('GraphInterrupt(')).toBe(true);
    // Every original non-whitespace character survives, none invented.
    expect(stripWs(out)).toBe(stripWs(input));
  });

  it('decodes escape sequences inside string literals', () => {
    // Raw error string with escaped newlines and quotes (as it arrives at runtime).
    const input = String.raw`{'msg': '{\n  "code": 429\n}', 'q': '\'hi\''}`;
    const out = prettifyErrorPayload(input);
    expect(out).toContain('\n  "code": 429'); // \n -> real newline
    // An escaped quote matching its own literal's delimiter (\' inside a
    // '...' literal) is left escaped rather than decoded: decoding it would
    // sit flush against the re-added outer delimiter quote and read as a
    // doubled quote (''hi'' instead of the correct \'hi\').
    expect(out).toContain(String.raw`'q': '\'hi\''`);
    expect(out).not.toContain("''hi''");
  });

  it('does not mistake a structured dict with escaped newlines for a traceback', () => {
    // Same shape of escaping as a fully pre-escaped traceback (no real
    // newlines, 2+ literal \n sequences), but it's a plain structured dict —
    // must still go through per-literal decode + bracket-expansion, not the
    // traceback fast path.
    const input = String.raw`{'msg': '{\n  "code": 429\n}', 'q': '\'hi\''}`;
    expect(input.includes('\n')).toBe(false);
    const out = prettifyErrorPayload(input);
    // Bracket-expansion ran (dict keys land on their own indented lines).
    expect(out).toContain("\n  'msg'");
    expect(out).toContain("\n  'q'");
    expect(out).not.toContain("''hi''");
  });

  it('decodes multi-level escaping for structured string bodies', () => {
    const input = String.raw`{'msg': '{\\n  \"code\": 429\\n}'}`;
    const out = prettifyErrorPayload(input);
    expect(out).toContain('\n  "code": 429');
    expect(out).not.toContain(String.raw`\\n`);
  });

  it('does not over-decode literal backslashes in plain string bodies', () => {
    const input = "{'path': 'C:\\\\temp'}";
    const out = prettifyErrorPayload(input);
    expect(out).toContain(String.raw`C:\temp`);
    expect(out).not.toContain('C:\temp');
  });

  it('does not break on an unterminated string literal', () => {
    const input = "{'key': 'unterminated value";
    const out = prettifyErrorPayload(input);
    expect(stripWs(out)).toBe(stripWs(input));
  });

  it('skips formatting for inputs over the size guard', () => {
    const huge = '{' + "'a':1,".repeat(20_000) + '}';
    expect(huge.length).toBeGreaterThan(50_000);
    expect(prettifyErrorPayload(huge)).toBe(huge);
  });

  it('decodes a fully pre-escaped traceback with no real newlines', () => {
    // As it arrives at runtime: the whole payload was serialized upstream
    // (e.g. repr()/json.dumps()) and never unescaped, so `\n`/`\"` are
    // literal 2-char sequences throughout, not just inside a nested literal.
    const input = String.raw`CancelledError(UserInterrupt('User interrupted the run'))Traceback (most recent call last):\n  File \"/app/run.py\", line 10, in run\n    raise CancelledError()\nasyncio.exceptions.CancelledError: User interrupted the run`;
    expect(input.includes('\n')).toBe(false);

    const out = prettifyErrorPayload(input);
    expect(out).toContain('\n  File "/app/run.py", line 10, in run');
    expect(out).toContain(
      "CancelledError(UserInterrupt('User interrupted the run'))Traceback"
    );
    // Every original non-whitespace character survives, none invented.
    expect(stripWs(out)).toBe(
      stripWs(input.replace(/\\n/g, '\n').replace(/\\"/g, '"'))
    );
  });

  it('leaves an already-decoded multi-line traceback untouched by the escape pass', () => {
    const input =
      'Traceback (most recent call last):\n  File "/app/run.py", line 10, in run\n    raise ValueError()\nValueError';
    expect(prettifyErrorPayload(input)).toBe(input);
  });
});
