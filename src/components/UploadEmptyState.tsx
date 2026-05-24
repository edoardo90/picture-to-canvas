import React, { useCallback, useState } from 'react'

type Props = {
  onImageSelected: (file: File) => void
  lang?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export function UploadEmptyState({ onImageSelected, lang }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const locale = lang ?? (typeof navigator !== 'undefined' ? navigator.language : 'it')
  const isEnglish = locale.startsWith('en')

  const texts = {
    headline: isEnglish ? 'Upload an image' : "Carica un'immagine",
    hint: isEnglish ? 'Click to choose a file or drag an image here' : 'Clicca per scegliere un file o trascina un\'immagine qui',
    dropHint: isEnglish ? 'Drop to upload' : 'Rilascia per caricare',
    errorType: isEnglish ? 'Unsupported file type. Please use JPG or PNG.' : 'Tipo di file non supportato. Usa JPG o PNG.',
    errorSize: isEnglish ? 'File is too large. Maximum size: 10 MB.' : 'File troppo grande. Dimensione massima: 10 MB.',
    success: isEnglish ? 'Image uploaded successfully.' : 'Immagine caricata con successo.',
    ariaLabel: isEnglish ? 'Upload image' : "Carica un'immagine",
  }

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setMessage(texts.errorType)
        return
      }
      if (file.size > MAX_BYTES) {
        setMessage(texts.errorSize)
        return
      }
      setMessage(texts.success)
      // Emit the raw File — top-level will read it (FileReader) and render preview
      onImageSelected(file)
    },
    [onImageSelected, texts]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    e.currentTarget.value = ''
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const input = (e.currentTarget.querySelector('input[type=file]') as HTMLInputElement | null)
      input?.click()
    }
  }

  function preventDefault(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className={`upload-empty-state${dragOver ? ' upload-empty-state--dragover' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={texts.ariaLabel}
      onKeyDown={handleKeyDown}
      onClick={() => {
        const input = document.querySelector<HTMLInputElement>('.upload-empty-state input[type=file]')
        input?.click()
      }}
      onDragEnter={(e) => { preventDefault(e); setDragOver(true) }}
      onDragOver={(e) => { preventDefault(e); setDragOver(true) }}
      onDragLeave={(e) => { preventDefault(e); setDragOver(false) }}
      onDrop={(e) => {
        preventDefault(e)
        setDragOver(false)
        handleFiles(e.dataTransfer?.files)
      }}
    >
      <img
        src={isEnglish ? '/assets/upload-illustration-en.svg' : '/assets/upload-illustration.svg'}
        alt={texts.headline}
        className="upload-empty-state__illustration"
        aria-hidden={false}
      />
      <div className="upload-empty-state__copy">
        <div className="upload-empty-state__headline">{texts.headline}</div>
        <div className="upload-empty-state__hint">{dragOver ? texts.dropHint : texts.hint}</div>
      </div>

      <input
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        aria-label={texts.ariaLabel}
        onChange={handleInputChange}
      />

      <div className="upload-empty-state__status" aria-live="polite">{message}</div>
    </div>
  )
}

export default UploadEmptyState
