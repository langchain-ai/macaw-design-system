# Measure agent outcomes with Macaw

We measure retrieval separately from finished UI work. A better search result can help an agent choose a component, but it does not prove better accessibility, lower cost, or fewer human corrections.

## Start with deterministic checks

| Command               | What it checks                                                                                                                | What it does not prove                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm check:design`   | New literal color, palette, spacing, stacking, and unknown variable findings in component implementation source               | Runtime styles, computed classes, accessibility, or visual quality                                        |
| `pnpm test:a11y`      | Tagged Storybook interactions in Chromium, in light and dark themes; stories with `a11y.test: 'error'` fail on axe violations | Complete library coverage, screen-reader usability, or a clean axe result for stories still marked `todo` |
| `pnpm test:visual`    | Matched screenshots of selected real stories against a supplied baseline                                                      | Accessibility or approval of a changed appearance                                                         |
| `pnpm eval:retrieval` | Accepted-family rank on the checked-in search cases                                                                           | Successful agent implementation or production cost savings                                                |

The existing package-build path and lint command run `check:design`; no workflow changes are required. We use the existing parser and browser tools, not a new dependency or hosted service.

### Design-rule boundaries

`scripts/design-rules.mjs` checks TypeScript string literals, template segments, numeric `zIndex` object properties, and CSS declaration values. It catches literal raw colors, selected palette utilities and primitive variable references, numeric spacing utilities, numeric stacking utilities, and unknown `var(--name)` references. Zero spacing is allowed. Token definitions may bind primitives; Radix variables are external contracts. CSS and inline custom-property declarations contribute known variable names.

The scanner excludes stories, tests, documentation, and icon assets. It does not evaluate JavaScript, resolve spreads, follow identifier values, or inspect generated styles. Numeric geometry such as chart widths is not forbidden. The unknown-variable check is a source inventory, not a CSS cascade validator. Consumers still need their application-specific rules.

`scripts/design-baseline.json` records existing findings by file, rule, literal, and occurrence count. Removing one literal does not allow a different literal or rule, and adding another occurrence fails. Moving an identical literal within a file is indistinguishable from its original occurrence. Remove obsolete allowances as debt is fixed; additions require explicit review rather than an automatic baseline refresh.

### Accessibility rollout

The Input playground and error/disabled states, plus the warning Banner, now run strict axe checks in both themes. The input stories also assert keyboard focus, editing, error descriptions, and disabled behavior. Existing strict story checks remain in place.

Do not switch every story from `todo` to `error` without fixing or triaging its findings. Several existing chat and markdown compositions still report label/name or landmark issues. A successful tagged run is not evidence that these known-debt stories have zero violations. Grow strict coverage by named user scenario, leaving open menus and dialogs visible for the final scan.

## Compare screenshots without committing generated assets

Start the real Storybook with `pnpm storybook`. Use the same browser build, OS, fonts, viewport, data, and theme for both runs. The harness fixes a 1024 × 768 viewport, device scale 1, reduced motion, and waits for fonts and the selected theme.

Start Storybook from the base checkout. Run the candidate checkout's harness against that base server to intentionally create a baseline outside the repository:

```bash
MACAW_VISUAL_BASELINE=/tmp/macaw-visual-baseline \
  MACAW_STORYBOOK_URL=http://127.0.0.1:5264 \
  pnpm test:visual --update-snapshots
```

On the candidate checkout, restart Storybook and compare without updating:

```bash
MACAW_VISUAL_BASELINE=/tmp/macaw-visual-baseline \
  MACAW_STORYBOOK_URL=http://127.0.0.1:5264 \
  pnpm test:visual
```

The cases use these real story IDs in both themes:

- `components-inputs-input--sizes-and-variants`: size and variant matrix
- `components-inputs-input--states`: errors, required fields, and disabled fields
- `components-status-banner--warning`: persistent warning
- `components-layout-dialog--with-description`: opened confirmation dialog

Playwright writes mismatch images under the system temporary directory, in `macaw-visual-results`. Review differences before accepting a baseline. This is an opt-in local harness, not a new mandatory CI gate: CI needs a separately approved, versioned baseline store. Primitive screenshots also do not replace screenshots of the consuming application's router, providers, layout, and real data.

## Run the retrieval diagnostic

From this checkout:

```bash
pnpm eval:retrieval > /tmp/macaw-retrieval-candidate.json
```

The eight cases in `scripts/retrieval-cases.json` cover forms, confirmation, single choice, searchable choice, warnings, routine loading, AI thinking, and error recovery. The report includes raw ranked families, hit rate at three, and mean reciprocal rank at ten. We deduplicate component subparts by family before scoring. Accepted families are alternatives, not an instruction to use all of them.

For a baseline source checkout, reuse the same frozen cases and runner, but point at that checkout's source CLI:

```bash
node scripts/eval-retrieval.mjs \
  --cli /absolute/base/packages/components/src/cli.mts \
  --cwd /absolute/base \
  > /tmp/macaw-retrieval-base.json
```

An installed CLI's JavaScript entry can also be passed with `--cli`, with `--cwd` set to the consumer project. Record the resolved package versions or lockfile: old results may not contain `packageVersion`. A failed command or malformed response is an error, not an empty search result. Missing relevant results receive rank `null`.

Keep a held-out query set. Improving the eight checked-in phrases alone is not evidence of general retrieval quality. Expand the cases with real unsuccessful queries and review acceptable alternatives with a designer.

### Development-set result

Using the same eight checked-in cases, compare source CLI at `72de42b` with this change. Both use the same Node 26 runtime and dependency installation; no agent implementation tasks were run.

| Retrieval-only measure                 | Before (`72de42b`) | After (this change) |
| -------------------------------------- | ------------------ | ------------------- |
| Accepted family in top 3               | 3/8 (37.5%)        | 8/8 (100%)          |
| Mean reciprocal rank, first 10 results | 0.375              | 1.000               |

This is a **tuned development set**, not a held-out benchmark: missing confirmation, routine-loading, and error-recovery phrases informed source-backed guidance additions. These results confirm coverage of these phrases only; they do not establish general retrieval improvements, visual quality, token savings, or faster completed work. The runner emits per-query rankings so future measurements can retain failures rather than hide them in an aggregate.

## Evaluate finished agent work

Use five small, repeatable implementation tasks in a fixed consumer starter:

| Task                     | Required behavior                                                                     | Failure signals                                                    |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Settings form            | Labeled fields, associated help/errors, keyboard submit, disabled save state          | Hand-built field primitive, invented props, missing descriptions   |
| Destructive confirmation | Named dialog, explicit destructive action, cancel, Escape, trapped and restored focus | Destructive default focus, missing name, lost focus                |
| Searchable picker        | Search, select, empty result, correct keyboard behavior                               | Menu used as a selection field, inaccessible trigger               |
| Persistent warning       | Semantic warning surface, concise message, optional action                            | Toast substituted for persistent information, raw color styling    |
| Loading and error layout | Distinguish routine loading from AI thinking; actionable recovery                     | AI animation for routine fetch, no status announcement or recovery |

For each task, run a baseline and a candidate with the same agent/model snapshot, system instructions, starter commit, package versions, tool permissions, token budget, viewport, and seed where supported. Change only the guidance/catalog treatment. Use fresh sessions, randomize treatment order, and run at least five repetitions per task and treatment. Record cached-token behavior; do not compare a warm cache to a cold one without labeling it.

Keep one JSONL record per attempt with these fields:

```json
{
  "task": "settings-form",
  "treatment": "baseline-or-candidate",
  "repeat": 1,
  "model": "exact-model-snapshot",
  "starterSha": "commit",
  "packageVersions": {},
  "guidanceSha": "commit",
  "traceUrl": null,
  "inputTokens": null,
  "cachedInputTokens": null,
  "outputTokens": null,
  "costUsd": null,
  "latencyMs": null,
  "toolCalls": null,
  "inventedApis": null,
  "newDesignViolations": null,
  "axeViolations": null,
  "behaviorPassed": null,
  "humanCorrections": null,
  "visualRating": null
}
```

Use `null` for unmeasured values, not zero. Report successful-attempt rate separately from cost and latency, including unsuccessful attempts in resource totals. Count corrections after the first submitted result, with a fixed definition of one correction. Have a reviewer who does not know the treatment rate visual quality from 1–5 against the same rubric: hierarchy, spacing, alignment, and correct component states. Report sample size, medians, spread, and task-level results, not just one aggregate score.

Use the agent's trace export for token, latency, and tool-call data; capture screenshots and keyboard/axe evidence with the existing browser tools. LangSmith datasets and experiments are an optional way to run and compare these tasks if the team already has an authorized connection. They are not required by these scripts, and this change does not send code or traces to a hosted service.

Publish a before/after table with measured values and links to the exact cases, commits, outputs, and review rubric. Do not translate retrieval gains into claimed end-to-end savings until these repeated implementation runs support that claim.
