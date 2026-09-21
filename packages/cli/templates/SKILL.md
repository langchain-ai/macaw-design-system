---
name: macaw
description: Use Macaw components and semantic tokens when building application UI.
---

# Build with Macaw

Read [component guidance]({{componentsDocs}}/DESIGN.md) and the relevant
[styling guidance]({{componentsDocs}}/STYLES.md) before implementing UI.
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
