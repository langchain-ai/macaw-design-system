import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as demo from './fixtures.mjs';
export const uuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function config(env = process.env) {
  const live = env.LANGSMITH_MODE === 'live';
  const endpoint = env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com';
  if (
    ![
      'https://api.smith.langchain.com',
      'https://eu.api.smith.langchain.com',
    ].includes(endpoint)
  )
    throw new Error('Endpoint must be a supported LangSmith API origin.');
  if (
    live &&
    (!env.LANGSMITH_API_KEY ||
      !uuid(env.LANGSMITH_PROJECT_ID) ||
      !uuid(env.LANGSMITH_DATASET_ID))
  )
    throw new Error(
      'Live mode requires a server API key and valid project/dataset UUIDs.'
    );
  return {
    live,
    endpoint,
    key: env.LANGSMITH_API_KEY,
    project: live ? env.LANGSMITH_PROJECT_ID : demo.project,
    dataset: env.LANGSMITH_DATASET_ID,
  };
}
export function normalizeRun(r) {
  return Object.fromEntries(
    [
      'id',
      'name',
      'run_type',
      'start_time',
      'end_time',
      'inputs',
      'outputs',
      'error',
      'trace_id',
      'parent_run_id',
      'dotted_order',
      'reference_example_id',
      'feedback_stats',
    ].map((k) => [k, r[k] ?? null])
  );
}
export function createApi(c, fetcher = fetch) {
  async function upstream(path, body) {
    const response = await fetcher(c.endpoint + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'x-api-key': c.key, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!response.ok)
      throw new Error(
        'LangSmith request failed. Check server credentials and scope.'
      );
    return response.json();
  }
  async function roots(session) {
    if (!c.live)
      return {
        runs: demo.runs
          .filter((r) => r.session_id === session)
          .map(normalizeRun),
        truncated: false,
      };
    const result = await upstream('/runs/query', {
      session: [session],
      is_root: true,
      limit: 30,
    });
    if (!Array.isArray(result.runs))
      throw new Error('Unexpected LangSmith runs response.');
    return {
      runs: result.runs.map(normalizeRun),
      truncated: !!result.cursors?.next,
    };
  }
  return async function api(path) {
    if (path === '/api/overview') {
      const traces = await roots(c.project);
      const sessions = c.live
        ? await upstream(
            '/sessions?' +
              new URLSearchParams({
                reference_dataset: c.dataset,
                include_stats: 'true',
                limit: '20',
              })
          )
        : demo.experiments;
      if (!Array.isArray(sessions))
        throw new Error('Unexpected LangSmith experiments response.');
      const experiments = await Promise.all(
        sessions
          .slice(0, 20)
          .map(async (e) => ({
            id: e.id,
            name: e.name,
            ...(await roots(e.id)),
          }))
      );
      return {
        mode: c.live ? 'live' : 'demo',
        ...traces,
        experiments,
        truncated:
          traces.truncated ||
          sessions.length >= 20 ||
          experiments.some((e) => e.truncated),
      };
    }
    const match = /^\/api\/traces\/([^/]+)$/.exec(path);
    if (!match || !uuid(match[1]))
      throw Object.assign(new Error('Not found'), { status: 404 });
    const rootsPage = await roots(c.project);
    const root = rootsPage.runs.find((r) => r.id === match[1]);
    if (!root)
      throw Object.assign(
        new Error('Run is outside the allowed project or current page.'),
        { status: 404 }
      );
    const result = c.live
      ? await upstream('/runs/query', {
          session: [c.project],
          trace: root.trace_id,
          limit: 100,
        })
      : {
          runs: [
            demo.runs.find((r) => r.id === root.id),
            ...demo.children.filter((r) => r.trace_id === root.trace_id),
          ],
        };
    const feedback = c.live
      ? await upstream(
          '/feedback?' + new URLSearchParams({ run: root.id, limit: '100' })
        )
      : demo.feedback(demo.runs.find((r) => r.id === root.id));
    if (!Array.isArray(result.runs) || !Array.isArray(feedback))
      throw new Error('Unexpected LangSmith detail response.');
    return {
      runs: result.runs.map(normalizeRun),
      feedback: feedback.map((f) => ({
        key: f.key,
        score: f.score ?? null,
        value: f.value ?? null,
        comment: f.comment ?? null,
      })),
      truncated: !!result.cursors?.next || feedback.length >= 100,
    };
  };
}
export function serve(c) {
  const api = createApi(c);
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; frame-ancestors 'self'; connect-src 'self'"
    );
    try {
      if (req.method !== 'GET')
        throw Object.assign(new Error('Read-only endpoint'), { status: 405 });
      const url = new URL(req.url, 'http://localhost');
      if (
        url.search ||
        (req.headers.origin &&
          ![
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
          ].includes(req.headers.origin))
      )
        throw Object.assign(new Error('Request denied'), { status: 403 });
      if (url.pathname.startsWith('/api/')) {
        const result = await api(url.pathname);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(result));
        return;
      }
      const root = fileURLToPath(new URL('./dist/', import.meta.url));
      const file = resolve(
        root,
        '.' +
          decodeURIComponent(
            url.pathname === '/' ? '/index.html' : url.pathname
          )
      );
      if (!file.startsWith(root))
        throw Object.assign(new Error('Not found'), { status: 404 });
      const bytes = await readFile(file);
      res.setHeader(
        'Content-Type',
        {
          '.html': 'text/html; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.woff2': 'font/woff2',
        }[extname(file)] || 'application/octet-stream'
      );
      res.end(bytes);
    } catch (e) {
      res.statusCode = e.status || 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: e.status
            ? e.message
            : 'Unable to load LangSmith data. Check server configuration and retry.',
        })
      );
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  serve(config()).listen(3001, '127.0.0.1', () =>
    console.log(
      'LangSmith example: http://127.0.0.1:3001 (API and built UI; Vite dev UI at :5173)'
    )
  );
