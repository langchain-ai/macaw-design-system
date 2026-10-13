import { spawnSync } from 'node:child_process';
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
const directory = resolve(root, 'packages/components');
const dist = resolve(directory, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

function run(binary, args) {
  const result = spawnSync(resolve(root, 'node_modules/.bin', binary), args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('vite', ['build']);
run('tsc', ['-p', 'tsconfig.build.json']);
await import('./rewrite-declaration-specifiers.mjs');
run('tailwindcss', [
  '-c',
  'tailwind.config.cjs',
  '-i',
  'packages/components/src/styles/tailwind.css',
  '-o',
  'packages/components/dist/utilities.css',
  '--minify',
]);
for (const file of ['base.css', 'styles.css'])
  copyFileSync(resolve(directory, 'src/styles', file), resolve(dist, file));
copyFileSync(
  resolve(directory, 'src/components/ThinkingState/NOTICE'),
  resolve(dist, 'components/ThinkingState/NOTICE')
);
const { buildCatalog } =
  await import('../packages/components/src/cli-catalog.mts');
const { version } = JSON.parse(
  readFileSync(resolve(directory, 'package.json'), 'utf8')
);
const sourceURL = `https://github.com/langchain-ai/macaw-design-system/blob/v${version}/packages/components/`;
const components = buildCatalog(directory).map((component) => ({
  ...component,
  sourceFiles: component.sourceFiles.map((file) => `${sourceURL}${file}`),
  stories: component.stories.map((file) => `${sourceURL}${file}`),
}));
writeFileSync(
  resolve(dist, 'catalog.json'),
  `${JSON.stringify({ schemaVersion: 1, packageName: '@langchain/macaw-components', version, components }, null, 2)}\n`
);
