import { PAPER_PRESETS } from './paperPresets'

test('provides exactly three presets', () => {
  expect(PAPER_PRESETS).toHaveLength(3)
})

test('A4 preset has correct dimensions', () => {
  const preset = PAPER_PRESETS.find(p => p.id === 'a4')
  expect(preset).toEqual({ id: 'a4', label: 'A4', widthCm: 21, heightCm: 29.7 })
})

test('A5 preset has correct dimensions', () => {
  const preset = PAPER_PRESETS.find(p => p.id === 'a5')
  expect(preset).toEqual({ id: 'a5', label: 'A5', widthCm: 14.8, heightCm: 21 })
})

test('18×26 preset has correct dimensions', () => {
  const preset = PAPER_PRESETS.find(p => p.id === '18x26')
  expect(preset).toEqual({ id: '18x26', label: '18 × 26 cm', widthCm: 18, heightCm: 26 })
})

test('every preset has a unique id', () => {
  const ids = PAPER_PRESETS.map(p => p.id)
  expect(new Set(ids).size).toBe(PAPER_PRESETS.length)
})
