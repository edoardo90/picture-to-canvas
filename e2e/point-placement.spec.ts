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

// AC-1 + AC-2: place a point on the image and see coordinates
test('placing a point on the image shows paper coordinates', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()

  await expect(page.locator('.app__point-label').first()).toBeVisible()
})

// AC-3 + AC-4: select a point by clicking it, then delete with Delete key
test('selecting a point and pressing Delete removes it', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()
  await expect(page.locator('.app__point-group')).toHaveCount(1)

  // Click the marker to select it
  await page.locator('.app__point-group').first().click()

  // Press Delete to remove it
  await page.keyboard.press('Delete')
  await expect(page.locator('.app__point-group')).toHaveCount(0)
})

// AC-6: changing paper size recomputes coordinates without removing points
test('changing paper size recomputes coordinates and keeps all points', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()

  const labelBefore = await page.locator('.app__point-label').first().textContent()

  await page.selectOption('#paper-size-select', 'a5')

  await expect(page.locator('.app__point-group')).toHaveCount(1)
  const labelAfter = await page.locator('.app__point-label').first().textContent()
  expect(labelAfter).not.toBe(labelBefore)
})

// AC-4: Escape deselects without deleting
test('pressing Escape deselects a point without removing it', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()
  await expect(page.locator('.app__point-group')).toHaveCount(1)

  await page.locator('.app__point-group').first().click()
  await expect(page.locator('.app__point-group--selected')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(page.locator('.app__point-group--selected')).toHaveCount(0)
  await expect(page.locator('.app__point-group')).toHaveCount(1)
})

// AC-3 keyboard: Tab to a point focuses and selects it
test('tabbing to a point selects it', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()
  await expect(page.locator('.app__point-group')).toHaveCount(1)

  await page.focus('#paper-size-select')
  // Tab past the hide-toolbar toggle button and the resize handle, then onto the first point
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.locator('.app__point-group--selected')).toHaveCount(1)
})

// AC-5: dragging a point repositions it and updates coordinates
test('dragging a point to a new position updates its coordinates', async ({ page }) => {
  await loadImageAndSelectPaper(page)

  const overlay = page.locator('.app__point-overlay')
  const overlayBox = await overlay.boundingBox()
  expect(overlayBox).not.toBeNull()

  const cx = overlayBox!.x + overlayBox!.width / 2
  const cy = overlayBox!.y + overlayBox!.height / 2
  await overlay.click()

  const labelBefore = await page.locator('.app__point-label').first().textContent()

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 60, cy + 60, { steps: 5 })
  await page.mouse.up()

  const labelAfter = await page.locator('.app__point-label').first().textContent()
  expect(labelAfter).not.toBe(labelBefore)
})
