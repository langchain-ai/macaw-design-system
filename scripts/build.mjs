import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const name = process.argv[2];
if (!['components', 'tokens', 'cli'].includes(name))
  throw new Error('Expected components, tokens, or cli.');
const directory = resolve(root, 'packages', name);
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

if (name === 'tokens') {
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
} else if (name === 'components') {
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
} else {
  const { transpileModule, ModuleKind, ScriptTarget } =
    await import('typescript');
  for (const file of readdirSync(resolve(directory, 'src')).filter((file) =>
    file.endsWith('.mts')
  )) {
    const source = readFileSync(resolve(directory, 'src', file), 'utf8');
    const output = transpileModule(source, {
      compilerOptions: {
        module: ModuleKind.NodeNext,
        target: ScriptTarget.ES2022,
        rewriteRelativeImportExtensions: true,
      },
      fileName: file,
    });
    writeFileSync(
      resolve(dist, file.replace(/\.mts$/, '.mjs')),
      output.outputText
    );
  }
  chmodSync(resolve(dist, 'cli.mjs'), 0o755);
}
