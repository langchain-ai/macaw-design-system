const MAX_DEPTH = 6;
const MAX_NODES = 200;
const MAX_STRING_LENGTH = 1_000;
const TRUNCATED = '[Preview truncated]';

type PreviewValue =
  | string
  | number
  | boolean
  | null
  | PreviewValue[]
  | { [key: string]: PreviewValue };

/** A bounded text preview of untrusted payloads, without invoking accessors or toJSON. */
export function formatChatToolCallValue(
  value: unknown,
  maxLength = 8_000
): string {
  const limit = Number.isFinite(maxLength)
    ? Math.max(TRUNCATED.length, Math.min(8_000, maxLength))
    : 8_000;
  const truncate = (text: string) =>
    text.length > limit
      ? `${text.slice(0, limit - TRUNCATED.length)}${TRUNCATED}`
      : text;

  if (typeof value === 'string') return truncate(value);

  let nodes = 0;
  let remainingCharacters = limit;
  const ancestors = new WeakSet<object>();

  const previewString = (text: string): string => {
    const length = Math.min(MAX_STRING_LENGTH, remainingCharacters);
    remainingCharacters -= Math.min(text.length, length);
    return text.length > length ? `${text.slice(0, length)}${TRUNCATED}` : text;
  };

  const visit = (current: unknown, depth: number): PreviewValue => {
    if (nodes >= MAX_NODES || remainingCharacters <= 0) {
      return TRUNCATED;
    }
    nodes += 1;
    if (depth > MAX_DEPTH) return TRUNCATED;
    if (current === null) return null;
    if (typeof current === 'string') return previewString(current);
    if (typeof current === 'boolean') return current;
    if (typeof current === 'number') {
      return Number.isFinite(current) ? current : String(current);
    }
    if (typeof current === 'bigint') return `${current}n`;
    if (typeof current === 'function') return '[Function omitted]';
    if (typeof current !== 'object') return String(current);
    if (ancestors.has(current)) return '[Circular]';
    ancestors.add(current);

    if (Array.isArray(current)) {
      const length: unknown = Object.getOwnPropertyDescriptor(
        current,
        'length'
      )?.value;
      if (typeof length !== 'number') return '[Unable to display array]';
      const items: PreviewValue[] = [];
      for (let index = 0; index < length; index += 1) {
        if (nodes >= MAX_NODES || remainingCharacters <= 0) {
          items.push(TRUNCATED);
          break;
        }
        const descriptor = Object.getOwnPropertyDescriptor(
          current,
          String(index)
        );
        const child: unknown = descriptor?.value;
        if (descriptor && !('value' in descriptor)) nodes += 1;
        items.push(
          descriptor === undefined
            ? visit(undefined, depth + 1)
            : 'value' in descriptor
              ? visit(child, depth + 1)
              : '[Accessor omitted]'
        );
      }
      ancestors.delete(current);
      return items;
    }

    const entries: [string, PreviewValue][] = [];
    // Error messages are nonenumerable; include them without reading accessors or stacks.
    if (current instanceof Error) {
      for (const key of ['name', 'message']) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor || descriptor.enumerable) continue;
        const child: unknown = descriptor.value;
        if (!('value' in descriptor)) nodes += 1;
        entries.push([
          previewString(key),
          'value' in descriptor
            ? visit(child, depth + 1)
            : '[Accessor omitted]',
        ]);
      }
    }
    let scannedKeys = 0;
    for (const key in current) {
      scannedKeys += 1;
      if (
        scannedKeys > MAX_NODES ||
        nodes >= MAX_NODES ||
        remainingCharacters <= 0
      ) {
        entries.push(['…', TRUNCATED]);
        break;
      }
      if (!Object.hasOwn(current, key)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      const child: unknown = descriptor?.value;
      if (descriptor && !('value' in descriptor)) nodes += 1;
      entries.push([
        previewString(key),
        descriptor && 'value' in descriptor
          ? visit(child, depth + 1)
          : '[Accessor omitted]',
      ]);
    }
    ancestors.delete(current);

    return Object.fromEntries(entries);
  };

  try {
    return truncate(
      JSON.stringify(visit(value, 0), null, 2) ?? '[Unable to display payload]'
    );
  } catch {
    return '[Unable to display payload]';
  }
}
