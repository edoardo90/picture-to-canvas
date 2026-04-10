import { loadPointStyle, savePointStyle, DEFAULT_POINT_STYLE } from './pointStyle'

beforeEach(() => {
  localStorage.clear()
})

describe('loadPointStyle', () => {
  it('returns defaults when localStorage is empty', () => {
    expect(loadPointStyle()).toEqual(DEFAULT_POINT_STYLE)
  })

  it('returns saved values when valid data is stored', () => {
    const saved = { ...DEFAULT_POINT_STYLE, pointRadius: 10, labelFontSize: 16 }
    localStorage.setItem('point-style-settings', JSON.stringify(saved))
    expect(loadPointStyle()).toEqual(saved)
  })

  it('clamps point radius above max to 20', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointRadius: 999 }))
    expect(loadPointStyle().pointRadius).toBe(20)
  })

  it('clamps point radius below min to 2', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointRadius: -1 }))
    expect(loadPointStyle().pointRadius).toBe(2)
  })

  it('clamps point opacity above 1 to 1', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointOpacity: 5 }))
    expect(loadPointStyle().pointOpacity).toBe(1)
  })

  it('clamps point opacity below 0 to 0', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointOpacity: -0.1 }))
    expect(loadPointStyle().pointOpacity).toBe(0)
  })

  it('clamps label font size above max to 32', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelFontSize: 100 }))
    expect(loadPointStyle().labelFontSize).toBe(32)
  })

  it('clamps label font size below min to 8', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelFontSize: 1 }))
    expect(loadPointStyle().labelFontSize).toBe(8)
  })

  it('clamps label offset dy below -40 to -40', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOffsetDy: -100 }))
    expect(loadPointStyle().labelOffsetDy).toBe(-40)
  })

  it('clamps label offset dy above 0 to 0', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOffsetDy: 5 }))
    expect(loadPointStyle().labelOffsetDy).toBe(0)
  })

  it('clamps label coordinate gap above 40 to 40', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelCoordinateGap: 999 }))
    expect(loadPointStyle().labelCoordinateGap).toBe(40)
  })

  it('clamps label coordinate gap below 0 to 0', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelCoordinateGap: -5 }))
    expect(loadPointStyle().labelCoordinateGap).toBe(0)
  })

  it('clamps label offset dx above 40 to 40', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOffsetDx: 999 }))
    expect(loadPointStyle().labelOffsetDx).toBe(40)
  })

  it('clamps label offset dx below 0 to 0', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOffsetDx: -10 }))
    expect(loadPointStyle().labelOffsetDx).toBe(0)
  })

  it('clamps label opacity above 1 to 1', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOpacity: 5 }))
    expect(loadPointStyle().labelOpacity).toBe(1)
  })

  it('clamps label opacity below 0 to 0', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ labelOpacity: -0.1 }))
    expect(loadPointStyle().labelOpacity).toBe(0)
  })

  it('rejects colour that is not a hex string and falls back to default', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointColour: 'red' }))
    expect(loadPointStyle().pointColour).toBe(DEFAULT_POINT_STYLE.pointColour)
  })

  it('rejects malformed hex colour and falls back to default', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointColour: '#gggggg' }))
    expect(loadPointStyle().pointColour).toBe(DEFAULT_POINT_STYLE.pointColour)
  })

  it('accepts a valid 6-digit hex colour', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointColour: '#ff0000' }))
    expect(loadPointStyle().pointColour).toBe('#ff0000')
  })

  it('returns defaults for malformed JSON', () => {
    localStorage.setItem('point-style-settings', 'not-json')
    expect(loadPointStyle()).toEqual(DEFAULT_POINT_STYLE)
  })

  it('returns defaults when stored value is not an object', () => {
    localStorage.setItem('point-style-settings', JSON.stringify(42))
    expect(loadPointStyle()).toEqual(DEFAULT_POINT_STYLE)
  })

  it('fills in missing fields with defaults when only some fields are stored', () => {
    localStorage.setItem('point-style-settings', JSON.stringify({ pointRadius: 8 }))
    const result = loadPointStyle()
    expect(result.pointRadius).toBe(8)
    expect(result.pointColour).toBe(DEFAULT_POINT_STYLE.pointColour)
    expect(result.labelFontSize).toBe(DEFAULT_POINT_STYLE.labelFontSize)
  })
})

describe('savePointStyle', () => {
  it('writes settings to localStorage', () => {
    const settings = { ...DEFAULT_POINT_STYLE, pointRadius: 8 }
    savePointStyle(settings)
    const stored = JSON.parse(localStorage.getItem('point-style-settings') ?? 'null')
    expect(stored).toEqual(settings)
  })

  it('does not throw if localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    expect(() => savePointStyle(DEFAULT_POINT_STYLE)).not.toThrow()
    vi.restoreAllMocks()
  })
})
