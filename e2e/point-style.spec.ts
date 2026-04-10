import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'sample.jpg')

async function loadImageAndSelectPaper(page: Page) {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(FIXTURE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')
  await page.selectOption('#paper-size-select', 'a4')
}

async function placeOnePoint(page: Page) {
  const overlay = page.locator('.app__point-overlay')
  await overlay.click()
  await expect(page.locator('.app__point-group')).toHaveCount(1)
}

async function openStylePanel(page: Page) {
  await page.getByRole('button', { name: 'Points Style' }).click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()
}

// AC-1: all seven style controls are present and labelled in the style panel
test('all seven style controls are visible in the style panel', async ({ page }) => {
  await page.goto('/')
  await openStylePanel(page)
  await expect(page.locator('#style-point-colour')).toBeVisible()
  await expect(page.locator('#style-point-radius')).toBeVisible()
  await expect(page.locator('#style-point-opacity')).toBeVisible()
  await expect(page.locator('#style-label-font-size')).toBeVisible()
  await expect(page.locator('#style-label-opacity')).toBeVisible()
  await expect(page.locator('#style-label-offset-dx')).toBeVisible()
  await expect(page.locator('#style-label-offset-dy')).toBeVisible()
  await expect(page.locator('#style-label-coord-gap')).toBeVisible()
})

// AC-2 + AC-3: changing radius immediately updates placed points; new points use current value
test('changing point radius immediately updates rendered markers', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.fill('#style-point-radius', '12')

  const r = await page.locator('.app__point-marker').first().getAttribute('r')
  expect(Number(r)).toBe(12)
})

// AC-5: setting point opacity to 0 makes the marker visually invisible
test('setting point opacity to 0 makes markers invisible', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.fill('#style-point-opacity', '0')

  const opacity = await page.locator('.app__point-marker').first().evaluate(
    el => (el as SVGElement).style.opacity
  )
  expect(Number(opacity)).toBe(0)
})

// AC-5: setting label opacity to 0 makes the label visually invisible
test('setting label opacity to 0 makes labels invisible', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.fill('#style-label-opacity', '0')

  const opacity = await page.locator('.app__point-label').first().evaluate(
    el => (el as SVGElement).style.opacity
  )
  expect(Number(opacity)).toBe(0)
})

// AC-8: style settings persist across page reload
test('style settings are restored after page reload', async ({ page }) => {
  await page.goto('/')
  await openStylePanel(page)
  await page.fill('#style-point-radius', '15')
  await page.reload()
  await openStylePanel(page)

  await expect(page.locator('#style-point-radius')).toHaveValue('15')
})

// AC-8: default values match expected appearance on fresh load
test('default values match expected appearance', async ({ page }) => {
  await page.goto('/')
  await openStylePanel(page)

  await expect(page.locator('#style-point-radius')).toHaveValue('4')
  await expect(page.locator('#style-point-opacity')).toHaveValue('90')
  await expect(page.locator('#style-label-font-size')).toHaveValue('11')
  await expect(page.locator('#style-label-opacity')).toHaveValue('100')
})

// AC-2 + AC-3: changing point colour immediately updates the fill on rendered markers
test('changing point colour immediately updates marker fill', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.locator('#style-point-colour').evaluate(
    (el: HTMLInputElement, color) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      nativeSetter.call(el, color)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    },
    '#ff0000'
  )

  const fill = await page.locator('.app__point-marker').first().evaluate(
    el => (el as SVGElement).style.fill
  )
  // Browser normalises #ff0000 to rgb(255, 0, 0)
  expect(fill.toLowerCase()).toMatch(/ff0000|rgb\(255,\s*0,\s*0\)/)
})

// AC-2 + AC-3: changing label font size immediately updates the fontSize style on rendered labels
test('changing label font size immediately updates label font size', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.fill('#style-label-font-size', '20')

  const fontSize = await page.locator('.app__point-label').first().evaluate(
    el => (el as SVGTextElement).style.fontSize
  )
  expect(fontSize).toBe('20px')
})

// AC-7: label x/y attributes reflect the configured offset from the marker centre
test('label position matches configured offset from marker centre', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)

  // Use default offsets: dx=10, dy=-6
  const result = await page.evaluate(() => {
    const marker = document.querySelector('.app__point-marker') as SVGCircleElement
    const label = document.querySelector('.app__point-label') as SVGTextElement
    if (!marker || !label) return null
    return {
      markerCx: Number(marker.getAttribute('cx')),
      markerCy: Number(marker.getAttribute('cy')),
      labelX: Number(label.getAttribute('x')),
      labelY: Number(label.getAttribute('y')),
    }
  })

  expect(result).not.toBeNull()
  expect(result!.labelX).toBeCloseTo(result!.markerCx + 10, 0)
  expect(result!.labelY).toBeCloseTo(result!.markerCy - 6, 0)
})

// AC-7: second tspan has dx attribute equal to labelCoordinateGap input value
test('second tspan dx attribute matches configured coordinate gap', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)
  await openStylePanel(page)

  await page.fill('#style-label-coord-gap', '15')

  const dx = await page.evaluate(() => {
    const tspans = document.querySelectorAll('.app__point-label tspan')
    return tspans[1]?.getAttribute('dx')
  })
  expect(Number(dx)).toBe(15)
})

// AC-7: label bounding box does not intersect the point marker bounding box (default offsets)
test('label does not overlap the point marker with default offsets', async ({ page }) => {
  await loadImageAndSelectPaper(page)
  await placeOnePoint(page)

  const noOverlap = await page.evaluate(() => {
    const marker = document.querySelector('.app__point-marker') as SVGCircleElement
    const label = document.querySelector('.app__point-label') as SVGTextElement
    if (!marker || !label) return false
    const mRect = marker.getBoundingClientRect()
    const lRect = label.getBoundingClientRect()
    // Check that the rectangles do not intersect
    return (
      lRect.right < mRect.left ||
      lRect.left > mRect.right ||
      lRect.bottom < mRect.top ||
      lRect.top > mRect.bottom
    )
  })
  expect(noOverlap).toBe(true)
})

// AC-8: multiple style properties persist across page reload
test('label font size and offset persist across page reload', async ({ page }) => {
  await page.goto('/')
  await openStylePanel(page)
  await page.fill('#style-label-font-size', '20')
  await page.fill('#style-label-offset-dx', '25')
  await page.reload()
  await openStylePanel(page)

  await expect(page.locator('#style-label-font-size')).toHaveValue('20')
  await expect(page.locator('#style-label-offset-dx')).toHaveValue('25')
})
