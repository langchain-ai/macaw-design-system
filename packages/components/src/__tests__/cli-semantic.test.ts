import { afterEach, expect, test, vi } from 'vitest';

import { run, type Component } from '../../../cli/src/commands.mts';

function component(name: string, family: string, keywords: string) {
  return {
    name,
    family,
    keywords,
    importPath: `@langchain/macaw-components/${family}`,
    importStatement: `import { ${name} } from '@langchain/macaw-components/${family}';`,
    sourceFiles: [],
    stories: [],
  } satisfies Component;
}

const catalog = () => [
  component('Button', 'Button', 'action, click'),
  component('Spinner', 'Spinner', 'loading, busy'),
  component('SpinnerIcon', 'Spinner', 'loading, busy'),
  component('ToastProvider', 'Toast', 'notification'),
];

function respond(probabilities: Record<string, number>, ok = true) {
  const choice = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0];
  const fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => ({
      answers: {
        component: {
          type: 'choice',
          choice: choice[0],
          confidence: choice[1],
          probabilities,
        },
      },
    }),
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

async function search(...args: string[]) {
  const write = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
  try {
    await run(['search', ...args, '--json'], catalog);
    return JSON.parse(String(write.mock.calls.at(-1)?.[0])).map(
      ({ name }: Component) => name
    );
  } finally {
    write.mockRestore();
  }
}

function withKey() {
  vi.stubEnv('LANGSMITH_GATEWAY_API_KEY', '');
  vi.stubEnv('LANGSMITH_API_KEY', 'test-key');
  vi.stubEnv('LANGSMITH_GATEWAY_BASE_URL', 'https://gateway.test/');
  vi.stubEnv('MACAW_SEMANTIC_SEARCH', '');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test('keeps lexical search without a key', async () => {
  vi.stubEnv('LANGSMITH_GATEWAY_API_KEY', '');
  vi.stubEnv('LANGSMITH_API_KEY', '');
  const fetch = respond({ Spinner: 1 });
  expect(await search('show something while data loads')).toEqual([]);
  expect(await search('busy')).toEqual(['Spinner', 'SpinnerIcon']);
  expect(fetch).not.toHaveBeenCalled();
  await expect(
    run(['search', 'busy', '--semantic'], catalog)
  ).rejects.toMatchObject({ code: 'ERR_INVALID_ARGUMENT' });
});

test('ranks queries without word matches by meaning', async () => {
  withKey();
  const fetch = respond({
    Spinner: 0.9,
    ToastProvider: 0.07,
    Button: 0.02,
    none: 0.01,
  });
  expect(await search('show something while data loads')).toEqual([
    'Spinner',
    'ToastProvider',
  ]);
  const [url, request] = fetch.mock.calls[0];
  expect(url).toBe('https://gateway.test/v1/systemone');
  expect(request.headers.authorization).toBe('Bearer test-key');
  const body = JSON.parse(request.body);
  expect(body).toMatchObject({
    model: 'typesafe/jev-1.13.0',
    state: 'show something while data loads',
  });
  expect(Object.keys(body.questions.component.criteria)).toEqual([
    'Button',
    'Spinner',
    'ToastProvider',
    'none',
  ]);
  expect(body.questions.component.criteria.Spinner).toBe(
    'Keywords: loading, busy. Exports: Spinner, SpinnerIcon.'
  );
});

test('uses word matches before semantic ranking', async () => {
  withKey();
  const fetch = respond({ ToastProvider: 1 });
  expect(await search('busy')).toEqual(['Spinner', 'SpinnerIcon']);
  expect(await search('Button', '--semantic')).toEqual(['Button']);
  expect(fetch).not.toHaveBeenCalled();
  expect(await search('busy', '--semantic')).toEqual(['ToastProvider']);
  expect(fetch).toHaveBeenCalledOnce();
});

test('returns no components when none fit', async () => {
  withKey();
  respond({ none: 0.9, Button: 0.1 });
  expect(await search('date picker')).toEqual([]);
});

test('falls back to word matches when semantic search is unavailable', async () => {
  withKey();
  respond({ Button: 1 }, false);
  expect(await search('busy', '--semantic')).toEqual([
    'Spinner',
    'SpinnerIcon',
  ]);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  expect(await search('show something while data loads')).toEqual([]);
  vi.stubEnv('MACAW_SEMANTIC_SEARCH', 'off');
  const fetch = respond({ Spinner: 1 });
  expect(await search('show something while data loads')).toEqual([]);
  expect(fetch).not.toHaveBeenCalled();
});
