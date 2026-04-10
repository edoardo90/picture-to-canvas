---
type: spec
status: updated
approved-by: PO
approved-date: 2026-04-10
implemented-date: 2026-04-10
open-questions-resolved: true
---

# Point Style Customisation

## Objective

Allow the user to adjust the visual appearance of point markers and their coordinate labels globally — so they can tune legibility to their specific photo, screen brightness, and working distance.

## Acceptance Criteria

- [x] AC-1: The toolbar contains controls for all seven style properties: point colour, point radius, point opacity, label font size, label opacity, label offset (distance between marker centre and label), and label coordinate gap (spacing between the two coordinate values).
- [x] AC-2: Changing any style property immediately re-renders all currently placed points to reflect the new value — no page reload or explicit save action is required.
- [x] AC-3: Points placed after a style change are rendered using the current style values at the moment of placement.
- [x] AC-4: Each numeric control (radius, opacities, font size, offset, gap) enforces a defined [min, max] range; values outside that range are clamped and cannot be submitted.
- [x] AC-5: Setting point opacity to its minimum value makes the point marker visually invisible; setting label opacity to its minimum makes the label text visually invisible.
- [x] AC-6: Each toolbar control has a touch target of at least 44 × 44 px and is fully operable on a mobile touch screen without hover-dependent interactions.
- [x] AC-7: Changing label font size, label offset, or label coordinate gap produces a correctly laid-out label: the text does not overlap the point marker, and the two coordinate values are visually separated by the specified gap.
- [x] AC-8: Style settings are persisted in `localStorage` and restored on the next app load. If no saved settings are found, the defaults from AC-1 are used.

## Out of Scope

- Per-point style overrides (all points share the same style).
- Persisting style settings between app sessions (now IN scope — see AC-8 below).
- Separate style settings for selected vs. unselected point states.
- A "Reset to defaults" affordance.
- Animating style transitions when a property changes.

## NFR

- Performance: Style changes must re-render all visible points synchronously — no perceptible lag on a mid-range mobile device even with many points placed.
- Security: All data is local; no style settings leave the device.
- Accessibility: Every style control must be keyboard-focusable, operable with standard keyboard interactions, and have a descriptive `aria-label` or associated `<label>`.

## Open Questions

- ~~**OQ-1:** Default values for each property.~~ **Resolved:** Match current rendered appearance exactly:
  | Property | Default |
  |---|---|
  | Point colour | `#ffffff` (white hex, stored separately from opacity) |
  | Point radius | 4 px |
  | Point opacity | 0.9 (90%) |
  | Label font size | 11 px |
  | Label opacity | 1.0 (100%) |
  | Label offset dx | +10 px |
  | Label offset dy | −6 px |
  | Label coordinate gap | 0 px |

- ~~**OQ-2:** Min/max ranges for numeric properties.~~ **Resolved:** Reasonable ranges:
  | Property | Min | Max |
  |---|---|---|
  | Point radius | 2 px | 20 px |
  | Point opacity | 0% | 100% |
  | Label font size | 8 px | 32 px |
  | Label opacity | 0% | 100% |
  | Label offset dx | 0 px | 40 px |
  | Label offset dy | −40 px | 0 px |
  | Label coordinate gap | 0 px | 40 px |

- ~~**OQ-3:** Colour control type.~~ **Resolved:** Native `<input type="color">`.

- ~~**OQ-4:** Persist across sessions?~~ **Resolved:** Yes, via `localStorage`.

## Notes

- The existing point marker is rendered as an SVG `<circle r={4}>` (r=5 when selected) with a text label offset at `(x+10, y-6)`. The new style properties will parameterise these values.
- "Label coordinate gap" maps to the space between the two `<tspan>` or text segments that render the x and y values (e.g. "10.5" and "8.2 cm"). Currently they are concatenated with a fixed separator.
- Controls should be added to the existing toolbar (bottom panel) consistent with the layout established by the Toolbar Resize & Toggle spec; care should be taken not to force the toolbar's minimum height to grow unexpectedly.
- Colour input accessibility: if a native `<input type="color">` is used, its default browser affordance may be insufficient on some mobile browsers — OQ-3 resolution should account for this.

## Implementation Notes

**Module structure:**
- `src/pointStyle.ts` is a self-contained module that owns the `PointStyleSettings` type, `DEFAULT_POINT_STYLE` defaults, and the `loadPointStyle` / `savePointStyle` functions.
- `pointStyle` state in `App` is initialised with `useState<PointStyleSettings>(loadPointStyle)` (lazy initialiser — runs once) and persisted via a `useEffect` that calls `savePointStyle(pointStyle)` on every change.
- `updatePointStyle(partial)` is a helpers that merges partial updates into the previous state via a functional `setPointStyle`.

**Storage and validation (`src/pointStyle.ts`):**
- `localStorage` key: `'point-style-settings'`.
- `loadPointStyle` validates each field individually: numeric fields are clamped with `clampNumber`; `pointColour` is validated against `/^#[0-9a-f]{6}$/i` and falls back to the default if the stored value is not a valid 6-digit hex string. Malformed JSON or a non-object payload falls back to `DEFAULT_POINT_STYLE`.
- `savePointStyle` wraps `localStorage.setItem` in `try/catch` and silently ignores `QuotaExceededError` or unavailable storage.

**Opacity encoding:**
- `pointOpacity` and `labelOpacity` are stored as fractions (0–1) in both state and `localStorage`. The toolbar inputs display and accept whole-number percentages (0–100); the `onChange` handlers divide by 100 before storing. `loadPointStyle` clamps to [0, 1].

**Toolbar controls (App.tsx):**
- All style controls are wrapped in a `<div role="group" aria-label="Point style">` containing two visual `<span class="app__style-section-label">` dividers ("Point" and "Label").
- The opacity labels were named **"Point opacity %"** and **"Label opacity %"** (not the generic "Opacity %" originally considered) to provide sufficient differentiation for screen-reader users.
- Each control uses an explicit `<label htmlFor="…">` associated with its input by id; no `aria-label` on the inputs themselves.
- Touch target sizes: `.app__style-number-input` has `min-height: 44px`; `.app__style-color-input` has `width: 44px; min-height: 44px`.

**SVG rendering (App.tsx):**
- `<circle class="app__point-marker">` receives `style={{ fill: pointStyle.pointColour, opacity: pointStyle.pointOpacity }}` and `r={pointStyle.pointRadius}`.
- `<text class="app__point-label">` receives `style={{ fontSize: pointStyle.labelFontSize, opacity: pointStyle.labelOpacity }}` and is positioned at `x={cx + pointStyle.labelOffsetDx}`, `y={cy + pointStyle.labelOffsetDy}`.
- The label contains two `<tspan>` elements: the first renders `"xCm, "` (comma + space hardcoded), the second renders `yCm` with `dx={pointStyle.labelCoordinateGap}` providing the additional pixel-level separation.

## Divergences from Spec

- **Label offset split into two controls**: the spec's AC-1 described "label offset" as a single property. The implementation exposes two separate numeric inputs — **Offset X** (`labelOffsetDx`) and **Offset Y** (`labelOffsetDy`) — making the total control count 8, not 7. This matches the per-axis min/max ranges already defined in OQ-2 and was the natural consequence of those resolved values.
- **Default point colour format**: the spec's OQ-1 resolution listed `rgba(255,255,255,0.9)` as the colour default. Because `<input type="color">` requires a hex string, the colour is stored as `#ffffff` and the 0.9 opacity is captured separately in `pointOpacity`. The rendered appearance is identical.
- **Label coordinate gap semantic**: the spec notes described the gap as a "text separator" (e.g. `", "`). The implementation hard-codes `", "` inside the first `<tspan>` and uses `labelCoordinateGap` exclusively as a numeric SVG `dx` pixel offset on the second `<tspan>`. The default value is `0` px (no extra gap beyond the fixed separator).
