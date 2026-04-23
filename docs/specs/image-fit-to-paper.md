---
type: spec
status: implemented
approved-by: "PO"
approved-date: "2026-04-23"
open-questions-resolved: true
---

# image-fit-to-paper

## Objective

Add a **Fit** mapping mode so that when a photo's aspect ratio differs from the paper, coordinates are reported relative to the largest proportionally-correct rectangle that fits inside the sheet — preventing stretched or squashed measurements.

## Background

The current mapping in `coordinateMapping.ts` (`mapToCanvas`) multiplies image-relative coordinates directly by paper dimensions, effectively stretching the image to fill the entire sheet regardless of its natural aspect ratio. This feature introduces a second mode that preserves the image ratio.

### Fit algorithm

Given image natural dimensions `imgW × imgH` and paper `paperW × paperH`:

1. **Option A** (paper as-is): fit the image inside `paperW × paperH` → inner rect area = `min(paperW, paperH × R)² / R`, where `R = imgW / imgH`.
2. **Option B** (paper rotated 90°, `paperH × paperW`): same formula with dimensions swapped.
3. Choose the option with the **larger inner area**. If both areas are equal (within tolerance `< 0.01 cm²`), choose Option A (no rotation).
4. Center the inner rect on the chosen paper orientation.
5. The inner rect's top-left offset on the paper (in cm) is `offsetX = (paperW − innerW) / 2`, `offsetY = (paperH − innerH) / 2`.
6. Reported coordinates: `xCm = offsetX + relX × innerW`, `yCm = offsetY + relY × innerH`.

### Preset label update

`src/paperPresets.ts` currently has `label: 'A4'` and `label: 'A5'`. This feature also updates them to `'A4 (21×29.7)'` and `'A5 (14.8×21)'` so users can see dimensions without opening the custom input.

## Acceptance Criteria

- [x] AC-1: A two-state toggle button **Stretch / Fit** is present in the toolbar. The `F` key toggles between modes; the shortcut hint is visible in the UI per the keyboard-first guidelines. The toggle is disabled (and visually muted) when no image is loaded.
- [x] AC-2: In **Fit** mode, a click/tap on the image reports coordinates computed with the Fit algorithm above (inner rect with preserved aspect ratio, centered, with cm offsets). In **Stretch** mode, existing behavior is unchanged.
- [x] AC-3: When Fit mode selects the rotated paper orientation (Option B), a `↺` badge appears on or adjacent to the Fit toggle button, and the paper dimension display swaps (e.g. `18 × 26 cm` → `26 × 18 cm`). Switching back to Stretch mode removes the badge and restores the original dimension display.
- [x] AC-4: In **Fit** mode the canvas renders: (a) a thin dashed border around the inner fitting rect, and (b) a semi-transparent dark overlay on the margin areas outside the inner rect. Clicks/taps that land in the margin area do **not** place a point (treated as out-of-bounds, same as clicking outside the image today).
- [x] AC-5: The A4 and A5 preset selector labels are updated to `A4 (21×29.7)` and `A5 (14.8×21)`.
- [x] AC-6: While **Fit** mode is active, the paper orientation swap button is disabled (visually muted, `disabled` attribute set). It carries a native `title` tooltip with the text `"Orientation is set automatically in Fit mode"`. Switching back to Stretch re-enables the button.

## Out of Scope

- Zooming or panning the image on the canvas.
- Persisting the selected mode across sessions.
- Rotating the image itself (only the paper orientation mapping changes).
- Fit mode for the custom paper size preset — it should work the same as any other size, but no special UX is needed.
- Displaying the inner rect's pixel dimensions or area in the UI.
- Animated transition when switching modes.

## NFR

- **Performance**: Computing the inner rect is O(1); it must complete synchronously inside the existing event handler with no perceptible delay.
- **Security**: No new external inputs or data handling — no additional security surface.
- **Accessibility**: The Stretch/Fit toggle must have a clear `aria-pressed` state and a descriptive `aria-label`. The `↺` badge must have an `aria-label` (e.g. "paper rotated") so it is announced by screen readers.

## Open Questions

- **Q1** ✅ — Badge uses the `↺` text character.
- **Q2** ✅ — Tolerance `< 0.01 cm²` area difference is accepted.

## Notes

- The rotation introduced by Fit mode is **logical only** — it changes which paper dimension is treated as width/height for coordinate mapping. The image on screen does not rotate.
- `coordinateMapping.ts` will need a new exported function (e.g. `mapToCanvasFit`) alongside the existing `mapToCanvas`, keeping Stretch mode untouched.
- The `toImageRelative` / `clampToImageRelative` functions already handle out-of-image-bounds rejection; the Fit mode margin rejection should reuse or extend this pattern rather than duplicating it.
- AC-5 applies only if the labels do not already include dimensions (currently they do not: `label: 'A4'`, `label: 'A5'`).
