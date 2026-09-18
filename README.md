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
  <!-- Keep the version badge aligned with package.json until the package is published to npm. -->
  <a href="package.json"><img src="https://img.shields.io/badge/version-0.1.0-orange" alt="Package version: 0.1.0"></a>
  <a href="https://x.com/langchain_oss"><img src="https://img.shields.io/twitter/url/https/twitter.com/langchain_oss.svg?style=social&amp;label=Follow%20%40LangChain" alt="Follow LangChain on X"></a>
  <p>
    <a href="https://langsmith-design-system.vercel.app/">Storybook</a> ·
    <a href="https://langsmith-design-system.vercel.app/?path=/docs/foundations-text--docs">Component Overview</a> ·
    <a href="https://langsmith-design-system.vercel.app/?path=/docs/foundations-icon-library--docs">Icon Overview</a>
  </p>
</div>

## Welcome

Welcome to LangChain's Design System package, Macaw! The Macaw parrot is inspired from our original logo, the parrot and chain emojis ("Lang" = Parrot, "Chain" = "Chain"). The varied colors of the Macaw represent all the different components and patterns our Design System supports, and the intelligence of the Macaw speaks to how we aim for our Design System to be intelligent itself, providing a CLI and documentation for coding agents and developers alike.

This repo, [`langchain-ai/macaw-design-system`](https://github.com/langchain-ai/macaw-design-system), contains LangChain's:

1. Component Library
2. Tokens
3. Helpers & Utilities
4. Icons
5. Agent Documentation

Contributions are welcome. See the [contributing guide](CONTRIBUTING.md) for local setup and pull request guidelines. We take code quality very seriously, so slop will not be accepted. PR authors should be able to defend their code.

## Install

Macaw's npm package name is `@langchain/design-system`. To install, run

```sh
pnpm add @langchain/design-system
```

React 18+ is supported.

## Use

Apps should use `AppThemeProvider` from
`@langchain/design-system/hooks/AppThemeProvider`, to wrap the entire application.

The default CSS imports uses the `styles.css` which includes our default fonts,
Inter and Fira Code. Both light and dark semantic tokens are supported.

```tsx
import '@langchain/design-system/styles.css';

import { Button, Card, Text } from '@langchain/design-system';

export function Example() {
  return (
    <Card>
      <Text>Shared product UI</Text>
      <Button>Continue</Button>
    </Card>
  );
}
```

Components are imported in this way:

```tsx
import { Button } from '@langchain/design-system';
import { BarChart } from '@langchain/design-system/components/BarChart';
import { Code } from '@langchain/design-system/components/Code';
```

Utilities, hooks, and contexts are also available through explicit subpaths,
for example `@langchain/design-system/utils/cn` and
`@langchain/design-system/hooks/useColorScheme`.

Add the `dark` class to the document root to activate dark tokens.

### Styling contracts

- `@langchain/design-system/styles.css` main stylesheet.
- `@langchain/design-system/tokens.css` semantic tokens for your own components, or composite components.
- `@langchain/design-system/tailwind-preset` our TW customizations, themes, and plugins.

### Agentic Contracts

- [docs/DESIGN.md](docs/DESIGN.md) for philosophy and overall structure
- [docs/STYLES.md](docs/STYLES.md) for the token catalog
- [`.agents/skills/design-system/SKILL.md`](.agents/skills/design-system/SKILL.md) for general LLM guidance

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) to develop locally, link the package to
LangChainPlus, and run checks before opening a pull request. All contributors
must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately using the instructions in
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE).

## Version and release

Releases are manual, not automatic. NX will be added soon.

## Scope and ownership

The component library owns domain-free UI, but can have some overlap if components are reused accross multiple pages or applications. If that is true, business logic should not be mixed in, and the component should be flexible, scalable, and reusable.

<!-- This might be moved to Link component's JSDocs -->
<!-- The `Link` component renders a native anchor by default. Pass a routing
framework's anchor element through `as` for client-side navigation:

```tsx
import { Link } from '@langchain/design-system';
import { Link as RouterLink } from 'react-router-dom';

<Link as={<RouterLink to="/runs" />}>View runs</Link>;
``` -->
