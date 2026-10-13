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

1. Prepare the next version with Nx conventional commits, build the packages,
   verify package outputs, and upload the built artifacts. This preparation step
   explicitly disables staging, commits, tags, and pushes.
2. In the `release` environment, calculate the same version from the verified
   commit. Nx commits the package manifests and lockfile and creates the shared
   tag. The workflow pushes the version commit and tag atomically to `main`.
3. In the `npm` environment, check out that tag, download the built artifacts,
   verify the release tag and packages, and publish all three packages with Nx.
4. After publication succeeds, create the matching GitHub release with generated
   release notes.

Storybook builds and deploys to GitHub Pages in a parallel path. Branch pushes
outside `main` run CI without publishing packages.

Do not manually bump package versions for ordinary component changes or create a
GitHub release to trigger publication. Nx determines the version from the merged
commit history; publishing a GitHub release is now an output of the workflow.
The private root package version does not need to match the public packages.

The `release.version.git` settings in `nx.json` enable commits and tags because
the automated version job depends on them. Nx does not push automatically; the
workflow performs the explicit atomic push. Use `--dry-run` when inspecting
versioning locally.

The workflow uses npm's default distribution tag (`latest` unless configured
otherwise). A prerelease version or GitHub's prerelease checkbox does not
automatically select the npm `beta` tag.

## Repository and npm setup

The release workflow must be permitted to push its version commit and tag under
the repository's branch and tag protection rules. A rule requiring every change
to go through a pull request can reject this step and prevent publication. Keep
required environment reviews in place and coordinate the release automation's
repository permissions with the maintainers.

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
