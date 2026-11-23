# Macaw CLI

Discover the components installed in your project and set up agent guidance.
This package has no React or component runtime dependencies.

```sh
pnpm add -D @langchain/macaw-cli
pnpm exec macaw search "loading"
pnpm exec macaw inspect Button --json
pnpm exec macaw foundations spacing
pnpm exec macaw init
```

Run commands in a project with `@langchain/macaw-components` installed. Discovery
reads that version's catalog, so import suggestions match the installed API.
`list`, `search`, `inspect`, and `foundations` support `--json`; `search` also
accepts `--limit`. `foundations` lists focused sections of the installed
`DESIGN.md` and `STYLES.md`, and `foundations <topic>` prints one.

`init` creates `.agents/skills/macaw/SKILL.md` with links to the installed usage
guidance. It leaves existing files unchanged. No configuration is written during
npm installation. Agent integration templates live in this package; canonical
component guidance lives in `@langchain/macaw-components`.
