# Syncing from LangChainPlus

The package is synced through LangChainPlus main at
[`8c7b45b3ebe9`](https://github.com/langchain-ai/langchainplus/commit/8c7b45b3ebe9f84f74d0f26bb9169032a1b10130),
fetched September 14, 2026. [upstream.json](./upstream.json) records the full
revision and watched paths.

## Previous sync

The last merged extraction was September 3, 2026, in standalone commit
`aaff93d4a0669267f2eab49f14a564d80a2acefc` (PR #2). A September 6 sync against
`ad9ceb7af1a53ff4bb2c40b7834572fb8a0496a0` was prepared in
[PR #3](https://github.com/langchain-ai/langchain-design-system/pull/3), which was
closed without merging. This update includes the missing shared work from that
sync and all later shared changes through the revision above.

## Included changes

- ThinkingState and LoadingIndicator, their animation styles, timer, stories,
  tests, and MIT attribution.
- Animated Tabs and GroupedTabs indicators; revised Badge and Kbd geometry;
  shared visual, control, selection-control, and option-row size definitions.
- Checkbox, RadioButton, RadioCard, RadioGroupItem, Switch, and Slider geometry
  and interactive hit areas.
- Chart legend hover/focus/filtering, chart types and geometry, full-height bar
  hover guides, and donut keyboard/mouse focus treatment.
- SplitViewPane outside-click and Escape handling, nested pane registration,
  closed-pane pointer behavior, and adjacent Pane integration.
- Typeahead filtering, decorators, and option/tag behavior; Phosphor wrapper and
  regular-weight updates; blocking ErrorBoundary reporting context.
- Component search/inspect CLI with colocated Storybook capability tags, updated
  DESIGN and STYLES guidance, foundation examples, and new component stories.
- Shared text-gradient utilities, syntax colors, tab animation tokens, and scoped
  dark styles.

## Package adaptations

Stories remain beside components, with foundation and overview stories in
`src/stories`. The CLI returns `@langchain/design-system` imports and discovers
these paths. Run it from this checkout on Node 22.18+ or Node 24; it is development
tooling and is not part of the published runtime.

The package keeps relative runtime imports, a router-independent Link/ErrorState,
server-rendering guards, portable declarations, and React 18-compatible callbacks
and forwarded refs. It retains keyboard-removable Typeahead tags and root Badge
refs. TooltipProvider remains available to package consumers.

Application routes, analytics implementations, authentication, legacy theme
migration, legacy/product icon trees and their migration audit stories, licensed
application fonts, onboarding/promo palettes, and the application banner slot
remain in LangChainPlus. The package uses Inter/Fira Code and its own Storybook
branding. Shared error context is passed to the consumer's reporting callback.

The public package stylesheet includes ThinkingState's compiled CSS and its
NOTICE ships with the component. Consumers continue to import `styles.css` once.

## Next sync

Fetch LangChainPlus main in its checkout, then run here:

```sh
pnpm verify:upstream ../langchainplus
# Or compare a specific upstream commit:
pnpm verify:upstream ../langchainplus <revision>
```

The read-only check reports upstream file changes, including additions and
removals. It detects upstream drift; it does not apply changes or establish
source or visual equivalence. Review application-only changes in the watched
files before deciding whether to port them.

Port shared changes with their stories, tests, documentation, dependencies,
styles, and exports. Preserve the package adaptations above. Run `pnpm format`,
`pnpm lint`, and `pnpm check`; inspect affected stories in both themes, at narrow
widths, and with relevant keyboard interactions. Update the recorded revision
only after the shared changes have been accounted for.
