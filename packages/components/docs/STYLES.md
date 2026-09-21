# STYLES.md — Design Token Reference

Tokens flow in one direction: **Primitives → Semantics → Components**.

- **Primitives** (`--neutral-50`, `--brand-400`, …) — raw scale values in `packages/tokens/src/tokens.css`. Never reference these in component code.
- **Semantic tokens** (`--bg-surface-level-1`, `--text-secondary`, …) — purpose-driven aliases that switch between light and dark mode automatically. Always use these.
- **Component tokens** (`--button-primary-bg`, …) — owned by a single component. Some live in `packages/components/src/styles/base.css` for Tailwind utility compatibility, but consuming code should treat them as private.

Tailwind maps semantic tokens to utility classes via `packages/components/tailwind.preset.cjs`. Always reach for the Tailwind class, not the CSS variable directly:

```tsx
// Good
<div className="bg-elevated shadow-md rounded-md" />

// Avoid — bypasses Tailwind and won't compose with responsive/state modifiers
<div style={{ backgroundColor: 'var(--bg-elevated)' }} />
```

## Package CSS contract

Import the all-in-one stylesheet once in the application entry point:

```ts
import '@langchain/macaw-components/styles.css';
```

It loads Inter and Fira Code, the light and dark token values, base and
component-support rules, and the precompiled utilities needed by the shipped
components. Its internal `utilities.css` import is generated during the package
build and is not a public entry point.

Use `@langchain/macaw-tokens/tokens.css` instead only when an application needs
the CSS custom properties without components, fonts, base rules, or utilities.
Do not import both CSS entries; `styles.css` already includes the tokens.

Applications that author semantic Tailwind classes should also use the optional
Tailwind v3 preset. The preset deliberately has no `content` paths and does not
replace the stylesheet import:

```js
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [require('@langchain/macaw-components/tailwind-preset')],
};
```

The precompiled stylesheet already covers classes used inside the package, so
consumers only need to scan their own source. Add or remove `html.dark` to
switch the token values and Tailwind dark variants together. A nested
`.dark[data-theme-scope]` region can also opt into dark tokens and button styles.

## Usage Rules

- Use semantic Tailwind classes from this file; do not hardcode colors or use primitive tokens in component code.
- Prefer the design-system component to recreating its styles or private tokens. `--button-*`, `.button-primary-*`, and `.button-secondary-*` are private to the Button implementation; use `Button` or `IconButton`.
- Use `text-*` for copy and `text-icon-*` for standalone icons.
- Merge conditional classes with `cn` from `@langchain/macaw-components/utils/cn`.

When editing `packages/components/tailwind.preset.cjs`, preserve `brand.DEFAULT` alongside the numeric
`brandPalette` entries so both `bg-brand` and existing `bg-brand-10` utilities
resolve. New component code still uses semantic classes.

## Component Sizes

`packages/components/src/utils/componentSizes.ts` defines the target outer-size families
and exact rem values for new or migrated components. Existing components may
still differ; check their source and `Foundations/Component Sizes` in Storybook.
The same tier name is meaningful only within its family.

| Family                                                                                                                                            | Tiers                   | Guidance                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| Visual elements — `VISUAL_ELEMENT_SIZES` (decorated `Icon`, `Avatar`, `Spinner`)                                                                  | `xxs`, `xs`, `sm`, `md` | Choose `md` for standard UI, smaller tiers for dense/inline UI; expose `xxs` only when needed.      |
| Controls — `CONTROL_SIZES` (`Button`, `IconButton`, `ButtonGroup`, `CopyButton`, `Input`, `CommandInput`, `Select`, `Typeahead`, `GroupedTabs`)   | `xs`, `sm`, `md`, `lg`  | Choose `md` for standard UI, `sm` for dense UI, `xs` for compact UI; retain `lg` for compatibility. |
| Selection controls — `SELECTION_CONTROL_SIZES` (`Checkbox`, `RadioButton`, `RadioCard`, `Switch`; `RadioGroupItem` and `Slider` remain intrinsic) | `sm`, `md`              | The tier controls indicator geometry, not labeled-row or card height.                               |
| Option rows — `OPTION_ROW_SIZES` (menu, select, and typeahead rows)                                                                               | `sm`, `md`              | Use `md` unless the menu is dense; multiline rows may grow.                                         |

- Family dimensions measure the **outer border box**. Use `box-sizing: border-box`
  and fit padding, borders, typography, icons, and loading indicators inside it.
- Visual elements and square selection indicators set width and height. Controls
  set exact height with intrinsic/container width; `Switch` and `Slider` own their widths.
- Selection indicators retain at least a 24px interactive hit area independent
  of their visual geometry. This hit area does not set row or card height.
- Option rows and multi-value `Typeahead` use `min-height` and grow with content.
  Plain `Icon`, textareas, labeled selection rows, and cards retain intrinsic total height.
- Keep component-owned text-label geometry (`Badge`, `Kbd`), intrinsic density
  APIs, typography, chart geometry, progress thickness, and brand assets outside
  the shared outer-box families.
- Derive supported tiers from the component's family mapping. Some components
  retain additional compatibility tiers; do not create a universal `Size` type.

- `Input`, `CommandInput`, and `Textarea` default to the `lg` compatibility tier.
  New consumers should choose `md` explicitly.

## Label Casing

Use **Title Case** for names of things: field labels, section headings, tabs,
column headers, menu items, and enumerated values (`Run Filters`, `Sampling
Rate`, `LLM-as-a-Judge`). Keep minor words lowercase in the middle: `a`, `an`,
`the`, `and`, `or`, `for`, `to`, `of`, `in`, `on`, `at`, `by`, `with`, `from`,
`as`.

Use **sentence case** for prose: button text, empty states, validation, tooltips,
helper text, and placeholders (`Load more`, `No evaluators found`, `Rule name is
required`). Behavioral options are prose even inside a picker. Keep sibling
labels consistent, and spell named controls exactly as they appear in the UI.

---

## Quick Reference

Use this table for new or meaningfully touched UI. Existing code still contains
deprecated aliases during migration; do not churn unrelated call sites just to
rename classes.

| Situation                                                 | Class                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Page / app shell background                               | `bg-surface-level-1`                                                                  |
| Card, panel, sidebar                                      | `bg-surface-level-2`                                                                  |
| Popover, tooltip, dropdown                                | `bg-elevated`                                                                         |
| Modal scrim / backdrop                                    | `bg-overlay` for new overlays; some current overlays still use opacity classes        |
| Non-Button brand fill                                     | `bg-brand`; use `<Button />` for CTAs                                                 |
| Tinted brand surface                                      | `bg-brand-subtle`                                                                     |
| Tinted brand gradient surface                             | `bg-brand-subtle-gradient`                                                            |
| Branded illustration backdrop                             | `bg-brand-illustration`                                                               |
| Purple accent surface                                     | `bg-purple`                                                                           |
| Success / Error / Warning tint                            | `bg-success` / `bg-error` / `bg-warning`                                              |
| Filled success / error / warning                          | `bg-success-strong` / `bg-error-strong` / `bg-warning-strong`                         |
| Control on-state                                          | `bg-control-active` for new control internals                                         |
| Selected list item                                        | `bg-selected` for new selection states                                                |
| Body text                                                 | `text-primary`                                                                        |
| Secondary / label text                                    | `text-secondary`                                                                      |
| Placeholder text                                          | `text-placeholder`                                                                    |
| Disabled text                                             | `text-disabled`                                                                       |
| Standalone default icon                                   | `text-icon-primary`; icons may inherit text color when paired with labels             |
| Default structural/control border                         | `border-default`; older controls often still use `border-secondary`                   |
| Focus border token                                        | `border-focus`; many current controls still use `border-brand` / `ring-brand`         |
| Error state border                                        | `border-error`                                                                        |
| Disabled border                                           | `border-disabled`                                                                     |
| Run/system status text                                    | `text-status-green` / `text-status-orange` / `text-status-yellow` / `text-status-red` |
| Low elevation for floating controls or interaction states | `shadow-sm`                                                                           |
| Dropdown / popover shadow                                 | `shadow-md`                                                                           |
| Modal / dialog shadow                                     | `shadow-lg`                                                                           |

---

## Banners

Use `Banner` from `@langchain/macaw-components/Banner` for page-level notices,
warnings, and announcements.

- State the important information in one short sentence. Add a specific `action`
  when the user has a next step.
- Keep `flush` banners to one line and avoid stacking banners on one page.

See `packages/components/src/components/Banner/Banner.stories.tsx` for examples.

---

## Cards

Use `Card` from `@langchain/macaw-components` for content surfaces. The component
owns the selected semantic surface, border, radius, and padding; consumers own the
content and internal layout.

## Chart Cards

Use `ChartCard` from `@langchain/macaw-components/ChartCard` for consistent
dashboard visualization shells.

- Consumers own charts, legends, data interactions, and empty states. Use the
  `state` prop for standard loading and known data-fetching error states; it
  does not catch chart-rendering exceptions.
- Set `skeletonVariant` to `bar`, `line`, `donut`, `metric`, or `sparkline` to match the chart
  shape while loading. Use `ChartCardSkeleton` directly for a chart placeholder
  outside a card.
- Loading and error states have a baseline minimum height. Set an explicit card
  height when the state must exactly match the ready chart and avoid layout
  shift.
- Set `isMovable` and pass drag listeners through `dragHandleProps` to enable
  reordering; `variant="full-width"` hides the move handle.
- Use `expandButtonProps` and `menuItems` for optional, feature-owned actions.

## Top Lists

Use `TopList` from `@langchain/macaw-components/TopList` for ranked top-K
categorical data. It composes the shared `BarChart` into horizontal rows and
owns sorting, row limits, truncated category labels, formatted end labels, and
accessible item interactions. Use `BarChart` directly for grouped, stacked, or
vertical bars that are not a ranked list.

Feature adapters still own fetching, domain-specific “Other” aggregation,
tooltips, navigation, loading, error, and empty states. Pass a custom comparator
when a semantic row such as “Other” must stay last regardless of value.

---

## Chart Tooltips

When a chart needs hover or focus details, compose its content with
`ChartTooltip`, `ChartTooltipHeader`, `ChartTooltipBody`, and
`ChartTooltipRow` from `@langchain/macaw-components`. Do not recreate the elevated surface,
spacing, typography, markers, dividers, or numeric alignment in a feature-local
tooltip component.

The chart library still owns interaction and positioning. For Visx charts, use
its tooltip state and collision-aware positioning utilities, such as
`useTooltip` with `TooltipWithBounds` or `TooltipInPortal`, and render
`ChartTooltip` inside the positioned layer. The generic design-system `Tooltip`
is intended for trigger-based explanatory copy, not chart coordinates.

- Use `ChartTooltipHeader` for the hovered date, bucket, experiment, or other
  primary context.
- Wrap multiple rows in `ChartTooltipBody`.
- Use one `ChartTooltipRow` per series and pass `markerColor` when the row maps
  to a chart color.
- Set `highlighted` on the row matching the currently hovered series.
- Use `variant="total"` for an aggregate row rather than styling its divider and
  typography locally.
- Feature-specific charts may compose richer content around these primitives,
  but shared tooltip structure and styling should remain in the design system.

See `packages/components/src/components/ChartTooltip/ChartTooltip.stories.tsx` for complete examples.

---

## Token Catalog

### Surface — `bg-*`

Use for background fills of layout regions.

Use the lowest level that creates enough separation. Avoid skipping levels unless matching an existing nested table or grouping pattern.

| Class                      | When to use                                      |
| -------------------------- | ------------------------------------------------ |
| `bg-surface-level-1`       | Root page / app shell background                 |
| `bg-surface-level-1-hover` | Hover state on level 1 surface                   |
| `bg-surface-level-2`       | Cards, panels, sidebars, table header groups     |
| `bg-surface-level-2-hover` | Hover state on level 2 surface                   |
| `bg-surface-level-3`       | Nested table headers or grouped inner containers |
| `bg-surface-level-4`       | Deepest neutral fill for additional separation   |
| `bg-disabled`              | Disabled input or control fill                   |
| `bg-elevated`              | Popovers, tooltips, dropdowns, context menus     |
| `bg-elevated-hover`        | Hover state inside an elevated surface           |
| `bg-elevated-selected`     | Selected item inside an elevated surface         |
| `bg-overlay`               | Modal backdrop / scrim                           |

### Brand — `bg-brand-*`

| Class                      | When to use                                               |
| -------------------------- | --------------------------------------------------------- |
| `bg-brand`                 | Primary CTA fill, strong brand element                    |
| `bg-brand-hover`           | Hover on a brand-filled element                           |
| `bg-brand-subtle`          | Tinted brand surface (selected nav item, brand tag)       |
| `bg-brand-subtle-hover`    | Hover on brand-subtle                                     |
| `bg-brand-subtle-gradient` | Tinted brand gradient surface, currently for info banners |
| `bg-brand-illustration`    | Backdrop for branded illustrations or media               |
| `bg-brand-muted`           | Faintest brand tint (highlight in reading views)          |
| `bg-purple`                | Purple-tinted accent surface                              |

### Intent — `bg-{intent}-*`

| Class               | When to use                             |
| ------------------- | --------------------------------------- |
| `bg-success`        | Success banner / badge background       |
| `bg-success-subtle` | Faint success tint                      |
| `bg-success-strong` | Filled success indicator (icon bg, dot) |
| `bg-error`          | Error banner / invalid field background |
| `bg-error-subtle`   | Faint error tint                        |
| `bg-error-strong`   | Filled error indicator                  |
| `bg-warning`        | Warning banner background               |
| `bg-warning-subtle` | Faint warning tint                      |
| `bg-warning-strong` | Filled warning indicator                |

### Control — `bg-control-*` / `text-control-*`

Used internally by Checkbox, RadioButton, Switch, and Slider. Prefer those components over applying these tokens directly.

| Class                            | When to use                                  |
| -------------------------------- | -------------------------------------------- |
| `bg-control-active`              | Checked / on fill                            |
| `bg-control-active-hover`        | Hover while checked / on                     |
| `bg-control-thumb`               | Knob or handle surface                       |
| `bg-control-disabled`            | Disabled control fill                        |
| `text-control-active-foreground` | Checkmark or glyph on an active control fill |

### Selected — `bg-selected-*`

| Class               | When to use                           |
| ------------------- | ------------------------------------- |
| `bg-selected`       | Selected row / item in a list or tree |
| `bg-selected-hover` | Hover state on the selected item      |

---

### Border — `border-*`

| Class                 | When to use                              |
| --------------------- | ---------------------------------------- |
| `border-default`      | Default input, card, or container border |
| `border-subtle`       | Subtle divider                           |
| `border-muted`        | Very subtle divider                      |
| `border-faint`        | Hairline separator                       |
| `border-strong`       | High-contrast border                     |
| `border-disabled`     | Disabled input border                    |
| `border-focus`        | Focus ring — apply on `:focus-visible`   |
| `border-error`        | Error state border                       |
| `border-error-strong` | Strong error border (e.g., toast)        |
| `border-brand`        | Brand-accented border                    |
| `border-brand-strong` | Strong brand border                      |
| `border-brand-subtle` | Faint brand border                       |
| `border-warning`      | Warning state border                     |
| `border-success`      | Success state border                     |
| `border-purple`       | Purple-accented border                   |

### Status Borders — `border-status-*`

Use status border tokens for run-state and system-state accents. Do not use them for generic form validation; use intent tokens for that.

| Class                  | When to use                                  |
| ---------------------- | -------------------------------------------- |
| `border-status-green`  | Successful run or positive status border     |
| `border-status-orange` | Orange run or intermediate status border     |
| `border-status-yellow` | Yellow run or warning-adjacent status border |
| `border-status-red`    | Failed run or negative status border         |

---

### Text — `text-*`

| Class                    | When to use                                       |
| ------------------------ | ------------------------------------------------- |
| `text-primary`           | Body copy, default text                           |
| `text-secondary`         | Labels, supporting text                           |
| `text-secondary-hover`   | Hover state for secondary text                    |
| `text-tertiary`          | Helper text                                       |
| `text-tertiary-hover`    | Hover state for tertiary text                     |
| `text-quaternary`        | Very subtle annotations                           |
| `text-disabled`          | Disabled text                                     |
| `text-placeholder`       | Input placeholder text                            |
| `text-error-primary`     | High-emphasis error message                       |
| `text-error-secondary`   | Inline error message                              |
| `text-error-tertiary`    | Lower-emphasis error message                      |
| `text-warning-primary`   | High-emphasis warning message                     |
| `text-warning-secondary` | Inline warning message                            |
| `text-warning-tertiary`  | Lower-emphasis warning message                    |
| `text-success-primary`   | High-emphasis success message                     |
| `text-success-secondary` | Inline success message                            |
| `text-success-tertiary`  | Lower-emphasis success message                    |
| `text-brand-primary`     | Brand-colored heading or link                     |
| `text-brand-secondary`   | Secondary brand text                              |
| `text-brand-tertiary`    | Tertiary brand text                               |
| `text-brand-disabled`    | Disabled brand text                               |
| `text-brand-on-fill`     | Text or icon on a brand-filled non-Button surface |
| `text-purple`            | Purple-accented text                              |
| `text-link`              | Hyperlink text                                    |
| `text-link-hover`        | Hover state for link text                         |

Intent text suffixes express emphasis, not severity: `primary` for prominent
messages, `secondary` for default inline copy, and `tertiary` for supporting detail.
Stay within the chosen `text-{error,warning,success}-*` scale.

### Status Text — `text-status-*`

Use status text tokens for run-state and system-state copy. For generic success, warning, and error messages, use `text-success-secondary`, `text-warning-secondary`, and `text-error-secondary`.

| Class                | When to use                                |
| -------------------- | ------------------------------------------ |
| `text-status-green`  | Successful run or positive status text     |
| `text-status-orange` | Orange run or intermediate status text     |
| `text-status-yellow` | Yellow run or warning-adjacent status text |
| `text-status-red`    | Failed run or negative status text         |

### Data visualization — `--chart-*`

SVG `fill` and `stroke` props cannot consume Tailwind classes, so chart code is
the documented exception to the Tailwind-only rule: import semantic values from
`@langchain/macaw-components/utils/chartColors`. Do not reference raw `--viz-*` scales or
write hex, RGB, or HSL colors in chart code.

| Export                                                           | When to use                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `CHART_SINGLE_FILL_COLOR`                                        | A single-series bar or other ordinary filled chart                                                                                   |
| `CHART_CATEGORICAL_LINE_COLORS` / `getCategoricalLineChartColor` | Unrelated line series; stronger colors keep thin strokes legible                                                                     |
| `CHART_CATEGORICAL_FILL_COLORS` / `getCategoricalFillChartColor` | Bars, areas, donuts, waterfalls, and other filled marks; hue-matched and softer than the line set, with lower luminance in dark mode |
| `CHART_COMPARISON_COLORS`                                        | Dataset and Experiment comparison charts; paired shades of blue, orange, magenta, acid, and purple                                   |
| `CHART_OTHER_COLOR`                                              | Aggregated “Other” data only                                                                                                         |
| `CHART_STATUS_COLORS`                                            | Positive, warning, or negative data with that real semantic meaning; `negativeSubtle` is for low-emphasis negative regions           |
| `CHART_STATUS_FILL_COLORS`                                       | Positive, warning, or negative bars, areas, donuts, and other large filled marks; lower luminance in dark mode                       |
| `CHART_BREAKDOWN_COLORS`                                         | Input, output, and other token/cost breakdowns                                                                                       |

Assignment rules:

- Use the line palette only for line strokes. Use the fill palette for every other categorical mark, including bars, areas, donuts, waterfalls, table markers, and run-type fills.
- Use either palette in index order so adjacent series receive deliberately distant hues. Use `getLineChartColorForKey` or `getFillChartColorForKey` only when a stable standalone assignment is needed without the full series list.
- Use solid fill colors for stacked bars and areas; gradients reduce color consistency between marks and legends.
- Use `CHART_STATUS_FILL_COLORS` instead of `CHART_STATUS_COLORS` when semantic status occupies a large filled area.
- Chart tokens are theme-responsive: define light aliases in `:root` and dark overrides in `html.dark`; never cache their resolved literal values across theme changes.
- Reserve neutral gray for “Other,” missing, or disabled data.
- Reserve positive, warning, and negative colors for semantic status. Do not assign them based on series position.
- Dataset and Experiment comparison charts use `CHART_COMPARISON_COLORS`, ordered as two shades per hue with consistent separation between each pair.
- Twenty categorical tokens support current high-cardinality usage charts, but prefer grouping, filtering, or small multiples once a chart becomes difficult to read.

### Table heatmaps — `--table-heatmap-*`

Use `bg-table-heatmap-{negative,positive}-1..5` for diverging Dataset and
Experiment table cells, with `bg-table-heatmap-neutral` at the midpoint. These
tokens use muted semantic intent backgrounds so text remains comfortable to
read across large cell areas; they are not chart-series colors.

### Icon — `text-icon-*` and `bg-icon-*`

Icons have a separate color namespace so icon and label colors can diverge independently. Apply to `<Icon>` wrappers or SVG elements directly.

Source general-purpose icon glyphs from server-safe Phosphor leaf modules such as `@phosphor-icons/react/dist/ssr/Check`; do not import from the package root or the legacy local icon tree. Use `<IconButton>` for interactive icons and `<Icon>` from `@langchain/macaw-components/Icon` when standardized sizing, semantic treatments, or tooltip labels are needed. Direct Phosphor glyphs must set `size` and `weight` explicitly: regular for outline glyphs, fill for intentionally filled states, and bold only where an established direct-rendered glyph must preserve a 2px visual weight.

| Class                      | When to use                           |
| -------------------------- | ------------------------------------- |
| `text-icon-primary`        | Default icon                          |
| `text-icon-secondary`      | Subdued icon                          |
| `text-icon-tertiary`       | Very subdued icon                     |
| `text-icon-disabled`       | Disabled icon                         |
| `text-icon-brand`          | Brand-colored icon                    |
| `text-icon-brand-fill`     | Foreground color for brand-mark icons |
| `bg-icon-brand-background` | Background color for brand-mark icons |
| `text-icon-error`          | Error icon                            |
| `text-icon-success`        | Success icon                          |
| `text-icon-warning`        | Warning icon                          |

---

### Shadow — `shadow-*`

| Class       | When to use                                               |
| ----------- | --------------------------------------------------------- |
| `shadow-sm` | Low elevation for floating controls or interaction states |
| `shadow-md` | Dropdown, popover shadow                                  |
| `shadow-lg` | Modal / dialog shadow                                     |

Shadows adapt to dark mode. Use `var(--shadow-color-subtle)` only when no named
shadow can express the required layer.

---

### Radius — `rounded-*`

| Class          | Value  | When to use                                |
| -------------- | ------ | ------------------------------------------ |
| `rounded-xs`   | 3px    | Compact labels, tags, and tag-style badges |
| `rounded-sm`   | 4px    | Small inputs and icon buttons              |
| `rounded-md`   | 6px    | Default buttons and most form controls     |
| `rounded-lg`   | 8px    | Cards, dialogs, and larger content panels  |
| `rounded-xl`   | 12px   | Sheets and large overlay surfaces          |
| `rounded-full` | 9999px | Pills, default badges, and status dots     |

Prefer these named values over Tailwind's built-in `rounded-*` scale (e.g. `rounded-lg` from Tailwind defaults to `8px` regardless of our design scale).

---

### Motion — `duration-*`

Use these instead of Tailwind's built-in `duration-{ms}` scale.

| Duration class    | Value | When to use                                 |
| ----------------- | ----- | ------------------------------------------- |
| `duration-fast`   | 100ms | Micro-interactions (toggle, checkbox check) |
| `duration-normal` | 200ms | Default hover / focus transitions           |
| `duration-slow`   | 300ms | larger layout shifts                        |
| `duration-slower` | 500ms | Entrance animations                         |

---

### Spacing — `space-*`

4-point scale (`space-1` … `space-9`), the single source of truth is
`packages/components/src/utils/spacing.ts`. Use it through Tailwind property prefixes:
`gap-space-4`, `px-space-6`, `mt-space-2`, `p-space-5`, etc. Do not use
off-scale spacing — `custom/require-spacing-tokens` suggests exact token
replacements for raw Tailwind values that map to the scale, and
`custom/no-off-scale-spacing` warns on values outside it.

| Step      | Value |
| --------- | ----- |
| `space-1` | 4px   |
| `space-2` | 8px   |
| `space-3` | 12px  |
| `space-4` | 16px  |
| `space-5` | 24px  |
| `space-6` | 32px  |
| `space-7` | 40px  |
| `space-8` | 48px  |
| `space-9` | 64px  |

#### Relationship defaults

Choose spacing by relationship, not by eye. Small gaps bind one cluster; larger
gaps separate regions. Modals are one step denser than pages.

| Relationship                                                    | Utility                     |
| --------------------------------------------------------------- | --------------------------- |
| Title, label, or control ↔ its description, field, or hint      | `gap-space-1`               |
| Inline icon ↔ label; action ↔ adjacent action                   | `gap-space-2`               |
| Section header ↔ body                                           | `gap-space-3`               |
| Related fields/cards; header copy ↔ actions/tabs                | `gap-space-4`               |
| Modal header ↔ body ↔ footer                                    | `gap-space-5`               |
| Page section ↔ section; page header/form body ↔ content/actions | `gap-space-6`               |
| Default page horizontal/top inset                               | `px-space-5` / `pt-space-5` |
| Card, panel, or modal padding                                   | `p-space-5`                 |
| List or table row padding                                       | `px-space-5 py-space-4`     |

---

## Deprecated Aliases

These aliases remain for compatibility; do not use them in new code.

| Deprecated                 | Use instead                |
| -------------------------- | -------------------------- |
| `bg-popover-urgent`        | `bg-elevated`              |
| `bg-primary`               | `bg-surface-level-1`       |
| `bg-primary-hover`         | `bg-surface-level-1-hover` |
| `bg-primary_hover`         | `bg-surface-level-1-hover` |
| `bg-secondary`             | `bg-surface-level-2`       |
| `bg-secondary-hover`       | `bg-surface-level-2-hover` |
| `bg-secondary_hover`       | `bg-surface-level-2-hover` |
| `bg-tertiary`              | `bg-surface-level-3`       |
| `bg-quaternary`            | `bg-surface-level-4`       |
| `bg-brand-primary`         | `bg-brand`                 |
| `bg-brand-primary-hover`   | `bg-brand-hover`           |
| `bg-brand-secondary`       | `bg-brand-subtle`          |
| `bg-brand-secondary-hover` | `bg-brand-subtle-hover`    |
| `bg-brand-tertiary`        | `bg-brand-muted`           |
| `bg-success-primary`       | `bg-success`               |
| `bg-success-secondary`     | `bg-success-subtle`        |
| `bg-error-primary`         | `bg-error`                 |
| `bg-error-secondary`       | `bg-error-subtle`          |
| `bg-warning-primary`       | `bg-warning`               |
| `bg-warning-secondary`     | `bg-warning-subtle`        |
| `border-primary`           | `border-default`           |
| `border-secondary`         | `border-subtle`            |
| `border-tertiary`          | `border-muted`             |
| `border-quaternary`        | `border-faint`             |

Use the replacement table only for affected classes; do not churn unrelated call sites.

---

## Progress indicators

- Use `LinearProgress` for indeterminate loading and `ProgressBar` for a known
  completion, quota, or usage value.
- `ProgressBar` represents one value. Keep segmented and categorical displays in
  feature components.
- Use `sm` in dense tables, `md` by default, and `lg` for emphasis.
- Choose `color` by meaning; thresholds remain feature-owned.
- `labelPosition` is `bottom` by default or `top` when the value should precede
  the bar. Compose richer labels outside the component.
- Provide `aria-label` or `aria-labelledby`. Pair semantic color with visible or
  accessible text.

---

## Validation

Run `pnpm lint` and `pnpm format:check`. Check the affected stories in both themes
and at narrow widths. The usage rules above also apply where automated lint does
not enforce them.
