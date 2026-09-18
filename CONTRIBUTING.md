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
pnpm storybook
```

Storybook runs at <http://localhost:6006>. Build the package with `pnpm build`;
the output is written to `dist/`.

Read [DESIGN.md](docs/DESIGN.md) for component rules and
[STYLES.md](docs/STYLES.md) for tokens. Components live in
`src/components/<Name>/`, alongside their stories and tests. Cross-component
examples live in `src/stories/`.

Keep product routing, data fetching, authentication, analytics, and business
logic in the consuming application. Use named exports and update the package
export map and consumer examples when changing the public API.

## Find components

Use `pnpm design-system search <capability>` and
`pnpm --silent design-system inspect <name> --json` to find exact imports and
colocated stories. The CLI runs from the checkout on Node 22.18+ or Node 24.

## Link to LangChainPlus

Once `smith-frontend` has `@langchain/macaw-design-system` as a dependency, link the
local checkout instead of publishing a test version. With the repositories as
sibling directories:

```sh
# Terminal 1: macaw-design-system
pnpm build:watch

# Terminal 2: langchainplus/smith-frontend
pnpm link ../../macaw-design-system
pnpm dev
```

Use an absolute path in `pnpm link` if the repositories are not siblings. To
return to the version in `package.json` and the lockfile:

```sh
pnpm unlink @langchain/macaw-design-system
```

The current extraction does not yet migrate `smith-frontend` imports to the
package, so linking it alone will not change existing design-system screens.

## Before opening a pull request

```sh
pnpm format
pnpm lint
pnpm check
npm pack --dry-run --ignore-scripts
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
