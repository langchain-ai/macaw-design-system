# Storybook deployment

The Vercel configuration builds the packages and Storybook from the repository
root and preserves the existing welcome-page link with a redirect.

## Configure Vercel

1. Connect the project that owns `langsmith-design-system.vercel.app` to
   `langchain-ai/macaw-design-system`. The Vercel GitHub app must have access to
   this repository. Stop any previous publisher for the same domain before the
   first production deployment.
2. Clear the root directory, select Node.js 24.x, and use the **Other** framework
   preset. The committed `vercel.json` supplies the install command, build
   command, output directory, and ignored-build command.
3. Track `main` for production. Enable pull request comments and preserve the
   project's existing deployment protection and domain settings.
4. Deploy `main` and verify the site. Confirm a pull request receives a Vercel
   check and preview URL, and that another commit updates it.

Vercel's GitHub integration handles production and Vercel preview deployments.
The separate GitHub Actions preview pipeline also builds pull requests and
publishes them at `https://macaw-preview.langsmith.net/pr-<number>/`. Those
previews are independent of the Vercel project connection.

## Build locally

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm build:storybook
```

The static site is written to `storybook-static/`. Build the workspace packages
first so Storybook can resolve their generated exports.

## Troubleshooting

- **No Vercel preview:** check the connected repository, GitHub app access,
  deployment author permissions, and any required fork approval.
- **No Vercel comment:** enable pull request comments in the project's Git
  settings; the deployment check still contains the preview link.
- **Wrong build directory:** clear the project's root directory.
- **Production content changes unexpectedly:** check for another publisher
  targeting the same domain.
- **GitHub Actions preview fails:** inspect the separate build and publish
  workflows; changing Vercel settings does not repair that pipeline.

Vercel references: [GitHub integration](https://vercel.com/docs/git/vercel-for-github)
and [project configuration](https://vercel.com/docs/project-configuration).
