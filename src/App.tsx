import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PAPER_PRESETS, type PaperSize } from './paperPresets'
import { mapToCanvas, mapToCanvasFit, computeFitLayout, toImageRelative, clampToImageRelative, type FitLayout } from './coordinateMapping'
import { loadPointStyle, savePointStyle, type PointStyleSettings } from './pointStyle'
import { StylePanel } from './StylePanel'

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

const MIN_TOOLBAR_HEIGHT = 36 // px — minimum readable size before collapse

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

function buildCustomPaperSize(widthStr: string, heightStr: string): PaperSize | null {
  const widthCm = parseFloat(widthStr)
  const heightCm = parseFloat(heightStr)
  if (widthCm > 0 && heightCm > 0) {
    return { id: 'custom', label: 'Custom', widthCm, heightCm }
  }
  return null
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [paperSize, setPaperSize] = useState<PaperSize | null>(
    PAPER_PRESETS.find(p => p.id === '18x26') ?? null
  )
  const [selectedSizeId, setSelectedSizeId] = useState<string>('18x26')
  const [customWidth, setCustomWidth] = useState<string>('')
  const [customHeight, setCustomHeight] = useState<string>('')
  const [points, setPoints] = useState<PlacedPoint[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [layout, setLayout] = useState<ContentLayout | null>(null)
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState<number | null>(null)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const [pointStyle, setPointStyle] = useState<PointStyleSettings>(loadPointStyle)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const [isFitMode, setIsFitMode] = useState(false)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)

  const fitLayout: FitLayout | null =
    isFitMode && naturalSize && paperSize
      ? computeFitLayout(naturalSize.width, naturalSize.height, paperSize.widthCm, paperSize.heightCm)
      : null

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const styleButtonRef = useRef<HTMLButtonElement>(null)
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const naturalToolbarHeightRef = useRef<number | null>(null)

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
      setNaturalSize(null)
      return
    }
    function update() {
      if (img) {
        setLayout(computeContentLayout(img))
        if (img.naturalWidth && img.naturalHeight) {
          setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
        }
      }
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
      } else if ((e.key === 'f' || e.key === 'F') && imageUrl) {
        setIsFitMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, imageUrl])

  useEffect(() => {
    if (toolbarRef.current && naturalToolbarHeightRef.current === null) {
      naturalToolbarHeightRef.current = toolbarRef.current.offsetHeight
    }
  }, [])

  useEffect(() => {
    savePointStyle(pointStyle)
  }, [pointStyle])

  function updatePointStyle(partial: Partial<PointStyleSettings>) {
    setPointStyle(prev => ({ ...prev, ...partial }))
  }

  function closeStylePanel() {
    setIsStylePanelOpen(false)
    styleButtonRef.current?.focus()
  }

  function handleSwapOrientation() {
    if (!paperSize) return
    setPaperSize({ ...paperSize, widthCm: paperSize.heightCm, heightCm: paperSize.widthCm })
    if (selectedSizeId === 'custom') {
      setCustomWidth(customHeight)
      setCustomHeight(customWidth)
    }
  }

  function handleLoadPictureClick() {
    fileInputRef.current?.click()
  }

  function handlePaperSizeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    setSelectedSizeId(value)
    if (value === 'custom') {
      setPaperSize(buildCustomPaperSize(customWidth, customHeight))
    } else {
      const preset = PAPER_PRESETS.find(p => p.id === value) ?? null
      setPaperSize(preset)
    }
  }

  function handleCustomWidthChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setCustomWidth(value)
    setPaperSize(buildCustomPaperSize(value, customHeight))
  }

  function handleCustomHeightChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setCustomHeight(value)
    setPaperSize(buildCustomPaperSize(customWidth, value))
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

  function handleResizeHandlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const currentHeight = toolbarRef.current?.offsetHeight ?? (toolbarHeight ?? MIN_TOOLBAR_HEIGHT)
    dragStartRef.current = { startY: e.clientY, startHeight: currentHeight }
  }

  function handleResizeHandlePointerMove(e: React.PointerEvent) {
    if (!dragStartRef.current) return
    // Handle is at the bottom edge: dragging down expands, dragging up shrinks
    const delta = e.clientY - dragStartRef.current.startY
    const maxHeight = naturalToolbarHeightRef.current ?? dragStartRef.current.startHeight
    const newHeight = Math.min(maxHeight, Math.max(MIN_TOOLBAR_HEIGHT, dragStartRef.current.startHeight + delta))
    setDragHeight(newHeight)
  }

  function handleResizeHandlePointerUp(e: React.PointerEvent) {
    if (!dragStartRef.current) return
    const delta = e.clientY - dragStartRef.current.startY
    const newHeight = dragStartRef.current.startHeight + delta
    const previousHeight = dragStartRef.current.startHeight
    const maxHeight = naturalToolbarHeightRef.current ?? previousHeight
    dragStartRef.current = null
    setDragHeight(null)
    if (newHeight < MIN_TOOLBAR_HEIGHT) {
      // Save height so reopening restores it (AC-4)
      setToolbarHeight(previousHeight)
      setIsToolbarCollapsed(true)
    } else {
      setToolbarHeight(Math.min(maxHeight, newHeight))
    }
  }

  function handleResizeHandleKeyDown(e: React.KeyboardEvent) {
    const currentHeight = toolbarRef.current?.offsetHeight ?? (toolbarHeight ?? MIN_TOOLBAR_HEIGHT)
    const maxHeight = naturalToolbarHeightRef.current ?? currentHeight
    const STEP = 8
    if (e.key === 'ArrowDown') {
      // ArrowDown: expand (pull handle down)
      e.preventDefault()
      setToolbarHeight(Math.min(maxHeight, currentHeight + STEP))
    } else if (e.key === 'ArrowUp') {
      // ArrowUp: shrink (push handle up)
      e.preventDefault()
      const newHeight = currentHeight - STEP
      if (newHeight < MIN_TOOLBAR_HEIGHT) {
        setToolbarHeight(currentHeight)
        setIsToolbarCollapsed(true)
      } else {
        setToolbarHeight(newHeight)
      }
    }
  }

  const effectiveHeight = dragHeight ?? toolbarHeight
  const contentScale = effectiveHeight !== null && naturalToolbarHeightRef.current !== null
    ? Math.min(1, effectiveHeight / naturalToolbarHeightRef.current)
    : 1

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

      {!isToolbarCollapsed && (
        <div
          ref={toolbarRef}
          className="app__toolbar"
          style={effectiveHeight !== null ? { height: effectiveHeight } : undefined}
        >
          <div className="app__toolbar-content">
            <div
              className="app__toolbar-left-group"
              style={contentScale < 1 ? { transform: `scale(${contentScale})`, transformOrigin: 'top left' } : undefined}
            >
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
                value={selectedSizeId}
                onChange={handlePaperSizeChange}
                data-paper-width={paperSize?.widthCm ?? ''}
                data-paper-height={paperSize?.heightCm ?? ''}
              >
                <option value="" disabled hidden>Select size</option>
                {PAPER_PRESETS.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">Custom…</option>
              </select>

              {selectedSizeId === 'custom' && (
                <span className="app__custom-size-inputs">
                  <label htmlFor="custom-width-input" className="app__paper-size-label">W cm</label>
                  <input
                    id="custom-width-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customWidth}
                    onChange={handleCustomWidthChange}
                    className="app__custom-size-input"
                  />
                  <label htmlFor="custom-height-input" className="app__paper-size-label">H cm</label>
                  <input
                    id="custom-height-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customHeight}
                    onChange={handleCustomHeightChange}
                    className="app__custom-size-input"
                  />
                </span>
              )}

              <button
                type="button"
                className="app__swap-button"
                aria-label="Swap orientation"
                disabled={isFitMode}
                title={isFitMode ? 'Orientation is set automatically in Fit mode' : undefined}
                onClick={handleSwapOrientation}
              >
                ⇅
              </button>

              <button
                type="button"
                className={`app__fit-toggle${isFitMode ? ' app__fit-toggle--active' : ''}`}
                aria-label="Fit mode"
                aria-pressed={isFitMode}
                disabled={!imageUrl}
                onClick={() => setIsFitMode(prev => !prev)}
              >
                {isFitMode ? 'Fit' : 'Stretch'}&nbsp;<span className="app__shortcut-hint" aria-hidden="true">F</span>
              </button>

              {isFitMode && fitLayout?.paperRotated && (
                <span className="app__fit-rotated-badge" aria-label="paper rotated">↺</span>
              )}

              {paperSize && (
                <span className="app__paper-dims">
                  {isFitMode && fitLayout?.paperRotated
                    ? `${paperSize.heightCm} × ${paperSize.widthCm} cm`
                    : `${paperSize.widthCm} × ${paperSize.heightCm} cm`}
                </span>
              )}

              <button
                ref={styleButtonRef}
                type="button"
                className="app__style-button"
                aria-expanded={isStylePanelOpen}
                aria-controls="style-panel"
                onClick={() => setIsStylePanelOpen(prev => !prev)}
              >
                Points Style
              </button>
            </div>

            <div
              className="app__toolbar-right-group"
              style={contentScale < 1 ? { transform: `scale(${contentScale})`, transformOrigin: 'top right' } : undefined}
            >
              <button
                type="button"
                className="app__toolbar-toggle"
                aria-label="Hide toolbar"
                onClick={() => setIsToolbarCollapsed(true)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="app__toolbar-resize-handle"
            aria-label="Resize toolbar"
            role="separator"
            aria-orientation="horizontal"
            tabIndex={0}
            onPointerDown={handleResizeHandlePointerDown}
            onPointerMove={handleResizeHandlePointerMove}
            onPointerUp={handleResizeHandlePointerUp}
            onKeyDown={handleResizeHandleKeyDown}
          />
        </div>
      )}

      {isToolbarCollapsed && (
        <button
          type="button"
          className="app__toolbar-toggle-fab"
          aria-label="Show toolbar"
          onClick={() => setIsToolbarCollapsed(false)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {isStylePanelOpen && (
        <StylePanel
          pointStyle={pointStyle}
          onUpdate={updatePointStyle}
          onClose={closeStylePanel}
          styleButtonRef={styleButtonRef}
          topOffset={
            toolbarRef.current
              ? toolbarRef.current.getBoundingClientRect().bottom
              : naturalToolbarHeightRef.current ?? 56
          }
        />
      )}

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
                {isFitMode && layout && (
                  <>
                    <defs>
                      <mask id="fit-margin-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect x={layout.left} y={layout.top} width={layout.width} height={layout.height} fill="black" />
                      </mask>
                    </defs>
                    <rect
                      x="0" y="0" width="100%" height="100%"
                      fill="rgba(0,0,0,0.45)"
                      mask="url(#fit-margin-mask)"
                      style={{ pointerEvents: 'none' }}
                    />
                    <rect
                      x={layout.left} y={layout.top}
                      width={layout.width} height={layout.height}
                      fill="none"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      style={{ pointerEvents: 'none' }}
                    />
                  </>
                )}
                {layout && points.map(point => {
                  const x = layout.left + point.relX * layout.width
                  const y = layout.top + point.relY * layout.height
                  const paperCoords = fitLayout
                    ? mapToCanvasFit(point.relX, point.relY, fitLayout)
                    : mapToCanvas(point.relX, point.relY, paperSize.widthCm, paperSize.heightCm)
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
                        r={pointStyle.pointRadius}
                        className="app__point-marker"
                        style={{ fill: pointStyle.pointColour, opacity: pointStyle.pointOpacity, pointerEvents: 'none' }}
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
                        x={x + pointStyle.labelOffsetDx}
                        y={y + pointStyle.labelOffsetDy}
                        className="app__point-label"
                        style={{ fontSize: pointStyle.labelFontSize, opacity: pointStyle.labelOpacity }}
                      >
                        <tspan>{paperCoords.xCm.toFixed(1)}, </tspan>
                        <tspan dx={pointStyle.labelCoordinateGap}>{paperCoords.yCm.toFixed(1)}</tspan>
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

