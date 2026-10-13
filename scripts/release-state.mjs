import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Use the same SemVer implementation as the pinned Nx release toolchain.
const { valid, gt } = createRequire(import.meta.resolve('nx/package.json'))(
  'semver'
);
const packages = ['components', 'tokens', 'cli'];

function packageVersion(git, ref, name) {
  return JSON.parse(git('show', `${ref}:packages/${name}/package.json`))
    .version;
}

function coordinatedVersion(git, ref) {
  const versions = packages.map((name) => packageVersion(git, ref, name));
  if (
    !valid(versions[0]) ||
    versions.some((version) => version !== versions[0])
  )
    throw new Error(
      'All Macaw packages must have the same valid release version.'
    );
  return versions[0];
}

export function releaseState({ sha, mainSha, git, releaseExists }) {
  git('merge-base', '--is-ancestor', sha, mainSha);
  const version = coordinatedVersion(git, sha);
  if (coordinatedVersion(git, mainSha) !== version) return null;

  const tag = `v${version}`;
  const commits = git(
    'log',
    '--first-parent',
    '--format=%H',
    sha,
    '--',
    'packages/components/package.json'
  ).split('\n');
  let targetSha;
  for (const commit of commits) {
    if (packageVersion(git, commit, 'components') !== version) break;
    targetSha = commit;
  }
  if (!targetSha) throw new Error(`Cannot find the commit introducing ${tag}.`);
  if (coordinatedVersion(git, targetSha) !== version)
    throw new Error(
      'Release commit versions do not match the requested version.'
    );

  const tagCommit = git('tag', '--list', tag)
    ? git('rev-list', '-n', '1', `refs/tags/${tag}`)
    : null;
  if (tagCommit && tagCommit !== targetSha)
    throw new Error(`${tag} already points to a different commit.`);
  if (releaseExists(tag)) {
    if (!tagCommit)
      throw new Error(`Published release ${tag} has no local tag.`);
    return null;
  }
  return { tag, targetSha };
}

export async function verifyRegistryVersion(version, fetchMetadata = fetch) {
  if (!valid(version)) throw new Error('Invalid release version.');
  for (const name of packages) {
    const packageName = `@langchain/macaw-${name}`;
    const response = await fetchMetadata(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      { signal: AbortSignal.timeout(30_000) }
    );
    if (response.status === 404) continue;
    if (!response.ok)
      throw new Error(
        `Cannot verify ${packageName}: npm returned ${response.status}.`
      );
    const latest = (await response.json())['dist-tags']?.latest;
    if (latest && (!valid(latest) || gt(latest, version)))
      throw new Error(
        `Refusing to move ${packageName} latest from ${latest} to ${version}.`
      );
  }
}

export function publishedReleaseExists(repo, tag, run = execFileSync) {
  try {
    const release = JSON.parse(
      run(
        'gh',
        ['api', `repos/${repo}/releases/tags/${encodeURIComponent(tag)}`],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      )
    );
    return !release.draft && Boolean(release.published_at);
  } catch (error) {
    if (error.stdout) {
      const response = JSON.parse(error.stdout);
      if (String(response.status) === '404') return false;
    }
    throw error;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8' }).trim();
  if (process.argv[2] === '--check-registry') {
    await verifyRegistryVersion(coordinatedVersion(git, 'HEAD'));
  } else {
    const release = releaseState({
      sha: process.env.GITHUB_SHA,
      mainSha: git('rev-parse', 'origin/main'),
      git,
      releaseExists: (tag) =>
        publishedReleaseExists(process.env.GITHUB_REPOSITORY, tag),
    });
    if (release)
      execFileSync(
        process.execPath,
        ['scripts/verify-release-tag.mjs', release.tag],
        {
          stdio: 'inherit',
        }
      );
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `released=${Boolean(release)}\ntag=${release?.tag ?? ''}\ntarget_sha=${release?.targetSha ?? ''}\n`
    );
  }
}
