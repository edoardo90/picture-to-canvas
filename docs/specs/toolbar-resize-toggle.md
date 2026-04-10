---
type: spec
status: implemented
approved-by: PO
approved-date: 2026-04-10
open-questions-resolved: true
---

# Toolbar Resize & Toggle

## Objective

Allow the user to hide the toolbar to maximise the image area, and to resize it via drag — so that on small screens (especially mobile) the drawing workspace is not wasted by a fixed panel.

## Acceptance Criteria

- [ ] AC-1: A drag handle is visible at the top edge of the toolbar. Dragging it upward or downward resizes the toolbar height. The minimum height is enough to show all toolbar controls without overflow (no controls are clipped).
- [ ] AC-2: Dragging the toolbar below its minimum height collapses it completely (height = 0, toolbar hidden).
- [ ] AC-3: When the toolbar is hidden, a persistent toggle affordance (e.g. a small chevron/arrow button) is visible at the bottom of the screen so the user understands the toolbar can be reopened.
- [ ] AC-4: Tapping/clicking the toggle affordance when the toolbar is hidden re-opens the toolbar to its last used height (or to a sensible default if no prior height exists).
- [ ] AC-5: A visible toggle button (same affordance) is also present when the toolbar is open, allowing the user to hide it without dragging.

## Out of Scope

- Persisting the toolbar height or collapsed state between app sessions.
- Horizontal resizing or repositioning of the toolbar.
- Snapping to intermediate preset heights.
- Animating to a fully collapsed state during the drag itself (snap only upon release below minimum).

## NFR

- Performance: Resize updates must be synchronous and smooth during drag — no perceptible lag on a mid-range mobile device.
- Security: No user input is transmitted; this is a local UI interaction.
- Accessibility: The toggle button must be keyboard-focusable and operable with `Enter`/`Space`. The drag handle must have an `aria-label` or equivalent descriptive label.

## Open Questions

- ~~**OQ-1:** What is the default toolbar height on first load?~~ **Resolved:** Auto-sized to content.
- ~~**OQ-2:** Should snap-to-closed happen during drag or on pointer-up?~~ **Resolved:** Only on pointer-up (release).
- ~~**OQ-3:** Toggle affordance when collapsed — floating button or strip?~~ **Resolved:** A floating action button (FAB).

## Notes

- The toolbar currently lives at the bottom of the screen and contains the paper size selector and the load-picture button.
- Minimum height must accommodate all current toolbar controls; any future toolbar control additions may need to revisit this minimum.
- The drag-handle interaction on touch devices must handle `touchstart`/`touchmove`/`touchend` (or a pointer-events unified handler) to work on mobile.
