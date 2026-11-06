import { useEffect, useState } from 'react';

import { createRoot } from 'react-dom/client';

import { Button } from '@langchain/macaw-components/Button';
import { Card } from '@langchain/macaw-components/Card';
import { AppThemeProvider } from '@langchain/macaw-components/hooks/AppThemeProvider';
import { Text } from '@langchain/macaw-components/Text';
import '@langchain/macaw-components/styles.css';
import './styles.css';

type Run = {
  id: string;
  name: string;
  run_type: string;
  parent_run_id: string | null;
  dotted_order: string;
  start_time: string;
  end_time: string | null;
  inputs: unknown;
  outputs: unknown;
  error: string | null;
  reference_example_id: string | null;
  feedback_stats: Record<string, { avg?: number | null }> | null;
};
type Overview = {
  mode: string;
  runs: Run[];
  experiments: { id: string; name: string; runs: Run[] }[];
  truncated: boolean;
};
type Detail = {
  runs: Run[];
  feedback: {
    key: string;
    score: number | boolean | null;
    value: unknown;
    comment: string | null;
  }[];
  truncated: boolean;
};
const views = ['Traces', 'Online Evals', 'Offline Evals'] as const;
const score = (v: unknown) =>
  v == null
    ? 'Not evaluated'
    : typeof v === 'number'
      ? v.toFixed(2)
      : typeof v === 'string' || typeof v === 'boolean'
        ? String(v)
        : JSON.stringify(v);
async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function Payload({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <Text variant="h3">{title}</Text>
      <pre>
        {value == null ? 'No payload recorded' : JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}
function App() {
  const [view, setView] = useState<(typeof views)[number]>('Traces');
  const [data, setData] = useState<Overview | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [selected, setSelected] = useState('');
  const [span, setSpan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    request<Overview>('/api/overview', controller.signal)
      .then((d) => {
        setData(d);
        setSelected((old) =>
          d.runs.some((r) => r.id === old) ? old : d.runs[0]?.id || ''
        );
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tick]);
  useEffect(() => {
    setDetail(null);
    setSpan('');
    if (!selected) return;
    const controller = new AbortController();
    setDetailLoading(true);
    request<Detail>('/api/traces/' + selected, controller.signal)
      .then((d) => {
        setDetail(d);
        setSpan(selected);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selected, tick]);
  const active = detail?.runs.find((r) => r.id === span);
  const keys = [
    ...new Set(
      data?.experiments.flatMap((e) =>
        e.runs.flatMap((r) => Object.keys(r.feedback_stats || {}))
      ) || []
    ),
  ];
  const examples = [
    ...new Set(
      data?.experiments.flatMap((e) =>
        e.runs
          .map((r) => r.reference_example_id)
          .filter((id): id is string => !!id)
      ) || []
    ),
  ];
  return (
    <main className="shell">
      <header>
        <div>
          <Text variant="xs" className="eyebrow">
            LANGSMITH / EMBEDDED INTELLIGENCE
          </Text>
          <Text variant="h1">Your Product. Your Observability.</Text>
          <Text color="secondary">
            Macaw components connected to a read-only LangSmith adapter.
          </Text>
        </div>
        <Button
          size="md"
          color="secondary"
          onClick={() => setTick((t) => t + 1)}
          loading={loading}
        >
          Refresh data
        </Button>
      </header>
      <Card intent="info">
        <div className="notice">
          <Text weight="semibold">
            {data?.mode === 'live'
              ? 'Connected to LangSmith'
              : 'Synthetic demo data'}
          </Text>
          <Text variant="sm">
            {data?.mode === 'live'
              ? 'Server-scoped project and dataset. Credentials never reach the browser.'
              : 'Illustrative fixtures, not real traces or evaluation results. Switch to live mode on the server.'}
          </Text>
        </div>
      </Card>
      <nav aria-label="Observability views" className="view-switch">
        {views.map((v) => (
          <Button
            key={v}
            size="md"
            color={view === v ? 'primary' : 'secondary'}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            {v}
          </Button>
        ))}
      </nav>
      {error && (
        <Card>
          <Text role="alert" color="error">
            {error}
          </Text>
          <Button onClick={() => setTick((t) => t + 1)}>Retry</Button>
        </Card>
      )}
      {loading && <Text role="status">Loading scoped LangSmith results…</Text>}
      {data?.truncated && (
        <Text color="secondary">
          Bounded sample: up to 30 runs per project and 20 experiments. More
          results exist; these are not dataset-wide metrics.
        </Text>
      )}
      {!loading && data && (
        <>
          <div className="section-heading">
            <Text variant="h2">
              {view === 'Traces'
                ? 'Trace Explorer'
                : view === 'Online Evals'
                  ? 'Production Quality'
                  : 'Experiment Comparison'}
            </Text>
            <Text variant="sm" color="secondary">
              {view === 'Offline Evals'
                ? 'Matched by reference example · recorded scores only'
                : 'Latest sampled root runs · read-only'}
            </Text>
          </div>
          {view !== 'Offline Evals' && (
            <div className="explorer">
              <Card>
                <Text variant="h3">Project Runs</Text>
                <div className="run-list">
                  {data.runs.map((r) => (
                    <button
                      className={
                        'run-row ' + (selected === r.id ? 'selected' : '')
                      }
                      key={r.id}
                      aria-pressed={selected === r.id}
                      onClick={() => setSelected(r.id)}
                    >
                      <span className="run-title">{r.name}</span>
                      <span className="run-meta">
                        {r.error
                          ? 'Error'
                          : r.end_time
                            ? 'Completed'
                            : 'Running'}{' '}
                        ·{' '}
                        {r.end_time
                          ? (
                              (Date.parse(r.end_time) -
                                Date.parse(r.start_time)) /
                              1000
                            ).toFixed(2) + 's'
                          : '—'}
                      </span>
                      <span className="run-meta">{r.id.slice(0, 8)}</span>
                    </button>
                  ))}
                </div>
                {!data.runs.length && (
                  <Text>No runs in the configured project.</Text>
                )}
              </Card>
              <Card className="detail">
                {detailLoading && (
                  <Text role="status">Loading trace and feedback…</Text>
                )}
                {detail?.truncated && (
                  <Text color="secondary">
                    Trace/feedback limited to 100 records.
                  </Text>
                )}
                {detail && view === 'Traces' && (
                  <>
                    <Text variant="h3">Trace Spans</Text>
                    <div className="span-list">
                      {[...detail.runs]
                        .sort((a, b) =>
                          (a.dotted_order || '').localeCompare(
                            b.dotted_order || ''
                          )
                        )
                        .map((r) => (
                          <Button
                            key={r.id}
                            size="md"
                            color="secondary"
                            variant={span === r.id ? 'outlined' : 'plain'}
                            aria-pressed={span === r.id}
                            onClick={() => setSpan(r.id)}
                          >
                            {r.parent_run_id ? '↳ ' : ''}
                            {r.name} · {r.run_type}
                          </Button>
                        ))}
                    </div>
                    {active && (
                      <>
                        <Text variant="h2">{active.name}</Text>
                        {active.error && (
                          <Text color="error">{active.error}</Text>
                        )}
                        <div className="payloads">
                          <Payload title="Input" value={active.inputs} />
                          <Payload title="Output" value={active.outputs} />
                        </div>
                      </>
                    )}
                  </>
                )}
                {detail && view === 'Online Evals' && (
                  <>
                    <Text variant="h2">Recorded Evaluation Feedback</Text>
                    <Text color="secondary">
                      Existing evaluator results for the selected production
                      run; no evaluators are configured or executed here.
                    </Text>
                    <div className="score-grid">
                      {detail.feedback.map((f, i) => (
                        <Card key={i}>
                          <Text variant="xs" color="secondary">
                            {f.key}
                          </Text>
                          <Text variant="h1">{score(f.score ?? f.value)}</Text>
                          <Text variant="sm">
                            {f.comment || 'No evaluator comment'}
                          </Text>
                        </Card>
                      ))}
                    </div>
                    {!detail.feedback.length && (
                      <Text>
                        No feedback recorded. This run is not evaluated, not
                        failed.
                      </Text>
                    )}
                  </>
                )}
                {!detail && !detailLoading && (
                  <Text>Select a run to inspect its details.</Text>
                )}
              </Card>
            </div>
          )}
          {view === 'Offline Evals' && (
            <Card>
              <Text color="secondary">
                Compare stored experiment scores on the same dataset examples.
                Missing scores stay missing; no benchmark is run from this UI.
              </Text>
              {data.experiments.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Reference Example</th>
                        {data.experiments.map((e) => (
                          <th scope="col" key={e.id}>
                            {e.name}
                            <span className="run-meta">
                              {e.runs.length} sampled runs
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {examples.map((id, i) => (
                        <tr key={id}>
                          <th scope="row">
                            Example {i + 1}
                            <span className="run-meta">{id.slice(0, 8)}</span>
                          </th>
                          {data.experiments.map((e) => {
                            const matches = e.runs.filter(
                              (r) => r.reference_example_id === id
                            );
                            return (
                              <td key={e.id}>
                                {matches.length === 1 ? (
                                  <>
                                    <Text variant="sm">{matches[0].name}</Text>
                                    {keys.length ? (
                                      keys.map((k) => (
                                        <div className="metric" key={k}>
                                          <span>{k}</span>
                                          <strong>
                                            {score(
                                              matches[0].feedback_stats?.[k]
                                                ?.avg
                                            )}
                                          </strong>
                                        </div>
                                      ))
                                    ) : (
                                      <Text>No scores recorded</Text>
                                    )}
                                  </>
                                ) : (
                                  <Text color="secondary">
                                    {matches.length
                                      ? 'Multiple repetitions; aggregation required'
                                      : 'No matching run'}
                                  </Text>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Text>No dataset-linked experiments found.</Text>
              )}
              {data.experiments.length > 0 && !examples.length && (
                <Text>No reference examples in the sampled runs.</Text>
              )}
            </Card>
          )}
        </>
      )}
      <footer>
        <Text variant="xs" color="secondary">
          Built with Macaw · Embed this view inside your authenticated product ·
          All data stays scoped by your backend
        </Text>
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <AppThemeProvider storageKey={null}>
    <App />
  </AppThemeProvider>
);
