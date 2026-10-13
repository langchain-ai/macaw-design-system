# Releasing Macaw

The three public packages use one version and a shared `v<version>` release tag:

- `@langchain/macaw-tokens`
- `@langchain/macaw-components`
- `@langchain/macaw-cli`

The repository root is private. Nx owns coordinated versioning and publication;
the components package pins tokens to the matching release version. Nx updates
that dependency when versioning the packages. pnpm links the matching workspace
package during development.

## Prepare a release

```sh
pnpm release:version patch --dry-run
pnpm release:version patch
pnpm release:changelog <new-version>
pnpm format
pnpm check
pnpm pack:check
```

Use an explicit version or `minor`/`major` when appropriate. Nx follows its
pre-1.0 SemVer rules while the packages are at 0.x; review the dry-run output.
For the first changelog, use `--first-release`.

These commands do not automatically commit, tag, push, or create a GitHub
release. Review and commit the package manifests, lockfile, and changelog, then
merge through the normal review process. Update the README version badge too.

After merge, create a GitHub release with a tag matching all three package
versions, such as `v0.1.0`. The publish workflow verifies the tag and licenses,
runs the full checks, verifies the tarballs, and publishes with Nx. Nx publishes
dependencies before dependents and can skip versions already in the registry
when recovering a partially completed release.

## One-time npm setup

The npm organization must allow publication of all three package names. Configure
trusted publishing for each package using this repository's `release.yml`
workflow and the `npm` GitHub environment. Keep any required environment review
protection in place. A new package may need an owner-managed initial publication
before its trusted publisher can be configured in npm.

Packages request public access and provenance. Do not publish the workspace root
or use `npm publish` directly on a manifest containing `workspace:*` dependencies;
public package manifests must contain registry-resolvable versions. The package
checks verify the tokens dependency in both pnpm and npm tarballs.

## Validate the release tooling without publishing

```sh
pnpm release:version patch --dry-run
pnpm pack:check
node scripts/verify-release-tag.mjs v0.1.0
```

Substitute the current version in the last command. `pack:check` creates temporary
pnpm tarballs, tests them in an isolated consumer, verifies the npm-packed
components dependency, and removes the tarballs afterward. It does
not publish anything.
