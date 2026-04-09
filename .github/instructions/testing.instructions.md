---
description: "Use when writing, planning, or reviewing tests. Covers unit and e2e philosophy, speed NFR, and what not to test."
---

# Testing

## NFR: Speed

Speed is the primary NFR for both unit and e2e tests. A slow test suite is a test suite that stops being run.

## Unit Tests

- Prefer in-process, in-memory tests with no I/O (no network, no file system, no real DOM)
- Test behavior, not implementation — if a refactor breaks a test without changing observable behavior, the test is wrong
- One concept per test; one assertion per test where possible
- Edge cases, error handling, and boundary conditions belong in unit tests

## E2E Tests

- Cover only critical user paths (the happy paths that represent core user value)
- Do not use e2e to test edge cases or error responses — that is unit test territory
- Keep the e2e suite small enough to run in CI on every PR without slowing the pipeline

## What Not to Test

- Internal/private functions that are not part of a public contract
- Framework behavior (trust the framework's own test suite)
- Implementation details that may change without behavior changing

<!-- TODO: add specific tooling (e.g. Vitest, Playwright, Cypress) when the stack is chosen -->
