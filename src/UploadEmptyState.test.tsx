import { render, fireEvent, screen } from '@testing-library/react'
import { vi } from 'vitest'
import UploadEmptyState from './components/UploadEmptyState'

describe('UploadEmptyState', () => {
  test('emits onImageSelected for valid PNG file via drop', () => {
    const onImageSelected = vi.fn()
    render(<UploadEmptyState onImageSelected={onImageSelected} lang="en" />)

    const file = new File(['abc'], 'sample.png', { type: 'image/png' })

    const container = screen.getByRole('button', { name: /upload image/i })
    fireEvent.dragEnter(container)
    fireEvent.dragOver(container)
    fireEvent.drop(container, {
      dataTransfer: {
        files: [file],
        types: ['Files'],
      },
    } as any)

    expect(onImageSelected).toHaveBeenCalledTimes(1)
    expect(onImageSelected).toHaveBeenCalledWith(expect.any(File))
  })

  test('shows error for unsupported file type', () => {
    const onImageSelected = vi.fn()
    render(<UploadEmptyState onImageSelected={onImageSelected} lang="en" />)
    const file = new File(['text'], 'bad.txt', { type: 'text/plain' })
    const container = screen.getByRole('button', { name: /upload image/i })
    fireEvent.drop(container, {
      dataTransfer: { files: [file], types: ['Files'] },
    } as any)
    expect(onImageSelected).not.toHaveBeenCalled()
    expect(screen.getByText(/Unsupported file type/i)).toBeTruthy()
  })

  test('shows error for oversize file', () => {
    const onImageSelected = vi.fn()
    render(<UploadEmptyState onImageSelected={onImageSelected} lang="en" />)
    // create a large blob > 10MB
    const large = new Uint8Array(11 * 1024 * 1024)
    const file = new File([large], 'big.png', { type: 'image/png' })
    const container = screen.getByRole('button', { name: /upload image/i })
    fireEvent.drop(container, { dataTransfer: { files: [file], types: ['Files'] } } as any)
    expect(onImageSelected).not.toHaveBeenCalled()
    expect(screen.getByText(/Maximum size: 10 MB/i)).toBeTruthy()
  })
})
