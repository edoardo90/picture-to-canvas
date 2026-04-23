import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

const MOCK_OBJECT_URL = 'blob:mock-123'

beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => MOCK_OBJECT_URL)
  globalThis.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
})

function getFileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

function selectFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, 'files', {
    value: [file],
    writable: false,
    configurable: true,
  })
  fireEvent.change(input)
}

// AC-1: button visible on initial screen
test('shows a "Load picture" button on initial render', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Load picture' })).toBeInTheDocument()
})

// AC-1: file picker is filtered to image types
test('file input accepts image/* files only', () => {
  render(<App />)
  expect(getFileInput().accept).toBe('image/*')
})

// AC-1: button delegates to the hidden file input
test('clicking "Load picture" triggers the hidden file input', () => {
  render(<App />)
  const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')
  fireEvent.click(screen.getByRole('button', { name: 'Load picture' }))
  expect(clickSpy).toHaveBeenCalledTimes(1)
  clickSpy.mockRestore()
})

// AC-2: image is displayed after file selection
test('displays the selected image in the main area', () => {
  render(<App />)
  const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
  selectFile(getFileInput(), file)
  const img = screen.getByRole('img', { name: 'Reference picture' })
  expect(img).toBeInTheDocument()
  expect(img).toHaveAttribute('src', MOCK_OBJECT_URL)
})

// AC-3: image is read locally via object URL
test('creates an object URL for the selected file without uploading', () => {
  render(<App />)
  const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
  selectFile(getFileInput(), file)
  expect(URL.createObjectURL).toHaveBeenCalledWith(file)
})

// AC-4: button remains accessible after image is loaded
test('"Load picture" button remains visible after an image is loaded', () => {
  render(<App />)
  const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
  selectFile(getFileInput(), file)
  expect(screen.getByRole('button', { name: 'Load picture' })).toBeInTheDocument()
})

// AC-5: button is a native element with default keyboard access
test('"Load picture" button is a focusable native button element', () => {
  render(<App />)
  const button = screen.getByRole('button', { name: 'Load picture' })
  expect(button.tagName).toBe('BUTTON')
  expect(button).not.toHaveAttribute('tabindex', '-1')
})

// value-reset fix: same-file re-selection still triggers the handler
test('selecting the same file a second time re-displays the image', () => {
  render(<App />)
  const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
  const input = getFileInput()
  selectFile(input, file)
  selectFile(input, file)
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('img', { name: 'Reference picture' })).toBeInTheDocument()
})

// memory fix: previous object URL is revoked when a new image is loaded
test('revokes the previous object URL when a new image is loaded', () => {
  const FIRST_URL = 'blob:mock-first'
  const SECOND_URL = 'blob:mock-second'
  vi.mocked(URL.createObjectURL).mockReturnValueOnce(FIRST_URL).mockReturnValueOnce(SECOND_URL)

  render(<App />)
  const input = getFileInput()
  selectFile(input, new File(['a'], 'first.jpg', { type: 'image/jpeg' }))
  selectFile(input, new File(['b'], 'second.jpg', { type: 'image/jpeg' }))

  expect(URL.revokeObjectURL).toHaveBeenCalledWith(FIRST_URL)
})

// non-image guard: selecting a non-image file must not display an <img>
test('does not display an image when a non-image file is selected', () => {
  render(<App />)
  const file = new File(['content'], 'document.txt', { type: 'text/plain' })
  selectFile(getFileInput(), file)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

// E-2 AC-1: paper size selector is visible before an image is loaded
test('shows paper size selector before an image is loaded', () => {
  render(<App />)
  expect(screen.getByRole('combobox', { name: 'Paper size' })).toBeInTheDocument()
})

// E-2 AC-1: paper size selector remains visible after an image is loaded
test('shows paper size selector after an image is loaded', () => {
  render(<App />)
  selectFile(getFileInput(), new File(['content'], 'photo.jpg', { type: 'image/jpeg' }))
  expect(screen.getByRole('combobox', { name: 'Paper size' })).toBeInTheDocument()
})

// default paper size is 18 × 26 cm on initial render
test('paper size selector shows 18 × 26 cm as default on initial render', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' }) as HTMLSelectElement
  expect(select.value).toBe('18x26')
})

// E-2 AC-3: all three preset options are present
test('paper size selector offers all three preset options', () => {
  render(<App />)
  expect(screen.getByRole('option', { name: 'A4' })).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'A5' })).toBeInTheDocument()
  expect(screen.getByRole('option', { name: '18 × 26 cm' })).toBeInTheDocument()
})

// E-2 AC-3: selecting a preset records the correct value
test('selecting A4 preset updates the selector value', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'a4' } })
  expect((select as HTMLSelectElement).value).toBe('a4')
})

// E-2 AC-3: selecting a preset stores the correct dimensions in state
test('selecting A4 stores widthCm=21 and heightCm=29.7', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'a4' } })
  expect(select).toHaveAttribute('data-paper-width', '21')
  expect(select).toHaveAttribute('data-paper-height', '29.7')
})

test('selecting A5 stores widthCm=14.8 and heightCm=21', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'a5' } })
  expect(select).toHaveAttribute('data-paper-width', '14.8')
  expect(select).toHaveAttribute('data-paper-height', '21')
})

test('selecting 18×26 stores widthCm=18 and heightCm=26', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: '18x26' } })
  expect(select).toHaveAttribute('data-paper-width', '18')
  expect(select).toHaveAttribute('data-paper-height', '26')
})

// handlePaperSizeChange unknown-id guard: unrecognised value leaves state null
test('selecting an unknown preset id clears the stored dimensions', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'a4' } })
  fireEvent.change(select, { target: { value: 'unknown-id' } })
  expect(select).toHaveAttribute('data-paper-width', '')
  expect(select).toHaveAttribute('data-paper-height', '')
})

// E-2 AC-5: selector is a native <select> element for built-in keyboard support
test('paper size selector is a native select element', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  expect(select.tagName).toBe('SELECT')
})

// ── Paper Custom Size (paper-custom-size.md) ────────────────────────────────

// AC-1: "Custom…" option is present
test('paper size selector includes a "Custom…" option', () => {
  render(<App />)
  expect(screen.getByRole('option', { name: 'Custom…' })).toBeInTheDocument()
})

// AC-2: custom inputs are hidden when a preset is selected
test('custom size inputs are hidden when a preset is selected', () => {
  render(<App />)
  expect(screen.queryByLabelText('Custom width in centimetres')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Custom height in centimetres')).not.toBeInTheDocument()
})

// AC-2: custom inputs appear when "Custom…" is selected
test('custom size inputs are shown when "Custom…" is selected', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  expect(screen.getByLabelText('Custom width in centimetres')).toBeInTheDocument()
  expect(screen.getByLabelText('Custom height in centimetres')).toBeInTheDocument()
})

// AC-2: custom inputs are hidden after switching back to a preset
test('custom size inputs are hidden after switching back to a preset', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(select, { target: { value: 'a4' } })
  expect(screen.queryByLabelText('Custom width in centimetres')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Custom height in centimetres')).not.toBeInTheDocument()
})

// AC-3: entering valid W and H synchronously updates paper size
test('entering valid W and H sets the paper size dimensions', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom width in centimetres'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('Custom height in centimetres'), { target: { value: '40' } })
  expect(select).toHaveAttribute('data-paper-width', '30')
  expect(select).toHaveAttribute('data-paper-height', '40')
})

// AC-4: only W filled → paper size is null
test('entering only W leaves paper size null', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom width in centimetres'), { target: { value: '30' } })
  expect(select).toHaveAttribute('data-paper-width', '')
  expect(select).toHaveAttribute('data-paper-height', '')
})

// AC-4: only H filled → paper size is null
test('entering only H leaves paper size null', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom height in centimetres'), { target: { value: '40' } })
  expect(select).toHaveAttribute('data-paper-width', '')
  expect(select).toHaveAttribute('data-paper-height', '')
})

// AC-4: select still shows "custom" while editing inputs
test('select still shows "custom" while custom inputs are being edited', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' }) as HTMLSelectElement
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom width in centimetres'), { target: { value: '30' } })
  expect(select.value).toBe('custom')
})

// AC-4: zero is not accepted as a valid dimension
test('entering zero for W leaves paper size null', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom width in centimetres'), { target: { value: '0' } })
  fireEvent.change(screen.getByLabelText('Custom height in centimetres'), { target: { value: '40' } })
  expect(select).toHaveAttribute('data-paper-width', '')
  expect(select).toHaveAttribute('data-paper-height', '')
})

// OQ-1: custom values are remembered when switching back to "Custom…"
test('custom values are remembered when switching back to "Custom…"', () => {
  render(<App />)
  const select = screen.getByRole('combobox', { name: 'Paper size' })
  fireEvent.change(select, { target: { value: 'custom' } })
  fireEvent.change(screen.getByLabelText('Custom width in centimetres'), { target: { value: '24' } })
  fireEvent.change(screen.getByLabelText('Custom height in centimetres'), { target: { value: '22' } })
  // Switch to a preset then back to custom
  fireEvent.change(select, { target: { value: 'a4' } })
  fireEvent.change(select, { target: { value: 'custom' } })
  expect(screen.getByLabelText('Custom width in centimetres')).toHaveValue(24)
  expect(screen.getByLabelText('Custom height in centimetres')).toHaveValue(22)
})
