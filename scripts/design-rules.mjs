import { parseSync, Visitor } from 'oxc-parser';

const rawColor =
  /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3})(?![\da-f])|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\([^)]*\)/gi;
const rawHex4InStyle = /(?:\[|:\s*)(#[\da-f]{4})(?![\da-f])(?=[\];,\s]|$)/gi;
const primitive =
  /var\(--(?:neutral|brand|gray|viz(?:-[a-z]+)?)-\d+\)|(?<![\w-])(?:bg|text|border|ring|fill|stroke|outline|divide|from|via|to|shadow)-(?:neutral|brand|gray|slate|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/gi;
const spacing =
  /(?<![\w-])-?(?:m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy])-(?:\d+(?:\.\d+)?|\[(?:-?[\d.]+)(?:px|rem|em|%)\])/g;
const zIndex = /(?<![\w-])-?z-(?:\d+|\[-?\d+\])/g;
const tokenReference = /var\((--[\w-]+)\)/g;

export function designFindings(file, source, tokens = new Set()) {
  const findings = [];
  function check(value, offset) {
    for (const [rule, pattern] of [
      ['raw-color', rawColor],
      ['primitive-token', primitive],
      ['spacing-scale', spacing],
      ['z-index', zIndex],
    ]) {
      for (const match of value.matchAll(pattern)) {
        if (rule === 'spacing-scale' && match[0].endsWith('-0')) continue;
        if (rule === 'raw-color' && /^(?:rgb|hsl)a?\(var\(--/.test(match[0]))
          continue;
        findings.push({ rule, value: match[0], offset: offset + match.index });
      }
    }
    for (const match of value.matchAll(rawHex4InStyle)) {
      findings.push({
        rule: 'raw-color',
        value: match[1],
        offset: offset + match.index + match[0].indexOf(match[1]),
      });
    }
    if (tokens.size) {
      for (const match of value.matchAll(tokenReference)) {
        if (!tokens.has(match[1]) && !match[1].startsWith('--radix-')) {
          findings.push({
            rule: 'unknown-token',
            value: match[1],
            offset: offset + match.index,
          });
        }
      }
    }
  }
  if (file.endsWith('.css')) {
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, (value) =>
      ' '.repeat(value.length)
    );
    for (const match of withoutComments.matchAll(
      /(?:^|[;{}])\s*([\w-]+)\s*:\s*([^;{}]+)/g
    )) {
      if (!match[1].startsWith('--')) check(match[2], match.index);
    }
    return findings;
  }
  const parsed = parseSync(file, source);
  if (parsed.errors.some(({ severity }) => severity === 'Error')) {
    throw new Error(`Cannot check design rules: invalid source in ${file}`);
  }
  new Visitor({
    Literal(node) {
      if (typeof node.value === 'string') check(node.value, node.start);
    },
    TemplateElement(node) {
      check(node.value.raw, node.start);
    },
    Property(node) {
      const name =
        node.key.type === 'Identifier' ? node.key.name : node.key.value;
      if (
        name === 'zIndex' &&
        node.value.type === 'Literal' &&
        typeof node.value.value === 'number'
      ) {
        findings.push({
          rule: 'z-index',
          value: `zIndex: ${node.value.value}`,
          offset: node.start,
        });
      }
    },
  }).visit(parsed.program);
  return findings;
}

export function newDesignFindings(current, baseline) {
  const remaining = new Map(
    baseline.map(({ file, rule, value, count }) => [
      JSON.stringify([file, rule, value]),
      count,
    ])
  );
  return current.filter(({ file, rule, value }) => {
    const key = JSON.stringify([file, rule, value]);
    const count = remaining.get(key) ?? 0;
    if (count === 0) return true;
    remaining.set(key, count - 1);
    return false;
  });
}
