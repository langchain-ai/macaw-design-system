<div align="center">
  <a href="https://www.langchain.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/assets/langchain-logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="docs/assets/langchain-logo-light.svg">
      <img alt="LangChain" src="docs/assets/langchain-logo-light.svg" width="400">
    </picture>
  </a>
  <h1>Macaw Design System</h1>
  <p><strong>The shared UI & Design foundation for the LangChain product suite.</strong></p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License: MIT"></a>
  <!-- Keep the version badge aligned with packages/components/package.json until the package is published to npm. -->
  <a href="packages/components/package.json"><img src="https://img.shields.io/badge/version-1.0.0--beta.1-orange" alt="Package version: 1.0.0-beta.1"></a>
  <a href="https://x.com/langchain_oss"><img src="https://img.shields.io/twitter/url/https/twitter.com/langchain_oss.svg?style=social&amp;label=Follow%20%40LangChain" alt="Follow LangChain on X"></a>
  <p>
    <a href="https://langsmith-design-system.vercel.app/">Storybook</a> ·
    <a href="https://langsmith-design-system.vercel.app/?path=/docs/foundations-text--docs">Component Overview</a> ·
    <a href="https://langsmith-design-system.vercel.app/?path=/docs/foundations-icon-library--docs">Icon Overview</a>
  </p>
</div>

## Welcome

Welcome to Macaw, LangChain’s design system! The name is a nod to our original 🦜🔗 logo. The macaw’s varied colors reflect the range of components and patterns in the system, while its intelligence reflects our focus on helping developers and coding agents build with them through a CLI and clear documentation.

This repo, [`langchain-ai/macaw-design-system`](https://github.com/langchain-ai/macaw-design-system), contains LangChain's:

1. Component Library
2. Tokens
3. Helpers & Utilities
4. Icons
5. Agent Documentation

Contributions are welcome. See the [contributing guide](CONTRIBUTING.md) for local setup and pull request guidelines. We take code quality very seriously, so slop will not be accepted. PR authors should be able to defend their code.

## Packages

| Package                                              | Purpose                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| [`@langchain/macaw-components`](packages/components) | React components, styles, icons, and versioned usage guidance |
| [`@langchain/macaw-tokens`](packages/tokens)         | Framework-independent theme tokens and token reference        |
| [`@langchain/macaw-cli`](packages/cli)               | Component discovery and agent scaffolding                     |

All three packages share a version and are released together with Nx.
`macaw-design-system` is the repository name; the workspace root is private.

## Install

```sh
pnpm add @langchain/macaw-components
pnpm add -D @langchain/macaw-cli
```

Components include tokens as a dependency. For a tokens-only integration, or
when importing token exports directly, add `@langchain/macaw-tokens` explicitly.
React 18 and 19 are supported.

## Use

Import the stylesheet once and wrap your app in `AppThemeProvider` from
`@langchain/macaw-components/hooks/AppThemeProvider`.

```tsx
import '@langchain/macaw-components/styles.css';
import { Button, Card, Text } from '@langchain/macaw-components';
import { Code } from '@langchain/macaw-components/Code';
```

Use direct family exports such as `/Button`, `/BarChart`, `/Code`, and `/Tabs`
for explicit dependency boundaries. Hooks, utilities, and icons have their own
subpaths. The stylesheet includes Inter, Fira Code, theme tokens, and compiled
component styles. Add `dark` to `html` to activate the dark theme.

- `@langchain/macaw-components/styles.css`: complete component stylesheet.
- `@langchain/macaw-components/tailwind-preset`: optional Tailwind v3 mapping.
- `@langchain/macaw-tokens/tokens.css`: variables without components or fonts.
- `@langchain/macaw-tokens/tokens.json`: token values and selectors for tooling.

## Agent setup and discovery

```sh
pnpm exec macaw init
pnpm exec macaw search "loading"
pnpm exec macaw inspect Button --json
```

The CLI reads the installed components package's catalog. `init` creates a
Macaw skill with links to that version's documentation and preserves existing
files. Templates and setup logic live in the CLI; component guidance ships with
components, and token guidance ships with tokens.

- [Component guidance](packages/components/docs/DESIGN.md)
- [Styling guidance](packages/components/docs/STYLES.md)
- [Token reference](packages/tokens/docs/TOKENS.md)
- [Repository contributor skill](.agents/skills/design-system/SKILL.md)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, package boundaries,
validation, and consumer testing. All contributors must follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately through [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE).

## Releases

Nx coordinates versioning across all three packages. Publication runs from a
matching GitHub release tag after validation. See [RELEASING.md](docs/RELEASING.md)
for the release process and npm trusted-publishing setup.

## Scope and ownership

Macaw owns shared, domain-free UI. Keep product routing, data fetching,
permissions, analytics, and feature workflows in the consuming application.
