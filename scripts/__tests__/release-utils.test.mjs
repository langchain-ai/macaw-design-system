import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateRelease } from '../release-utils.mjs';

const release = (version, overrides = {}) =>
  validateRelease({
    version,
    tag: `v${version}`,
    prerelease: version.includes('-'),
    changelog: `# Changelog\n\n## ${version} - 2026-09-06\n\n- Changes\n`,
    ...overrides,
  });

test('stable and prerelease versions select different npm tags', () => {
  assert.deepEqual(release('0.1.0'), { failures: [], distTag: 'latest' });
  assert.deepEqual(release('1.0.0-beta.1'), { failures: [], distTag: 'next' });
});

test('rejects invalid versions and npm-normalized build metadata', () => {
  for (const version of [
    '01.0.0',
    '1.0',
    'v1.0.0',
    '1.0.0-01',
    '1.0.0+build',
    '1.0.0\n',
  ]) {
    assert.ok(release(version).failures.length > 0, version);
  }
});

test('rejects mismatched tags, prerelease status, and missing release notes', () => {
  for (const overrides of [
    { tag: 'v0.2.0' },
    { tag: '0.1.0' },
    { prerelease: true },
    { prerelease: undefined },
    { changelog: '## Unreleased' },
  ]) {
    assert.ok(release('0.1.0', overrides).failures.length > 0);
  }
  assert.ok(release('1.0.0-rc.1', { prerelease: false }).failures.length > 0);
  assert.ok(
    release('0.1.0', { changelog: '## 0x1x0 - 2026-09-06' }).failures.length > 0
  );
});
