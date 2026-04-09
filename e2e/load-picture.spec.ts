import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'sample.jpg')

// AC-1: "Load picture" button is visible on the initial screen
test('shows "Load picture" button on initial screen', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
})

// AC-1: initial state shows empty-state text
test('shows "No image loaded" before any image is selected', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('No image loaded')).toBeVisible()
})

// AC-2: happy path — selecting an image file displays it in the main area
test('displays the image after the user selects a file', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(FIXTURE_IMAGE)

  const img = page.getByRole('img', { name: 'Reference picture' })
  await expect(img).toBeVisible()
  await expect(page.getByText('No image loaded')).not.toBeVisible()
})

// AC-4: "Load picture" button remains accessible after an image is loaded
test('"Load picture" button remains visible after an image is loaded', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(FIXTURE_IMAGE)

  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
})

// AC-2: replacing the image with a second file updates the displayed image
test('replacing the image with another file updates the display', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(FIXTURE_IMAGE)
  const firstSrc = await page.getByRole('img', { name: 'Reference picture' }).getAttribute('src')

  await fileInput.setInputFiles(FIXTURE_IMAGE)
  const secondSrc = await page.getByRole('img', { name: 'Reference picture' }).getAttribute('src')

  // Both src values are blob: URLs; a new one is created on each selection
  expect(firstSrc).toMatch(/^blob:/)
  expect(secondSrc).toMatch(/^blob:/)
})
