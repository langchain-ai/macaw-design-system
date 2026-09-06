# Storybook and LangChainPlus parity

Run `pnpm storybook` for development, or `pnpm build:storybook` followed by
`pnpm verify:storybook` for a production build. Component stories are
co-located; foundation and overview stories live in `src/stories/`.

The standalone configuration uses the same Storybook 10 React/Vite framework,
docs/links addons, navigation groups, SVG support, theme decorator, and tooltip
provider as LangChainPlus. It loads this package's styles instead of application
CSS. No product authentication, feature-flag stubs, or app aliases are needed.

Shared components and stories were reviewed against LangChainPlus main at
`ad9ceb7af1a53ff4bb2c40b7834572fb8a0496a0`. This includes the chart legend
interaction updates, Typeahead filtering/decorators, shared component size
reference, and regular Phosphor weights. The upstream revision and watched
paths are recorded in [upstream.json](upstream.json).

## Intentional differences

- Package branding and native links replace application branding and routing.
- Product migration audit stories and the product-only `BrandIcons` example
  stay in LangChainPlus. This package includes its brand logos and shared
  Phosphor wrappers, without legacy Untitled UI or product icon trees.
- Inter and Fira Code ship through open-source font dependencies. Proprietary
  Lausanne/Aeonik font files and application-only CSS are not redistributed.
- Theme persistence uses a package-specific key. LangChainPlus's temporary
  legacy theme migration and application error reporting stay in that app.
- Standalone code retains server-rendering guards, portable declaration
  annotations, and React 18-compatible chart callbacks. Tag removal supports
  keyboard activation and Badge refs point to the root element.

These differences mean the two sites are not pixel-identical in every
product-specific example. Shared geometry, semantic tokens, states, and
interactions should agree. The package is not automatically synced to the app.

## Close future drift

Fetch the latest LangChainPlus main branch, then run from this repository:

```sh
pnpm verify:upstream ../langchainplus
```

This read-only check reports changed upstream files since the reviewed
snapshot, including new files. It requires access to that checkout and is
separate from public CI. Review each change, port shared behavior and its
tests/stories, and keep package adaptations above. Do not overwrite the package
with the application tree. Update the snapshot only after reviewing the diff.

Run `pnpm check` and `pnpm pack:check`. Inspect changed examples in both themes,
at narrow widths, and with keyboard navigation. Compare the same story and
state in each repository. The check tracks upstream changes; it does not prove
visual equivalence or apply changes automatically.

Once LangChainPlus imports this package, maintain shared implementation and
stories here and keep application integration stories in LangChainPlus.

## Hosting

`vercel.json` builds and verifies the standalone Storybook into
`storybook-static`. Connect a Vercel project to this GitHub repository and
enable preview deployments for PRs. CI also uploads a Storybook artifact for
review on Node 24. The existing public URL in the README is the LangChainPlus
deployment until an owner switches its source or provides a new public URL.
Do not assume a successful local build has changed that deployment.
