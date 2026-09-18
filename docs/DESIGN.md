# Macaw Design System

Use existing components and semantic tokens. Compose or extend components to support new behavior.

Read the relevant [`STYLES.md`](./STYLES.md) sections for token choices, values, and usage rules.

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

## Components

From this repository, use `pnpm design-system search <capability>` to discover components and `pnpm --silent design-system inspect <name> --json` for imports, source, and stories. Root-exported components such as `Button` and `Text` can be imported from `@langchain/design-system`. Components omitted from the root require direct imports, such as `TabGroup` and `TabList` from `@langchain/design-system/components/Tabs`. The CLI returns direct paths even when a root import is available.

Keep capability keywords in the static component-level `tags` array of the story beside the component in `src/components/`. The CLI reads them directly, and Storybook exposes them as sidebar filters. Built-in tags such as `autodocs` are excluded from CLI search.

Use existing components for their interaction contracts, not just their appearance. They own focus handling, keyboard behavior, accessible names, loading states, and responsive details that a styled native element may miss.

- Use `Button` for actions and `Link` for navigation.
- Use `IconButton` for an icon-only action and provide its `label`.
- Use `Input` or `Textarea` for text entry, `Select` for a known option list, and `Typeahead` when the user types to search or create options.
- Use `RadioGroup` for a short visible choice set and `RadioCard` when an option needs supporting content.
- Use `Dialog` for a short blocking decision and `Pane` for substantial editing or detail work.
- Use the Tabs family for tabbed navigation, with routing handled by the app, and `GroupedTabs` for a local view switch.
- Use `Banner` for persistent regional information, `useToast().createToast(...)` for the result of an action, and field hint/error APIs for validation.
- Use `ThinkingState` for active AI work (generation, reasoning, or tool use); name the work and show elapsed time only for longer waits.
- Use `LoadingIndicator` for the AI animation alone; announce status on its surrounding control or region.
- Use `Spinner` for routine saves, fetches, or refreshes, even within AI screens (e.g. fetching chat history).
- Use `Skeleton` for known content shapes, `LinearProgress` for regional loading, and `ProgressBar` for measurable completion.

Custom components should compose primitives and keep feature data, permissions, navigation, and domain behavior in the feature. Prefer a few composable parts over large prop surfaces and boolean-driven branches. Use named exports for new components, and update types, stories, and relevant guidance when behavior changes.

## Tokens

Tokens flow in one direction:

```text
Primitives  ->  Semantics          ->  Components
--brand-400     --text-secondary       --button-primary-bg
raw scale       purpose alias          private detail
```

Component code uses semantic tokens through Tailwind utilities. Do not use primitive variables, component-owned variables, primitive palette utilities, or color literals. Use `cn` from `@langchain/design-system/utils/cn` for conditional classes.

```tsx
<div className="rounded-lg bg-surface-level-2 text-secondary" />
```

Choose color by meaning:

- `bg-surface-level-1..4` expresses nesting. Use the lowest level that creates enough separation.
- `bg-elevated*` is for popovers, tooltips, dropdowns, and other floating layers.
- Success, warning, and error tokens describe general feedback and validation.
- Status tokens describe run or system state, not generic validation.
- `text-*` is for copy; `text-icon-*` is for standalone icons.
- Pair state color with text, shape, or an icon.

Chart SVG `fill` and `stroke` are the exception to Tailwind-only color usage. Import semantic values from `@langchain/design-system/utils/chartColors`; do not use raw visualization variables or literals.

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

## Typography and labels

Use `Text` for supported typography roles and let its variant own size, line height, and element choice. Use `as="span"` inside buttons and links, and `as="label"` with `htmlFor` when labelling a field. Sans is for UI and prose; mono is for code, keys, and IDs.

Use Title Case for names of things: field labels, section headings, tabs, columns, menu items, and enumerated values. Use sentence case for prose: buttons, empty states, validation, tooltips, helper text, and placeholders. Sibling labels should follow the same convention.

## Spacing, shape, and motion

Use the 4-point `space-*` scale through utilities such as `gap-space-4` and `px-space-5`. Pick spacing by relationship: small gaps bind one cluster; larger gaps separate sections. Prefer flex or grid `gap` over sibling margins.

Use named `rounded-*`, `shadow-*`, and duration utilities instead of recreating their values. Motion should explain a state change and respect `prefers-reduced-motion`. Use named values from `src/utils/zIndices.ts` or `useZIndex` instead of numeric z-indexes.

Component size names are family-specific. Use the tiers supported by the component; do not infer a universal size scale. `src/utils/componentSizes.ts` is the source of truth for shared outer-size families.

## Quality bar

Treat loading, empty, ready, error, disabled, and narrow-width behavior as part of the feature. Minimize layout shift. Keep focus styles visible and preserve keyboard behavior. Validate destructive or permission-gated changes before presenting them as complete. Error copy should state what happened or what the user must fix.

For visible changes, run the affected page or Storybook story and inspect the relevant interaction, edge states, and dark mode. Lint and unit tests do not establish visual correctness.

## Source map

| Concern                          | Source                                         |
| -------------------------------- | ---------------------------------------------- |
| Token names and values           | `docs/STYLES.md`                               |
| Components and public barrel     | `src/components`                               |
| Component stories                | `src/components/<Family>/<Family>.stories.tsx` |
| Foundation and overview stories  | `src/stories`                                  |
| Primitive and semantic variables | `src/styles/tokens.css`                        |
| Tailwind mapping                 | `tailwind.preset.cjs`                          |
| Component size families          | `src/utils/componentSizes.ts`                  |
| Spacing scale                    | `src/utils/spacing.ts`                         |
| Z-index values                   | `src/utils/zIndices.ts`                        |
| Class merge helper               | `src/utils/cn.tsx`                             |
