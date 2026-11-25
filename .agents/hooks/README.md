# Design-system context

Claude Code and Codex load the canonical contributor skill on `SessionStart` and
`SubagentStart`, including session resume and compaction. `AGENTS.md` routes other
agents to the same guidance. The hook requires Bash and jq; Codex also uses Git
to locate the repository when started from a subdirectory.

Keep lifecycle hooks enabled. Codex project hooks must be reviewed and trusted
through `/hooks`, including after hook definitions change. These hooks run only
at lifecycle boundaries and add no per-command checks. They do not install hooks
in consuming applications or change the packaged CLI skill.

Codex's `additionalContextLimit` is an approximate token threshold. The 10,000
limit leaves headroom for the contributor skill; keep the emitted UTF-8 byte
count below it as a conservative size check when expanding the skill.
