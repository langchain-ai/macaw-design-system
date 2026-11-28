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

## Dotted canvas background

Use `--bg-canvas-dotted` as a background image for graph editors and creation
canvases. Pair it with `--bg-canvas-dotted-size` for a repeating 20px grid of
1px-radius dots. The pattern uses `--border-subtle` in each theme and leaves the
surface color independent. It is a CSS gradient, not an SVG asset.

```css
.canvas {
  background-color: var(--bg-surface-level-1);
  background-image: var(--bg-canvas-dotted);
  background-size: var(--bg-canvas-dotted-size);
  background-repeat: repeat;
}
```

With the component Tailwind preset, use
`className="bg-canvas-dotted bg-surface-level-1"` instead.

Applications using `@langchain/macaw-components/styles.css` already load these
tokens and should not import the token stylesheet a second time.
