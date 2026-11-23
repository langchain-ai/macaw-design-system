---
name: macaw
description: Use Macaw components and semantic tokens when building application UI.
---

# Build with Macaw

Before implementing UI, run `pnpm exec macaw foundations components` to choose
components, and `pnpm exec macaw foundations` to list other topics such as
`tokens`, `surfaces`, and `spacing`. Topics are sections of the installed
[component guidance]({{componentsDocs}}/DESIGN.md) and
[styling guidance]({{componentsDocs}}/STYLES.md); read those files for anything
the topics do not cover.
The token package also exports `@langchain/macaw-tokens/docs/TOKENS.md`.
These files belong to the installed package versions.

Use `pnpm exec macaw search "<capability>"` and
`pnpm exec macaw inspect <name> --json` to find components and exact imports.
Compose existing components, preserve keyboard and screen-reader behavior,
and use semantic tokens. Keep product data, routing, permissions, and analytics
in the application.

Import `@langchain/macaw-components/styles.css` once in the application entry
point. Inspect meaningful loading, empty, error, disabled, responsive, and
light/dark states when changing UI.
