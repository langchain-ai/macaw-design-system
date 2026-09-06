import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const snapshot = JSON.parse(
  readFileSync(new URL('../docs/upstream.json', import.meta.url), 'utf8')
);
const checkout = process.argv[2];
const ref = process.argv[3] ?? 'origin/main';
if (!checkout) {
  console.error('Usage: pnpm verify:upstream /path/to/langchainplus [ref]');
  process.exitCode = 1;
} else {
  const git = (...args) =>
    execFileSync('git', ['-C', resolve(checkout), ...args], {
      encoding: 'utf8',
    }).trim();
  const revision = git(
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${ref}^{commit}`
  );
  const changes = git(
    'diff',
    '--name-status',
    snapshot.revision,
    revision,
    '--',
    ...snapshot.paths
  );
  if (changes) {
    console.error(
      `Upstream changes since ${snapshot.revision}:\n${changes}\nReview and port shared changes before updating docs/upstream.json.`
    );
    process.exitCode = 1;
  } else {
    console.log(
      `No upstream changes since the reviewed snapshot (${snapshot.revision}).`
    );
  }
}
