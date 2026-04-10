import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PAPER_PRESETS, type PaperSize } from './paperPresets'
import { mapToCanvas, toImageRelative, clampToImageRelative } from './coordinateMapping'

type PlacedPoint = {
  id: string
  relX: number
  relY: number
}

type ContentLayout = {
  left: number
  top: number
  width: number
  height: number
}

function computeContentLayout(img: HTMLImageElement): ContentLayout | null {
  const { naturalWidth, naturalHeight } = img
  if (!naturalWidth || !naturalHeight) return null
  const rect = img.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  const containerAspect = rect.width / rect.height
  const imageAspect = naturalWidth / naturalHeight
  let contentWidth: number
  let contentHeight: number
  if (imageAspect > containerAspect) {
    contentWidth = rect.width
    contentHeight = rect.width / imageAspect
  } else {
    contentWidth = rect.height * imageAspect
    contentHeight = rect.height
  }
  return {
    left: (rect.width - contentWidth) / 2,
    top: (rect.height - contentHeight) / 2,
    width: contentWidth,
    height: contentHeight,
  }
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null)
  const [points, setPoints] = useState<PlacedPoint[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [layout, setLayout] = useState<ContentLayout | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  useEffect(() => {
    const img = imageRef.current
    if (!img || !imageUrl) {
      setLayout(null)
      return
    }
    function update() {
      if (img) setLayout(computeContentLayout(img))
    }
    img.addEventListener('load', update)
    const ro = new ResizeObserver(update)
    ro.observe(img)
    update()
    return () => {
      img.removeEventListener('load', update)
      ro.disconnect()
    }
  }, [imageUrl])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) return
      if (e.key === 'Delete' && selectedId) {
        setPoints(prev => prev.filter(p => p.id !== selectedId))
        setSelectedId(null)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId])

  function handleLoadPictureClick() {
    fileInputRef.current?.click()
  }

  function handlePaperSizeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const preset = PAPER_PRESETS.find(p => p.id === event.target.value) ?? null
    setPaperSize(preset)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setPoints([])
    setSelectedId(null)
    setDraggingId(null)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    event.target.value = ''
  }

  function getViewportContentRect() {
    const img = imageRef.current
    if (!img || !layout) return null
    const imgRect = img.getBoundingClientRect()
    return {
      left: imgRect.left + layout.left,
      top: imgRect.top + layout.top,
      width: layout.width,
      height: layout.height,
    }
  }

  function handleOverlayPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!paperSize) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const contentRect = getViewportContentRect()
    if (!contentRect) return
    const coords = toImageRelative(e.clientX, e.clientY, contentRect)
    setSelectedId(null)
    if (!coords) return
    setPoints(prev => [
      ...prev,
      { id: crypto.randomUUID(), relX: coords.relX, relY: coords.relY },
    ])
  }

  function handleMarkerPointerDown(e: React.PointerEvent<SVGGElement>, pointId: string) {
    e.stopPropagation()
    e.preventDefault()
    if (e.pointerType === 'mouse' && e.button !== 0) return
    setSelectedId(pointId)
    setDraggingId(pointId)
    e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId)
  }

  function handleOverlayPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggingId) return
    const contentRect = getViewportContentRect()
    if (!contentRect) return
    const coords = clampToImageRelative(e.clientX, e.clientY, contentRect)
    setPoints(prev =>
      prev.map(p => (p.id === draggingId ? { ...p, relX: coords.relX, relY: coords.relY } : p))
    )
  }

  function handleOverlayPointerUp() {
    setDraggingId(null)
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

        <label htmlFor="paper-size-select" className="app__paper-size-label">
          Paper size
        </label>
        <select
          id="paper-size-select"
          className="app__paper-size-select"
          value={paperSize?.id ?? ''}
          onChange={handlePaperSizeChange}
          data-paper-width={paperSize?.widthCm ?? ''}
          data-paper-height={paperSize?.heightCm ?? ''}
        >
          <option value="" disabled>Select size</option>
          {PAPER_PRESETS.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      <div className="app__display-area">
        {imageUrl ? (
          <>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Reference picture"
              className="app__image"
            />
            {paperSize && (
              <svg
                className="app__point-overlay"
                style={{ cursor: draggingId ? 'grabbing' : 'crosshair' }}
                onPointerDown={handleOverlayPointerDown}
                onPointerMove={handleOverlayPointerMove}
                onPointerUp={handleOverlayPointerUp}
              >
                {layout && points.map(point => {
                  const x = layout.left + point.relX * layout.width
                  const y = layout.top + point.relY * layout.height
                  const paperCoords = mapToCanvas(
                    point.relX,
                    point.relY,
                    paperSize.widthCm,
                    paperSize.heightCm,
                  )
                  const isSelected = point.id === selectedId
                  return (
                    <g
                      key={point.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Point at ${paperCoords.xCm.toFixed(1)} cm, ${paperCoords.yCm.toFixed(1)} cm`}
                      className={`app__point-group${isSelected ? ' app__point-group--selected' : ''}`}
                      style={{ cursor: draggingId === point.id ? 'grabbing' : 'grab' }}
                      onFocus={() => setSelectedId(point.id)}
                      onPointerDown={e => handleMarkerPointerDown(e, point.id)}
                      onKeyDown={e => {
                        if (e.key === 'Delete') {
                          setPoints(prev => prev.filter(p => p.id !== point.id))
                          setSelectedId(null)
                        }
                      }}
                    >
                      {/* Transparent hit area for easier touch/click targeting */}
                      <circle cx={x} cy={y} r={12} fill="transparent" style={{ pointerEvents: 'all' }} />
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 5 : 4}
                        className="app__point-marker"
                        style={{ pointerEvents: 'none' }}
                      />
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={9}
                          className="app__point-ring"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      <text
                        x={x + 10}
                        y={y - 6}
                        className="app__point-label"
                      >
                        {paperCoords.xCm.toFixed(1)}, {paperCoords.yCm.toFixed(1)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
          </>
        ) : (
          <p className="app__empty-state">No image loaded</p>
        )}
      </div>
    </main>
  )
}

export default App

