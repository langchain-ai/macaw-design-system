# LangChain Design System

**The shared UI foundation for the LangChain product suite.**

[Storybook](https://langsmith-design-system.vercel.app/) ·
[Component Overview](https://langsmith-design-system.vercel.app/?path=/docs/foundations-text--docs) ·
[Icon Overview](https://langsmith-design-system.vercel.app/?path=/docs/foundations-icon-library--docs)



<!-- Update with DS name -->
Welcome to Langchain's design-system package! This repo, `@langchain/design-system`, contains LangChain's:

1. Component Library
2. Tokens
3. Helpers & Utiltiies
4. Icons

<!-- Needs to be updated -->
For feedback, contact LangChain! 


## Install

To install, run

```sh
pnpm add @langchain/design-system
```

React 18+ is supported.

## Use

The default CSS imports uses the `styles.css` which includs our default fonts,
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

Components are imported in this:

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
may use `AppThemeProvider` from
`@langchain/design-system/hooks/AppThemeProvider`, or manage that class through
their existing theme provider.

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

This repository supports Node 22 and 24 and uses pnpm 10.27.0.

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

`pnpm check` runs the typecheck, tests, package build and verification, and a
production Storybook build.

## Version and release

Releases are manual, not periodic. The release owner:

1. Chooses the semantic-version bump and updates `version` in `package.json`.
2. Merges the validated change.
3. Publishes a GitHub release tagged with that version, for example `v0.2.0`.

The release workflow checks that the tag matches `package.json`, runs the full
package checks, and publishes to npm with provenance. It does not choose or
create the next version.

`langchainplus` does not receive a release automatically. After publication,
its `@langchain/design-system` dependency and lockfile must be updated in a
separate PR. The existing monthly Dependabot run may propose that PR once the
dependency is present; a maintainer can also update it immediately when a
product change needs the new version.

Before the first public release, repository owners must choose an approved
license, replace the current `UNLICENSED` package declaration, and configure
npm trusted publishing for the GitHub `npm` environment. No license is inferred
from the source repository.

## Scope and ownership

The library owns domain-free UI: semantic tokens and reusable components whose
behavior does not depend on a particular product. Product navigation,
permissions, analytics, data fetching, and feature workflows remain in their
applications.

LangChain team members can reach Frontend Platform in Slack:

- [#team-frontend-platform](https://langchain.slack.com/app_redirect?channel=team-frontend-platform) for ownership and platform work
- [#ask-frontend-platform](https://langchain.slack.com/app_redirect?channel=ask-frontend-platform) for usage questions
