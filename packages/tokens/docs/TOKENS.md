# Macaw tokens

Import `@langchain/macaw-tokens/tokens.css` for CSS custom properties without
React, fonts, component styles, or a Tailwind dependency.

```css
@import '@langchain/macaw-tokens/tokens.css';

.surface {
  background: var(--bg-surface-level-1);
  color: var(--text-primary);
}
```

Use semantic names such as `--bg-surface-level-1` and `--text-primary` rather
than primitive palette values. Add `dark` to the document's `html` element to
switch themes. A `.dark[data-theme-scope]` container also supports a scoped dark
theme. Component-specific custom properties are implementation details.

`@langchain/macaw-tokens/tokens.json` is the complete machine-readable reference,
generated from the same CSS. Its `rules` contain `selector` and `tokens` fields.
Values retain CSS `var()` references; dark rules contain overrides, so apply them
over the root values rather than treating them as a complete independent theme.
The additive `roles` field retains semantic intent: `roles.surfaces.entries`
maps each surface utility and CSS token to its purpose, while
`roles.spacing.relationships` maps layout relationships to spacing utilities.
Both include version-pinned `source` links. These roles are extracted from the
canonical component `STYLES.md` tables during the build, not inferred from color
values; matching colors do not make input and popover roles interchangeable.
The schema version remains 1 and existing `rules` consumers are unchanged.

Applications using `@langchain/macaw-components/styles.css` already load these
tokens and should not import the token stylesheet a second time.
