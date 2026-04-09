---
description: "Entry point for starting work on a new feature. Checks the spec-first workflow and tells you which agent to invoke next."
tools: [read]
---

Before doing anything, read:
- [Spec-first workflow](../instructions/spec-first-workflow.instructions.md)
- [Project overview](../../docs/specs/overview.md)

Then, based on the current state of the feature I describe, tell me which step we're at and which agent to invoke:

1. **No spec exists** → suggest invoking the `requirements` agent to create one
2. **Spec exists with status `draft`** → remind me to review and approve it before building
3. **Spec is `approved`** → confirm we can invoke the `developer` agent
4. **Code exists but spec status is still `approved`** → suggest invoking the `reviewer` agent, then `docs-updater`

What feature are we working on?
