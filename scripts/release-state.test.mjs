import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { mergedRelease, releaseState } from './release-state.mjs';

const repo = { full_name: 'langchain-ai/macaw-design-system' };
const pr = {
  merged_at: '2026-10-13T00:00:00Z',
  merge_commit_sha: 'merged',
  base: { ref: 'main', repo },
  head: { ref: 'release/v1.3.0', repo },
};
const files = [
  { filename: 'packages/components/package.json', status: 'modified' },
];

test('recognizes a merged coordinated release PR', () => {
  assert.equal(mergedRelease([pr], 'merged', '1.3.0', files), 'v1.3.0');
});

test('does not publish ordinary, unmerged, stale, foreign, or wrong-version PRs', () => {
  for (const candidate of [
    { ...pr, merged_at: null },
    { ...pr, merge_commit_sha: 'old' },
    { ...pr, base: { ...pr.base, ref: 'other' } },
    { ...pr, head: { ...pr.head, ref: 'feature/component' } },
    { ...pr, head: { ...pr.head, ref: 'release/v1.4.0' } },
    { ...pr, head: { ...pr.head, repo: { full_name: 'other/fork' } } },
  ])
    assert.equal(mergedRelease([candidate], 'merged', '1.3.0', files), null);
  assert.equal(mergedRelease([], 'merged', '1.3.0', files), null);
});

test('rejects release PRs with unexpected, added, deleted, or missing files', () => {
  for (const changes of [
    [],
    [{ filename: 'scripts/build-components.mjs', status: 'modified' }],
    [{ filename: 'packages/components/package.json', status: 'added' }],
    [{ filename: 'packages/components/package.json', status: 'removed' }],
  ])
    assert.throws(() => mergedRelease([pr], 'merged', '1.3.0', changes));
});

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'macaw-release-state-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Release test');
  git('config', 'user.email', 'release@example.invalid');
  const writeVersions = (version) => {
    for (const name of ['components', 'tokens', 'cli']) {
      const dir = join(cwd, 'packages', name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ version }));
    }
  };
  const commit = (message) => {
    git('add', '.');
    git('commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  writeVersions('1.2.0');
  const before = commit('Initial version');
  writeVersions('1.3.0');
  const merged = commit('Coordinated release');
  writeFileSync(join(cwd, 'component.txt'), 'Later component change');
  const sha = commit('Later main change');
  const candidate = { ...pr, number: 7, merge_commit_sha: merged };
  const state = ({
    prs = [candidate],
    changes = files,
    current = [],
    ...options
  } = {}) =>
    releaseState({
      repo: repo.full_name,
      sha,
      version: '1.3.0',
      git,
      api: (path) => {
        if (path.includes('/commits/')) return current;
        if (path.includes('/pulls?')) return prs;
        if (path.endsWith('/files?per_page=100')) return changes;
        if (path.endsWith('/pulls/7')) return { changed_files: changes.length };
        throw new Error(`Unexpected API path: ${path}`);
      },
      ...options,
    });
  return { git, before, merged, sha, candidate, state };
}

test('recovers a missed release at its ancestor commit, without publishing later changes', (t) => {
  const { state, merged, sha } = fixture(t);
  assert.notEqual(merged, sha);
  assert.deepEqual(state(), { tag: 'v1.3.0', targetSha: merged });
});

test('detects a release when commit-to-PR association is not yet available', (t) => {
  const { state, merged } = fixture(t);
  assert.deepEqual(state({ sha: merged }), {
    tag: 'v1.3.0',
    targetSha: merged,
  });
});

test('does not recover unmerged, foreign, wrong-version or non-ancestor releases', (t) => {
  const { state, git, before, candidate, merged } = fixture(t);
  const unrelated = git(
    'commit-tree',
    git('rev-parse', `${merged}^{tree}`),
    '-p',
    before,
    '-m',
    'Unrelated release'
  );
  for (const invalid of [
    { ...candidate, merged_at: null },
    {
      ...candidate,
      head: { ...candidate.head, repo: { full_name: 'other/fork' } },
    },
    { ...candidate, head: { ...candidate.head, ref: 'release/v1.4.0' } },
    { ...candidate, merge_commit_sha: unrelated },
  ])
    assert.equal(state({ prs: [invalid] }), null);
});

test('recovery applies the file allowlist and rejects an incomplete file list', (t) => {
  const { state, candidate } = fixture(t);
  assert.throws(
    () =>
      state({
        changes: [
          { filename: 'scripts/build-components.mjs', status: 'modified' },
        ],
      }),
    /only package versions and lockfile/
  );
  assert.throws(
    () =>
      state({
        api: (path) => {
          if (path.includes('/commits/')) return [];
          if (path.includes('/pulls?')) return [candidate];
          if (path.endsWith('/files?per_page=100')) return files;
          return { changed_files: 2 };
        },
      }),
    /file list is incomplete/
  );
});

test('checks coordinated versions at the release commit', (t) => {
  const { state, before, candidate } = fixture(t);
  assert.throws(
    () => state({ prs: [{ ...candidate, merge_commit_sha: before }] }),
    /Release commit package versions must match/
  );
});

test('skips a tagged ancestor but allows retrying its original release run', (t) => {
  const { state, git, merged, candidate } = fixture(t);
  git('tag', 'v1.3.0', merged);
  assert.equal(state(), null);
  assert.deepEqual(state({ sha: merged, current: [candidate] }), {
    tag: 'v1.3.0',
    targetSha: merged,
  });
});

test('rejects a tag pointing to another commit', (t) => {
  const { state, git, before, merged, candidate } = fixture(t);
  git('tag', 'v1.3.0', before);
  assert.throws(
    () => state({ sha: merged, current: [candidate] }),
    /already points to a different commit/
  );
});

test('allows preparing the first release PR from previously untagged versions', (t) => {
  const { state } = fixture(t);
  assert.equal(state({ prs: [] }), null);
});
