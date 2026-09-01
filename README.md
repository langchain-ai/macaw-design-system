<div align="center">

# LangChain Design System

**The shared UI foundation for the LangChain product suite.**

Build familiar, accessible, and maintainable product experiences for LangSmith,
Fleet, and what comes next.

[Explore Storybook](https://langsmith-design-system.vercel.app/) ·
[Browse components](https://langsmith-design-system.vercel.app/?path=/docs/design-system-text--docs) ·
[Browse icons](https://langsmith-design-system.vercel.app/?path=/docs/design-system-foundations-icon-library--docs)

</div>

> [!NOTE]
> This repository is becoming the standalone home of the LangChain Design
> System. During the extraction, the active implementation remains in
> [`langchainplus/smith-frontend/src/design-system`](https://github.com/langchain-ai/langchainplus/tree/main/smith-frontend/src/design-system).

## Why it exists

The design system helps humans and agents build products that feel familiar,
interconnected, and intuitive—without rebuilding foundational UI decisions for
every feature.

- **Built for agents.** Components, props, tokens, and guidance should be easy
  to discover and use without one-off workarounds.
- **Built for delightful experiences.** Thoughtful, intuitive UX should be the
  default across the LangChain product suite.
- **Built for maintainability.** Shared styling, accessibility,
  responsiveness, and behavior should be solved once and improved everywhere.
- **Built to accelerate.** Clear primitives and guardrails help teams move
  quickly without introducing visual or interaction drift.
- **Built as the foundation.** Product UI composes from shared primitives; the
  design system owns the reusable visual contract.

## What belongs here

The standalone library is for domain-free UI: semantic tokens, icons, and
reusable components whose behavior does not depend on a particular product.

| Tier | Ownership | Examples |
| --- | --- | --- |
| **Design system** | Domain-free primitives. Props in, events out. | Button, Badge, Input, Tooltip |
| **Shared product UI** | Reusable composites that may depend on routing, providers, or app context. These stay with their product. | Layout, Breadcrumbs |
| **Feature UI** | Components that understand runs, datasets, experiments, billing, or other product concepts. These stay with their feature. | Page and workflow components |

The one-line test: a design-system component should have no idea which app it
is running in. It should use semantic tokens, expose an intent-based API, and
map cleanly to a reusable design primitive.

## Explore the system

The [Storybook](https://langsmith-design-system.vercel.app/) is the best place
to browse the current system, inspect variants, and understand intended usage.

- [Component library](https://langsmith-design-system.vercel.app/?path=/docs/design-system-text--docs)
- [Icon library](https://langsmith-design-system.vercel.app/?path=/docs/design-system-foundations-icon-library--docs)
- [Current source in `langchainplus`](https://github.com/langchain-ai/langchainplus/tree/main/smith-frontend/src/design-system)

## Contributing

Before adding a new primitive, search the existing implementation and
Storybook. Prefer extending a nearby component or established pattern over
introducing a parallel abstraction.

Package setup, local development commands, and release instructions will be
documented here as the standalone package scaffold lands. Until then, follow
the contributor guidance in the
[`langchainplus` repository](https://github.com/langchain-ai/langchainplus).

## Help and ownership

LangChain team members can reach Frontend Platform in Slack:

- [#team-frontend-platform](https://langchain.slack.com/app_redirect?channel=team-frontend-platform) — design-system ownership and ongoing platform work
- [#ask-frontend-platform](https://langchain.slack.com/app_redirect?channel=ask-frontend-platform) — usage questions and support
