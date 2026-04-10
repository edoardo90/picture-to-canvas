import { test, expect } from '@playwright/test'

// AC-2: clicking Style button opens the panel
test('Style panel opens when Style button is clicked', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('dialog', { name: 'Point style' })).not.toBeAttached()

  await page.getByRole('button', { name: 'Points Style' }).click()

  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()
})

// AC-2: Style button has aria-expanded reflecting open state
test('Style button reflects open state via aria-expanded', async ({ page }) => {
  await page.goto('/')

  const button = page.getByRole('button', { name: 'Points Style' })
  await expect(button).toHaveAttribute('aria-expanded', 'false')

  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
})

// AC-2: re-clicking the Style button closes the panel
test('Style panel closes when Style button is clicked again', async ({ page }) => {
  await page.goto('/')

  const button = page.getByRole('button', { name: 'Points Style' })
  await button.click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  await button.click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).not.toBeAttached()
})

// AC-3: pressing Esc closes the panel
test('Style panel closes on Escape', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Points Style' }).click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog', { name: 'Point style' })).not.toBeAttached()
})

// AC-3: clicking outside (on the canvas area) closes the panel
test('Style panel closes on outside click', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Points Style' }).click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  // Click well below the floating panel in the display area
  await page.mouse.click(400, 400)

  await expect(page.getByRole('dialog', { name: 'Point style' })).not.toBeAttached()
})

// AC-4: panel contains all eight controls in a grid
test('Style panel contains all eight style controls', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Points Style' }).click()

  const panel = page.getByRole('dialog', { name: 'Point style' })
  await expect(panel.locator('#style-point-colour')).toBeAttached()
  await expect(panel.locator('#style-point-radius')).toBeAttached()
  await expect(panel.locator('#style-point-opacity')).toBeAttached()
  await expect(panel.locator('#style-label-font-size')).toBeAttached()
  await expect(panel.locator('#style-label-opacity')).toBeAttached()
  await expect(panel.locator('#style-label-offset-dx')).toBeAttached()
  await expect(panel.locator('#style-label-offset-dy')).toBeAttached()
  await expect(panel.locator('#style-label-coord-gap')).toBeAttached()
})

// AC-5: focus returns to Style button after Esc closes the panel
test('focus returns to Style button after closing with Esc', async ({ page }) => {
  await page.goto('/')

  const button = page.getByRole('button', { name: 'Points Style' })
  await button.click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(button).toBeFocused()
})

// AC-5: Tab key wraps focus inside the panel (focus trap)
test('Tab key wraps focus inside the panel', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Points Style' }).click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  const panel = page.locator('#style-panel')

  // Tab through all 8 focusable inputs — none should escape the panel
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    const isInsidePanel = await page.evaluate(() => {
      const el = document.getElementById('style-panel')
      return el != null && el.contains(document.activeElement)
    })
    expect(isInsidePanel).toBe(true)
  }

  // After 8 Tabs from the first element, focus should have wrapped back to it
  await expect(panel.locator('#style-point-colour')).toBeFocused()
})

// AC-3/OQ-1: Esc closes panel even when an input inside the panel is focused
test('Esc closes panel when an input inside the panel is focused', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Points Style' }).click()
  await expect(page.getByRole('dialog', { name: 'Point style' })).toBeVisible()

  await page.locator('#style-point-radius').focus()
  await expect(page.locator('#style-point-radius')).toBeFocused()

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog', { name: 'Point style' })).not.toBeAttached()
})

// AC-1: the toolbar contains exactly Load, Paper size, Style, Hide — no loose style inputs
test('toolbar contains exactly the four expected controls', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
  await expect(page.locator('#paper-size-select')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Points Style' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Hide toolbar' })).toBeVisible()

  // Style controls must NOT be visible outside the panel
  await expect(page.locator('#style-point-radius')).not.toBeAttached()
})

// Layout: style panel controls flow horizontally (not stacked in a single column)
test('style panel controls are laid out horizontally', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Points Style' }).click()

  const fields = page.locator('.app__style-field')
  const first = await fields.nth(0).boundingBox()
  const second = await fields.nth(1).boundingBox()

  if (!first || !second) throw new Error('style field elements not found')

  const cy = (box: { y: number; height: number }) => box.y + box.height / 2

  // First two fields share the same horizontal row (Y-centres within 5 px)
  expect(Math.abs(cy(first) - cy(second))).toBeLessThan(5)
  // Second field is to the right of the first
  expect(second.x).toBeGreaterThan(first.x)
})

// Visual: style panel background is semi-transparent (80% opacity)
test('style panel has a semi-transparent background', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Points Style' }).click()

  const bg = await page.locator('#style-panel').evaluate(
    el => window.getComputedStyle(el).backgroundColor
  )
  expect(bg).toBe('rgba(34, 34, 34, 0.8)')
})
