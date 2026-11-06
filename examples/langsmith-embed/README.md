# Embeddable LangSmith UI with Macaw

A consuming application, not a product-specific addition to the component library. Three read-only surfaces: trace spans and input/output; recorded production evaluation feedback; dataset-linked experiments compared by reference example. Offline comparison reads `feedback_stats` averages already stored on runs. Repeated examples are labeled rather than silently choosing a repetition. This does not create evaluation rules or execute online/offline evaluators.

## Run locally

From the repository root (Node 22.18+, pnpm 10.27):

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec nx run langsmith-embed:build
pnpm exec nx run langsmith-embed:dev
```

Open http://127.0.0.1:3001. Default is explicitly labeled synthetic fixtures. For hot reload, keep that API process running and use a second terminal:

```sh
pnpm exec vite --config examples/langsmith-embed/vite.config.ts
```

Open http://127.0.0.1:5173. Verification:

```sh
pnpm exec nx run langsmith-embed:typecheck
pnpm exec nx run langsmith-embed:test
```

## Connect to real LangSmith results

Supply these environment variables to the **Node server only**, via your secret manager or shell. Never prefix secrets with `VITE_`, commit them, or put them in the host iframe URL.

- `LANGSMITH_MODE=live` explicitly enables network reads.
- `LANGSMITH_API_KEY` is a server-side key authorized for the workspace.
- `LANGSMITH_PROJECT_ID` is the production project UUID.
- `LANGSMITH_DATASET_ID` is the dataset UUID with linked experiments.
- `LANGSMITH_ENDPOINT` defaults to `https://api.smith.langchain.com`; the only alternative allowed is `https://eu.api.smith.langchain.com`.

The adapter uses the legacy stable REST interface: POST `/runs/query` with server-fixed `session`, GET `/feedback` for a verified project root, and GET `/sessions?reference_dataset=...`. POST here is a read-only query. It does not mix legacy and v2 response shapes. Scopes cannot be changed by browser query parameters. Runs must occur in the current server-scoped root page before their trace/feedback can be read. API keys and arbitrary upstream URLs never cross the browser boundary. Payloads render as text, never HTML.

This intentionally bounded example reads at most 30 root runs/project, 20 experiments, 100 spans/trace and 100 feedback records/run. Truncation is surfaced. This is a sample, not a complete monitoring dashboard or statistically valid dataset-wide comparison. Add backend cursor pagination and explicit date filters for a production integration. Errors retain honest missing/unevaluated states.

## Embed safely

The shipped server binds to loopback and has **no user authentication**. It is local-development-only, not safe to expose as an unauthenticated production server. Origin checks are defense in depth, not authentication. Before deployment, put the UI and adapter behind your product's authenticated session middleware or gateway; enforce user/tenant authorization and resolve project/dataset scopes from the authorized tenant server-side. Add payload redaction, response size limits, audit logging and rate limiting. Do not rely on the browser to authorize trace access. Static production content and API must be same-origin.

The production server currently sends `frame-ancestors 'self'`. Replace that directive with an explicit allowlist of your trusted product origins at the authenticated gateway; never use a wildcard. The host must allow the UI origin in its own `frame-src` policy. Do not remove the rest of the CSP. Vite dev mode is for local development, not deployment. Authentication in a cross-origin iframe requires your platform's approved cookie/session strategy; prefer a same-origin embed to avoid third-party-cookie restrictions. Never solve this by putting a LangSmith key or long-lived bearer token in the URL.

```html
<iframe
  src="/langsmith-embed/"
  title="LangSmith observability"
  style="width:100%;height:850px;border:0"
></iframe>
```

Example assumes the authenticated gateway maps that path to this app and rewrites its root-absolute asset/API URLs, or you adapt Vite `base` and API URLs for your mount. Alternatively serve at the root of a dedicated authorized origin and allowlist it in both CSP policies. No cross-window messages are required. Macaw follows the viewer's light/dark system preference and disables theme storage for embedding.
