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
