import { useEffect, useRef } from 'react'
import type { PointStyleSettings } from './pointStyle'

type StylePanelProps = {
  pointStyle: PointStyleSettings
  onUpdate: (partial: Partial<PointStyleSettings>) => void
  onClose: () => void
  styleButtonRef: React.RefObject<HTMLButtonElement>
  topOffset: number
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !(el as HTMLInputElement).disabled && el.tabIndex >= 0)
}

export function StylePanel({
  pointStyle,
  onUpdate,
  onClose,
  styleButtonRef,
  topOffset,
}: StylePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const focusables = getFocusableElements(panelRef.current!)
    focusables[0]?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (styleButtonRef.current?.contains(target)) return
      onClose()
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose, styleButtonRef])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Tab') return
    const focusables = getFocusableElements(panelRef.current!)
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div
      ref={panelRef}
      id="style-panel"
      role="dialog"
      aria-label="Point style"
      aria-modal="true"
      className="app__style-panel"
      style={{ top: `${topOffset}px` }}
      onKeyDown={handleKeyDown}
    >
      <div className="app__style-panel-grid">
        <div className="app__style-field">
          <label htmlFor="style-point-colour" className="app__style-label">Colour</label>
          <input
            type="color"
            id="style-point-colour"
            className="app__style-color-input"
            value={pointStyle.pointColour}
            onChange={e => onUpdate({ pointColour: e.target.value })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-point-radius" className="app__style-label">Radius</label>
          <input
            type="number"
            id="style-point-radius"
            className="app__style-number-input"
            value={pointStyle.pointRadius}
            min={2}
            max={20}
            onChange={e => onUpdate({ pointRadius: Math.min(20, Math.max(2, Number(e.target.value))) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-point-opacity" className="app__style-label">Point opacity %</label>
          <input
            type="number"
            id="style-point-opacity"
            className="app__style-number-input"
            value={Math.round(pointStyle.pointOpacity * 100)}
            min={0}
            max={100}
            onChange={e => onUpdate({ pointOpacity: Math.min(1, Math.max(0, Number(e.target.value) / 100)) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-label-font-size" className="app__style-label">Label size</label>
          <input
            type="number"
            id="style-label-font-size"
            className="app__style-number-input"
            value={pointStyle.labelFontSize}
            min={8}
            max={32}
            onChange={e => onUpdate({ labelFontSize: Math.min(32, Math.max(8, Number(e.target.value))) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-label-opacity" className="app__style-label">Label opacity %</label>
          <input
            type="number"
            id="style-label-opacity"
            className="app__style-number-input"
            value={Math.round(pointStyle.labelOpacity * 100)}
            min={0}
            max={100}
            onChange={e => onUpdate({ labelOpacity: Math.min(1, Math.max(0, Number(e.target.value) / 100)) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-label-offset-dx" className="app__style-label">Offset X</label>
          <input
            type="number"
            id="style-label-offset-dx"
            className="app__style-number-input"
            value={pointStyle.labelOffsetDx}
            min={0}
            max={40}
            onChange={e => onUpdate({ labelOffsetDx: Math.min(40, Math.max(0, Number(e.target.value))) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-label-offset-dy" className="app__style-label">Offset Y</label>
          <input
            type="number"
            id="style-label-offset-dy"
            className="app__style-number-input"
            value={pointStyle.labelOffsetDy}
            min={-40}
            max={0}
            onChange={e => onUpdate({ labelOffsetDy: Math.min(0, Math.max(-40, Number(e.target.value))) })}
          />
        </div>

        <div className="app__style-field">
          <label htmlFor="style-label-coord-gap" className="app__style-label">Coord gap</label>
          <input
            type="number"
            id="style-label-coord-gap"
            className="app__style-number-input"
            value={pointStyle.labelCoordinateGap}
            min={0}
            max={40}
            onChange={e => onUpdate({ labelCoordinateGap: Math.min(40, Math.max(0, Number(e.target.value))) })}
          />
        </div>
      </div>
    </div>
  )
}
