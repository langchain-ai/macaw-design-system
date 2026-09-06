# Versioning and releases

This is one npm package. Use npm's built-in version command and a reviewed
changelog; Nx Release adds a second project model without solving a current
coordination problem. Reconsider Nx if this becomes a multi-package workspace
that needs coordinated releases or task caching.

## Choose a version

- Patch: compatible fixes, including visual or accessibility corrections.
- Minor: compatible new components, props, or tokens.
- Major: removed/renamed exports, incompatible props or token semantics,
  changed defaults, or a higher React/runtime minimum.

During `0.x`, use a minor bump for breaking changes and call them out explicitly
in the changelog. A patch must remain compatible. Prereleases use versions such
as `0.2.0-beta.1` and publish under npm's `next` tag; stable releases use
`latest`. Build metadata (`+...`) is not accepted for npm releases.

## First release setup (repository owners)

1. Merge the MIT license and confirm the source/assets are cleared for release.
2. Make the GitHub repository public when ready. Draft PRs do not change its
   visibility, and npm provenance requires a public source repository.
3. Configure npm trusted publishing for `@langchain/design-system`, repository
   `langchain-ai/langchain-design-system`, workflow `release.yml`, environment
   `npm`. If npm requires an initial package bootstrap, follow npm's current
   trusted-publisher setup flow before using the workflow.
4. Configure the GitHub `npm` environment with required reviewers and release
   tag restrictions. Protect `main` with required CI checks on Node 22 and 24.
5. Connect the Storybook hosting project to this repository. Use
   `pnpm build:storybook` and output directory `storybook-static`. See
   [STORYBOOK.md](STORYBOOK.md).

## Prepare a release PR

```sh
npm version minor --no-git-tag-version
pnpm format
pnpm check
pnpm pack:check
```

Choose `patch`, `minor`, `major`, or an explicit version as appropriate. This
updates `package.json` without creating a commit or tag. Move the applicable
`Unreleased` entries to `## <version> - YYYY-MM-DD` in `CHANGELOG.md`, leaving a
fresh `Unreleased` section. For the first release, keep `0.1.0` and create its
dated changelog section. Review breaking changes and consumer upgrade guidance.

## Publish

After the release PR merges, create a GitHub release with the exact package
version prefixed by `v` (for example, `v0.2.0`), targeting the merged main
commit. Mark prerelease versions as GitHub prereleases. Publish the GitHub
release to start the workflow.

The workflow verifies the tag, changelog, prerelease flag, and main ancestry,
runs all checks, validates the packed artifact, and publishes with provenance.
It explicitly selects `latest` or `next`. It never chooses the next version or
updates consuming applications. The license is checked explicitly even though
publishing disables lifecycle scripts.

Verify the version and provenance on npm after the workflow succeeds. Then
open a separate consumer PR updating `@langchain/design-system` and its
lockfile. LangChainPlus continues using its copied source until its imports
are migrated; merely installing a new package version does not replace it.

If validation fails, fix it before publishing. npm versions are immutable:
if publication succeeded, release a new version for corrections. Do not move
an already published release tag or retry it with different contents.
