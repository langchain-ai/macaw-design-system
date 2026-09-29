import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, 'packages/tokens');
const dist = resolve(directory, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const css = readFileSync(resolve(directory, 'src/tokens.css'), 'utf8');
copyFileSync(
  resolve(directory, 'src/tokens.css'),
  resolve(dist, 'tokens.css')
);
// Preserve selectors and var() references: JSON is a reference, not resolved colors.
const rules = [
  ...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g),
].map(([, selector, body]) => ({
  selector: selector.trim(),
  tokens: Object.fromEntries(
    [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [
      key,
      value.trim(),
    ])
  ),
}));
writeFileSync(
  resolve(dist, 'tokens.json'),
  `${JSON.stringify({ schemaVersion: 1, rules }, null, 2)}\n`
);
