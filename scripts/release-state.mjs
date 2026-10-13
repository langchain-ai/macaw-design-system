import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function isReleasePR(pr, version) {
  return (
    pr.merged_at &&
    pr.base.ref === 'main' &&
    pr.head.ref === `release/v${version}` &&
    pr.head.repo?.full_name === pr.base.repo.full_name
  );
}

export function mergedRelease(prs, sha, version, files) {
  const tag = `v${version}`;
  const pr = prs.find(
    (pr) => pr.merge_commit_sha === sha && isReleasePR(pr, version)
  );
  if (!pr) return null;
  if (
    !files.length ||
    files.some(
      (file) =>
        file.status !== 'modified' ||
        !/^(pnpm-lock\.yaml|packages\/(components|tokens|cli)\/package\.json)$/.test(
          file.filename
        )
    )
  )
    throw new Error(
      'Release PR must change only package versions and lockfile.'
    );
  return tag;
}

export function releaseState({ repo, sha, version, api, git }) {
  const tag = `v${version}`;
  const tagCommit = git('tag', '--list', tag)
    ? git('rev-list', '-n', '1', `refs/tags/${tag}`)
    : null;
  const prs = api(`repos/${repo}/commits/${sha}/pulls?per_page=100`);
  let candidate = prs.find(
    (pr) => pr.merge_commit_sha === sha && isReleasePR(pr, version)
  );

  if (!candidate && !tagCommit) {
    const head = encodeURIComponent(`${repo.split('/')[0]}:release/${tag}`);
    const releases = api(
      `repos/${repo}/pulls?state=closed&base=main&head=${head}&sort=updated&direction=desc&per_page=100`
    );
    candidate = releases.find((pr) => {
      if (!isReleasePR(pr, version)) return false;
      try {
        git('merge-base', '--is-ancestor', pr.merge_commit_sha, sha);
        return true;
      } catch (error) {
        if (error.status === 1) return false;
        throw error;
      }
    });
  }
  if (!candidate) return null;

  const targetSha = candidate.merge_commit_sha;
  const files = api(
    `repos/${repo}/pulls/${candidate.number}/files?per_page=100`
  );
  if (files.length !== candidate.changed_files) {
    const details = api(`repos/${repo}/pulls/${candidate.number}`);
    if (files.length !== details.changed_files)
      throw new Error('Release PR file list is incomplete.');
  }
  mergedRelease([candidate], targetSha, version, files);
  for (const name of ['components', 'tokens', 'cli']) {
    const manifest = JSON.parse(
      git('show', `${targetSha}:packages/${name}/package.json`)
    );
    if (manifest.version !== version)
      throw new Error(`Release commit package versions must match ${tag}.`);
  }
  if (tagCommit && tagCommit !== targetSha)
    throw new Error(`${tag} already points to a different commit.`);
  return { tag, targetSha };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const version = JSON.parse(
    readFileSync('packages/components/package.json', 'utf8')
  ).version;
  const release = releaseState({
    repo: process.env.GITHUB_REPOSITORY,
    sha: process.env.GITHUB_SHA,
    version,
    api: (path) => {
      const pages = JSON.parse(
        execFileSync('gh', ['api', '--paginate', '--slurp', path], {
          encoding: 'utf8',
        })
      );
      return Array.isArray(pages[0]) ? pages.flat() : pages[0];
    },
    git: (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim(),
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
