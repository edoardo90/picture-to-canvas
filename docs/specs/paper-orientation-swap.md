---
type: spec
status: implemented
approved-by: "user"
approved-date: "2026-04-23"
open-questions-resolved: true
---

# Paper Orientation Swap Button

## Objective

Give users a single tap/click to swap the paper width and height (toggling between portrait and landscape), so they can quickly match the paper orientation to their needs without re-selecting a preset or re-entering custom values.

## Acceptance Criteria

- [ ] AC-1: A small icon button (using "⇅" or "↔", with an `aria-label` of **"Swap orientation"**) is rendered in the toolbar, immediately adjacent to the paper dimensions display (width × height).
- [ ] AC-2: Clicking the button swaps the paper width and height values in `App.tsx` state — i.e. `widthCm` and `heightCm` are exchanged — and the coordinate display updates immediately to reflect the new orientation.
- [ ] AC-3: The swap works whether the active paper size comes from a preset or from custom width/height values entered by the user.
- [ ] AC-4: After a swap, pressing the button again restores the original values (the operation is a toggle — two taps return to the starting state).
- [ ] AC-5: The button is keyboard-accessible: it is reachable by `Tab` and activatable by `Enter` or `Space`; a visible focus ring is always present.

## Out of Scope

- Any animation during the swap.
- Modifying `paperPresets.ts` — presets remain stored in portrait orientation; the swap only affects in-memory state.
- Automatically re-applying or resetting the swap when the user changes preset.
- Persisting the swapped state across page reloads.
- Interaction with the `paper-auto-orientation` feature (if both are implemented, they operate independently; auto-orientation is spec'd separately).

## NFR

- Performance: The swap is a single state update; no perceptible impact on rendering.
- Security: No user input is parsed; only two existing numeric state values are exchanged — no new attack surface.
- Accessibility: Minimum touch target 44 × 44 px. `aria-label="Swap orientation"` is required; a visible focus ring must always be shown.

## Open Questions

_(none)_

## Notes

- `widthCm` and `heightCm` live in `App.tsx` state today. The swap sets `widthCm ← old heightCm` and `heightCm ← old widthCm` in a single `setState` call (or two coordinated calls using the functional form).
- If the `paper-auto-orientation` spec is implemented alongside this one, the two must not conflict: auto-orientation derives an *effective* orientation at render time, while this button mutates stored state. The interaction between them is **explicitly out of scope** for this spec.
- Icon choice ("⇅" vs "↔") is left to the developer; either communicates "swap axes". Vertical arrows ("⇅") may communicate portrait↔landscape more intuitively.
