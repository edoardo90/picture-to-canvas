---
type: spec
status: approved
approved-by: ""
approved-date: ""
open-questions-resolved: false
---

Approved by user on 2026-05-24

# Empty-state upload & drag-and-drop (E-?)

## Objective

One sentence: Replace the generic "no image loaded" state with a clear, inviting empty-state illustration and add drag-and-drop plus click-to-upload behaviour so users can load a reference image into the canvas quickly and accessibly.

## Problem & Motivation

- The current empty state displays only plain text ("no image loaded"), which is not discoverable or inviting for non-technical users.
- Users should be able to add an image by clicking to open a file picker or by dragging an image onto the canvas area — common patterns on the web that reduce friction.
- Provide localized UI (Italian + English) and accessible feedback for success and error cases.

## UX (Visual + Interaction)

- Layout: full-size empty-state area centered inside the main canvas container. Illustration (SVG) centered with a short headline and a 1–2 line supporting hint below.
- Illustration assets: `assets/upload-illustration.svg` (Italian), `assets/upload-illustration-en.svg` (English). Use `img` or inline SVG with `role="img"` and descriptive `alt` text.
- Headline copy (see "UI copy" section) placed under the SVG; supporting hint smaller and lower-contrast.
- Click behaviour: clicking the empty-state area opens the native file picker (accept only images). The clickable area must be keyboard focusable and actionable via `Enter`/`Space`.
- Drag-and-drop: dragging a valid image over the empty-state area shows a visible focus/highlight outline and changes the copy to a drop-target hint (e.g., "Drop to upload").
- File types: accept `image/jpeg` and `image/png` (extensions `.jpg`, `.jpeg`, `.png`).
- Max size: 10 MB. Files larger than 10MB are rejected with an inline error and an aria announcement.
- Keyboard & accessibility:
  - Empty-state area is reachable via Tab and has `role="button"` and `aria-label` summarising the action (localized).
  - Activation keys: `Enter` and `Space` trigger the file picker.
  - Provide an `aria-live="polite"` region for status messages (e.g., "Image loaded", "File too large", "Unsupported file type").
  - Focus states: visible 2px outline (or project standard focus ring) while focused; distinct visual state when a drag is over the target.
  - All images loaded into the canvas must include accessible alt text derived from user-supplied filename (sanitised) and a default localized alt fallback (e.g., "Uploaded reference image").

## Acceptance Criteria

- [ ] AC-1: When the app has no image, the empty-state illustration is shown using `assets/upload-illustration.svg` (Italian) or `assets/upload-illustration-en.svg` (English) depending on UI language.
- [ ] AC-2: Clicking the empty-state area opens the native file picker; selecting a supported image loads and displays it on the canvas as a preview.
- [ ] AC-3: Dragging a supported image file over the empty-state area shows a drop highlight; dropping the file loads the image into the canvas.
- [ ] AC-4: Supported formats: JPEG and PNG only. Unsupported types show a localized error message and do not load.
- [ ] AC-5: Max file size is 10 MB. Oversized files are rejected with a localized error and aria-live announcement.
- [ ] AC-6: After successful load, a preview of the image is shown on the canvas and the empty-state is removed.
- [ ] AC-7: There is an accessible mechanism to remove/reset the loaded image (e.g., a toolbar "Remove image" action or a small close/reset button in the canvas header).
- [ ] AC-8: All status messages (success, error) are announced via an `aria-live` region.
- [ ] AC-9: Keyboard-only users can open the file picker (Enter/Space), navigate to the file picker, and remove/reset the image without using a pointer.

## Out of Scope

- Image editing (cropping, rotating, scaling) beyond fitting the loaded image into the existing canvas pipeline.
- Persisting uploaded images to remote storage.
- Supporting additional file types (SVG upload is out-of-scope for v1).

## NFR (Non-Functional Requirements)

- Performance: Loading a 10 MB image should not block the main thread for more than ~200ms on modern desktop hardware; use `createObjectURL` where appropriate and revoke URLs after use.
- Security: Never execute or inject uploaded content. Sanitize displayed file names; do not evaluate SVG markup if arbitrary SVG upload is later allowed.
- Accessibility: All new interactive elements meet keyboard and screen-reader requirements; status updates use `aria-live` polite.

## Open Questions

- OQ-1 — owner: PO: Should we allow `image/webp` in v1? (current spec restricts to JPEG/PNG)
- OQ-2 — owner: Designer: Should the illustration be inline SVG (to allow color theme tinting) or a static file reference? Provide both assets currently.

## Notes

- The project already renders an image into the canvas when an image source exists; this feature focuses on exposing upload entry-points and improving empty-state UX.

## Implementation Notes

**Files likely to change**
- `src/App.tsx` — add empty-state component, handle image state and file-loading handlers.
- `src/StylePanel.tsx` — possibly add a "Remove image" control or wire existing controls to clear image state.
- `src/main.tsx` — only if top-level i18n or asset preloading requires it (unlikely).
- `src/components/EmptyStateUpload.tsx` (new) — recommended: isolated component for illustration, keyboard handling, drag/drop and file-picker integration.

**Assets**
- `assets/upload-illustration.svg` (Italian)
- `assets/upload-illustration-en.svg` (English)

**Approach**
- Use standard HTML5 drag/drop events on the empty-state container: `dragenter`, `dragover` (preventDefault), `dragleave`, `drop`.
- For file reading, prefer `URL.createObjectURL(file)` to obtain a blob URL for large files and call `URL.revokeObjectURL()` when the previous image is replaced/removed. Alternatively, `FileReader.readAsDataURL` is acceptable for smaller images but may increase memory overhead.
- Validate `file.type` (MIME) and `file.size` before attempting to read.
- Set app image state as `{ src: string (blob|data URL), name: string, size: number, type: string }` so other parts of app can reference metadata.
- Emit localized status messages to an `aria-live` region: success, reject-type, reject-size, and load-start/load-complete if needed.

**UX details**
- Focusable container: `<div tabIndex={0} role="button" aria-label={localizedLabel}>`.
- Drop highlight: add `.empty-state--dragover` CSS class while a valid file is dragged over; show localized "Drop to upload" text.
- Error display: inline toast (visually) and aria-live message; do not use modal dialogs for simple rejections.

## Data Flow

- User action (click or drop) -> `EmptyStateUpload` handlers -> validate file -> createObjectURL/readAsDataURL -> update top-level `image` state in `src/App.tsx` -> image renderer draws the preview on canvas.

## Security & Performance Notes

- Sanitize displayed filename (strip path chars, limit length to 100 chars) before rendering in UI.
- Do not execute or embed uploaded content. If SVG uploads are enabled later, parse and sanitise the markup server-side or via a strict sanitizer.
- Revoke object URLs when images are removed or replaced to free memory.

## Tests

**Unit tests (suggested)**
- `src/__tests__/emptyStateUpload.test.tsx`:
  - Validate file-type/size validation functions.
  - Simulate `drop` and `click` handlers with mocked `File` objects and assert `App` image state updates.
  - Ensure keyboard activation (`Enter`/`Space`) triggers file-picker handler.

**Playwright e2e tests (suggested)**
- `e2e/upload-empty-state.spec.ts` (add to `e2e/`):
  - `loads via file picker`: simulate user opening file picker (page.setInputFiles) and assert the image is shown on canvas.
  - `loads via drag and drop`: use Playwright's `dispatchEvent('drop', { dataTransfer: ... })` helper and assert image loads.
  - `rejects unsupported type`: try uploading `.txt` and assert error message and no image on canvas.
  - `rejects oversized file`: upload >10MB fake file and assert error.
  - `remove / reset image`: after load, trigger the remove action and assert the empty-state returns.

## Visual design considerations

- Ensure illustration scales responsively and remains centered; do not cover or overlap existing toolbar chrome.
- Provide a subtle animation for the drop highlight (fade + slight scale) to provide affordance without being distracting.

## Tasks & Estimates (rough)

- Create `EmptyStateUpload` component and styles — 3h
- Wire component into `src/App.tsx` and manage top-level image state — 2h
- Implement file validation and objectURL handling + revoke logic — 1.5h
- Add remove/reset control and link to UI — 1h
- Unit tests — 2h
- Playwright e2e tests — 3h
- Accessibility review & polish — 1h
- Buffer / review & small fixes — 1h

Total: ~14.5h (1.5–2 working days)

## Sample UI copy

- Italian (use with `assets/upload-illustration.svg`):
  - Headline: "Carica un'immagine"
  - Hint: "Clicca per scegliere un file o trascina un'immagine qui"
  - Drop hint: "Rilascia per caricare"
  - Error (type): "Tipo di file non supportato. Usa JPG o PNG."
  - Error (size): "File troppo grande. Dimensione massima: 10 MB."
  - Success announcement: "Immagine caricata con successo."

- English (use with `assets/upload-illustration-en.svg`):
  - Headline: "Upload an image"
  - Hint: "Click to choose a file or drag an image here"
  - Drop hint: "Drop to upload"
  - Error (type): "Unsupported file type. Please use JPG or PNG."
  - Error (size): "File is too large. Maximum size: 10 MB."
  - Success announcement: "Image uploaded successfully."

**Exact asset filenames**: `assets/upload-illustration.svg`, `assets/upload-illustration-en.svg`

## Handoff / Next steps

- After approval (status: `approved`) the `developer` agent should implement the component in `src/components/EmptyStateUpload.tsx` and wire it into `src/App.tsx`. Include unit tests and the Playwright e2e tests listed above.

---

Summary:
- Adds an accessible, localized empty-state with illustration and copy, click-to-upload and drag-and-drop support, validation for JPEG/PNG up to 10 MB, error handling with `aria-live`, and a remove/reset control. Implementation notes, files to change, tests, and task estimates are included.
