# General Guidelines for working with Nx

- This project uses nx to manage the monorepo, builds, and deployments, along with pnpm. Do not deviate from using these tools.

# Design-system changes

Before changing components, tokens, styles, icons, stories, exports, or package
documentation, read [.agents/skills/design-system/SKILL.md](.agents/skills/design-system/SKILL.md).
Follow its component discovery, package boundaries, accessibility, and verification
rules. Read [DESIGN.md](packages/components/docs/DESIGN.md) for component behavior
and [STYLES.md](packages/components/docs/STYLES.md) for styling changes. Keep product
workflows in consuming applications and reuse existing components and semantic tokens.
