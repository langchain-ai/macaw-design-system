const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const project = id(1);
export const experiments = [
  { id: id(2), name: 'Baseline · GPT-4.1', run_count: 3 },
  { id: id(3), name: 'Candidate · Retrieval v2', run_count: 3 },
];
const run = (n, session, example, name, score) => ({
  id: id(n),
  session_id: session,
  reference_example_id: id(example),
  trace_id: id(n),
  parent_run_id: null,
  dotted_order: String(n),
  name,
  run_type: 'chain',
  start_time: '2026-10-02T10:00:00Z',
  end_time: '2026-10-02T10:00:01.240Z',
  inputs: { question: name },
  outputs: { answer: 'Your order ships within two business days.' },
  error: null,
  feedback_stats: { correctness: { avg: score } },
});
export const runs = [
  run(10, project, 101, 'When will my order arrive?', 0.96),
  run(11, project, 102, 'Can I change my shipping address?', 0.82),
  run(12, project, 103, 'What is the return policy?', null),
  ...experiments.flatMap((e, i) => [
    run(20 + i * 10, e.id, 101, 'Shipping time', i ? 0.95 : 0.78),
    run(21 + i * 10, e.id, 102, 'Address changes', i ? 0.91 : 0.65),
  ]),
];
export const children = runs
  .slice(0, 3)
  .map((r, i) => ({
    ...r,
    id: id(50 + i),
    parent_run_id: r.id,
    name: 'Retrieve shipping policy',
    run_type: 'retriever',
    dotted_order: r.dotted_order + '.1',
    outputs: { documents: ['Standard shipping: two business days.'] },
  }));
export const feedback = (r) =>
  r.feedback_stats.correctness.avg == null
    ? []
    : [
        {
          id: id(1000),
          run_id: r.id,
          key: 'correctness',
          score: r.feedback_stats.correctness.avg,
          value: null,
          comment: 'Supported by the retrieved policy.',
          feedback_source: { type: 'model' },
        },
      ];
