# Releasing Macaw

The three public packages use one version and a shared `v<version>` release tag:

- `@langchain/macaw-tokens`
- `@langchain/macaw-components`
- `@langchain/macaw-cli`

The repository root is private. Nx owns coordinated versioning and publication;
pnpm rewrites the components package's `workspace:*` token dependency to the
matching release version when packing or publishing.

## Include the version bump in your PR

For a change that should publish a new release, use Nx on your feature branch to
update all three public package versions and the lockfile together. Choose the
next version explicitly; for example:

```sh
pnpm release:version 1.3.0 --stage-changes=false --git-commit=false --git-tag=false --git-push=false
```

Include those changes in the same PR as the implementation. These flags leave
staging and committing to you and leave release tags to CI. The private root
package version does not need to match the public packages.

## Automatic publication from main

Merging a PR into `main` starts the Release workflow in
`.github/workflows/release.yml`:

1. Build and verify the committed package versions without calculating another bump.
2. In the `release` environment, identify the main-branch commit that introduced
   the coordinated version and create its `v<version>` tag.
3. In the `npm` environment, check out the tagged commit by its immutable SHA,
   build and verify its committed package versions, and publish with Nx.
4. After publication succeeds, create the matching GitHub release.

Main remains protected: CI writes release tags and publishes packages without
pushing commits to main or creating another PR. Its package manifests reflect
the published version once publication succeeds; they can temporarily be ahead
while publication is pending or has failed. Merges without a version bump do
not publish a new version.

If a release run is missed, a later main run finds the version's original commit
along main's first-parent history. An existing tag pins retries to that same
commit. Already published packages are skipped, so a partially published release
can resume. Older runs do not move npm's `latest` tag backward after a newer
version has been published.

Storybook builds and deploys to GitHub Pages in a parallel path. Branch pushes
outside `main` run CI without publishing packages. Creating a GitHub release
manually does not trigger publication.

The workflow uses npm's default distribution tag (`latest` unless configured
otherwise). A prerelease version or GitHub's prerelease checkbox does not
automatically select the npm `beta` tag.

## Repository and npm setup

Keep main's PR requirement and required environment reviews enabled. The workflow
needs permission to push release tags and create GitHub releases. It does not
need permission to create PRs or bypass main's protection.

Enable **Settings → Pages → Source: GitHub Actions**; do not add a suggested
Jekyll or Static HTML workflow. Pages artifacts are named by `github.run_attempt`
and deployment selects that exact name so reruns cannot pick an older artifact.
An old run using the previous workflow must be replaced by a new main run after
this change merges; rerunning an old workflow does not adopt the fix.

The npm organization must allow publication of all three package names. Configure
trusted publishing for each package using this repository's `release.yml`
workflow and the `npm` GitHub environment. A new package may need an owner-managed
initial publication before its trusted publisher can be configured in npm.
The publish job uses Node 24 for its bundled npm version, which supports trusted
publishing (npm 11.5.1 or newer).

Do not publish the workspace root or use `npm publish` directly on a manifest
containing `workspace:*` dependencies; the configured Nx/pnpm publication flow
performs that conversion.

## Validate without publishing

```sh
pnpm release:version 1.3.0 --stage-changes=false --git-commit=false --git-tag=false --git-push=false --dry-run
pnpm format:check
pnpm lint
pnpm check
pnpm pack:check
```

Replace `1.3.0` with your intended version. The dry run previews the coordinated
manifest and lockfile changes without modifying them.

`pack:check` creates temporary tarballs, tests them in an isolated consumer, and
removes them afterward. It does not publish anything. To check a release tag
against the current package manifests, run
`node scripts/verify-release-tag.mjs v<version>` with their shared version.
