---
description: "Use when writing, reviewing, or refactoring application code. Covers quality principles, architecture guidelines, and security baseline."
---

# Coding Standards

## Principles

- **Single responsibility**: each module, class, or function does one thing
- **Explicit over implicit**: avoid magic values, hidden state, and surprising side effects
- **Fail fast**: validate at system boundaries; trust internal contracts
- **Small, pure functions**: prefer functions that take inputs and return outputs with no side effects
- **No premature abstraction**: don't extract a helper until you have at least two concrete use cases

## Architecture

- Keep I/O (network, file system, DOM) at the edges of the system
- Business logic must not depend on framework internals
- Prefer composition over inheritance

## Security (OWASP Top 10 baseline)

- Validate and sanitize all user input at system boundaries
- Never expose internal error details to the user
- No secrets in source code or logs

## Naming

- Names must communicate intent; avoid abbreviations
- Boolean names start with `is`, `has`, `can`, or `should`
- Functions are verbs, data structures are nouns

<!-- TODO: add applyTo glob and tool-specific rules when the stack is chosen -->
