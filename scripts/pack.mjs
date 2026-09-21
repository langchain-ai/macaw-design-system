import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'macaw-pack-'));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.equal(
    result.status,
    0,
    result.stderr || result.stdout || result.error?.message
  );
  return result.stdout;
}

try {
  const consumer = join(temporary, 'consumer');
  const modules = join(consumer, 'node_modules');
  mkdirSync(join(modules, '@langchain'), { recursive: true });
  writeFileSync(join(consumer, 'package.json'), '{"type":"module"}\n');
  for (const name of ['tokens', 'components', 'cli']) {
    const source = join(root, 'packages', name);
    run('pnpm', ['--dir', source, 'pack', '--pack-destination', temporary]);
    const archive = readdirSync(temporary).find(
      (file) =>
        file.startsWith(`langchain-macaw-${name}-`) && file.endsWith('.tgz')
    );
    assert.ok(archive, `Missing ${name} tarball`);
    const unpacked = join(temporary, name);
    mkdirSync(unpacked);
    run('tar', ['-xzf', join(temporary, archive), '-C', unpacked]);
    symlinkSync(
      join(unpacked, 'package'),
      join(modules, '@langchain', `macaw-${name}`),
      'dir'
    );
    const manifest = JSON.parse(
      readFileSync(join(unpacked, 'package/package.json'), 'utf8')
    );
    assert.equal(manifest.name, `@langchain/macaw-${name}`);
    assert.ok(existsSync(join(unpacked, 'package/LICENSE')));
    assert.ok(
      !existsSync(join(unpacked, 'package/src')),
      'Source tooling must not be required by consumers'
    );
    if (name === 'components') {
      assert.equal(
        manifest.dependencies['@langchain/macaw-tokens'],
        manifest.version
      );
      // Link only declared runtime dependencies/peers from the existing installation.
      const packageModules = join(unpacked, 'package/node_modules');
      for (const dependency of Object.keys({
        ...manifest.dependencies,
        ...manifest.peerDependencies,
      })) {
        const destination = join(packageModules, dependency);
        const target =
          dependency === '@langchain/macaw-tokens'
            ? join(temporary, 'tokens/package')
            : join(source, 'node_modules', dependency);
        if (existsSync(target)) {
          mkdirSync(dirname(destination), { recursive: true });
          symlinkSync(target, destination, 'dir');
        }
      }
    }
  }
  const cli = join(temporary, 'cli/package/bin/macaw.mjs');
  const invoke = (...args) => run(process.execPath, [cli, ...args], consumer);
  const button = JSON.parse(invoke('inspect', 'Button', '--json'));
  assert.equal(button.importPath, '@langchain/macaw-components/Button');
  assert.ok(JSON.parse(invoke('search', 'loading', '--json')).length > 0);
  const catalog = JSON.parse(invoke('list', '--json'));
  const requireFromConsumer = createRequire(join(consumer, 'package.json'));
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { existsSync } from 'node:fs';
    import { fileURLToPath } from 'node:url';
    for (const specifier of ${JSON.stringify(catalog.map((entry) => entry.importPath))}) {
      if (!existsSync(fileURLToPath(import.meta.resolve(specifier)))) throw new Error(specifier);
    }
  `,
    ],
    consumer
  );
  assert.ok(
    catalog.every((entry) =>
      entry.sourceFiles.every((file) => file.startsWith('https://github.com/'))
    )
  );
  invoke('init', '--json');
  const skill = join(consumer, '.agents/skills/macaw/SKILL.md');
  const original = readFileSync(skill, 'utf8');
  assert.ok(
    original.includes('node_modules/@langchain/macaw-components/docs/DESIGN.md')
  );
  for (const [, link] of original.matchAll(/\]\(([^)]+\.md)\)/g))
    assert.ok(
      existsSync(resolve(dirname(skill), link)),
      `Broken guidance link: ${link}`
    );
  const repeat = spawnSync(process.execPath, [cli, 'init', '--json'], {
    cwd: consumer,
    encoding: 'utf8',
  });
  assert.equal(repeat.status, 1);
  assert.equal(JSON.parse(repeat.stderr).code, 'ERR_ALREADY_CONFIGURED');
  assert.equal(readFileSync(skill, 'utf8'), original);
  const missing = spawnSync(process.execPath, [cli, 'list', '--json'], {
    cwd: temporary,
    encoding: 'utf8',
  });
  assert.equal(missing.status, 1);
  assert.equal(JSON.parse(missing.stderr).code, 'ERR_PACKAGE_NOT_FOUND');
  // Exercise runtime imports and theme CSS from the unpacked packages.
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "await import('@langchain/macaw-components'); await import('@langchain/macaw-components/Code');",
    ],
    consumer
  );
  const tokens = JSON.parse(
    readFileSync(
      requireFromConsumer.resolve('@langchain/macaw-tokens/tokens.json'),
      'utf8'
    )
  );
  assert.ok(
    tokens.rules.some(
      (rule) => rule.selector === ':root' && rule.tokens['--bg-surface-level-1']
    )
  );
  assert.ok(tokens.rules.some((rule) => rule.selector.includes('html.dark')));
  writeFileSync(
    join(consumer, 'index.html'),
    '<script type="module" src="/entry.js"></script>'
  );
  writeFileSync(
    join(consumer, 'entry.js'),
    "import '@langchain/macaw-components/styles.css'; import { Button } from '@langchain/macaw-components/Button'; console.log(Button);"
  );
  writeFileSync(
    join(consumer, 'vite.config.mjs'),
    'export default { css: { postcss: { plugins: [] } }, build: { minify: false } };\n'
  );
  run(
    join(root, 'node_modules/.bin/vite'),
    ['build', '--config', join(consumer, 'vite.config.mjs')],
    consumer
  );
  const css = readdirSync(join(consumer, 'dist/assets'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(consumer, 'dist/assets', file), 'utf8'))
    .join('\n');
  assert.ok(
    css.includes('--bg-surface-level-1') && css.includes('html.dark'),
    'The consumer bundle must include both token themes'
  );
  console.log(
    `Verified all three tarballs, ${catalog.length} catalog imports, isolated CLI discovery/setup, runtime imports, and a consumer CSS build.`
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
