import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  function handleLoadPictureClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    event.target.value = ''
  }

  return (
    <main className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
        className="app__file-input"
      />

      <div className="app__toolbar">
        <button
          type="button"
          className="app__load-button"
          onClick={handleLoadPictureClick}
        >
          Load picture
        </button>
      </div>

      <div className="app__display-area">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Reference picture"
            className="app__image"
          />
        ) : (
          <p className="app__empty-state">No image loaded</p>
        )}
      </div>
    </main>
  )
}

export default App
