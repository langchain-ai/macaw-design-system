# Releasing Macaw

The three public packages use one version and a shared `v<version>` release tag:

- `@langchain/macaw-tokens`
- `@langchain/macaw-components`
- `@langchain/macaw-cli`

The repository root is private. Nx owns coordinated versioning and publication;
pnpm rewrites the components package's `workspace:*` token dependency to the
matching release version when packing or publishing.

## Automatic releases from main

Pushing to `main`, including merging a pull request, starts the Release workflow
in `.github/workflows/release.yml`:

1. Build and verify the committed package versions without predicting another bump.
2. In the `release` environment, use Nx conventional commits to prepare coordinated
   manifest and lockfile updates on `release/v<version>` and open a release PR.
   No release tag is pushed and no packages are published at this stage. An
   existing open PR for that version is left unchanged; merge or close it first.
3. Review and merge the release PR through the normal protected-branch process.
   The next main workflow verifies the merged PR's branch, repository, merge SHA,
   changed-file allowlist, and coordinated version, then tags that main commit.
   If that run is missed, a later main run recovers the untagged version by
   finding its merged release PR and verifying that its merge commit is an
   ancestor of the current commit. The tag still points to the release merge.
4. In the `npm` environment, check out the tag, build its committed package
   versions, verify the packages, and publish with Nx. Recovery never uses
   artifacts from a later main commit.
5. After publication succeeds, create the matching GitHub release.

Storybook builds and deploys to GitHub Pages in a parallel path. Branch pushes
outside `main` run CI without publishing packages.

Do not manually bump package versions for ordinary component changes or create a
GitHub release to trigger publication. Nx determines the version from the merged
commit history; publishing a GitHub release is now an output of the workflow.
The private root package version does not need to match the public packages.

The `release.version.git` settings in `nx.json` provide the local defaults.
The workflow overrides tag creation and the skip-CI commit message while preparing
release PRs. Nx does not push automatically. Use `--dry-run` locally.

The workflow uses npm's default distribution tag (`latest` unless configured
otherwise). A prerelease version or GitHub's prerelease checkbox does not
automatically select the npm `beta` tag.

## Repository and npm setup

Keep main's PR requirement and required environment reviews enabled. The workflow
needs permission to push release branches and tags, not a main-branch bypass.
Enable **Settings → Actions → General → Workflow permissions → Allow GitHub
Actions to create and approve pull requests** (the workflow never approves PRs).
Organization policy may need a maintainer to permit this setting.

PRs created with `GITHUB_TOKEN` do not trigger pull-request CI automatically.
A maintainer must close/reopen the generated PR to trigger checks before merging;
do not bypass required checks. If a release PR becomes stale, close it and delete
its release branch before rerunning preparation; the workflow never force-pushes.

Enable **Settings → Pages → Source: GitHub Actions**; do not add a suggested
Jekyll or Static HTML workflow. Pages artifacts are named by `github.run_attempt`
and deployment selects that exact name so reruns cannot pick an older artifact.
An old run using the previous workflow must be replaced by a new main run after
this change merges; rerunning an old workflow does not adopt the fix.

The npm organization must allow publication of all three package names. Configure
trusted publishing for each package using this repository's `release.yml`
workflow and the `npm` GitHub environment. A new package may need an owner-managed
initial publication before its trusted publisher can be configured in npm.

Do not publish the workspace root or use `npm publish` directly on a manifest
containing `workspace:*` dependencies; the configured Nx/pnpm publication flow
performs that conversion.

## Validate without publishing

```sh
pnpm release:version --dry-run
pnpm format:check
pnpm lint
pnpm check
pnpm pack:check
```

The version dry run previews the coordinated version, commit, and tag without
creating them. To validate the build preparation path specifically, use:

```sh
pnpm release:version --stage-changes=false --git-commit=false --git-tag=false --git-push=false --dry-run
```

`pack:check` creates temporary tarballs, tests them in an isolated consumer, and
removes them afterward. It does not publish anything. To check a release tag
against the current package manifests, run
`node scripts/verify-release-tag.mjs v<version>` with their shared version.
