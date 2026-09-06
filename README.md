<div align="center">

# LangChain Design System

**The shared UI foundation for the LangChain product suite.**

[Explore Storybook](https://langsmith-design-system.vercel.app/) ·
[Browse components](https://langsmith-design-system.vercel.app/?path=/docs/foundations-text--docs) ·
[Browse icons](https://langsmith-design-system.vercel.app/?path=/docs/foundations-icon-library--docs)

</div>

This repository contains the standalone `@langchain/design-system` package:
accessible React components, semantic styling tokens, precompiled utilities,
theme helpers, chart primitives, and Phosphor icon wrappers shared by LangChain
products.

The package is preparing its first npm release under the [MIT license](LICENSE).
The hosted Storybook above currently builds from LangChainPlus; see
[Storybook parity and hosting](docs/STORYBOOK.md) for the standalone setup.
This package does not include `@langchain/untitled-ui-icons` or the legacy Untitled-compatible icon
trees.

## Install

Once the package is published:

```sh
pnpm add @langchain/design-system react react-dom
```

React 18.2–19 and TypeScript 5.4+ are supported. The package is ESM-only. Navigation styles can be composed with any
routing framework. Tailwind is optional for package consumers.

## Use

Import the package stylesheet once at the application entry point. It includes
Inter and Fira Code, light and dark semantic tokens, base styles, and the
precompiled utility classes used by the components.

```tsx
import '@langchain/design-system/styles.css';

import { Button, Card, Text, TooltipProvider } from '@langchain/design-system';

export function Example() {
  return (
    <TooltipProvider>
      <Card>
        <Text>Shared product UI</Text>
        <Button>Continue</Button>
      </Card>
    </TooltipProvider>
  );
}
```

The root export stays deliberately lightweight. Import components with heavier
dependency graphs from their explicit subpaths so applications only load what
they use:

```tsx
import { BarChart } from '@langchain/design-system/components/BarChart';
import { Code } from '@langchain/design-system/components/Code';
import { TabGroup } from '@langchain/design-system/components/Tabs';
import { CheckIcon } from '@langchain/design-system/icons';
```

Utilities, hooks, and contexts are also available through explicit subpaths,
for example `@langchain/design-system/utils/cn` and
`@langchain/design-system/hooks/useColorScheme`.

Add the `dark` class to the document root to activate dark tokens. Applications
should use `AppThemeProvider` from
`@langchain/design-system/hooks/AppThemeProvider`, or synchronize the class and color-scheme context through
their existing theme provider. See [integration](docs/INTEGRATION.md) for the
required providers, including tooltips and toasts.

The `Link` component renders a native anchor by default. Pass a routing
framework's anchor element through `as` for client-side navigation:

```tsx
import { Link } from '@langchain/design-system';
import { Link as RouterLink } from 'react-router-dom';

<Link as={<RouterLink to="/runs" />}>View runs</Link>;
```

### Styling contracts

- `@langchain/design-system/styles.css` is the recommended complete stylesheet.
- `@langchain/design-system/tokens.css` exposes only the semantic token layers
  for applications that own their reset, fonts, and utilities.
- `@langchain/design-system/tailwind-preset` exposes the system's Tailwind 3
  theme and plugins. It intentionally has no `content` paths; consumers remain
  responsible for scanning their own source. The published package already
  includes compiled classes required by its components.

See [docs/DESIGN.md](docs/DESIGN.md) for the system rules and
[docs/STYLES.md](docs/STYLES.md) for the token catalog. Repository-local agent
guidance lives in
[`.agents/skills/design-system/SKILL.md`](.agents/skills/design-system/SKILL.md)
and treats those documents as the source of truth.

## Develop

For development, use Node 22.22.2+ or 24.15.0+ and pnpm 10.27.0.

```sh
pnpm install
pnpm storybook
```

`pnpm storybook` is the fastest loop for component work. To build the package
output in `dist/`, run `pnpm build`. Use `pnpm build:watch` when another local
application is consuming the package; it rebuilds JavaScript, types, styles,
and assets after changes under `src/`.

### Use this checkout in `langchainplus`

Once `smith-frontend` has `@langchain/design-system` as a dependency, link the
local checkout instead of publishing a test version. With the repositories as
sibling directories:

```sh
# Terminal 1: langchain-design-system
pnpm build:watch

# Terminal 2: langchainplus/smith-frontend
pnpm link ../../langchain-design-system
pnpm dev
```

Use an absolute path in `pnpm link` if the repositories are not siblings. To
return to the version in `package.json` and the lockfile:

```sh
pnpm unlink @langchain/design-system
```

The current extraction does not yet migrate `smith-frontend` imports to the
package, so linking it alone will not change existing design-system screens.

Useful checks:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm verify:package
pnpm build:storybook
npm pack --dry-run --ignore-scripts
```

`pnpm check` runs formatting, lint, license and release-script checks,
typechecking, component tests, package validation, and the Storybook build.
`pnpm pack:check` also imports every runtime module from an extracted tarball
with only production dependencies and peers available.

## Version and release

This single-package repository uses npm's built-in semver command and a
reviewed [changelog](CHANGELOG.md). Nx is not needed for the current structure.
A GitHub release triggers validation and npm trusted publishing; prereleases
publish to `next`, stable versions to `latest`.

See [RELEASING.md](docs/RELEASING.md) for the version policy, release steps, and
first-publication setup. Publishing does not update LangChainPlus: its package
dependency and imports need a separate consumer PR.

## Documentation and contributing

- [Integration](docs/INTEGRATION.md): providers, imports, CSS, frameworks, and local linking.
- [Design rules](docs/DESIGN.md) and [tokens](docs/STYLES.md).
- [Storybook](docs/STORYBOOK.md): shared stories, parity, and hosting.
- [Contributing](CONTRIBUTING.md), [changelog](CHANGELOG.md), and [security](SECURITY.md).
- [Third-party notices](THIRD_PARTY_NOTICES.md).

Use [GitHub issues](https://github.com/langchain-ai/langchain-design-system/issues)
for public questions, bug reports, and proposals.

## Scope and ownership

The library owns domain-free UI: semantic tokens and reusable components whose
behavior does not depend on a particular product. Product navigation,
permissions, analytics, data fetching, and feature workflows remain in their
applications.

LangChain team members can reach Frontend Platform in Slack:

- [#team-frontend-platform](https://langchain.slack.com/app_redirect?channel=team-frontend-platform) for ownership and platform work
- [#ask-frontend-platform](https://langchain.slack.com/app_redirect?channel=ask-frontend-platform) for usage questions
