import { describe, it, expect } from 'vitest'
import { mapToCanvas, toImageRelative, clampToImageRelative } from './coordinateMapping'

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
