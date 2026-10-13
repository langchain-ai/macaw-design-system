# Releasing Macaw

The three public packages use one version and a shared `v<version>` release tag:

- `@langchain/macaw-tokens`
- `@langchain/macaw-components`
- `@langchain/macaw-cli`

The repository root is private. Nx owns coordinated versioning and publication;
pnpm rewrites the components package's `workspace:*` token dependency to the
matching release version when packing or publishing.

## Prepare a release

The public package manifests already target `1.1.0-beta.0`. That version is
pending publication; changes merged before it is published can join the same
release without another version bump. The private root package version is not
published and does not need to match.

The release tag configuration allows Nx to use the previous beta tag as its
baseline, including when preparing a stable release. For beta versioning,
pass `--preid beta` to select the prerelease identifier explicitly:

```sh
pnpm release:version 1.1.0-beta.0 --preid beta --dry-run
pnpm release:version 1.1.0-beta.0 --preid beta
pnpm release:changelog 1.1.0-beta.0 --dry-run
pnpm release:changelog 1.1.0-beta.0
pnpm format
pnpm check
pnpm pack:check
```

Choose a new version only when preparing a later release, and review the
dry-run output. Use `prerelease --preid beta` to advance an existing beta
sequence; use an explicit stable version when graduating from beta. Use
`--first-release` only when no previous release tag exists.

The `release.version.git` and `release.changelog.git` settings in `nx.json`
disable automatic commits, tags, and pushes for these preparation commands.
Nx may stage the generated files.
Review and commit the package manifests, lockfile, and changelog, then merge
through the normal review process. Include the unreleased changelog notes in
the release entry and update the README version badge too.

After merge, create a GitHub release with a tag matching all three package
versions, such as `v1.1.0-beta.0`, pointing to the commit containing the release
changes. Merging a PR alone does not trigger versioning or publication.
The publish workflow verifies the tag and licenses,
runs the full checks, verifies the tarballs, and publishes with Nx. Nx publishes
dependencies before dependents and can skip versions already in the registry
when recovering a partially completed release.

The workflow uses npm's default distribution tag (`latest` unless configured
otherwise). A prerelease version or GitHub's prerelease checkbox does not
automatically select the npm `beta` tag.

## One-time npm setup

The npm organization must allow publication of all three package names. Configure
trusted publishing for each package using this repository's `release.yml`
workflow and the `npm` GitHub environment. Keep any required environment review
protection in place. A new package may need an owner-managed initial publication
before its trusted publisher can be configured in npm.

Packages request public access and provenance. Do not publish the workspace root
or use `npm publish` directly on a manifest containing `workspace:*` dependencies;
the configured Nx/pnpm publication flow performs that conversion.

## Validate the release tooling without publishing

```sh
pnpm release:version 1.1.0-beta.0 --preid beta --dry-run
pnpm release:changelog 1.1.0-beta.0 --dry-run
pnpm pack:check
node scripts/verify-release-tag.mjs v1.1.0-beta.0
```

Substitute the current version in the last command. `pack:check` creates temporary
tarballs, tests them in an isolated consumer, and removes them afterward. It does
not publish anything.
