import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'sample.jpg')

test('loads image via file picker', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input.app__file-input')
  await fileInput.setInputFiles(FIXTURE_IMAGE)
  await page.waitForSelector('img[alt="Reference picture"]')
  await expect(page.locator('img[alt="Reference picture"]')).toBeVisible()
})

test('loads image via drag and drop', async ({ page }) => {
  await page.goto('/')
  const b64 = fs.readFileSync(FIXTURE_IMAGE).toString('base64')
  await page.evaluate(async ({ b64 }) => {
    const bin = atob(b64)
    const len = bin.length
    const u8 = new Uint8Array(len)
    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i)
    const file = new File([u8], 'sample.jpg', { type: 'image/jpeg' })
    const dt = new DataTransfer()
    dt.items.add(file)
    const el = document.querySelector('.upload-empty-state') || document.querySelector('.app__display-area')
    el?.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }))
  }, { b64 })
  await page.waitForSelector('img[alt="Reference picture"]')
  await expect(page.locator('img[alt="Reference picture"]')).toBeVisible()
})

test('rejects unsupported file type', async ({ page }) => {
  await page.goto('/')
  // Use UploadEmptyState's own input so validation error message is shown
  const fileInput = page.locator('.upload-empty-state input[type="file"]')
  await fileInput.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
  await expect(page.locator('img[alt="Reference picture"]')).toHaveCount(0)
  await expect(page.locator('text=Unsupported file type')).toHaveCount(1)
})

test('rejects oversized file', async ({ page }) => {
  await page.goto('/')
  // Use UploadEmptyState's own input so validation error message is shown
  const fileInput = page.locator('.upload-empty-state input[type="file"]')
  const big = Buffer.alloc(11 * 1024 * 1024)
  await fileInput.setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: big })
  await expect(page.locator('img[alt="Reference picture"]')).toHaveCount(0)
  await expect(page.locator('text=Maximum size: 10 MB')).toHaveCount(1)
})
