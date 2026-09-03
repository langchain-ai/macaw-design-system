# STYLES.md — Design Token Reference

Tokens flow in one direction: **Primitives → Semantics → Components**.

- **Primitives** (`--neutral-50`, `--brand-400`, …) — raw scale values in `src/styles/tokens.css`. Never reference these in component code.
- **Semantic tokens** (`--bg-surface-level-1`, `--text-secondary`, …) — purpose-driven aliases that switch between light and dark mode automatically. Always use these.
- **Component tokens** (`--button-primary-bg`, …) — owned by a single component. Some live in `src/styles/base.css` for Tailwind utility compatibility, but consuming code should treat them as private.

Tailwind maps semantic tokens to utility classes through `tailwind.preset.cjs`. Always reach for the Tailwind class, not the CSS variable directly:

```tsx
// Good
<div className="bg-elevated shadow-md rounded-md" />

// Avoid — bypasses Tailwind and won't compose with responsive/state modifiers
<div style={{ backgroundColor: 'var(--bg-elevated)' }} />
```

## Package CSS contract

Import the all-in-one stylesheet once in the application entry point:

```ts
import '@langchain/design-system/styles.css';
```

It loads Inter and Fira Code, the light and dark token values, base and
component-support rules, and the precompiled utilities needed by the shipped
components. Its internal `utilities.css` import is generated during the package
build and is not a public entry point.

Use `@langchain/design-system/tokens.css` instead only when an application needs
the CSS custom properties without components, fonts, base rules, or utilities.
Do not import both CSS entries; `styles.css` already includes the tokens.

Applications that author semantic Tailwind classes should also use the optional
Tailwind v3 preset. The preset deliberately has no `content` paths and does not
replace the stylesheet import:

```js
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [require('@langchain/design-system/tailwind-preset')],
};
```

The precompiled stylesheet already covers classes used inside the package, so
consumers only need to scan their own source. Add or remove `html.dark` to
switch the token values and Tailwind dark variants together.

## Agent Rules

- Use semantic Tailwind classes from this file for UI code; do not hardcode hex/HSL/RGB values, primitive CSS variables, or primitive palette utilities in component code.
- Use the design-system component first (`Button`, `IconButton`, `Badge`, `Input`, etc.); do not rebuild component styling with private tokens.
- Treat Button tokens as private: `--button-*`, `.button-primary-*`, and `.button-secondary-*` are only for the design-system Button implementation.
- Use `text-*` tokens for readable copy and `text-icon-*` tokens for standalone icons. Component tokens are implementation details unless explicitly documented as compatibility aliases.
- Use `cn` from `@langchain/design-system/utils/cn` for conditional classes so token conflicts merge predictably.
- Preserve Tailwind object shapes where semantic names overlap primitive palettes: `brand.DEFAULT` plus numeric `brandPalette` keeps both `bg-brand` and `bg-brand-10` working.

---

## Label Casing

Use **Title Case** for the names of things — field labels, section headings, tab
names, column headers, menu items, and enumerated values shown in a column or
picker (`Account Settings`, `Sampling Rate`, `Data Retention`, `API Keys`). Minor
words stay lowercase in the middle of a label but are capitalized when they lead
or end it, so `Apply to Past Items` keeps `to` lowercase while `Import From`
capitalizes the trailing `From`. The minor words
are `a`, `an`, `the`, `and`, `or`, `for`, `to`, `of`, `in`, `on`, `at`, `by`,
`with`, `from`, `as`.

Use **sentence case** for anything that reads as prose — button text, empty
states, error and validation messages, tooltips, helper text, and placeholders
(`Load more`, `No results found`, `Name is required`).

Option text that states a behavior rather than naming one is prose, even inside
a radio group or checkbox list: `Only apply to new items` and `Apply to existing
items from date...` stay sentence case, while the setting they sit under
(`Usage Limit`, `Automatic Updates`) is Title Case.

Peer items must agree. A group of sibling labels — the actions in one form, the
values of one table column, the toggles in one section — that mixes both styles
is a bug regardless of which one you would have picked. Match the surrounding
group; when a sentence names a UI control, spell the control exactly as it is
labelled.

---

## Quick Reference

Use this table for new or meaningfully touched UI. Existing code still contains
deprecated aliases during migration; do not churn unrelated call sites just to
rename classes.

| Situation                                                 | Class                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Root surface                                              | `bg-surface-level-1`                                                                  |
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
| Domain status text                                        | `text-status-green` / `text-status-orange` / `text-status-yellow` / `text-status-red` |
| Low elevation for floating controls or interaction states | `shadow-sm`                                                                           |
| Dropdown / popover shadow                                 | `shadow-md`                                                                           |
| Modal / dialog shadow                                     | `shadow-lg`                                                                           |

---

## Banners

Use `Banner` from `@langchain/design-system/components/Banner` for page-level notices,
warnings, and announcements.

- Keep banner copy concise and action-oriented. State the important information
  in one short sentence and provide a clear, specific CTA through the `action`
  prop when the user has a next step.
- Full-page (`flush`) banners should especially maintain short copy to ensure it's shown as single-line.
- Avoid spamming/stacking multiple banners in a single page. Reserve banner use for important actions or announcements with real action items.

See `src/components/Banner/Banner.stories.tsx` for examples.

---

## Cards

Use `Card` from `@langchain/design-system` for content surfaces. The component
owns the selected semantic surface, border, radius, and padding; consumers own the
content and internal layout.

## Chart Cards

Use `ChartCard` from `@langchain/design-system/components/ChartCard` for consistent
dashboard visualization shells.

- Consumers own charts, legends, data interactions, and empty states. Use the
  `state` prop for standard loading and known data-fetching error states; it
  does not catch chart-rendering exceptions.
- Loading and error states have a baseline minimum height. Set an explicit card
  height when the state must exactly match the ready chart and avoid layout
  shift.
- Set `isMovable` and pass drag listeners through `dragHandleProps` to enable
  reordering; `variant="full-width"` hides the move handle.
- Use `expandButtonProps` and `menuItems` for optional, feature-owned actions.

## Top Lists

Use `TopList` from `@langchain/design-system/components/TopList` for ranked top-K
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
`ChartTooltipRow` from `@langchain/design-system`. Do not recreate the elevated surface,
spacing, typography, markers, dividers, or numeric alignment in a feature-local
tooltip component.

The chart library still owns interaction and positioning. For Visx charts, use
its tooltip state and collision-aware positioning utilities, such as
`useTooltip` with `TooltipWithBounds` or `TooltipInPortal`, and render
`ChartTooltip` inside the positioned layer. The generic design-system `Tooltip`
is intended for trigger-based explanatory copy, not chart coordinates.

- Use `ChartTooltipHeader` for the hovered date, bucket, category, or other
  primary context.
- Wrap multiple rows in `ChartTooltipBody`.
- Use one `ChartTooltipRow` per series and pass `markerColor` when the row maps
  to a chart color.
- Set `highlighted` on the row matching the currently hovered series.
- Use `variant="total"` for an aggregate row rather than styling its divider and
  typography locally.
- Feature-specific charts may compose richer content around these primitives,
  but shared tooltip structure and styling should remain in the design system.

See `src/components/ChartTooltip/ChartTooltip.stories.tsx` for complete examples.

---

## Token Catalog

### Surface — `bg-*`

Use for background fills of layout regions.

Use the lowest level that creates enough separation. Avoid skipping levels unless matching an existing nested table or grouping pattern.

| Class                      | When to use                                      |
| -------------------------- | ------------------------------------------------ |
| `bg-surface-level-1`       | Root application surface                         |
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

Use status border tokens for domain-specific state accents. Do not use them for
generic form validation; use intent tokens for that.

| Class                  | When to use                          |
| ---------------------- | ------------------------------------ |
| `border-status-green`  | Successful or positive status border |
| `border-status-orange` | Intermediate status border           |
| `border-status-yellow` | Warning-adjacent status border       |
| `border-status-red`    | Failed or negative status border     |

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

#### Intent text — error / warning / success

The `text-{error,warning,success}-{primary,secondary,tertiary}` tokens encode emphasis, not
distinct meanings. Pick the level by how prominent the message should be within
its surrounding text, then stay on that intent's scale.

| Level     | Class                                                                        | When to use                                                                              |
| --------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Primary   | `text-error-primary` / `text-warning-primary` / `text-success-primary`       | High-emphasis intent copy                                                                |
| Secondary | `text-error-secondary` / `text-warning-secondary` / `text-success-secondary` | Default intent copy alongside other text                                                 |
| Tertiary  | `text-error-tertiary` / `text-warning-tertiary` / `text-success-tertiary`    | Lower-emphasis intent copy such as secondary annotations, captions, or supporting detail |

For domain-specific status copy, use the `text-status-*` tokens below instead.

### Status Text — `text-status-*`

Use status text tokens for domain-specific state copy. For generic success,
warning, and error messages, use `text-success-secondary`,
`text-warning-secondary`, and `text-error-secondary`.

| Class                | When to use                        |
| -------------------- | ---------------------------------- |
| `text-status-green`  | Successful or positive status text |
| `text-status-orange` | Intermediate status text           |
| `text-status-yellow` | Warning-adjacent status text       |
| `text-status-red`    | Failed or negative status text     |

### Data visualization — `--chart-*`

SVG `fill` and `stroke` props cannot consume Tailwind classes, so chart code is
the documented exception to the Tailwind-only rule: import semantic values from
`@langchain/design-system/utils/chartColors`. Do not reference raw `--viz-*` scales or
write hex, RGB, or HSL colors in chart code.

| Export                                                           | When to use                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `CHART_SINGLE_FILL_COLOR`                                        | A single-series bar or other ordinary filled chart                                                                                   |
| `CHART_CATEGORICAL_LINE_COLORS` / `getCategoricalLineChartColor` | Unrelated line series; stronger colors keep thin strokes legible                                                                     |
| `CHART_CATEGORICAL_FILL_COLORS` / `getCategoricalFillChartColor` | Bars, areas, donuts, waterfalls, and other filled marks; hue-matched and softer than the line set, with lower luminance in dark mode |
| `CHART_COMPARISON_COLORS`                                        | Paired comparison series; paired shades of blue, orange, magenta, acid, and purple                                                   |
| `CHART_OTHER_COLOR`                                              | Aggregated “Other” data only                                                                                                         |
| `CHART_STATUS_COLORS`                                            | Positive, warning, or negative data with that real semantic meaning; `negativeSubtle` is for low-emphasis negative regions           |
| `CHART_STATUS_FILL_COLORS`                                       | Positive, warning, or negative bars, areas, donuts, and other large filled marks; lower luminance in dark mode                       |
| `CHART_BREAKDOWN_COLORS`                                         | Input, output, and other token/cost breakdowns                                                                                       |

Assignment rules:

- Use the line palette only for line strokes. Use the fill palette for every other categorical mark, including bars, areas, donuts, waterfalls, and table markers.
- Use either palette in index order so adjacent series receive deliberately distant hues. Use `getLineChartColorForKey` or `getFillChartColorForKey` only when a stable standalone assignment is needed without the full series list.
- Use solid fill colors for stacked bars and areas; gradients reduce color consistency between marks and legends.
- Use `CHART_STATUS_FILL_COLORS` instead of `CHART_STATUS_COLORS` when semantic status occupies a large filled area.
- Chart tokens are theme-responsive: define light aliases in `:root` and dark overrides in `html.dark`; never cache their resolved literal values across theme changes.
- Reserve neutral gray for “Other,” missing, or disabled data.
- Reserve positive, warning, and negative colors for semantic status. Do not assign them based on series position.
- Paired comparison charts use `CHART_COMPARISON_COLORS`, ordered as two shades per hue with consistent separation between each pair.
- Twenty categorical tokens support current high-cardinality usage charts, but prefer grouping, filtering, or small multiples once a chart becomes difficult to read.

### Table heatmaps — `--table-heatmap-*`

Use `bg-table-heatmap-{negative,positive}-1..5` for diverging table cells, with
`bg-table-heatmap-neutral` at the midpoint. These
tokens use muted semantic intent backgrounds so text remains comfortable to
read across large cell areas; they are not chart-series colors.

### Icon — `text-icon-*` and `bg-icon-*`

Icons have a separate color namespace so icon and label colors can diverge independently. Apply to `<Icon>` wrappers or SVG elements directly.

Source general-purpose icon glyphs from server-safe Phosphor leaf modules such
as `@phosphor-icons/react/dist/ssr/Check`; do not import from the Phosphor
package root. Use `<IconButton>` for interactive icons and `<Icon>` from
`@langchain/design-system/components/Icon` when standardized sizing, semantic
treatments, or tooltip labels are needed. Direct Phosphor glyphs must set `size`
and `weight` explicitly: regular for outline glyphs, fill for intentionally
filled states, and bold only where an established direct-rendered glyph must
preserve a 2px visual weight.

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

Shadow values are defined as CSS variables so they adapt to dark mode automatically.
Use `var(--shadow-color-subtle)` only when composing a custom shadow layer that cannot be expressed with one of the named shadow classes.

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

Use duration tokens for named motion timing decisions. Do not mix these with Tailwind's built-in `duration-{ms}` scale.

| Duration class    | Value | When to use                                 |
| ----------------- | ----- | ------------------------------------------- |
| `duration-fast`   | 100ms | Micro-interactions (toggle, checkbox check) |
| `duration-normal` | 200ms | Default hover / focus transitions           |
| `duration-slow`   | 300ms | larger layout shifts                        |
| `duration-slower` | 500ms | Entrance animations                         |

```tsx
// Example
<div className="transition-colors duration-normal hover:bg-surface-level-2" />
```

---

### Spacing — `space-*`

4-point scale (`space-1` … `space-9`), with `src/utils/spacing.ts` as the source
of truth. Use it through Tailwind property prefixes: `gap-space-4`,
`px-space-6`, `mt-space-2`, `p-space-5`, etc. Do not use off-scale spacing.

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

Pick spacing by the relationship between the two things, not by eyeballing a
gap. Tighter steps bind elements into a single unit; larger steps separate
distinct regions. Modals run one step denser than full pages.

**Intra-cluster** (elements that read as a single unit):

| Relationship                       | Utility       | When                                                     |
| ---------------------------------- | ------------- | -------------------------------------------------------- |
| Title ↔ description (header block) | `gap-space-1` | Inside page and section heading groups.                  |
| Label ↔ control (within a field)   | `gap-space-1` | Keep field labels close to their controls.               |
| Control ↔ helper/error text        | `gap-space-1` | Helper and validation text belongs to the field cluster. |
| Inline icon ↔ label                | `gap-space-2` | Default inline gap for icon plus text labels.            |
| Action buttons ↔ each other        | `gap-space-2` | Gap between buttons in an action or footer row.          |

**Within a section:**

| Relationship                                   | Utility       | When                                                                  |
| ---------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| Section header ↔ section body                  | `gap-space-3` | Separates the section explanation from the content it introduces.     |
| Field / card ↔ field / card (within a section) | `gap-space-4` | Default rhythm for related fields, cards, or controls.                |
| Header copy ↔ action area                      | `gap-space-4` | Between heading copy and the action group before responsive wrapping. |
| Header block ↔ tabs / filter bar               | `gap-space-4` | Between a page header block and the tab or filter bar below it.       |

**Region-level (page):**

| Relationship                   | Utility       | When                                                      |
| ------------------------------ | ------------- | --------------------------------------------------------- |
| Section ↔ section              | `gap-space-6` | Default distance between major content groups.            |
| Page header ↔ content          | `gap-space-6` | Between the top page heading and the first major section. |
| Form body ↔ actions row (page) | `gap-space-6` | Separate a page-level form body from its footer actions.  |

**Region-level (modal — one step denser than a page):**

| Relationship                              | Utility       | When                                                          |
| ----------------------------------------- | ------------- | ------------------------------------------------------------- |
| Modal region gap (header / body / footer) | `gap-space-5` | Tighter region rhythm for modals and dialogs than full pages. |

**Insets & container padding:**

| Relationship                 | Utility                 | When                                                            |
| ---------------------------- | ----------------------- | --------------------------------------------------------------- |
| Page horizontal inset        | `px-space-5`            | Default horizontal inset for settings-style content panels.     |
| Page top inset               | `pt-space-5`            | Default top inset between the page chrome and content.          |
| Card / panel / modal padding | `p-space-5`             | Padding inside cards, panels, dialogs, and bordered containers. |
| List / table row padding     | `px-space-5 py-space-4` | 24px horizontal, 16px vertical inside list and table rows.      |

---

## Deprecated Aliases

These class names remain in the Tailwind config for backwards compatibility but must not be used in new code.

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

When migrating existing code, use the table above. The compatibility aliases in
`src/styles/tokens.css` preserve the token values during migration.

---

## Component-Owned Tokens

- Button color variables live in `src/styles/base.css` for Tailwind utility compatibility, but they are still Button-owned implementation tokens.
- Use `<Button />` or `<IconButton />` instead of applying `.button-primary-*` or `.button-secondary-*` utilities yourself.

### Progress indicators

- Use `<LinearProgress />` for indeterminate loading states.
- Use `<ProgressBar />` for determinate completion, quota, or usage values.
- Keep layered, segmented, and categorical distribution visualizations in feature-specific components; `ProgressBar` represents one determinate value.
- Use `size="sm"` in dense table layouts; `md` is the default and `lg` is reserved for emphasized displays.
- Choose a semantic `color` based on meaning. Each color renders as a gradient derived from the visualization palette; there is no separate solid/gradient appearance prop.
- Thresholds belong to the consuming feature; `ProgressBar` only renders the selected state.
- Pass `label` to render a string using the fixed tertiary treatment. Label typography scales with the bar: `xs` text for `sm`, `sm` text for `md`, and `md` text for `lg`. Use `labelPosition="top"` when the value should precede the bar; it defaults to `bottom`. Compose labels outside the component when richer content or horizontal placement is required.
- Always provide `aria-label` or `aria-labelledby`. Pair warning, error, and success colors with visible text or an accessible value description so color is not the only signal.
