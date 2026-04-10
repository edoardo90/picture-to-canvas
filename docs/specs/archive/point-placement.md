---
type: spec
status: updated
approved-by: PO
approved-date: 2026-04-09
implemented-date: 2026-04-10
open-questions-resolved: true
---

# Point Placement & Coordinate Mapping (E-3)

## Objective

Allow the user to place, move, and delete points on the reference photo, and see the real-world position of each point on the paper sheet — so they know exactly where to draw each mark.

## Acceptance Criteria

- [x] AC-1: When an image and a paper size are both loaded, tapping/clicking anywhere on the image places a small, discrete point marker at that position.
- [x] AC-2: Each point displays its computed paper coordinates (x cm, y cm) close to the marker, measured from the top-left corner of the paper sheet, proportional to the image area.
- [x] AC-3: The user can select a point by clicking/tapping it. A selected point has a distinct visual state (e.g. highlighted ring). Only one point can be selected at a time.
- [x] AC-4: Pressing `Delete` (`Canc`) while a point is selected removes that point. Pressing `Escape` deselects without deleting.
- [x] AC-5: A selected point can be repositioned by clicking and dragging it; the coordinates update live during the drag.
- [x] AC-6: When the paper size is changed after points have been placed, all coordinates are silently recomputed — no points are removed.
- [x] AC-7: Clicking/tapping on the image background (not on a point marker) deselects any selected point and places a new point at that position.

## Out of Scope

- Labelling or numbering points beyond their coordinates.
- Undo/redo.
- Placing points before both an image and a paper size are selected.
- Exporting or printing the point list.
- Multi-point selection.

## NFR

- Performance: Coordinate values must update synchronously during drag — no perceptible lag on a mid-range mobile device.
- Security: All computation is local; no data leaves the device.
- Accessibility: Point markers must be reachable and deletable via keyboard alone (Tab to cycle through points, Delete to remove the focused one).

## Open Questions

- ~~**OQ-1:** Should clicking the image background always place a new point, or should there be a distinct "add mode" vs "select mode"?~~ **Resolved:** Every click on the background places a new point; clicking a marker selects it.
- ~~**OQ-2:** What is the maximum number of points supported in v1?~~ **Resolved:** No hard limit in v1.

## Implementation Notes

**Component structure (`src/App.tsx`):**
- Points stored as `PlacedPoint[]` state: `{ id: string, relX: number, relY: number }` where `relX/relY` are fractional coordinates (0–1) relative to the displayed image content area.
- `layout` state (`ContentLayout`) tracks the pixel bounding box of the image content inside the `object-fit` container, updated via `ResizeObserver`.
- Selection tracked by `selectedId: string | null`. Drag tracked by `draggingId: string | null`.
- Points only render when `paperSize` is non-null and `layout` is available — the JSX guard `{paperSize && (` narrows `paperSize` to non-null for typescript without assertions.

**Point markers (SVG):**
- Each point is rendered as a `<g tabIndex={0} role="button">` inside a full-overlay `<svg class="app__point-overlay">`.
- Hit area: `<circle r={12} fill="transparent" pointerEvents="all">` — explicit `pointerEvents: 'all'` required because SVG ignores transparent fills by default.
- Visual marker: `<circle r={4}>` (r=5 when selected), `pointerEvents: 'none'`.
- Selection ring: `<circle r={9}>` rendered only when selected, `pointerEvents: 'none'`.
- Text label: `<text>` positioned at `(x+10, y-6)` relative to marker center; participates in pointer events (no override) so clicks on the label bubble to the `<g>` handler correctly.

**Interaction model:**
- `handleMarkerPointerDown` on `<g>`: calls `stopPropagation()` to prevent the overlay's `handleOverlayPointerDown` from firing, sets `selectedId`, starts drag via `setPointerCapture`.
- `handleOverlayPointerDown` on `<svg>`: always sets `selectedId(null)`, then places a new point if the click lands inside image bounds (`toImageRelative` returns non-null). Clicks in SVG chrome outside the image content area only deselect.
- `Delete`/`Escape` handled on `window` keydown — guarded against `INPUT`/`SELECT`/`TEXTAREA` targets.
- Keyboard selection: `onFocus` on `<g>` sets `selectedId`, so Tab-navigation selects the focused point.

**Coordinate mapping (`src/coordinateMapping.ts`):**
- `mapToCanvas(relX, relY, widthCm, heightCm)` — pure function, fully unit-tested.
- Formula: `xCm = relX * widthCm`, `yCm = relY * heightCm`.

## Divergences from Spec

- **OQ-1 resolution wording**: the resolved note said "clicking a marker selects/deselects it". The implementation does not toggle: clicking a selected marker does not deselect it (a second click starts a drag). Deselection happens via clicking the background or pressing `Escape`. Behaviour is correct per AC-3 and AC-4; only the OQ wording was imprecise.
- **Pointer-events bug fixed during implementation**: the initial build had a SVG pointer-events issue where the overlay intercepted clicks before they reached `<g>` markers. Fixed by adding `pointerEvents: 'all'` to the hit-area circle and removing `pointerEvents: 'none'` from the text label.
