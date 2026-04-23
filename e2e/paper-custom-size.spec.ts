import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'sample.jpg')

async function loadImage(page: Page) {
  await page.goto('/')
  // Wait for the React app to render, then make the hidden file input interactable
  await page.waitForSelector('input[type="file"]', { state: 'attached' })
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01'
  })
  await page.locator('input[type="file"]').setInputFiles(FIXTURE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')
}

// Critical user flow: select Custom…, enter dimensions, place a point, assert
// coordinates reflect the custom paper size (not the default 18×26 preset)
test('custom paper size coordinates differ from the default 18×26 preset', async ({ page }) => {
  await loadImage(page)

  // Place a point with the default 18×26 preset
  const overlay = page.locator('.app__point-overlay')
  await overlay.click()
  await expect(page.locator('.app__point-label').first()).toBeVisible()
  const defaultLabel = await page.locator('.app__point-label').first().textContent()

  // Switch to Custom… and enter 24 × 22 cm
  await page.selectOption('#paper-size-select', 'custom')
  await page.locator('#custom-width-input').fill('24')
  await page.locator('#custom-height-input').fill('22')

  // Coordinates must update to reflect the new dimensions
  const customLabel = await page.locator('.app__point-label').first().textContent()
  expect(customLabel).not.toBe(defaultLabel)
})
