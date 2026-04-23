---
type: spec
status: updated
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

## Notes

All acceptance criteria are met. No divergences from implementation were found.
