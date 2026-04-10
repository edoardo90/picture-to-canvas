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
