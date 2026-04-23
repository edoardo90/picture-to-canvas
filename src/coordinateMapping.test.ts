import { describe, it, expect } from 'vitest'
import { mapToCanvas, mapToCanvasFit, computeFitLayout, toImageRelative, clampToImageRelative } from './coordinateMapping'

describe('mapToCanvas', () => {
  it('maps origin to paper origin', () => {
    expect(mapToCanvas(0, 0, 21, 29.7)).toEqual({ xCm: 0, yCm: 0 })
  })

  it('maps center to center of A4 paper', () => {
    expect(mapToCanvas(0.5, 0.5, 21, 29.7)).toEqual({ xCm: 10.5, yCm: 14.85 })
  })

  it('maps far corner to paper dimensions', () => {
    expect(mapToCanvas(1, 1, 21, 29.7)).toEqual({ xCm: 21, yCm: 29.7 })
  })

  it('scales proportionally for A5 paper', () => {
    expect(mapToCanvas(0.5, 0.5, 14.8, 21)).toEqual({ xCm: 7.4, yCm: 10.5 })
  })

  it('maps a quarter point correctly', () => {
    expect(mapToCanvas(0.25, 0.75, 20, 30)).toEqual({ xCm: 5, yCm: 22.5 })
  })
})

describe('toImageRelative', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 }

  it('returns (0.5, 0.5) for the center point', () => {
    expect(toImageRelative(300, 200, rect)).toEqual({ relX: 0.5, relY: 0.5 })
  })

  it('returns (0, 0) for the top-left corner', () => {
    expect(toImageRelative(100, 50, rect)).toEqual({ relX: 0, relY: 0 })
  })

  it('returns (1, 1) for the bottom-right corner', () => {
    expect(toImageRelative(500, 350, rect)).toEqual({ relX: 1, relY: 1 })
  })

  it('returns null when x is left of the image', () => {
    expect(toImageRelative(99, 200, rect)).toBeNull()
  })

  it('returns null when x is right of the image', () => {
    expect(toImageRelative(501, 200, rect)).toBeNull()
  })

  it('returns null when y is above the image', () => {
    expect(toImageRelative(300, 49, rect)).toBeNull()
  })

  it('returns null when y is below the image', () => {
    expect(toImageRelative(300, 351, rect)).toBeNull()
  })
})

describe('clampToImageRelative', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 }

  it('clamps x below left edge to 0', () => {
    expect(clampToImageRelative(0, 200, rect)).toEqual({ relX: 0, relY: 0.5 })
  })

  it('clamps x beyond right edge to 1', () => {
    expect(clampToImageRelative(600, 200, rect)).toEqual({ relX: 1, relY: 0.5 })
  })

  it('clamps y above top edge to 0', () => {
    expect(clampToImageRelative(300, 0, rect)).toEqual({ relX: 0.5, relY: 0 })
  })

  it('clamps y below bottom edge to 1', () => {
    expect(clampToImageRelative(300, 500, rect)).toEqual({ relX: 0.5, relY: 1 })
  })

  it('leaves a point inside the rect unchanged', () => {
    expect(clampToImageRelative(300, 200, rect)).toEqual({ relX: 0.5, relY: 0.5 })
  })
})

describe('computeFitLayout', () => {
  it('returns no rotation when image aspect ratio matches paper exactly', () => {
    // Square image, square paper
    const result = computeFitLayout(100, 100, 10, 10)
    expect(result.paperRotated).toBe(false)
    expect(result.innerW).toBeCloseTo(10)
    expect(result.innerH).toBeCloseTo(10)
    expect(result.offsetX).toBeCloseTo(0)
    expect(result.offsetY).toBeCloseTo(0)
  })

  it('rotates paper when landscape image fits better in landscape orientation of portrait paper', () => {
    // 4:3 landscape image, A4 portrait (21 × 29.7)
    const result = computeFitLayout(400, 300, 21, 29.7)
    expect(result.paperRotated).toBe(true)
    expect(result.innerW).toBeCloseTo(28)
    expect(result.innerH).toBeCloseTo(21)
    expect(result.offsetX).toBeCloseTo(0.85)
    expect(result.offsetY).toBeCloseTo(0)
  })

  it('does not rotate when portrait image fits better in portrait paper', () => {
    // 3:4 portrait image, A4 portrait (21 × 29.7)
    const result = computeFitLayout(300, 400, 21, 29.7)
    expect(result.paperRotated).toBe(false)
    expect(result.innerW).toBeCloseTo(21)
    expect(result.innerH).toBeCloseTo(28)
    expect(result.offsetX).toBeCloseTo(0)
    expect(result.offsetY).toBeCloseTo(0.85)
  })

  it('centers the inner rect with equal offsets on constrained axis', () => {
    // Square image (1:1) in A4 portrait (21 × 29.7) — constrained by width
    const result = computeFitLayout(100, 100, 21, 29.7)
    expect(result.paperRotated).toBe(false)
    expect(result.innerW).toBeCloseTo(21)
    expect(result.innerH).toBeCloseTo(21)
    expect(result.offsetX).toBeCloseTo(0)
    expect(result.offsetY).toBeCloseTo((29.7 - 21) / 2)
  })

  it('chooses option A (no rotation) when areas are within 0.01 cm² tolerance', () => {
    // Square image in square paper — both options produce identical area
    const result = computeFitLayout(50, 50, 20, 20)
    expect(result.paperRotated).toBe(false)
  })

  it('inner rect aspect ratio always matches image aspect ratio', () => {
    const result = computeFitLayout(1920, 1080, 18, 26)
    const imageRatio = 1920 / 1080
    const innerRatio = result.innerW / result.innerH
    expect(innerRatio).toBeCloseTo(imageRatio, 5)
  })
})

describe('mapToCanvasFit', () => {
  const layout = { innerW: 28, innerH: 21, offsetX: 0.85, offsetY: 0, paperRotated: true }

  it('maps origin (0, 0) to the inner rect top-left offset', () => {
    expect(mapToCanvasFit(0, 0, layout)).toEqual({ xCm: 0.85, yCm: 0 })
  })

  it('maps far corner (1, 1) to inner rect bottom-right', () => {
    const result = mapToCanvasFit(1, 1, layout)
    expect(result.xCm).toBeCloseTo(0.85 + 28)
    expect(result.yCm).toBeCloseTo(0 + 21)
  })

  it('maps center (0.5, 0.5) to the center of the inner rect', () => {
    const result = mapToCanvasFit(0.5, 0.5, layout)
    expect(result.xCm).toBeCloseTo(0.85 + 14)
    expect(result.yCm).toBeCloseTo(10.5)
  })

  it('maps with zero offsets when inner rect fills entire paper', () => {
    const squareLayout = { innerW: 21, innerH: 29.7, offsetX: 0, offsetY: 0, paperRotated: false }
    expect(mapToCanvasFit(0.5, 0.5, squareLayout)).toEqual({ xCm: 10.5, yCm: 14.85 })
  })
})
