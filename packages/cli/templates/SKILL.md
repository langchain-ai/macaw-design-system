---
name: macaw
description: Use Macaw components and semantic tokens when building application UI.
---

# Build with Macaw

Start with `pnpm exec macaw foundations` and retrieve only relevant topics,
such as `pnpm exec macaw foundations surfaces --json` or `spacing --json`.
These focused sections come from the installed canonical docs. For more context,
or older catalogs without foundations, read [component guidance]({{componentsDocs}}/DESIGN.md)
and the relevant [styling guidance]({{componentsDocs}}/STYLES.md) sections.
The token package also exports `@langchain/macaw-tokens/docs/TOKENS.md`.
These files belong to the installed package versions.

Use `pnpm exec macaw search "<capability>"` and
`pnpm exec macaw inspect <name> --json` to find components and exact imports.
Inspect includes curated use/avoid advice, composition and accessibility
obligations, and selected source-derived props when available. Missing metadata
is not a complete API or a claim that no obligations exist; follow source and
story links for uncurated components and inherited types.
Compose existing components, preserve keyboard and screen-reader behavior,
and use semantic tokens. Keep product data, routing, permissions, and analytics
in the application.

Import `@langchain/macaw-components/styles.css` once in the application entry
point. Inspect meaningful loading, empty, error, disabled, responsive, and
light/dark states when changing UI.
