# Macaw CLI

Discover the components installed in your project and set up agent guidance.
This package has no React or component runtime dependencies.

```sh
pnpm add -D @langchain/macaw-cli
pnpm exec macaw search "loading"
pnpm exec macaw inspect Button --json
pnpm exec macaw init
```

Run commands in a project with `@langchain/macaw-components` installed. Discovery
reads that version's catalog, so import suggestions match the installed API.
`list`, `search`, and `inspect` support `--json`; `search` also accepts `--limit`.

With `LANGSMITH_GATEWAY_API_KEY` set, a search whose words match no component
is ranked by meaning instead, so `macaw search "show something while data
loads"` finds `Spinner` and `Skeleton`. `--semantic` uses meaning for every query
except an exact component name, and also accepts `LANGSMITH_API_KEY`. The query
and catalog names are sent to TypeSafe's classifier through the LangSmith gateway
(`LANGSMITH_GATEWAY_BASE_URL` overrides the host). Without a key, or if the
request fails, search uses word matches only. Set `MACAW_SEMANTIC_SEARCH=off` to
keep searches local.

`init` creates `.agents/skills/macaw/SKILL.md` with links to the installed usage
guidance. It leaves existing files unchanged. No configuration is written during
npm installation. Agent integration templates live in this package; canonical
component guidance lives in `@langchain/macaw-components`.
