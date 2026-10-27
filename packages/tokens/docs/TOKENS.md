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

Applications using `@langchain/macaw-components/styles.css` already load these
tokens and should not import the token stylesheet a second time.

## Typography

The 14px `md` tier is the baseline. Font sizes and their paired line heights are
published as rem-valued custom properties:

| Tier      | Font size   | Line height |
| --------- | ----------- | ----------- |
| `3xl`     | `1.75rem`   | `2.25rem`   |
| `2xl`     | `1.5rem`    | `2rem`      |
| `xl`      | `1.25rem`   | `2rem`      |
| `lg-plus` | `1.125rem`  | `1.75rem`   |
| `lg`      | `1rem`      | `1.5rem`    |
| `md`      | `0.875rem`  | `1.25rem`   |
| `sm`      | `0.8125rem` | `1rem`      |
| `xs`      | `0.75rem`   | `1rem`      |

For example, the `md` pair is `--font-size-md` and `--line-height-md`.
`lg-plus` names the intermediate 18px tier so that `xl` remains 20px.
