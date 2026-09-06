import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'design-system-package-'));
try {
  const [packed] = JSON.parse(
    execFileSync(
      'npm',
      [
        'pack',
        '--json',
        '--ignore-scripts',
        '--pack-destination',
        temporary,
        '--cache',
        join(temporary, 'cache'),
      ],
      { cwd: root, encoding: 'utf8' }
    )
  );
  const paths = packed.files.map(({ path }) => path);
  for (const required of [
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'README.md',
    'CHANGELOG.md',
    'dist/index.js',
    'dist/styles.css',
  ]) {
    assert.ok(paths.includes(required), `Tarball is missing ${required}`);
  }
  for (const path of paths) {
    assert.ok(
      /^(dist\/|docs\/|package\.json$|README\.md$|LICENSE$|THIRD_PARTY_NOTICES\.md$|CHANGELOG\.md$|tailwind\.preset\.)/.test(
        path
      ),
      `Unexpected tarball file: ${path}`
    );
    assert.ok(
      !/(?:__tests__|\.stories\.|\.test\.|test-utils|\/stories\/)/.test(path),
      `Development file in tarball: ${path}`
    );
  }
  execFileSync('tar', [
    '-xzf',
    join(temporary, packed.filename),
    '-C',
    temporary,
  ]);
  const consumer = join(temporary, 'package');
  const manifest = JSON.parse(
    readFileSync(join(consumer, 'package.json'), 'utf8')
  );
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  };
  // Only production dependencies and peers are visible from the extracted package.
  for (const name of Object.keys(dependencies)) {
    const destination = join(consumer, 'node_modules', name);
    mkdirSync(dirname(destination), { recursive: true });
    symlinkSync(resolve(root, 'node_modules', name), destination, 'dir');
  }
  const modules = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.js')) modules.push(path);
    }
  };
  walk(join(consumer, 'dist'));
  writeFileSync(
    join(consumer, 'smoke.mjs'),
    `import { pathToFileURL } from 'node:url';\nfor (const path of ${JSON.stringify(modules)}) await import(pathToFileURL(path));\n`
  );
  execFileSync(process.execPath, [join(consumer, 'smoke.mjs')], {
    cwd: consumer,
    stdio: 'inherit',
  });
  console.log(
    `Verified tarball: ${paths.length} files; ${modules.length} runtime modules imported with production dependencies and peers.`
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
