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
Copy the `importStatement` returned by `inspect` to use the package's public API.
Search Macaw before creating or copying a shared UI primitive into an application.

The [Macaw Storybook](https://langchain-ai.github.io/macaw-design-system/) hosts
shared examples. It can be newer than your installed package, so use the installed
catalog and docs when checking API compatibility.

`init` creates `.agents/skills/macaw/SKILL.md` with links to the installed usage
guidance. It leaves existing files unchanged. No configuration is written during
npm installation. Agent integration templates live in this package; canonical
component guidance lives in `@langchain/macaw-components`.
