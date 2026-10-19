# Contributing to Macaw Design System

Bug reports, component fixes, and documentation improvements are welcome.
Use [GitHub issues](https://github.com/langchain-ai/macaw-design-system/issues)
for bugs and proposals. Include a small reproduction, package and React
versions, browser, and screenshots when relevant. Report vulnerabilities
privately through [SECURITY.md](SECURITY.md).

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Develop locally

Use the Node.js version supported by `engines.node` and the pnpm version pinned
in `packageManager` in the root [package.json](package.json).

```sh
pnpm install --frozen-lockfile
pnpm build-all
pnpm storybook
```

Storybook runs at <http://localhost:5264>. Build the packages with `pnpm build-all`;
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
command reads the built catalog instead.

## Link to a consuming project

To test local Macaw changes in any project that depends on
`@langchain/macaw-components`, link your checkout instead of publishing a test
version. First, follow the [consumer setup](README.md#install) in that project.

```sh
# Terminal 1: your Macaw checkout
cd /path/to/macaw-design-system
pnpm build-all

# Terminal 2: the consuming application's package directory
cd /path/to/your-project
pnpm link /path/to/macaw-design-system/packages/components
pnpm dev
```

Replace the paths with your local directories and use your application's dev
command in place of `pnpm dev` if it differs. Wait for the Macaw build to finish
before starting the application. After editing Macaw source, rerun `pnpm build-all`
from the Macaw checkout to update the linked packages.

Relative paths work too. For example, if `langchainplus` and `macaw-design-system`
are sibling checkouts, run this from `langchainplus/smith-frontend`:

```sh
pnpm link ../../macaw-design-system/packages/components
```

Link `packages/tokens` too when testing direct imports from
`@langchain/macaw-tokens`. Only code that imports Macaw packages will use the
linked changes; linking does not replace a project's own components.

For publication checks, run `pnpm pack:check` from the Macaw checkout to test all
three tarballs in an isolated consumer. To return to the version in the consuming
project's `package.json` and lockfile, run this from its package directory:

```sh
pnpm unlink @langchain/macaw-components
```

Unlink `@langchain/macaw-tokens` too if you linked it.

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
consumer verification updates. Releases use a shared version.
