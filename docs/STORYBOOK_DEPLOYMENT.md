# Storybook deployment

Macaw's Storybook is hosted at <https://langsmith-design-system.vercel.app/>.
The existing Vercel project must be connected to this repository using the
one-time migration below before Macaw owns that site.

Vercel's GitHub integration builds production from `main` and creates previews
for pull requests, including drafts. Each new commit updates the Vercel check,
deployment link, and preview comment on the PR. There are no path filters;
`vercel.json` explicitly enables deployments and prevents the ignored-build
command from skipping updates. Existing Vercel access and fork-approval policies
still apply.

The old LangSmith welcome-page URL redirects to Macaw's welcome page so
existing links to the site continue to work.

## Move the existing project from LangChainPlus

1. Merge Macaw's `vercel.json` configuration into `main`.
2. Disable the LangChainPlus workflows `Deploy Storybook to Vercel` and
   `Deploy Storybook Preview to Vercel`, cancel any runs still in progress, and
   merge their removal. Disconnect any other Vercel project still building
   LangChainPlus Storybook automatically. The old production workflow must stop
   before Macaw publishes, or it can overwrite the shared site.
3. Open the existing Vercel project that owns
   `langsmith-design-system.vercel.app`. Keep the project and its domain. Under
   **Settings → Git**, disconnect `langchain-ai/langchainplus` and connect
   `langchain-ai/macaw-design-system`. The Vercel GitHub app must have access to
   the Macaw repository.
4. Under **Settings → Build and Deployment**, clear the old `smith-frontend`
   root directory so builds run from the repository root. Use Node.js 24.x and
   the **Other** framework preset. The committed `vercel.json` supplies the
   install command, build command, output directory, and ignored-build command.
   Disable skipping unaffected projects if that monorepo option is enabled.
5. Set the production environment's tracked branch to `main`. Enable pull
   request comments in the project's Git settings. Preserve the project's
   existing deployment protection and domain settings.
6. Deploy the latest Macaw `main` commit and verify the existing public URL.
   Open or update a Macaw PR and confirm its Vercel check, deployment link, and
   preview comment appear. Push another commit and check that the preview
   updates.

This uses Vercel's existing GitHub integration, so GitHub Actions does not need
Vercel tokens or access to LangChainPlus's 1Password and Tailscale credentials.
Macaw's GitHub CI continues to run independently as the merge gate.

## Build locally

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm build:storybook
```

The static site is written to `storybook-static/`. All workspace packages must
be built first so Storybook can resolve their generated exports.

## Troubleshooting

- **No preview on a PR:** check the connected repository, Vercel GitHub app
  access, deployment author permissions, and any required fork approval.
- **No PR comment:** enable pull request comments in the Vercel project's Git
  settings; the deployment check still contains the preview link.
- **Build looks for `smith-frontend`:** clear the project's root directory.
- **The public site reverts to LangChainPlus:** check for an old production
  workflow still running or a Vercel project still connected to LangChainPlus.

Vercel references: [GitHub integration](https://vercel.com/docs/git/vercel-for-github)
and [project configuration](https://vercel.com/docs/project-configuration).
