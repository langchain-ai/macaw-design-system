# Macaw CLI

Discover the components installed in your project and set up agent guidance.
This package has no React or component runtime dependencies.

```sh
pnpm add -D @langchain/macaw-cli
pnpm exec macaw search "loading"
pnpm exec macaw inspect Button --json
pnpm exec macaw foundations
pnpm exec macaw foundations spacing --json
pnpm exec macaw init
```

Run commands in a project with `@langchain/macaw-components` installed. Discovery
reads that version's catalog, so import suggestions match the installed API.
`list`, `search`, `inspect`, and `foundations` support `--json`. Search returns
one representative per family (default 10, `--limit 1–100`); inspect still accepts
individual subparts such as `RadioGroupItem`. Task phrases such as “persistent
warning” and “choose an option” supplement the story capability tags.

New catalogs add optional `packageVersion` and `guidance` fields to each entry.
Curated guidance covers common families, not the entire library; absence is not
a statement that a component has no obligations. `guidance.scope` identifies
whether advice describes the named export or its family. Selected prop types,
literal variants, and explicit default expressions are extracted from source,
not hand-maintained; inherited and imported types still require the linked API.
Published guidance and source links are pinned to the catalog version.

`foundations` lists compact topics; `foundations <topic>` retrieves just that
canonical section, including structured surface roles or spacing relationships.
The build extracts these from DESIGN/STYLES rather than maintaining a second
set of foundation rules. Legacy schema-v1 catalogs still support discovery;
foundations reports an actionable update error when metadata is absent.
`docs/component-guidance.json` in the component package is the curated decision
index; story tags remain the capability source, and source types/defaults remain
the API contract.

`init` creates `.agents/skills/macaw/SKILL.md` with links to the installed usage
guidance. It leaves existing files unchanged. No configuration is written during
npm installation. Agent integration templates live in this package; canonical
component guidance lives in `@langchain/macaw-components`.
