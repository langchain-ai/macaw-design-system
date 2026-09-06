// npm versions intentionally exclude SemVer build metadata, which npm strips.
const identifier = '(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)';
const versionPattern = new RegExp(
  `^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-(${identifier}(?:\\.${identifier})*))?$`
);

export function validateRelease({ version, tag, prerelease, changelog }) {
  const failures = [];
  const match = typeof version === 'string' && version.match(versionPattern);
  if (!match || match[0] !== version)
    failures.push('Package version must be npm-compatible SemVer.');
  if (tag !== `v${version}`)
    failures.push(
      'Release tag must match the package version with a v prefix.'
    );
  const isPrerelease = Boolean(match?.[4]);
  if (typeof prerelease !== 'boolean' || prerelease !== isPrerelease) {
    failures.push('GitHub prerelease status must match the package version.');
  }
  const escapedVersion = String(version).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = new RegExp(
    `^## ${escapedVersion} - \\d{4}-\\d{2}-\\d{2}\\r?$`,
    'm'
  );
  if (!heading.test(changelog ?? ''))
    failures.push('Add a dated changelog section for this version.');
  return { failures, distTag: isPrerelease ? 'next' : 'latest' };
}
