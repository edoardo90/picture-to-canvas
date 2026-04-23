import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LANDSCAPE = path.join(__dirname, 'fixtures', 'landscape.bmp') // 4×2 px
const PORTRAIT  = path.join(__dirname, 'fixtures', 'portrait.bmp')  // 2×4 px

async function loadImage(page: Page, fixturePath: string) {
  await page.goto('/')
  await page.locator('input[type="file"]').setInputFiles(fixturePath)
  await page.waitForSelector('img[alt="Reference picture"]')
}

// AC-2 + AC-4: swap changes point coordinates; swapping back restores them
test('swapping orientation changes point coordinates and round-trips', async ({ page }) => {
  // A landscape photo with a portrait paper preset is a realistic scenario
  await loadImage(page, LANDSCAPE)
  await page.selectOption('#paper-size-select', 'a4') // A4: 21 × 29.7 cm (portrait)

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()

  const label = page.locator('.app__point-label').first()
  await expect(label).toBeVisible()
  const before = await label.textContent()

  // Swap → A4 becomes 29.7 × 21 cm — coordinates must change
  await page.getByRole('button', { name: 'Swap orientation' }).click()
  const after = await label.textContent()
  expect(after).not.toBe(before)

  // Swap back → coordinates must return to original values
  await page.getByRole('button', { name: 'Swap orientation' }).click()
  await expect(label).toHaveText(before!)
})

// AC-3: swap also works when a portrait photo is loaded
test('swap works with a portrait image', async ({ page }) => {
  await loadImage(page, PORTRAIT)
  await page.selectOption('#paper-size-select', 'a4')

  const overlay = page.locator('.app__point-overlay')
  await overlay.click()

  const label = page.locator('.app__point-label').first()
  await expect(label).toBeVisible()
  const before = await label.textContent()

  await page.getByRole('button', { name: 'Swap orientation' }).click()
  const after = await label.textContent()
  expect(after).not.toBe(before)
})
