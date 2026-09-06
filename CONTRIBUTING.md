# Contributing

Bug reports, documentation improvements, and component fixes are welcome.
Use [GitHub issues](https://github.com/langchain-ai/langchain-design-system/issues)
for public questions and proposals. Include a small reproduction, package and
React versions, browser, and light/dark screenshots when relevant. Report
security issues through [SECURITY.md](SECURITY.md).

## Develop

Use Node 22.22.2+ or 24.15.0+ and pnpm 10.27.0 (`corepack enable`).

```sh
pnpm install --frozen-lockfile
pnpm storybook
```

Read [DESIGN.md](docs/DESIGN.md) for component rules and
[STYLES.md](docs/STYLES.md) for tokens. Keep product routing, authentication,
data fetching, analytics, and business logic in the consuming application.

Components live in `src/components/<Name>/`, alongside their stories and
`__tests__`. Cross-component examples live in `src/stories/`. Use named
exports, add the component entry to `package.json`, and include its public
API in `tests/consumer/imports.ts`. Prefer explicit component imports when
the dependency graph is large; see [integration](docs/INTEGRATION.md).

## Before opening a PR

```sh
pnpm format
pnpm check
pnpm pack:check
```

Add tests for behavior changes. Inspect keyboard focus, disabled/loading/error
states, light and dark themes, and narrow viewports in Storybook. A successful
build is not evidence that the component looks or behaves correctly.

Describe the user-visible problem, solution, and validation. Include screenshots
for visual changes and add an entry under `Unreleased` in `CHANGELOG.md`.
Call out API, token, default-style, or keyboard-behavior changes so maintainers
can choose the correct version bump. See [releases](docs/RELEASING.md).

## Keeping LangChainPlus aligned

Until the application imports the published package, shared fixes must be
ported between repositories. Follow [the parity workflow](docs/STORYBOOK.md)
and record the exact upstream commit reviewed. Product integration remains in
a separate LangChainPlus PR.
