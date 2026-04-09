# get-to-canvas

An app for freehand drawing: given a reference photo and paper sheet dimensions, lets users place points on the photo and know their exact position on the paper.

## Spec-First Rule

**Never write code for a feature that has no approved spec.**
Specs live in `docs/specs/`. If a spec doesn't exist, use the `requirements` agent to create one first.

## Agent Map

| Agent | When to invoke | Writes code? | Writes specs? |
|-------|----------------|--------------|---------------|
| `orchestrator` | Run the full pipeline end-to-end | No | No — delegates |
| `requirements` | New feature or change request | No | Yes — creates |
| `developer` | Spec exists with status `approved` | Yes | No |
| `reviewer` | Code is written | No | No |
| `docs-updater` | Feature is implemented and reviewed | No | Yes — updates |

## Key Paths

- Specs: `docs/specs/`
- Spec template: `docs/specs/_template.md`
- Decision log: `docs/decisions/README.md`
- Workflow rules: `.github/instructions/spec-first-workflow.instructions.md`
- UI & interaction rules: `.github/instructions/ui-guidelines.instructions.md`
