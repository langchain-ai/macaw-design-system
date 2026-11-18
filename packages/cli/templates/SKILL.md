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
Copy the returned `importStatement` from `@langchain/macaw-components`; search
Macaw before creating a primitive or copying a component into application code.
Compose existing components, preserve keyboard and screen-reader behavior,
and use semantic tokens. Keep product data, routing, permissions, and analytics
in the application.

Browse shared examples in the [Macaw Storybook](https://langchain-ai.github.io/macaw-design-system/).
The live site can be newer than the installed package; use the installed catalog
and documentation for API compatibility. Shared component and token changes
belong in the [Macaw repository](https://github.com/langchain-ai/macaw-design-system).

Import `@langchain/macaw-components/styles.css` once in the application entry
point. Inspect meaningful loading, empty, error, disabled, responsive, and
light/dark states when changing UI.
