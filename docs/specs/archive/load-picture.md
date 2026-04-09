---
type: spec
status: updated
approved-by: ""
approved-date: ""
open-questions-resolved: true
---

# Load Picture

## Objective

Allow the user to select an image file from their device and display it prominently, so they have a reference photo to work from.

## Acceptance Criteria

- [x] AC-1: A "Load picture" button is visible on the initial screen. Activating it opens the device's native file picker filtered to image types (`image/*`).
- [x] AC-2: After a file is selected, the image is displayed in the main display area, filling as much of the available space as possible while preserving its aspect ratio.
- [x] AC-3: The loaded image is never uploaded to a server — it is read locally in the browser via `URL.createObjectURL`.
- [x] AC-4: The "Load picture" button remains accessible after an image is loaded, allowing the user to replace the current image.
- [x] AC-5: The button is keyboard-accessible: it can be focused with `Tab` and activated with `Enter` or `Space`.

## Out of Scope

- Persisting the loaded image between sessions.
- Accepting images from a URL or camera capture.
- Applying any transformations (crop, rotate, zoom) to the image.

## NFR

- Performance: The image must be displayed within 500 ms of the user confirming the file selection on a mid-range mobile device.
- Security: No image data leaves the device; file access uses browser-native object URLs only.
- Accessibility: The button must have a visible focus ring and a descriptive accessible label.

## Open Questions

- ~~Should there be a visual placeholder / empty-state illustration before any image is loaded? — owner: designer/PO~~
  **Resolved:** A simple text fallback `"No image loaded"` is rendered in the display area before any image is selected.

## Notes

- The display area is the foundation for future features (point placement, coordinate mapping), so its layout should leave room for overlaid interaction layers.
- Per UI guidelines, the image display should be canvas-dominant — no chrome elements should push or shrink the image area.

## Implementation Notes (divergences from spec)

### Toolbar layout
A thin `app__toolbar` strip is rendered above the `app__display-area` and houses the "Load picture" button. This strip does consume a small amount of vertical space, which is a minor divergence from the note that "no chrome elements should push or shrink the image area." The trade-off was accepted to keep the button persistently accessible (AC-4); the display area still takes all remaining height via `flex: 1`.

### Hidden file input pattern (AC-1 / AC-5)
The native `<input type="file">` element is visually hidden and marked `aria-hidden="true"` / `tabIndex={-1}`. The visible `<button>` programmatically triggers it via `fileInputRef.current?.click()`. Keyboard accessibility (Tab focus, Enter/Space activation) lives on the button itself, satisfying AC-5 without exposing the input to assistive technology.

### Input validation guard (AC-1)
`handleFileChange` checks `file.type.startsWith('image/')` and bails out silently if the check fails. This defends against browsers that do not strictly filter the picker by `accept="image/*"`. No error message is shown to the user — the selection is simply ignored. (Not described in the original spec; noted here for completeness.)

### Input value reset
After every successful file selection `event.target.value` is reset to `''`. This allows the user to re-select the same file and have the `onChange` event fire again, so replacing an image with an identical copy works correctly.

### Object URL revocation
A `useEffect` cleanup revokes the previous object URL whenever `imageUrl` changes. This prevents memory leaks when the user loads multiple images in sequence. This was not specified but is part of the implementation.
