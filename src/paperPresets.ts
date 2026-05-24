export type PaperSizeId = string

export type PaperSize = {
  id: PaperSizeId
  label: string
  widthCm: number
  heightCm: number
}

export const PAPER_PRESETS: PaperSize[] = [
  // ISO
  { id: 'a5', label: '14.8 × 21 cm', widthCm: 14.8, heightCm: 21 },
  { id: 'a4', label: '21 × 29.7 cm', widthCm: 21, heightCm: 29.7 },

  // Common blocks (Arches block sizes)
  { id: '10x25', label: '10 × 25 cm', widthCm: 10, heightCm: 25 },
  { id: '12.7x17.8', label: '12.7 × 17.8 cm', widthCm: 12.7, heightCm: 17.78 },
  { id: '18x26', label: '18 × 26 cm', widthCm: 18, heightCm: 26 },
  { id: '20x20', label: '20 × 20 cm', widthCm: 20, heightCm: 20 },
  { id: '20x26', label: '20 × 26 cm', widthCm: 20, heightCm: 26 },
  { id: '23x31', label: '23 × 31 cm', widthCm: 23, heightCm: 31 },
  { id: '26x36', label: '26 × 36 cm', widthCm: 26, heightCm: 36 },
  { id: '28x36', label: '28 × 36 cm', widthCm: 28, heightCm: 36 },
  { id: '31x31', label: '31 × 31 cm', widthCm: 31, heightCm: 31 },
  { id: '31x41', label: '31 × 41 cm', widthCm: 31, heightCm: 41 },
  { id: '36x51', label: '36 × 51 cm', widthCm: 36, heightCm: 51 },
  { id: '41x51', label: '41 × 51 cm', widthCm: 41, heightCm: 51 },
  { id: '46x61', label: '46 × 61 cm', widthCm: 46, heightCm: 61 },

  // Sheet sizes (Arches commercial dimensions from provided list)
  { id: '50.8x40.6', label: '50.8 × 40.6 cm', widthCm: 50.8, heightCm: 40.6 },
  { id: '56x76', label: '56 × 76 cm', widthCm: 56, heightCm: 76 },
  { id: '64.8x101.6', label: '64.8 × 101.6 cm', widthCm: 64.8, heightCm: 101.6 },
  { id: '101.6x152.4', label: '101.6 × 152.4 cm', widthCm: 101.6, heightCm: 152.4 },

  // Large roll formats (optional)
  { id: '113x914', label: '113 × 914 cm', widthCm: 113, heightCm: 914 },
  { id: '130x914', label: '130 × 914 cm', widthCm: 130, heightCm: 914 },

  // Custom placeholder
  { id: 'custom', label: 'Custom…', widthCm: 0, heightCm: 0 },
]
