import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'sample.jpg')
const LANDSCAPE_IMAGE = path.join(__dirname, 'fixtures', 'landscape.jpg')

async function loadImage(page: Page) {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(FIXTURE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')
}

// AC-1: Fit toggle button is present in the toolbar
test('Fit toggle button is visible in toolbar', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toBeVisible()
})

// AC-1: toggle is disabled when no image is loaded
test('Fit toggle is disabled before an image is loaded', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toBeDisabled()
})

// AC-1: toggle has aria-pressed=false initially
test('Fit toggle has aria-pressed="false" by default', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toHaveAttribute('aria-pressed', 'false')
})

// AC-1: toggle becomes enabled after loading an image
test('Fit toggle is enabled after loading an image', async ({ page }) => {
  await loadImage(page)
  await expect(page.getByRole('button', { name: 'Fit mode' })).toBeEnabled()
})

// AC-1: clicking the toggle switches aria-pressed to true
test('clicking Fit toggle sets aria-pressed to true', async ({ page }) => {
  await loadImage(page)
  await page.getByRole('button', { name: 'Fit mode' }).click()
  await expect(page.getByRole('button', { name: 'Fit mode' })).toHaveAttribute('aria-pressed', 'true')
})

// AC-1: pressing F key toggles fit mode
test('pressing F key enables fit mode', async ({ page }) => {
  await loadImage(page)
  await page.keyboard.press('f')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toHaveAttribute('aria-pressed', 'true')
})

// AC-1: pressing F again returns to Stretch mode
test('pressing F twice returns to Stretch mode', async ({ page }) => {
  await loadImage(page)
  await page.keyboard.press('f')
  await page.keyboard.press('f')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toHaveAttribute('aria-pressed', 'false')
})

// AC-1: F key does nothing before image is loaded
test('F key does not toggle mode before an image is loaded', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('f')
  await expect(page.getByRole('button', { name: 'Fit mode' })).toHaveAttribute('aria-pressed', 'false')
})

// AC-2: coordinates are shown for a placed point in Fit mode
test('placing a point in Fit mode shows a coordinate label', async ({ page }) => {
  await loadImage(page)
  await page.keyboard.press('f')

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()

  await expect(page.locator('.app__point-label').first()).toBeVisible()
})

// AC-4: fit mode renders a dashed inner rect border on the canvas
test('fit mode renders the inner rect overlay', async ({ page }) => {
  await loadImage(page)
  await page.keyboard.press('f')

  // The dashed border rect is rendered inside the SVG when fit mode is active
  const dashedRect = page.locator('.app__point-overlay rect[stroke-dasharray]')
  await expect(dashedRect).toBeAttached()
})

// AC-5: A4 preset label includes dimensions
test('A4 preset label shows dimensions', async ({ page }) => {
  await page.goto('/')
  const a4Option = page.locator('#paper-size-select option[value="a4"]')
  await expect(a4Option).toHaveText('A4 (21×29.7)')
})

// AC-5: A5 preset label includes dimensions
test('A5 preset label shows dimensions', async ({ page }) => {
  await page.goto('/')
  const a5Option = page.locator('#paper-size-select option[value="a5"]')
  await expect(a5Option).toHaveText('A5 (14.8×21)')
})

// AC-3: landscape image against portrait paper triggers rotated badge and swapped dims
test('Fit mode shows ↺ badge when paper is rotated (landscape image, portrait paper)', async ({ page }) => {
  // Default paper is 18×26 (portrait). Landscape image (wider than tall) triggers Option B.
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(LANDSCAPE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')

  await page.getByRole('button', { name: 'Fit mode' }).click()

  const badge = page.locator('.app__fit-rotated-badge')
  await expect(badge).toBeVisible()
  await expect(page.locator('.app__paper-dims')).toHaveText('26 × 18 cm')
})

// Fix 3 / NFR accessibility: ↺ badge has aria-label="paper rotated"
test('↺ badge has aria-label="paper rotated" when visible', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(LANDSCAPE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')

  await page.getByRole('button', { name: 'Fit mode' }).click()

  const badge = page.locator('.app__fit-rotated-badge')
  await expect(badge).toHaveAttribute('aria-label', 'paper rotated')
})

// AC-6: swap button is disabled while Fit mode is active
test('orientation swap button is disabled in Fit mode', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(LANDSCAPE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')

  await page.getByRole('button', { name: 'Fit mode' }).click()

  await expect(page.getByRole('button', { name: 'Swap orientation' })).toBeDisabled()
})

// AC-6: swap button carries the tooltip text in Fit mode
test('orientation swap button has title tooltip in Fit mode', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(LANDSCAPE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')

  await page.getByRole('button', { name: 'Fit mode' }).click()

  await expect(page.getByRole('button', { name: 'Swap orientation' })).toHaveAttribute(
    'title',
    'Orientation is set automatically in Fit mode'
  )
})

// AC-6: swap button is re-enabled when returning to Stretch mode
test('orientation swap button is re-enabled after switching back to Stretch mode', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(LANDSCAPE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')

  await page.getByRole('button', { name: 'Fit mode' }).click()
  await page.getByRole('button', { name: 'Fit mode' }).click()

  await expect(page.getByRole('button', { name: 'Swap orientation' })).toBeEnabled()
})
