---
description: "Use when designing or implementing UI components, layouts, or interactions. Covers visual style, keyboard-first interaction, and affordances."
---

# UI & Interaction Guidelines

## Visual Style

- **Minimal and neutral**: restrict palette — near-white/dark background, one accent colour, muted greys for chrome
- **Large and spacious**: generous padding; interactive targets minimum 44×44 px
- **Canvas-dominant layout**: the drawing canvas fills the screen; toolbars overlay or flank it — they never push it
- No decoration without meaning: no gradients, borders, or shadows unless they carry information

## Keyboard-First

- Every action must be reachable without a mouse
- `Esc` always closes/cancels the current modal, panel, or active mode
- `Tab` / `Shift+Tab` cycles interactive elements in logical DOM order
- `Enter` / `Space` confirms the focused action
- Single-key shortcuts for frequent actions (e.g. `z` undo, `+`/`-` zoom)

## Affordances

- Keyboard shortcuts are **visible in the UI** — not hidden in a help popup
- Shortcut hints appear next to the label, subdued (muted colour or lower opacity), e.g. `Undo  Z`
- `?` opens a compact shortcut reference overlay

## Component Rules

- Prefer native HTML elements (`<button>`, `<input>`) over custom ARIA widgets
- Focus ring must always be visible — never `outline: none` without a custom replacement
- Focus trapping in modals; focus returns to the trigger on close
