const STORAGE_KEY = 'point-style-settings'

export type PointStyleSettings = {
  pointColour: string
  pointRadius: number
  pointOpacity: number
  labelFontSize: number
  labelOpacity: number
  labelOffsetDx: number
  labelOffsetDy: number
  labelCoordinateGap: number
}

export const DEFAULT_POINT_STYLE: PointStyleSettings = {
  pointColour: '#ffffff',
  pointRadius: 4,
  pointOpacity: 0.9,
  labelFontSize: 11,
  labelOpacity: 1.0,
  labelOffsetDx: 10,
  labelOffsetDy: -6,
  labelCoordinateGap: 0,
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function validateHexColour(value: unknown, fallback: string): string {
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) return value
  return fallback
}

export function loadPointStyle(): PointStyleSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_POINT_STYLE }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_POINT_STYLE }
    const p = parsed as Record<string, unknown>
    return {
      pointColour: validateHexColour(p.pointColour, DEFAULT_POINT_STYLE.pointColour),
      pointRadius: clampNumber(p.pointRadius, 2, 20, DEFAULT_POINT_STYLE.pointRadius),
      pointOpacity: clampNumber(p.pointOpacity, 0, 1, DEFAULT_POINT_STYLE.pointOpacity),
      labelFontSize: clampNumber(p.labelFontSize, 8, 32, DEFAULT_POINT_STYLE.labelFontSize),
      labelOpacity: clampNumber(p.labelOpacity, 0, 1, DEFAULT_POINT_STYLE.labelOpacity),
      labelOffsetDx: clampNumber(p.labelOffsetDx, 0, 40, DEFAULT_POINT_STYLE.labelOffsetDx),
      labelOffsetDy: clampNumber(p.labelOffsetDy, -40, 0, DEFAULT_POINT_STYLE.labelOffsetDy),
      labelCoordinateGap: clampNumber(p.labelCoordinateGap, 0, 40, DEFAULT_POINT_STYLE.labelCoordinateGap),
    }
  } catch {
    return { ...DEFAULT_POINT_STYLE }
  }
}

export function savePointStyle(settings: PointStyleSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable — ignore silently
  }
}
