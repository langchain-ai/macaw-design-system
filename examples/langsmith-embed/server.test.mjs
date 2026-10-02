import assert from 'node:assert/strict';
import test from 'node:test';

import { project, runs } from './fixtures.mjs';
import { config, createApi, normalizeRun } from './server.mjs';
test('demo is default even if a key is present', () =>
  assert.equal(config({ LANGSMITH_API_KEY: 'unused' }).live, false));
test('live requires explicit valid scopes and restricts origins', () => {
  assert.throws(() => config({ LANGSMITH_MODE: 'live' }));
  assert.throws(() => config({ LANGSMITH_ENDPOINT: 'https://evil.example' }));
});
test('only approved run fields cross the boundary', () =>
  assert.equal(
    normalizeRun({ id: 'x', api_key: 'secret' }).api_key,
    undefined
  ));
test('demo overview and scoped trace work', async () => {
  const api = createApi(config({}));
  const page = await api('/api/overview');
  assert.equal(page.mode, 'demo');
  assert.equal(page.experiments.length, 2);
  assert.equal((await api('/api/traces/' + runs[0].id)).runs.length, 2);
  await assert.rejects(api('/api/traces/' + runs[3].id), { status: 404 });
});
test('unscoped IDs never trigger feedback or detail queries', async () => {
  let calls = 0;
  const api = createApi(
    { ...config({}), live: true, key: 'server-secret', project },
    async () => {
      calls++;
      return { ok: true, json: async () => ({ runs: [], cursors: {} }) };
    }
  );
  await assert.rejects(
    api('/api/traces/00000000-0000-4000-8000-000000000099'),
    { status: 404 }
  );
  assert.equal(calls, 1);
  await assert.rejects(api('/api/traces/not-a-uuid'), { status: 404 });
  assert.equal(calls, 1);
});
test('legacy queries use fixed scopes and preserve truncation', async () => {
  const api = createApi(
    { ...config({}), live: true, key: 'secret', project, dataset: project },
    async (url, init) => {
      assert.equal(init.headers['x-api-key'], 'secret');
      if (url.includes('/sessions')) return { ok: true, json: async () => [] };
      const body = JSON.parse(init.body);
      assert.deepEqual(body.session, [project]);
      assert.equal(body.limit, 30);
      return {
        ok: true,
        json: async () => ({ runs: [], cursors: { next: 'next-page' } }),
      };
    }
  );
  assert.equal((await api('/api/overview')).truncated, true);
});
