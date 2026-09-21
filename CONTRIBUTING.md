# Contributing to Macaw Design System

Bug reports, component fixes, and documentation improvements are welcome.
Use [GitHub issues](https://github.com/langchain-ai/macaw-design-system/issues)
for bugs and proposals. Include a small reproduction, package and React
versions, browser, and screenshots when relevant. Report vulnerabilities
privately through [SECURITY.md](SECURITY.md).

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Develop locally

Use Node 22 or 24 and pnpm 10.27.0 (`corepack enable`).

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm storybook
```

Storybook runs at <http://localhost:6006>. Build the package with `pnpm build`;
each package writes its output to `packages/<name>/dist/`.

Read [DESIGN.md](packages/components/docs/DESIGN.md) for component rules and
[STYLES.md](packages/components/docs/STYLES.md) for tokens. Components live in
`packages/components/src/components/<Name>/`, alongside their stories and tests. Cross-component
examples live in `packages/components/src/stories/`.

Keep product routing, data fetching, authentication, analytics, and business
logic in the consuming application. Use named exports and update the package
export map and consumer examples when changing the public API.

## Find components

Use `pnpm design-system search <capability>` and
`pnpm --silent design-system inspect <name> --json` to find exact imports and
colocated stories. This contributor command reads live source and story tags. The published `macaw`
command reads the built catalog instead. Builds require Node 22.18+ or Node 24.

## Link to LangChainPlus

Once `smith-frontend` has `@langchain/macaw-components` as a dependency, link the
local checkout instead of publishing a test version. With the repositories as
sibling directories:

```sh
# Terminal 1: macaw-design-system
pnpm build:watch

# Terminal 2: langchainplus/smith-frontend
pnpm link ../../macaw-design-system/packages/components
pnpm dev
```

Use an absolute path in `pnpm link` if the repositories are not siblings. Link
`packages/tokens` too when testing direct token imports. For publication checks,
`pnpm pack:check` tests all three tarballs in an isolated consumer. To
return to the version in `package.json` and the lockfile:

```sh
pnpm unlink @langchain/macaw-components
```

The current extraction does not yet migrate `smith-frontend` imports to the
package, so linking it alone will not change existing design-system screens.

## Before opening a pull request

```sh
pnpm format
pnpm lint
pnpm check
pnpm pack:check
```

`pnpm check` runs the typecheck, tests, package build and verification, and a
production Storybook build. For documentation-only changes, formatting and
checking the rendered content and links are sufficient.

Add tests for behavior changes. Inspect keyboard navigation, focus,
disabled/loading/error states, light and dark themes, and narrow viewports in
Storybook when changing components.

Describe the problem, solution, and validation in your pull request. Include
screenshots for visual changes and call out changes to APIs, tokens, or default
behavior. Review and understand every change you submit, including generated
code; PR authors should be able to explain and defend their work.

## Package boundaries

- `packages/tokens`: token CSS, generated JSON, and framework-independent docs.
- `packages/components`: React code, stories, styles, Tailwind preset, usage docs,
  and generated catalog. Depends on tokens.
- `packages/cli`: dependency-free CLI and agent setup templates. Reads the
  consumer's installed catalog without importing React or repository source.

Keep behavior and visuals unchanged when moving files across these boundaries.
A public contract change needs the matching export map, documentation, and
consumer verification updates. Releases use a shared version; see
[RELEASING.md](docs/RELEASING.md).
