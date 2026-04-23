import { test, expect } from '@playwright/test'

// AC-2, AC-4: clicking the swap button exchanges width and height; clicking again restores them
test('swap button exchanges paper width and height and round-trips', async ({ page }) => {
  await page.goto('/')
  // Wait for the React app to render
  await page.waitForSelector('#paper-size-select', { state: 'attached' })

  const select = page.locator('#paper-size-select')

  // Verify initial dimensions (18 × 26 cm default preset)
  await expect(select).toHaveAttribute('data-paper-width', '18')
  await expect(select).toHaveAttribute('data-paper-height', '26')

  // Click swap — dimensions should be exchanged
  await page.getByRole('button', { name: 'Swap orientation' }).click()

  await expect(select).toHaveAttribute('data-paper-width', '26')
  await expect(select).toHaveAttribute('data-paper-height', '18')

  // Click swap again — should restore original values
  await page.getByRole('button', { name: 'Swap orientation' }).click()

  await expect(select).toHaveAttribute('data-paper-width', '18')
  await expect(select).toHaveAttribute('data-paper-height', '26')
})
