import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

const root = process.cwd();
const fixtures: string[] = [];

function stepScript(file: string, step: string) {
  return readFileSync(join(root, '.github/workflows', `${file}.yml`), 'utf8')
    .split(`      - name: ${step}\n`)[1]
    .split('        run: |\n')[1]
    .split('\n      - name:')[0]
    .replace(/^          /gm, '');
}

const versionScript = stepScript('release', 'Version workspace');
const buildScript = stepScript('build', 'Prepare release version');

function fixture(version = '3.2.0') {
  const cwd = mkdtempSync(join(tmpdir(), 'macaw-release-'));
  fixtures.push(cwd);
  function git(...args: string[]) {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    return result.stdout.trim();
  }
  mkdirSync(join(cwd, 'scripts'));
  for (const file of ['verify-release-tag.mjs', 'verify-license.mjs']) {
    copyFileSync(join(root, 'scripts', file), join(cwd, 'scripts', file));
  }
  for (const name of ['components', 'tokens', 'cli']) {
    const dir = join(cwd, 'packages', name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ version, license: 'MIT' })
    );
    writeFileSync(join(dir, 'LICENSE'), 'MIT');
  }
  mkdirSync(join(cwd, 'bin'));
  writeFileSync(
    join(cwd, 'bin/pnpm'),
    '#!/usr/bin/env bash\nset -euo pipefail\nprintf "%s\\n" "$@" > args\neval "$NX_TEST_ACTION"\n',
    { mode: 0o755 }
  );
  git('init', '-q');
  git('config', 'user.name', 'Release test');
  git('config', 'user.email', 'release@example.invalid');
  git('add', 'packages', 'scripts');
  git('commit', '-qm', 'initial');
  function run(action: string, releaseVersion = '', script = versionScript) {
    return spawnSync('bash', ['-c', script], {
      cwd,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${join(cwd, 'bin')}:${process.env.PATH}`,
        GITHUB_OUTPUT: join(cwd, 'output'),
        RELEASE_VERSION: releaseVersion,
        NX_TEST_ACTION: action,
        LC_ALL: 'C',
      },
    });
  }
  return {
    cwd,
    git,
    run,
    output: () => readFileSync(join(cwd, 'output'), 'utf8'),
  };
}

afterEach(() => {
  for (const cwd of fixtures.splice(0))
    rmSync(cwd, { recursive: true, force: true });
});

it('releases an Nx-created tag without a new commit or a hardcoded version', () => {
  const f = fixture();
  const before = f.git('rev-parse', 'HEAD');
  f.git('tag', 'existing-tag');
  const result = f.run('git tag -a v3.2.0 -m release', '3.2.0');
  expect(result.status, result.stderr).toBe(0);
  expect(f.git('rev-parse', 'HEAD')).toBe(before);
  expect(f.output()).toBe('released=true\ntag=v3.2.0\n');
});

it('ignores pre-existing tags when conventional commits produce no release', () => {
  const f = fixture();
  f.git('tag', 'v3.2.0');
  const result = f.run(':');
  expect(result.status, result.stderr).toBe(0);
  expect(f.output()).toBe('released=false\n');
});

it('releases a new conventional-commit version', () => {
  const f = fixture();
  f.git('tag', 'v3.2.0');
  const result = f.run(
    `for p in packages/*/package.json; do sed -i 's/3.2.0/3.2.1/' "$p"; done; git add packages; git commit -qm bump; git tag v3.2.1`
  );
  expect(result.status, result.stderr).toBe(0);
  expect(f.output()).toBe('released=true\ntag=v3.2.1\n');
});

it.each([
  [
    'git commit --allow-empty -qm unexpected',
    'expected exactly one release tag',
  ],
  ['git tag v3.2.0; git tag v3.2.1', 'expected exactly one release tag'],
  ['git tag unexpected', 'unexpected release tag'],
  ['git tag v3.2.0 HEAD~1', 'release tag does not point to the version commit'],
  ['git tag v3.2.1', 'does not match v3.2.0'],
  [
    'touch unexpected; git add unexpected; git commit -qm unexpected; git tag v3.2.0',
    'versioning changed files',
  ],
])('rejects unsafe versioning result: %s', (action, error) => {
  const f = fixture();
  f.git('commit', '--allow-empty', '-qm', 'next');
  const result = f.run(action);
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain(error);
});

it('requires an explicit first stable version instead of bumping from all historical commits', () => {
  const f = fixture();
  f.git('tag', 'v3.2.0-beta.1');
  const result = f.run('exit 99', '', buildScript);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('No stable release tag found');
});

it('fails rather than retagging an already released version', () => {
  const f = fixture();
  f.git('tag', 'v3.2.0');
  const result = f.run('git tag v3.2.0', '3.2.0');
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('already exists');
});

it.each(['', '3.2.0'])(
  'passes the same version argument to build and versioning: %s',
  (version) => {
    const build = fixture();
    build.git('tag', 'v3.2.0');
    const release = fixture();
    expect(build.run(':', version, buildScript).status).toBe(0);
    expect(release.run(':', version).status).toBe(0);
    const expected = [
      'nx',
      'release',
      'version',
      ...(version ? [version] : []),
    ];
    expect(
      readFileSync(join(release.cwd, 'args'), 'utf8').trim().split('\n')
    ).toEqual(expected);
    expect(
      readFileSync(join(build.cwd, 'args'), 'utf8').trim().split('\n')
    ).toEqual([
      ...expected,
      '--stage-changes=false',
      '--git-commit=false',
      '--git-tag=false',
      '--git-push=false',
    ]);
  }
);

it.each([
  '--git-push=true',
  'patch',
  'v3.2.0',
  '03.2.0',
  '3.2.0-beta.1',
  '$(touch injected)',
  '3.2.0\n4.0.0',
])('rejects invalid explicit release input: %s', (input) => {
  for (const script of [buildScript, versionScript]) {
    const f = fixture();
    const result = f.run('exit 99', input, script);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('release_version must be a stable version');
  }
});
