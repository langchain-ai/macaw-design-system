import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  publishedReleaseExists,
  releaseState,
  verifyRegistryVersion,
} from './release-state.mjs';

const packages = ['components', 'tokens', 'cli'];

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'macaw-release-state-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git('init', '-q', '--initial-branch=main');
  git('config', 'user.name', 'Release test');
  git('config', 'user.email', 'release@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', '/dev/null');
  const writeManifest = (name, version, extra = {}) => {
    const dir = join(cwd, 'packages', name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ version, ...extra })
    );
  };
  const commit = (message) => {
    git('add', '.');
    git('commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  for (const name of packages) writeManifest(name, '1.2.0');
  const before = commit('Initial version');
  git('switch', '-qc', 'feature');
  for (const name of packages) writeManifest(name, '1.3.0');
  const feature = commit('Feature and coordinated version bump');
  git('switch', '-q', 'main');
  writeFileSync(join(cwd, 'main.txt'), 'Independent main change');
  commit('Advance main');
  git('merge', '--no-ff', 'feature', '-qm', 'Merge feature');
  const merged = git('rev-parse', 'HEAD');
  writeFileSync(join(cwd, 'component.txt'), 'Later component change');
  commit('Later source change');
  writeManifest('components', '1.3.0', { description: 'Updated description' });
  const sha = commit('Later manifest change without a bump');
  const state = (options = {}) =>
    releaseState({
      sha,
      mainSha: sha,
      git,
      releaseExists: () => false,
      ...options,
    });
  return { git, writeManifest, commit, before, feature, merged, sha, state };
}

test('recovers the first-parent release merge after later source and manifest changes', (t) => {
  const { state, merged, feature, sha } = fixture(t);
  assert.notEqual(merged, feature);
  assert.notEqual(merged, sha);
  for (const trigger of [merged, sha])
    assert.deepEqual(state({ sha: trigger }), {
      tag: 'v1.3.0',
      targetSha: merged,
    });
});

test('retries an incomplete tagged release and skips a completed release', (t) => {
  const { state, git, merged } = fixture(t);
  git('tag', 'v1.3.0', merged);
  assert.deepEqual(state(), { tag: 'v1.3.0', targetSha: merged });
  assert.equal(state({ releaseExists: () => true }), null);
});

test('rejects conflicting tags and completed releases without a tag', (t) => {
  const { state, git, before } = fixture(t);
  assert.throws(() => state({ releaseExists: () => true }), /has no local tag/);
  git('tag', 'v1.3.0', before);
  assert.throws(() => state(), /already points to a different commit/);
});

test('rejects uncoordinated trigger versions', (t) => {
  const { state, writeManifest, commit } = fixture(t);
  writeManifest('tokens', '1.4.0');
  const sha = commit('Mismatched versions');
  assert.throws(
    () => state({ sha, mainSha: sha }),
    /same valid release version/
  );
});

test('rejects an uncoordinated release source even after later manifests are repaired', (t) => {
  const { state, writeManifest, commit } = fixture(t);
  for (const name of ['components', 'cli']) writeManifest(name, '1.4.0');
  commit('Incomplete coordinated bump');
  writeManifest('tokens', '1.4.0');
  const sha = commit('Repair remaining package version');
  assert.throws(
    () => state({ sha, mainSha: sha }),
    /same valid release version/
  );
});

test('skips an obsolete run after main advances to a new version', (t) => {
  const { state, writeManifest, commit } = fixture(t);
  for (const name of packages) writeManifest(name, '1.4.0');
  const mainSha = commit('Next release');
  assert.equal(state({ mainSha }), null);
});

test('rejects a commit outside main ancestry', (t) => {
  const { state, git, before, writeManifest, commit } = fixture(t);
  git('switch', '-qc', 'unmerged', before);
  for (const name of packages) writeManifest(name, '1.4.0');
  const sha = commit('Unmerged release');
  assert.throws(() => state({ sha }), { status: 1 });
});

test('propagates release API failures instead of treating them as an unpublished version', (t) => {
  const { state } = fixture(t);
  const failure = new Error('GitHub unavailable');
  assert.throws(
    () =>
      state({
        releaseExists: () => {
          throw failure;
        },
      }),
    (error) => error === failure
  );
});

test('recognizes published releases, drafts, and GitHub numeric or string 404 responses', () => {
  const exists = (run) => publishedReleaseExists('owner/repo', 'v1.3.0', run);
  for (const status of [404, '404'])
    assert.equal(
      exists(() => {
        throw Object.assign(new Error('Not found'), {
          stdout: JSON.stringify({ status }),
        });
      }),
      false
    );
  for (const [release, expected] of [
    [{ draft: true, published_at: '2026-10-13T00:00:00Z' }, false],
    [{ draft: false, published_at: null }, false],
    [{ draft: false, published_at: '2026-10-13T00:00:00Z' }, true],
  ])
    assert.equal(
      exists(() => JSON.stringify(release)),
      expected
    );
});

test('propagates non-404 and malformed GitHub API responses', () => {
  for (const status of [401, 403, 500]) {
    const failure = Object.assign(new Error('GitHub unavailable'), {
      stdout: JSON.stringify({ status }),
    });
    assert.throws(
      () =>
        publishedReleaseExists('owner/repo', 'v1.3.0', () => {
          throw failure;
        }),
      (error) => error === failure
    );
  }
  assert.throws(
    () => publishedReleaseExists('owner/repo', 'v1.3.0', () => 'invalid JSON'),
    SyntaxError
  );
});

function metadata(latest, status = 200) {
  return new Response(JSON.stringify({ 'dist-tags': { latest } }), { status });
}

test('allows new, already published, and missing packages without rolling back latest', async () => {
  for (const latest of ['1.2.0', '1.3.0-beta.1', '1.3.0', undefined])
    await verifyRegistryVersion('1.3.0', async () => metadata(latest));
  await verifyRegistryVersion('1.3.0', async () => metadata(undefined, 404));
});

test('rejects a newer latest version on any public package', async () => {
  for (const name of packages)
    await assert.rejects(
      verifyRegistryVersion('1.3.0', async (url) =>
        metadata(
          decodeURIComponent(url).endsWith(`macaw-${name}`) ? '1.4.0' : '1.3.0'
        )
      ),
      new RegExp(`Refusing to move @langchain/macaw-${name} latest`)
    );
});

test('rejects invalid release and registry versions', async () => {
  await assert.rejects(
    verifyRegistryVersion('invalid', async () => metadata('1.2.0')),
    /Invalid release version/
  );
  await assert.rejects(
    verifyRegistryVersion('1.3.0', async () => metadata('invalid')),
    /Refusing to move/
  );
});

test('propagates npm HTTP, network, and malformed-response failures', async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(
      verifyRegistryVersion('1.3.0', async () => metadata(undefined, status)),
      new RegExp(`npm returned ${status}`)
    );
  const failure = new Error('Network unavailable');
  await assert.rejects(
    verifyRegistryVersion('1.3.0', async () => {
      throw failure;
    }),
    (error) => error === failure
  );
  await assert.rejects(
    verifyRegistryVersion('1.3.0', async () => new Response('invalid JSON')),
    SyntaxError
  );
});
