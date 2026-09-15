---
name: design-system
description: Build or change @langchain/design-system components, tokens, styles, icons, stories, package exports, or documentation in this repository. Use for package work, not product-specific UI in a consuming application.
---

# LangChain Design System

Maintain the shared, domain-free UI package. Read
[`docs/DESIGN.md`](../../../docs/DESIGN.md) before changing component behavior or
visual rules. Read [`docs/STYLES.md`](../../../docs/STYLES.md) when working with
tokens, CSS, Tailwind, spacing, or z-index.

## Find components and guidance

- Run `pnpm design-system search "<capability>"`, then
  `pnpm --silent design-system inspect <name> --json` for exact imports, source,
  and stories. Family names group exports; they are not always importable names.
- Keep capability keywords in the static component-level `tags` array of the
  colocated story. The CLI reads this metadata directly.
- Read long docs in bounded sections. For styling, read **Usage Rules** in
  `docs/STYLES.md` and the sections relevant to the change.
- Use `ThinkingState` for active AI work and `LoadingIndicator` for its decorative
  animation. Use `Spinner` for routine loading, `Skeleton` for known content
  shapes, and `ProgressBar` for measurable completion.
- Component sizes are family-specific. Check `src/utils/componentSizes.ts` and
  the component's actual supported tiers.

## Work from the package contract

- Search `src/components`, colocated stories, and `src/stories` before adding a
  new primitive. Extend or compose an existing component when it already owns
  the interaction.
- Keep product navigation, data fetching, permissions, analytics, and feature
  workflows in the consuming application.
- Preserve accessibility, responsive behavior, light and dark themes, loading,
  empty, error, and disabled states.
- Use named exports. Keep the root barrel lightweight and add an explicit
  component subpath when the dependency graph is intentionally isolated.
- Update the export map, types, story, tests, and docs when a public contract
  changes. `pnpm verify:package` checks the packaged surface.

## Styling and icons

- Use semantic tokens and the named spacing, radius, shadow, motion, and
  z-index scales. Do not add raw color, primitive-token, spacing, or stacking
  literals when the system already represents the intent.
- Merge conditional classes with `cn` from `src/utils/cn.tsx`.
- Import general-purpose icons from server-safe Phosphor leaf modules such as
  `@phosphor-icons/react/dist/ssr/Check`. Set size and weight explicitly; use
  `fill` only for intentionally filled states.
- Keep first-party brand geometry as local assets. Do not approximate it with a
  third-party icon.

## Verify changes

Use Storybook for component development and inspect meaningful interaction,
theme, and responsive states. Do not claim visual correctness from static
checks alone.

Run the checks proportional to the change:

```sh
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:package
```

Run `pnpm check` for release-oriented or broad package changes.
