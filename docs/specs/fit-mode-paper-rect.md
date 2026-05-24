---
type: spec
status: implemented
approved-by: "PO"
approved-date: "2026-05-24"
open-questions-resolved: true
---

# fit-mode-paper-rect

## Objective

Make Fit the default mode on app load and add a white paper-sheet rectangle to the canvas in Fit mode, so users immediately perceive how the photo sits inside the paper and understand why a point near the image edge may be several centimetres from the paper edge.

## Background

### Part 1 — Fit as default

`isFitMode` is currently initialised to `false` in `App.tsx`. Most users load a photo and expect Fit-mode coordinates, so defaulting to Stretch creates confusion. Changing the initial state to `true` removes that friction.

### Part 2 — Paper rectangle overlay

In Fit mode the coordinate mapping already offsets measurements by the paper margins (`offsetX`, `offsetY` from `computeFitLayout`). However the canvas gives no visual cue of those margins: the image fills its rendered content area and there is nothing to suggest that the paper is larger than the photo.

The new overlay renders a white rectangle (the "paper sheet") behind the image. The image appears inside it — like a photo placed on a blank sheet — so users can intuitively grasp the margin relationship without reading any numbers.

**Layout derivation.** `computeFitLayout` returns `innerW`, `innerH` (image-to-paper fitting rect, in cm) and the effective paper dims (`effectivePaperW`, `effectivePaperH`). Given the image content area on screen (`layout.width × layout.height`), the paper rect on screen is:

```
paperRectW = layout.width  × (effectivePaperW / innerW)
paperRectH = layout.height × (effectivePaperH / innerH)
```

The paper rect is centred on the same point as the image content area. Because the fit algorithm always makes the image touch at least one paper edge, the paper rect is always ≥ the image content area in both dimensions (no upscaling needed for the image itself).

## Acceptance Criteria

- [ ] AC-1: On app load, `isFitMode` is `true`. Fit mode is active before any user interaction, regardless of whether an image is loaded.

- [ ] AC-2: In Fit mode with an image loaded, a white (`#ffffff`) non-interactive (`pointer-events: none`, `aria-hidden="true"`) rectangle is rendered in the canvas behind the image and all point markers. Its on-screen aspect ratio equals the effective paper aspect ratio (honouring the `paperRotated` flag from `fitLayout`).

- [ ] AC-3: The image content area is visually centred inside the paper rectangle. The ratio `image_content_width / paper_rect_width` on screen equals `innerW / effectivePaperW` from `computeFitLayout` (and equivalently for height).

- [ ] AC-4: Coordinate mapping is unchanged — a click at `(relX, relY)` on the image continues to produce the same paper `(xCm, yCm)` as `mapToCanvasFit`. No changes to `coordinateMapping.ts`.

- [ ] AC-5: In Stretch mode (Fit off), the paper rectangle is not rendered and canvas rendering is unchanged from pre-feature behaviour.

## Out of Scope

- Making the paper-rect margins (white area outside the image) clickable or interactive.
- Showing the paper rectangle in Stretch mode.
- Animating the transition between modes.
- Changing the coordinate mapping algorithm.
- Printing or exporting the paper rectangle.

## NFR

- Performance: computing and rendering the paper rect must not cause perceptible lag on window resize (same `ResizeObserver` tick as the existing `ContentLayout` update).
- Accessibility: the paper rect element is purely decorative — it must carry `aria-hidden="true"` and no focusable attributes.
- Visual: the white rectangle must be distinguishable from the canvas background without requiring an additional border or shadow (white-on-dark suffices).

## Open Questions

- OQ-1 ✅ **Keep** the existing dark overlay and dashed border unchanged.
- OQ-2 ✅ **Clipping is acceptable** — no layout rescaling needed.
- OQ-3 ✅ **Add a subtle drop shadow** to the paper rect to separate it from the dark canvas background.

## Notes

- **Part 1 change is trivial:** `useState(false)` → `useState(true)` in `App.tsx` line ~74. Any e2e or unit tests that assert Stretch mode on load (e.g. checking `aria-pressed="false"` on the Fit toggle at startup) will need to be updated.
- **`fitLayout` is already available** in `App.tsx` when `isFitMode && naturalSize && paperSize`. The paper rect dimensions can be derived directly from `fitLayout.innerW`, `fitLayout.innerH`, `fitLayout.paperRotated`, and the `paperSize` props.
- The paper rect does not interact with `clampToImageRelative` or `handleOverlayPointerDown` — those functions operate only on the image content area and are unaffected.
- If OQ-1 resolves to "remove the dark overlay", the `fit-margin-mask` `<defs>` block in `App.tsx` is deleted along with the two overlay rects. The dashed fitting-rect border may be kept as a subtle separator between image and paper margins.
