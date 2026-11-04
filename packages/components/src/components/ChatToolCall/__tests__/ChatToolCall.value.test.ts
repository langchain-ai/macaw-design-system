import { formatChatToolCallValue } from '../ChatToolCall.value';

describe('formatChatToolCallValue', () => {
  it('leaves text and unsafe markup as text', () => {
    const text = '<script>alert(1)</script> [Open](javascript:alert(1))';
    expect(formatChatToolCallValue(text)).toBe(text);
  });

  it.each([false, 0, null])(
    'preserves a meaningful falsy value: %s',
    (value) => {
      expect(formatChatToolCallValue(value)).toBe(JSON.stringify(value));
    }
  );

  it('handles cycles without losing readable siblings', () => {
    const value: Record<string, unknown> = { name: 'payload' };
    value.self = value;
    expect(formatChatToolCallValue(value)).toContain('"name": "payload"');
    expect(formatChatToolCallValue(value)).toContain('[Circular]');
  });

  it('does not mistake repeated references for cycles', () => {
    const child = { name: 'same' };
    expect(
      formatChatToolCallValue({ first: child, second: child })
    ).not.toContain('[Circular]');
  });

  it('does not evaluate getters or toJSON', () => {
    const getter = vi.fn(() => 'secret');
    const toJSON = vi.fn(() => 'replacement');
    const value = { toJSON };
    Object.defineProperty(value, 'secret', { get: getter, enumerable: true });
    const text = formatChatToolCallValue(value);
    expect(text).toContain('[Accessor omitted]');
    expect(text).toContain('[Function omitted]');
    expect(getter).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  it.each([
    new Error('Connection timed out'),
    new TypeError('Connection timed out'),
  ])('preserves an error message without exposing its stack: %s', (error) => {
    const text = formatChatToolCallValue(error);
    expect(text).toContain('"message": "Connection timed out"');
    expect(text).not.toContain('"stack"');
  });

  it('preserves an error name and enumerable context', () => {
    const error = Object.assign(new Error('Connection timed out'), {
      code: 'ETIMEDOUT',
    });
    Object.defineProperty(error, 'name', { value: 'TimeoutError' });
    const text = formatChatToolCallValue(error);
    expect(text).toContain('"name": "TimeoutError"');
    expect(text).toContain('"message": "Connection timed out"');
    expect(text).toContain('"code": "ETIMEDOUT"');
  });

  it('does not evaluate error getters or toJSON', () => {
    const getter = vi.fn(() => 'secret');
    const toJSON = vi.fn(() => 'replacement');
    const error = Object.assign(new Error(), { toJSON });
    for (const key of ['name', 'message']) {
      Object.defineProperty(error, key, { get: getter });
    }
    const text = formatChatToolCallValue(error);
    expect(text).toContain('"name": "[Accessor omitted]"');
    expect(text).toContain('"message": "[Accessor omitted]"');
    expect(text).toContain('[Function omitted]');
    expect(getter).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  it('bounds deep, wide, and long payload previews', () => {
    let deep: unknown = 'leaf';
    for (let index = 0; index < 20; index += 1) deep = { child: deep };
    expect(formatChatToolCallValue(deep)).toContain('[Preview truncated]');
    expect(
      formatChatToolCallValue(
        Array.from({ length: 1_000 }, (_, index) => index)
      )
    ).toContain('[Preview truncated]');
    const text = formatChatToolCallValue('x'.repeat(20_000));
    expect(text.length).toBeLessThanOrEqual(8_000);
    expect(text).toContain('[Preview truncated]');
    expect(formatChatToolCallValue({ text: 'x'.repeat(2_000) })).toContain(
      '[Preview truncated]'
    );
    expect(formatChatToolCallValue(new Error('x'.repeat(20_000)))).toContain(
      '[Preview truncated]'
    );
  });

  it('preserves array order and empty positions', () => {
    const value = [1, 2, 3];
    delete value[1];
    expect(formatChatToolCallValue(value)).toBe(
      '[\n  1,\n  "undefined",\n  3\n]'
    );
  });

  it('limits array visits even when every item exceeds the depth limit', () => {
    const inspect = vi.fn(Reflect.getOwnPropertyDescriptor);
    const wide = new Proxy(Array.from({ length: 10_000 }), {
      getOwnPropertyDescriptor: inspect,
    });
    let value: unknown = wide;
    for (let index = 0; index < 6; index += 1) value = { child: value };

    expect(formatChatToolCallValue(value)).toContain('[Preview truncated]');
    expect(inspect.mock.calls.length).toBeLessThan(300);
  });

  it('can preview bigint and unreadable objects without throwing', () => {
    expect(formatChatToolCallValue({ value: 12n })).toContain('12n');
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    expect(formatChatToolCallValue(proxy)).toBe('[Unable to display payload]');
  });
});
