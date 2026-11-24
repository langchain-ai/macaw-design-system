import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { designFindings, newDesignFindings } from './design-rules.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(root, 'packages/components/src');
const tokens = new Set();
function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory())
      return ['__tests__', 'docs', 'stories', 'icons'].includes(entry.name)
        ? []
        : sources(path);
    return /\.(?:tsx?|css)$/.test(entry.name) &&
      !/\.(?:stories|test)\.tsx?$/.test(entry.name)
      ? [path]
      : [];
  });
}
const files = sources(sourceRoot);
for (const path of [
  ...files,
  resolve(root, 'packages/tokens/src/tokens.css'),
]) {
  for (const match of readFileSync(path, 'utf8').matchAll(
    /(--[\w-]+)["']?(?:\?|\])?\s*[:=]/g
  ))
    tokens.add(match[1]);
}
const current = files.flatMap((path) => {
  const source = readFileSync(path, 'utf8');
  const file = relative(root, path).replaceAll('\\', '/');
  return designFindings(file, source, tokens).map((finding) => ({
    ...finding,
    file,
    line: source.slice(0, finding.offset).split('\n').length,
  }));
});
const baseline = JSON.parse(
  readFileSync(resolve(root, 'scripts/design-baseline.json'), 'utf8')
);
const added = newDesignFindings(current, baseline);
for (const { file, line, rule, value } of added)
  console.error(`${file}:${line}: ${rule}: ${value}`);
if (added.length) {
  console.error(
    `${added.length} new design violations. Use semantic tokens and named scales; review exceptional component geometry explicitly.`
  );
  process.exitCode = 1;
} else {
  console.log('Design checks passed: no new literal/token violations.');
}
