---
description: "Use when starting a new feature, planning work, or deciding what to build next. Covers the spec-first rule and the correct agent sequence."
---

# Spec-First Workflow

## The Rule

**No code without a spec.** Before writing any implementation, a spec must exist in `docs/specs/` with status `approved`.

## Agent Sequence

1. **`requirements` agent** — create the spec in `docs/specs/` using `docs/specs/_template.md`
2. **`developer` agent** — read the approved spec, implement the feature, write tests
3. **`reviewer` agent** — compare implementation against the spec and coding standards
4. **`docs-updater` agent** — update the spec to reflect what was actually built (if it diverged)

## Spec Lifecycle

| Status | Meaning |
|--------|---------|
| `draft` | Being written, not ready for implementation |
| `approved` | Ready for implementation |
| `implemented` | Code written and reviewed |
| `updated` | Spec reflects the final implementation |

Each spec file declares its status in the YAML frontmatter: `status: draft`.

## Rules for Agents

- `developer` must not start work on a spec with status `draft`
- `reviewer` must reference specific acceptance criteria by ID (AC-1, AC-2…) in findings
- `docs-updater` must not change the intent of a spec — only document what was built

## Definition of Done

A feature is done when the **orchestrator** (you) confirms all of the following:

- [ ] All ACs satisfied — confirmed by `reviewer` findings
- [ ] All unit tests and e2e tests pass
- [ ] No open critical findings from `reviewer` (or debt explicitly accepted)
- [ ] Manual smoke test by orchestrator — the feature works as expected in the running app

Only after this confirmation should the orchestrator invoke `@docs-updater`.

## Orchestrator Agent

The `orchestrator` agent runs this entire pipeline automatically, pausing at every human gate.
All individual agents remain directly invocable — the orchestrator is a convenience layer, not a replacement.
See `.github/agents/orchestrator.agent.md` for the full pipeline definition.

## Keeping Context Small

- **Max 5 AC per spec.** If a feature needs more, split it into two specs.
- **Archive completed specs.** Once status is `updated`, move the file to `docs/specs/archive/`. Agents work only on `docs/specs/*.md` (top level).
- **`copilot-instructions.md` is an index, not a container.** Never add content there — only pointers to the right file.
- **`docs/decisions/README.md` is an index.** For non-trivial decisions, create `docs/decisions/NNN-title.md` and link from the table.
