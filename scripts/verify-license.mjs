import { existsSync, readFileSync } from 'node:fs';

for (const name of ['components', 'tokens', 'cli']) {
  const licenseFile = new URL(`../packages/${name}/LICENSE`, import.meta.url);
  const packageJson = JSON.parse(
    readFileSync(
      new URL(`../packages/${name}/package.json`, import.meta.url),
      'utf8'
    )
  );
  const failures = [];

  if (
    typeof packageJson.license !== 'string' ||
    packageJson.license.trim() === '' ||
    packageJson.license.toUpperCase() === 'UNLICENSED'
  ) {
    failures.push(
      'Publishing is blocked until package.json names an approved license.'
    );
  }

  if (!existsSync(licenseFile)) {
    failures.push(
      'Publishing is blocked until the approved LICENSE file is present.'
    );
  } else if (readFileSync(licenseFile, 'utf8').trim() === '') {
    failures.push('Publishing is blocked because the LICENSE file is empty.');
  }

  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  }
}
