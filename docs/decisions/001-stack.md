# 001 — Stack: Vite + React + TypeScript, browser-first

**Date**: 2026-04-09

## Decision

Use Vite + React + TypeScript as the application stack. Run in the browser; no native wrapper.

## Rationale

- Widely represented in AI model training → better code output from the `developer` agent
- Core logic (coordinate mapping) is pure functions → fully testable without a browser
- Browser-first covers all requirements: works offline, shareable via Netlify Drop link
- TypeScript types map naturally to spec acceptance criteria

## Testing

- **Unit**: Vitest — in-process, sub-second feedback
- **E2E**: Playwright — only critical user paths

## Future

If native distribution is ever needed, Tauri can wrap the existing Vite app with minimal changes.
