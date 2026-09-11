# LangChain Design System

**The shared UI foundation for the LangChain product suite.**

* [Storybook](https://langsmith-design-system.vercel.app/)
* [Component Overview](https://langsmith-design-system.vercel.app/?path=/docs/foundations-text--docs)
* [Icon Overview](https://langsmith-design-system.vercel.app/?path=/docs/foundations-icon-library--docs)



## Welcome
<!-- Update with DS name -->
Welcome to Langchain's design-system package! This repo, `@langchain/design-system`, contains LangChain's:

1. Component Library
2. Tokens
3. Helpers & Utiltiies
4. Icons

Contributions are welcome, please raise PRs directly in Github. We take code quality very seriously, so slop will not be accepted. PR authors should be able to defend their code.


## Install

To install, run

```sh
pnpm add @langchain/design-system
```

React 18+ is supported.

## Use
Apps should use `AppThemeProvider` from
`@langchain/design-system/hooks/AppThemeProvider`, to wrap the entire application.

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

Components are imported in this way:

```tsx
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

This repository supports Node 22 and 24 and uses pnpm.

```sh
pnpm install
pnpm storybook
```


To build the package run `pnpm build`, which outputs in `./dist`. 


<!-- This section might be better in Storybook -->
#### For linking to `langchainplus`

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

Releases are manual, not automatic. NX will be added soon.

## Scope and ownership

The component library owns domain-free UI, but can have some overlap if components are reused accross multiple pages or applications. If that is true, business logic should not be mixed in, and the component should cover multiple use cases.

For LangChain team members, you can reach Frontend Platform in Slack with these channels:


- [#ask-frontend-platform](https://langchain.slack.com/app_redirect?channel=ask-frontend-platform) focused on questions
- [#team-frontend-platform](https://langchain.slack.com/app_redirect?channel=team-frontend-platform) focused on discussion, PR review requests, announcements



<!-- This might be moved to Link component's JSDocs -->
<!-- The `Link` component renders a native anchor by default. Pass a routing
framework's anchor element through `as` for client-side navigation:

```tsx
import { Link } from '@langchain/design-system';
import { Link as RouterLink } from 'react-router-dom';

<Link as={<RouterLink to="/runs" />}>View runs</Link>;
``` -->
