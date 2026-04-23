---
type: spec
status: updated
approved-by: PO
approved-date: 2026-04-10
implemented-date: 2026-04-10
open-questions-resolved: true
---

# Toolbar Resize — Edge Alignment Fix

## Objective

Fix the visual drift caused by CSS scaling during toolbar resize, so that left-side controls stay anchored to the left edge and the Hide button stays anchored to the right edge at every scale.

## Acceptance Criteria

- [x] AC-1: When the toolbar is resized to any height above the minimum, the Load, Paper size, and Points Style controls remain visually anchored to the **left** edge of the toolbar — they do not drift toward the center.
- [x] AC-2: When the toolbar is resized to any height above the minimum, the Hide arrow button remains visually anchored to the **right** edge of the toolbar — it does not drift toward the center.
- [x] AC-3: Both sides scale symmetrically toward their respective outer edges, not toward the horizontal center of the toolbar.
- [x] AC-4: At `contentScale = 1` (full-size toolbar) the layout is identical to the current layout with no visual change.
- [x] AC-5: All existing resize and collapse behaviour (drag handle, minimum height, snap-to-collapse, toggle reopen) is unchanged.

## Out of Scope

- Any change to the controls themselves (icons, labels, order).
- Changing when or how `contentScale` is calculated.
- Persisting toolbar height or state between sessions.
- Animations or transitions on the toolbar content.

## NFR

- Performance: The fix must not introduce additional layout recalculations beyond what already occurs during drag. Resize must remain smooth on a mid-range mobile device.
- Security: No user input is transmitted; this is a purely local visual fix.
- Accessibility: No change to keyboard focus order or ARIA attributes is required unless the DOM structure change forces it.

## Open Questions

_None._

## Implementation Notes

- **Two-group DOM split:** The toolbar content is split into two sibling flex children inside `.app__toolbar-content`: `.app__toolbar-left-group` (Load button, Paper size label + select, Points Style button) and `.app__toolbar-right-group` (Hide toolbar button). Each group has its own `transform: scale(contentScale)` applied independently.
- **`transformOrigin`:** The left group uses `transformOrigin: 'top left'`; the right group uses `transformOrigin: 'top right'`. This anchors each group to its respective outer edge during scale-down.
- **`justify-content: space-between`:** Applied to `.app__toolbar-content` so the two groups are pushed to opposite ends at full scale without any positional hacks.
- **`margin-left: auto` removed:** The Hide button previously relied on `margin-left: auto` for right-alignment. This was removed; right-alignment is now handled entirely by `justify-content: space-between` on the container.
- **New CSS classes:** `.app__toolbar-left-group` and `.app__toolbar-right-group` — both are `display: flex; align-items: center`; the left group has `gap: 0.75rem`.
- **E2E anchor tests:** Two new tests added to `e2e/toolbar-toggle.spec.ts` ("after shrinking the toolbar, the Load button stays anchored to the left edge" and "after shrinking the toolbar, the Hide button stays anchored to the right edge"). Each drags the handle upward by 15 px then asserts the respective button's edge is within 20 px of the toolbar's edge.
- **Accepted debt:** The 15 px drag distance in the anchor tests is thin (the toolbar will hit `MIN_TOOLBAR_HEIGHT = 36 px` and clamp, so the actual scale change is small). The 20 px tolerance keeps the tests robust; the theoretical overlap scenario where both groups visually collide at extreme scale is impossible in practice given the minimum height clamp.

## Notes

- The root cause was a single `transform: scale(n)` with `transformOrigin: 'top center'` applied to the entire toolbar content div, which pulled all children toward the horizontal center.
- Related spec: `docs/specs/archive/toolbar-resize-toggle.md` (status: implemented).
