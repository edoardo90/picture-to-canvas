---
status: implemented
approved-by: ""
approved-date: ""
open-questions-resolved: false
---

# Project Setup

## Objective

Bootstrap the application so a developer can run it locally and see a working page, confirming the toolchain is correctly configured.

## Acceptance Criteria

<!-- Max 5. If you need more, split into a separate spec. -->
- [ ] AC-1: Running `npm install` completes without errors
- [ ] AC-2: Running `npm run dev` starts a local dev server and the app is reachable in the browser
- [ ] AC-3: The browser shows a page with the app name "get-to-canvas" (hello-world placeholder)
- [ ] AC-4: Running `npm test` executes the unit test suite and all tests pass
- [ ] AC-5: Running `./local-dev/start.sh` starts the dev server (equivalent to `npm run dev`)

## Out of Scope

- Any application feature or UI beyond the hello-world placeholder
- E2E test setup (Playwright) — deferred to a subsequent spec
- Deployment configuration

## NFR

- Performance: `npm run dev` cold start under 3 seconds
- Security: no secrets in source code; `.env` in `.gitignore`
- Accessibility: n/a for this spec

## Open Questions

- *(none)*

## Notes

Stack decided in `docs/decisions/001-stack.md`: Vite + React + TypeScript, Vitest for unit tests.

Suggested folder structure (to be confirmed by developer agent):
```
src/
  main.tsx        ← entry point
  App.tsx         ← root component
  App.test.tsx    ← first unit test (smoke)
local-dev/
  start.sh        ← runs `npm run dev` from any working directory
```

`npm run build` should produce a `dist/` folder openable without a dev server (verified manually, not a formal AC for this spec).
