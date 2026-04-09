---
type: spec
status: updated
approved-by: PO
approved-date: 2026-04-09
open-questions-resolved: true
---

# Paper Setup

## Objective

Allow the user to select the dimensions of the physical paper sheet they are drawing on, so the app can compute real-world coordinates for placed points.

## Acceptance Criteria

- [x] AC-1: A paper-size selector is always visible in the toolbar (before and after an image is loaded). It presents exactly three preset options: **A4** (21 × 29.7 cm), **A5** (14.8 × 21 cm), and **18 × 26 cm**.
- [x] AC-2: The selector shows which preset is currently active. On first load, no preset is selected (the selector defaults to a "Select size" placeholder).
- [x] AC-3: Selecting a preset immediately records the paper dimensions (width and height in cm) in the application state.
- [x] AC-4: The stored dimensions are accessible to the coordinate-mapping logic without coupling that logic to the UI component.
- [x] AC-5: The selector is keyboard-accessible: focusable with `Tab`, opened and navigated with arrow keys, confirmed with `Enter` — matching native `<select>` behaviour.

## Out of Scope

- Custom (free-form) width/height input.
- Unit selection (cm is the only unit in this feature).
- Landscape/portrait toggling — the preset values are the canonical dimensions as entered; no reordering of width/height is applied.
- Persisting the selected size between sessions.
- Recomputing existing points when the preset changes (deferred to E-3; the decision is that points will be silently recomputed, not invalidated).

## NFR

- Performance: Selecting a preset must update state synchronously — no async operations.
- Security: No user input is transmitted; values are drawn from a hard-coded preset list.
- Accessibility: The selector must have a visible label ("Paper size") and a visible focus ring.

## Open Questions

- ~~**OQ-1:** Should the selector also appear (and be usable) before an image is loaded, or only after?~~ **Resolved:** The selector is always visible, regardless of whether an image is loaded.
- ~~**OQ-2:** When the user changes the preset after having placed points, should they be invalidated or silently recomputed?~~ **Resolved:** Points will be silently recomputed. Handling deferred to E-3 spec.

## Notes

- Preset dimensions (in cm):
  | Label | Width | Height |
  |-------|-------|--------|
  | A4    | 21    | 29.7   |
  | A5    | 14.8  | 21     |
  | 18 × 26 | 18  | 26     |
- The 18 × 26 cm preset corresponds to a common sketchbook format.
- The coordinate-mapping logic (E-3) will consume the paper dimensions from state; this spec only covers storing them.

## Implementation Notes (divergences from spec)

### Data module (`paperPresets.ts`)
Preset data lives in a dedicated pure module exporting `PaperSizeId` (a literal union `'a4' | 'a5' | '18x26'`), `PaperSize` type, and `PAPER_PRESETS` array. This was not prescribed by the spec but satisfies AC-4: the coordinate-mapping logic in E-3 can import from this module without any dependency on React or the UI.

### Unknown-id guard in `handlePaperSizeChange`
The change handler resolves `event.target.value` against `PAPER_PRESETS` and falls back to `null` if no match is found (`?? null`). This is a defensive measure not described in the spec; it prevents a hypothetical tampered `<option>` value from injecting an arbitrary object into state.

### State exposure via `data-paper-*` attributes
`data-paper-width` and `data-paper-height` are set on the `<select>` element reflecting the current `paperSize` state (empty string when `null`). These attributes are not part of the user-visible interface; they exist solely as a test-observable surface for AC-3 assertions without exposing React internal state.

### `PaperSizeId` literal union (type safety)
The `id` field on `PaperSize` is typed as `PaperSizeId = 'a4' | 'a5' | '18x26'` rather than plain `string`. This was introduced after a reviewer finding to prevent invalid preset IDs at compile time.
