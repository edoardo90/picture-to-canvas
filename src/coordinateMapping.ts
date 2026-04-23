export type PaperCoords = {
  xCm: number
  yCm: number
}

export type ContentRect = {
  left: number
  top: number
  width: number
  height: number
}

export type FitLayout = {
  innerW: number
  innerH: number
  offsetX: number
  offsetY: number
  paperRotated: boolean
}

/**
 * Computes the largest axis-aligned rect that fits the image inside the paper
 * while preserving the image aspect ratio. Returns offset and inner dimensions
 * in cm, and whether the paper orientation was logically rotated 90°.
 */
export function computeFitLayout(
  imgW: number,
  imgH: number,
  paperWidthCm: number,
  paperHeightCm: number,
): FitLayout {
  const ratio = imgW / imgH

  // Option A: paper as-is (paperWidthCm × paperHeightCm)
  const innerW_A = Math.min(paperWidthCm, paperHeightCm * ratio)
  const innerH_A = innerW_A / ratio
  const areaA = innerW_A * innerH_A

  // Option B: paper rotated 90° (paperHeightCm × paperWidthCm)
  const innerW_B = Math.min(paperHeightCm, paperWidthCm * ratio)
  const innerH_B = innerW_B / ratio
  const areaB = innerW_B * innerH_B

  if (areaB > areaA + 0.01) {
    return {
      innerW: innerW_B,
      innerH: innerH_B,
      offsetX: (paperHeightCm - innerW_B) / 2,
      offsetY: (paperWidthCm - innerH_B) / 2,
      paperRotated: true,
    }
  }

  return {
    innerW: innerW_A,
    innerH: innerH_A,
    offsetX: (paperWidthCm - innerW_A) / 2,
    offsetY: (paperHeightCm - innerH_A) / 2,
    paperRotated: false,
  }
}

/**
 * Maps a relative position within the image [0,1] to real-world paper coordinates
 * using the Fit layout (preserves aspect ratio, centered inner rect).
 */
export function mapToCanvasFit(
  relX: number,
  relY: number,
  fitLayout: FitLayout,
): PaperCoords {
  return {
    xCm: fitLayout.offsetX + relX * fitLayout.innerW,
    yCm: fitLayout.offsetY + relY * fitLayout.innerH,
  }
}

/**
 * Maps a relative position within the image [0,1] to real-world paper coordinates.
 */
export function mapToCanvas(
  relX: number,
  relY: number,
  paperWidthCm: number,
  paperHeightCm: number,
): PaperCoords {
  return {
    xCm: relX * paperWidthCm,
    yCm: relY * paperHeightCm,
  }
}

/**
 * Converts a viewport (client) position to image-relative [0,1] coordinates.
 * Returns null if the position falls outside the content rect.
 */
export function toImageRelative(
  clientX: number,
  clientY: number,
  contentRect: ContentRect,
): { relX: number; relY: number } | null {
  const relX = (clientX - contentRect.left) / contentRect.width
  const relY = (clientY - contentRect.top) / contentRect.height
  if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null
  return { relX, relY }
}

/**
 * Same as toImageRelative but clamps the result to [0,1].
 * Used during drag to keep a point inside the image boundaries.
 */
export function clampToImageRelative(
  clientX: number,
  clientY: number,
  contentRect: ContentRect,
): { relX: number; relY: number } {
  return {
    relX: Math.max(0, Math.min(1, (clientX - contentRect.left) / contentRect.width)),
    relY: Math.max(0, Math.min(1, (clientY - contentRect.top) / contentRect.height)),
  }
}
