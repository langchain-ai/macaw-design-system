import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function mergedRelease(prs, sha, version, files) {
  const tag = `v${version}`;
  const pr = prs.find(
    (pr) =>
      pr.merged_at &&
      pr.merge_commit_sha === sha &&
      pr.base.ref === 'main' &&
      pr.head.ref === `release/${tag}` &&
      pr.head.repo?.full_name === pr.base.repo.full_name
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  const api = (path) =>
    JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));
  const prs = api(`repos/${repo}/commits/${sha}/pulls?per_page=100`);
  const version = JSON.parse(
    readFileSync('packages/components/package.json', 'utf8')
  ).version;
  const candidate = prs.find(
    (pr) =>
      pr.merged_at &&
      pr.merge_commit_sha === sha &&
      pr.head.ref === `release/v${version}`
  );
  const files = candidate
    ? api(`repos/${repo}/pulls/${candidate.number}/files?per_page=100`)
    : [];
  if (candidate && files.length !== candidate.changed_files) {
    const details = api(`repos/${repo}/pulls/${candidate.number}`);
    if (files.length !== details.changed_files)
      throw new Error('Release PR file list is incomplete.');
  }
  const tag = mergedRelease(prs, sha, version, files);
  if (tag)
    execFileSync('node', ['scripts/verify-release-tag.mjs', tag], {
      stdio: 'inherit',
    });
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `released=${Boolean(tag)}\ntag=${tag ?? ''}\n`
  );
}
