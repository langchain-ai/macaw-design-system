import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { mergedRelease } from './release-state.mjs';

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

test('workflow builds committed versions and deploys only current Pages attempt', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  assert.ok(!workflow.includes('prepare_release: true'));
  assert.ok(!workflow.includes('HEAD:main'));
  assert.ok(workflow.includes('name: github-pages-${{ github.run_attempt }}'));
  assert.ok(
    workflow.includes('artifact_name: github-pages-${{ github.run_attempt }}')
  );
  assert.ok(workflow.includes("if: needs.version.outputs.released == 'true'"));
  assert.ok(
    workflow.includes('released: ${{ steps.merged.outputs.released }}')
  );
  assert.ok(workflow.includes('--git-tag=false'));
});
