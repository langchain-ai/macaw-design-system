import { appendFileSync, readFileSync } from 'node:fs';

import './verify-license.mjs';
import { validateRelease } from './release-utils.mjs';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);
const { failures, distTag } = validateRelease({
  version,
  tag: process.argv[2],
  prerelease:
    process.argv[3] === 'true'
      ? true
      : process.argv[3] === 'false'
        ? false
        : undefined,
  changelog: readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8'),
});

if (failures.length > 0 || process.exitCode) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `dist-tag=${distTag}\n`);
} else {
  console.log(`Release ${version} will publish to ${distTag}.`);
}
