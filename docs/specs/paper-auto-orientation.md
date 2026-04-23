---
type: spec
status: draft
approved-by: ""
approved-date: ""
open-questions-resolved: true
---

# Auto-orient paper to match photo orientation

## Objective

Automatically swap the effective paper width and height in `App.tsx` when the photo and paper preset have mismatched orientations, so that point coordinates are always labelled correctly without requiring any user action.

## Acceptance Criteria

- [ ] AC-1: For a landscape photo and a portrait paper preset, the bottom-right point's X coordinate equals `max(widthCm, heightCm)` and Y equals `min(widthCm, heightCm)`.
- [ ] AC-2: For a portrait photo and a portrait paper preset, the coordinates are unchanged (`widthCm` for X, `heightCm` for Y).
- [ ] AC-3: The `aria-label` on each point group uses the correct orientation-aware coordinates.
- [ ] AC-4: All existing unit and e2e tests continue to pass.

## Out of Scope

- A user-facing toggle or control to manually override orientation.
- Changes to the signature of `mapToCanvas`.
- Changes to `paperPresets.ts` (presets remain stored in portrait orientation).
- Handling square photos or square paper in any special way (treated as "no swap needed").

## NFR

- Performance: No perceptible impact — the swap is a single comparison executed on each render.
- Security: No user input involved; no new attack surface.
- Accessibility: `aria-label` must reflect the corrected coordinates (covered by AC-3).

## Open Questions

_(none)_

## Notes

- Paper presets store `widthCm` as the short side and `heightCm` as the long side (portrait convention).
- Swap logic: if `photo.naturalWidth > photo.naturalHeight` (landscape) **and** `widthCm < heightCm` (portrait preset), then `effectiveWidth = heightCm`, `effectiveHeight = widthCm`. Same swap applies if the photo is portrait and the preset happens to be landscape. Otherwise no swap.
- The change is confined to `src/App.tsx` at the `mapToCanvas` call site. `src/coordinateMapping.ts` and `mapToCanvas` are not modified.
