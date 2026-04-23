---
type: spec
status: implemented
approved-by: ""
approved-date: ""
open-questions-resolved: true
---

# Paper Custom Size Input

## Objective

Let the user enter a custom paper width and height in centimetres, so they are not limited to the three built-in presets.

## Acceptance Criteria

- [ ] AC-1: A **"Custom…"** option is appended to the end of the existing preset `<select>`. All existing preset options and their behaviour are unchanged.
- [ ] AC-2: Selecting **"Custom…"** reveals two `<input type="number">` fields — labelled **"W"** and **"H"** (unit: cm) — inline in the toolbar, immediately after the select element. Switching back to any named preset hides those fields.
- [ ] AC-3: When both fields contain a valid value (a positive number greater than 0), the paper size in app state is updated **synchronously** to the entered width × height. The update fires on every change event so the coordinate display reflects the new dimensions without requiring an explicit confirm action.
- [ ] AC-4: While the custom inputs are visible, the `<select>` still shows the **"Custom…"** option as selected. If the user edits only one field, the paper size in app state becomes `null` until both fields are valid.
- [ ] AC-5: The custom fields are **keyboard-accessible**: `Tab` moves focus from W to H and back out to the next toolbar control; the global `Delete`-key shortcut for removing points is already suppressed for `INPUT` elements and requires no additional work.

## Out of Scope

- A single combined text field accepting "24x22" format — two separate numeric inputs are chosen because they map directly to native `<input type="number">`, provide independent validation, and are more accessible on mobile (numeric keyboard per field).
- Unit selection (cm only, consistent with existing presets).
- Persisting custom values to localStorage between sessions.
- Landscape/portrait toggle — width × height is taken as entered; no axis swap is applied.
- Input validation feedback beyond the browser's native `min`/`step` constraints.

## NFR

- Performance: State updates are synchronous; no debouncing or async operations.
- Security: Values are parsed as numbers by the browser's native `<input type="number">`; no raw string is passed to coordinate logic. The coordinate-mapping layer already receives numeric `widthCm`/`heightCm` values and is unaffected.
- Accessibility: Each input must have a visible label ("W cm" / "H cm") or an `aria-label`. Minimum touch target 44 × 44 px. Focus ring always visible.

## Open Questions

_All resolved._

- **OQ-1 (resolved):** Custom W/H values are **remembered** in component state for the lifetime of the session. When the user switches to a preset and back to "Custom…", the fields re-populate with the previously entered values.
- **OQ-2 (resolved):** The `<select>` always shows the **static label "Custom…"**, regardless of the currently entered dimensions.

## Notes

- **Implementation hint (for developer — do not implement before approval):** The `PaperSizeId` union in `paperPresets.ts` will need a `'custom'` variant, or the custom size can be represented as an ad-hoc `PaperSize` object with `id: 'custom'` constructed directly in the component without changing the presets array.
- The existing global `keydown` handler in `App.tsx` already skips `Delete`/`Escape` logic when the focused element is an `INPUT`, `SELECT`, or `TEXTAREA` — the custom fields are covered automatically.
- The toolbar already contains a `<select>` and a button; the two extra inputs should be rendered as a compact inline group (e.g. `W [___] H [___]` with short labels) to avoid crowding the toolbar row.
