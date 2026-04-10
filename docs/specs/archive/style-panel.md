---
type: spec
status: updated
approved-by: PO
approved-date: 2026-04-10
implemented-date: 2026-04-10
open-questions-resolved: true
---

# Style Panel (Floating)

## Objective

Move the seven style controls out of the toolbar and into a toggleable floating panel overlaid on the canvas — so the toolbar stays compact and the style controls remain accessible without crowding the workspace.

## Acceptance Criteria

- [x] AC-1: The toolbar contains exactly four controls in this order: **Load**, **Paper size**, **Points Style** (toggle button), **Hide**. The seven style controls (point colour, point radius, point opacity, label font size, label opacity, label offset, label coordinate gap) are no longer rendered inside the toolbar.
- [x] AC-2: Clicking/tapping the **Points Style** button opens the floating panel if it is closed, and closes it if it is open. The button reflects the current state via `aria-expanded` and `aria-controls="style-panel"`.
- [x] AC-3: The floating panel closes when (a) the user presses **Esc**, (b) the user clicks or taps outside the panel and outside the Style button, or (c) the user re-clicks the Style button (covered by AC-2).
- [x] AC-4: The panel is positioned as a floating overlay near the toolbar and on top of the canvas — it does not shift the canvas or alter the toolbar layout. It contains all seven style controls laid out horizontally in a wrapping flex row; each field shows its label above and its input below.
- [x] AC-5: While the panel is open, focus is trapped inside it; Tab and Shift+Tab cycle only through the panel's focusable elements. When the panel closes, focus returns to the **Points Style** button.

## Out of Scope

- Per-point style overrides.
- Persisting the panel's open/closed state between sessions.
- Animating the panel open/close transition.
- Changing style rendering, localStorage persistence, or clamping behaviour (covered by the archived point-style-customisation spec).
- Repositioning the panel via drag.

## NFR

- Performance: Opening and closing the panel must be instantaneous — no perceptible animation delay.
- Security: No data leaves the device; all state is local.
- Accessibility: The Style button must have `aria-expanded` and `aria-controls` pointing to the panel. The panel must have `role="dialog"` (or equivalent) and a visible title or `aria-label`. All seven controls inside the panel retain their existing `<label>` associations and keyboard operability.

## Open Questions

- ~~**OQ-1:** Should the panel be dismissed on Escape even when focus is on an input inside it (e.g. a number field)?~~ **Resolved:** Yes — Esc always closes the panel regardless of which element inside has focus.
- ~~**OQ-2:** Where exactly should the panel be anchored — above the toolbar, or at a fixed viewport position?~~ **Resolved:** Anchored below the toolbar (which sits at the top of the viewport), using `position: fixed` with `top` set to the toolbar's bottom edge.

## Notes

- The seven style controls were moved out of `App.tsx` into a new `src/StylePanel.tsx` component.
- `App.tsx` owns `isStylePanelOpen` state, `styleButtonRef`, and `closeStylePanel()`. The `StylePanel` receives `topOffset` (calculated as `toolbarRef.current.getBoundingClientRect().bottom`) to anchor itself below the toolbar.
- Toolbar and panel backgrounds use `rgba(34, 34, 34, 0.8)` (80% opacity), making the canvas visible through both.
- The accepted tech debt: fallback value `56` (unextracted constant) in `App.tsx` when `toolbarRef.current` is null at render time.
- Outside-click dismiss uses a `pointerdown` listener on `window`; it guards against the `styleButtonRef` to prevent toggle double-firing. The e2e test clicks at absolute viewport coordinates `(400, 400)` to avoid landing on the panel which is `position: fixed` at the top.
- See `docs/specs/archive/point-style-customisation.md` for full context on the seven controls, their defaults, ranges, and localStorage persistence.
- See `docs/specs/toolbar-resize-toggle.md` for the existing toolbar structure and the Hide/FAB affordance.
