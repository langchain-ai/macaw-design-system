# Releasing Macaw

The three public packages use one version and a shared `v<version>` release tag:

- `@langchain/macaw-tokens`
- `@langchain/macaw-components`
- `@langchain/macaw-cli`

The repository root is private. Nx owns coordinated versioning and publication;
pnpm rewrites the components package's `workspace:*` token dependency to the
matching release version when packing or publishing.

## First stable release: 1.0.0

`1.0.0` graduates the beta packages to the stable npm `latest` tag. It requires
React 19, Tailwind v4, and Node 26 or newer. Consumers using Tailwind v3 must
upgrade their Tailwind setup alongside Macaw; removing the prerelease suffix
does not remove these compatibility changes.

All three package manifests and the publish script explicitly select `latest`.
Install the stable release with:

```sh
pnpm add @langchain/macaw-components@1.0.0
pnpm add -D @langchain/macaw-cli@1.0.0
```

Until `v1.0.0` exists, the build and release workflows explicitly select `1.0.0`
so conventional commits do not bump the first stable version again. The version
job can tag the verified merge commit when its manifests already contain the
release version. Subsequent releases use Nx's conventional-commit versioning.

## Release workflow

Merge reviewed changes through the normal pull request process. On `main`, the
release workflow:

1. Prepares the release version and builds the packages with Node 26.
2. Uses Nx to create any version commit and the shared release tag, then pushes
   them atomically through the configured release app.
3. Verifies the tag, licenses, package exports, types, and packed consumers.
4. Publishes all three packages to npm `latest` and creates the GitHub release.

Nx publishes dependencies before dependents and can skip versions already in
the registry when recovering a partially completed publication. The `release`
and `npm` GitHub environments retain their configured approval requirements.

Before merging release changes, run:

```sh
pnpm check
pnpm pack:check
```

Update the package changelogs and README version badge when preparing an explicit
release. After `1.0.0`, review Nx's planned version with
`pnpm release:version --dry-run`; use `patch`, `minor`, or `major` explicitly when
needed. `release:version` normally creates a local commit and tag, so use
`--dry-run` for inspection.

## One-time npm setup

The npm organization must allow publication of all three package names. Configure
trusted publishing for each package using this repository's `release.yml`
workflow and the `npm` GitHub environment. Keep any required environment review
protection in place. A new package may need an owner-managed initial publication
before its trusted publisher can be configured in npm.

Packages request public access and provenance. Do not publish the workspace root
or use `npm publish` directly on a manifest containing `workspace:*` dependencies;
the configured Nx/pnpm publication flow performs that conversion.

## Validate without publishing

```sh
pnpm release:version 1.0.0 --dry-run
pnpm pack:check
node scripts/verify-release-tag.mjs v1.0.0
pnpm release:publish --dry-run --access public
```

Substitute the intended release version in the version and tag commands for later
releases. `pack:check` creates temporary tarballs, tests them in an isolated
consumer, and removes them afterward. These checks do not publish anything.
