import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildFoundations } from '../packages/components/src/cli-foundations.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, 'packages/tokens');
const dist = resolve(directory, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const css = readFileSync(resolve(directory, 'src/tokens.css'), 'utf8');
copyFileSync(resolve(directory, 'src/tokens.css'), resolve(dist, 'tokens.css'));
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
const foundations = buildFoundations(resolve(root, 'packages/components'));
const sourceURL = `https://github.com/langchain-ai/macaw-design-system/blob/v${foundations.version}/packages/components/`;
const roles = {
  surfaces: {
    source: `${sourceURL}${foundations.topics.surfaces.source}`,
    entries: foundations.topics.surfaces.roles,
  },
  spacing: {
    source: `${sourceURL}${foundations.topics.spacing.source}`,
    relationships: foundations.topics.spacing.relationships,
  },
};
writeFileSync(
  resolve(dist, 'tokens.json'),
  `${JSON.stringify({ schemaVersion: 1, rules, roles }, null, 2)}\n`
);
