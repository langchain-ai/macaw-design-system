import { readFileSync } from 'node:fs';

import './verify-license.mjs';

const tag = process.argv[2];
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);
const expectedTag = `v${packageJson.version}`;
const semver =
  '(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)' +
  '(?:-(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*))*)?' +
  '(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?';
const versionPattern = new RegExp(`^${semver}$`);
const tagPattern = new RegExp(`^v${semver}$`);
const failures = [];

if (!versionPattern.test(packageJson.version)) {
  failures.push(
    `package.json version ${packageJson.version} is not valid SemVer.`
  );
}

if (!tagPattern.test(tag ?? '')) {
  failures.push(`Release tag ${tag ?? '<missing>'} must be v-prefixed SemVer.`);
} else if (tag !== expectedTag) {
  failures.push(`Release tag ${tag} does not match ${expectedTag}.`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
