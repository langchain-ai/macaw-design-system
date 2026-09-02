---
name: LangChain Design System
description: Philosophy, foundations, and rules for shared LangChain product UI.
audience: designers, developers, and agents
sources:
  tokens: docs/STYLES.md
  components: src/components
  stories: src/components/**/*.stories.tsx
  primitives: src/styles/tokens.css
  base: src/styles/base.css
  tailwind: tailwind.preset.cjs
principles:
  - Built for agents
  - Built for delightful experiences
  - Built for maintainability
  - Built to accelerate, not just constrain
  - Built as the final arbiter
---

# LangChain Design System

This package is the shared UI foundation for LangChain products. It provides
components, semantic styling tokens, precompiled component utilities, a
Tailwind preset, hooks, utilities, and Phosphor-based icon wrappers.

This document explains the design rules. See [STYLES.md](./STYLES.md) for the
CSS integration contract and token catalog. The central rule is simple:
reference the system instead of a raw literal. Prefer a design-system component
to a bespoke control and a semantic token to a color, spacing, or z-index
literal.

## Principles

### Built for agents

The package should be discoverable from typed APIs, semantic names, stories,
and documentation. Props describe intent (`variant="primary"`), not incidental
implementation (`background="green"`). Document why and when an option exists
so correct usage does not require reverse-engineering the source.

### Built for delightful experiences

Accessible interactions, visible focus, responsive behavior, and explicit
loading, empty, and error states are part of the component contract. Consistent
behavior across products is a user-facing quality, not only a maintenance
benefit.

### Built for maintainability

Shared decisions belong in components and tokens so one change can update every
consumer. Avoid copied CSS, private component variables, and one-off variants.
Keep accessibility and responsive behavior inside reusable primitives whenever
possible.

### Built to accelerate

The system should make the common path fast and correct. When a recurring need
is missing, close the gap in the package and document it instead of accumulating
parallel local implementations.

### Built as the final arbiter

Custom product UI should compose and extend the shared primitives. Divergence
is appropriate only when a documented product need cannot be represented by
the existing system.

## Package contract

Import the package stylesheet once at the application entry point:

```ts
import '@langchain/design-system/styles.css';
```

It includes fonts, light and dark token values, base rules, and the precompiled
utilities used by package components. Use
`@langchain/design-system/tokens.css` only for a variables-only integration. Do
not import both.

Applications that author the semantic Tailwind classes may additionally extend
the optional Tailwind v3 preset:

```js
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [require('@langchain/design-system/tailwind-preset')],
};
```

The preset intentionally does not define consumer `content` paths and does not
replace the stylesheet import. Consumers scan their own source; the package's
component classes are already precompiled. Theme switching uses `html.dark`.

## Tokens

Tokens flow in one direction:

```text
Primitives  ->  Semantics          ->  Components
--brand-400     --text-secondary       --button-primary-bg
raw scale       purpose alias          component-owned detail
```

- Primitive values live in `src/styles/tokens.css`. Do not use them in
  component or consumer code.
- Semantic tokens communicate purpose and adapt between light and dark themes.
  Prefer their Tailwind utilities, such as `bg-surface-level-2` and
  `text-secondary`.
- Component tokens are private implementation details. Use the owning
  component instead of applying its variables or classes directly.

```tsx
// Semantic utilities adapt to theme and compose with state variants.
<div className="rounded-lg bg-surface-level-2 text-secondary" />
```

Use `cn` from `@langchain/design-system/utils/cn` for conditional classes so
conflicting Tailwind utilities resolve predictably.

## Components

Prefer the root package barrel for components exported there:

```tsx
import { Button, Card, Text } from '@langchain/design-system';
```

Use a documented component subpath when a component is intentionally omitted
from the root barrel or when an isolated entry point helps keep a bundle
boundary explicit:

```tsx
import { ChartCard } from '@langchain/design-system/components/ChartCard';
import { TabGroup } from '@langchain/design-system/components/Tabs';
```

The root barrel at `src/components/index.ts` and the package export map are the
canonical inventory. Component stories live beside their implementations in
`src/components`; cross-component and foundation stories remain in
`src/stories`.

Construction rules:

- Use an existing component before recreating its styling or interaction.
- Prefer composition to large prop surfaces and boolean-driven branches.
- Keep product data fetching, navigation, permissions, and domain behavior in
  the consumer unless they are explicitly part of a generic component.
- Use named exports for new components.
- Update types, stories, and relevant documentation with behavior changes.

## Icons

Use server-safe Phosphor leaf modules for general-purpose glyphs:

```tsx
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';

<CheckIcon aria-hidden size={16} weight="regular" />;
```

Set `size` and `weight` explicitly. Use `regular` for outline glyphs, `fill`
only for intentionally filled states, and `bold` only for a deliberate heavier
visual weight. Do not import from the Phosphor package root. The optically
adjusted wrappers used by components are exported from
`@langchain/design-system/icons`. This package does not provide a separate
general-purpose icon catalog.

## Foundations

### Color

Choose color by meaning, not appearance. Use surface tokens for layout layers,
intent tokens for generic success/warning/error feedback, status tokens for
domain-specific states, text tokens for copy, and icon tokens for standalone
icons. Do not hardcode color literals or use primitive palette utilities. Pair
state color with text, shape, or an icon so color is never the only signal.

### Typography

Use `Text` for supported text roles and sizes. Inside interactive elements, use
`<Text as="span">` to preserve valid HTML. Sans is for UI and prose; mono is for
code, identifiers, and keyboard input.

### Spacing

Use the 4-point `space-*` scale from `src/utils/spacing.ts` through utilities
such as `gap-space-4` and `px-space-5`. Pick spacing by relationship: small gaps
bind a cluster, while larger gaps separate sections. Prefer flex or grid `gap`
over sibling margins.

### Radius and elevation

Use named `rounded-*` and `shadow-*` utilities. Choose the smallest radius and
lowest elevation that communicate the component boundary. Avoid recreating a
named shadow from arbitrary values.

### Motion

Motion should explain state change. Use `duration-fast`, `duration-normal`,
`duration-slow`, or `duration-slower`, and honor `prefers-reduced-motion`.

### Z-index

Do not hardcode stacking values. Import named constants from
`@langchain/design-system/utils/zIndices` or compose stacking contexts with the
exported z-index utilities.

## Quality bar

- Design loading, empty, ready, and error states together.
- Keep focus styles visible and preserve component roles and keyboard behavior.
- Minimize layout shift when content changes state.
- Validate destructive or permission-gated changes before presenting them as
  complete.
- Add or update stories for meaningful visual and interaction states.
- Run `pnpm check` before release-oriented changes; use `pnpm storybook` during
  component development.

## Source map

| Concern                          | Source                  |
| -------------------------------- | ----------------------- |
| Token catalog and CSS contract   | `docs/STYLES.md`        |
| Components and public barrel     | `src/components`        |
| Component stories                | `src/components`        |
| Primitive and semantic variables | `src/styles/tokens.css` |
| Base and component-support rules | `src/styles/base.css`   |
| Public Tailwind preset           | `tailwind.preset.cjs`   |
| Spacing scale                    | `src/utils/spacing.ts`  |
| Z-index constants                | `src/utils/zIndices.ts` |
| Class merge helper               | `src/utils/cn.tsx`      |
| Phosphor wrapper exports         | `src/icons`             |
