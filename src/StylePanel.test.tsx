import { render, screen, fireEvent } from '@testing-library/react'
import { StylePanel } from './StylePanel'
import { DEFAULT_POINT_STYLE } from './pointStyle'
import type { PointStyleSettings } from './pointStyle'

function renderPanel(overrides?: {
  pointStyle?: Partial<PointStyleSettings>
  onUpdate?: (p: Partial<PointStyleSettings>) => void
  onClose?: () => void
}) {
  const onUpdate = overrides?.onUpdate ?? vi.fn()
  const onClose = overrides?.onClose ?? vi.fn()
  const styleButtonRef = { current: null } as React.RefObject<HTMLButtonElement>
  render(
    <StylePanel
      pointStyle={{ ...DEFAULT_POINT_STYLE, ...overrides?.pointStyle }}
      onUpdate={onUpdate}
      onClose={onClose}
      styleButtonRef={styleButtonRef}
      topOffset={60}
    />
  )
  return { onUpdate, onClose }
}

// Rendering: all 8 control inputs are present
test('renders all eight style control inputs', () => {
  renderPanel()
  expect(document.getElementById('style-point-colour')).toBeInTheDocument()
  expect(document.getElementById('style-point-radius')).toBeInTheDocument()
  expect(document.getElementById('style-point-opacity')).toBeInTheDocument()
  expect(document.getElementById('style-label-font-size')).toBeInTheDocument()
  expect(document.getElementById('style-label-opacity')).toBeInTheDocument()
  expect(document.getElementById('style-label-offset-dx')).toBeInTheDocument()
  expect(document.getElementById('style-label-offset-dy')).toBeInTheDocument()
  expect(document.getElementById('style-label-coord-gap')).toBeInTheDocument()
})

// Rendering: dialog role and aria attributes
test('panel has role="dialog" with aria-modal="true"', () => {
  renderPanel()
  const dialog = screen.getByRole('dialog', { name: 'Point style' })
  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveAttribute('aria-modal', 'true')
})

// Rendering: each input has an associated visible label
test('each control input has an associated label', () => {
  renderPanel()
  expect(screen.getByLabelText('Colour')).toBeInTheDocument()
  expect(screen.getByLabelText('Radius')).toBeInTheDocument()
  expect(screen.getByLabelText('Point opacity %')).toBeInTheDocument()
  expect(screen.getByLabelText('Label size')).toBeInTheDocument()
  expect(screen.getByLabelText('Label opacity %')).toBeInTheDocument()
  expect(screen.getByLabelText('Offset X')).toBeInTheDocument()
  expect(screen.getByLabelText('Offset Y')).toBeInTheDocument()
  expect(screen.getByLabelText('Coord gap')).toBeInTheDocument()
})

// onUpdate: colour change passes the value directly
test('changing colour calls onUpdate with the new colour', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-colour')!, {
    target: { value: '#ff0000' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointColour: '#ff0000' })
})

// onUpdate: opacity input converts percentage to 0-1 fraction
test('changing point opacity calls onUpdate with value divided by 100', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-opacity')!, {
    target: { value: '75' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointOpacity: 0.75 })
})

// onUpdate: label opacity input also converts percentage
test('changing label opacity calls onUpdate with value divided by 100', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-opacity')!, {
    target: { value: '50' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelOpacity: 0.5 })
})

// onUpdate: opacity is clamped to [0, 1] (can't go below 0 or above 1)
test('point opacity is clamped to 0 when a negative value is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-opacity')!, {
    target: { value: '-10' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointOpacity: 0 })
})

test('point opacity is clamped to 1 when a value above 100 is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-opacity')!, {
    target: { value: '200' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointOpacity: 1 })
})

// onUpdate: radius is clamped to [2, 20]
test('radius is clamped to 2 when a value below min is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-radius')!, {
    target: { value: '0' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointRadius: 2 })
})

test('radius is clamped to 20 when a value above max is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-point-radius')!, {
    target: { value: '999' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ pointRadius: 20 })
})

// onUpdate: labelOffsetDx is clamped to [0, 40]
test('labelOffsetDx is clamped to 0 when a negative value is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-offset-dx')!, {
    target: { value: '-5' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelOffsetDx: 0 })
})

test('labelOffsetDx is clamped to 40 when a value above max is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-offset-dx')!, {
    target: { value: '100' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelOffsetDx: 40 })
})

// onUpdate: labelOffsetDy is clamped to [-40, 0]
test('labelOffsetDy is clamped to -40 when a value below min is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-offset-dy')!, {
    target: { value: '-100' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelOffsetDy: -40 })
})

test('labelOffsetDy is clamped to 0 when a positive value is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-offset-dy')!, {
    target: { value: '10' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelOffsetDy: 0 })
})

// onUpdate: labelCoordinateGap is clamped to [0, 40]
test('labelCoordinateGap is clamped to 0 when a negative value is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-coord-gap')!, {
    target: { value: '-1' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelCoordinateGap: 0 })
})

test('labelCoordinateGap is clamped to 40 when a value above max is entered', () => {
  const { onUpdate } = renderPanel()
  fireEvent.change(document.getElementById('style-label-coord-gap')!, {
    target: { value: '99' },
  })
  expect(onUpdate).toHaveBeenCalledWith({ labelCoordinateGap: 40 })
})

// Esc: window keydown with Escape calls onClose
test('pressing Escape calls onClose', () => {
  const { onClose } = renderPanel()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledTimes(1)
})

// Esc: non-Escape keydown does NOT call onClose
test('pressing a non-Escape key does not call onClose', () => {
  const { onClose } = renderPanel()
  fireEvent.keyDown(window, { key: 'Enter' })
  expect(onClose).not.toHaveBeenCalled()
})
