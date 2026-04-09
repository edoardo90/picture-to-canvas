export type PaperSizeId = 'a4' | 'a5' | '18x26'

export type PaperSize = {
  id: PaperSizeId
  label: string
  widthCm: number
  heightCm: number
}

export const PAPER_PRESETS: PaperSize[] = [
  { id: 'a4', label: 'A4', widthCm: 21, heightCm: 29.7 },
  { id: 'a5', label: 'A5', widthCm: 14.8, heightCm: 21 },
  { id: '18x26', label: '18 × 26 cm', widthCm: 18, heightCm: 26 },
]
