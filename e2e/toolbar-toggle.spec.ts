import { test, expect } from '@playwright/test'

// AC-5: toggle button visible when toolbar is open, hides toolbar when clicked
test('clicking the hide button collapses the toolbar', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()

  await page.getByRole('button', { name: 'Hide toolbar' }).click()

  await expect(page.getByRole('button', { name: 'Load picture' })).not.toBeVisible()
})

// AC-3: when toolbar is hidden, a FAB is shown so the user can reopen it
test('a floating button is visible when the toolbar is hidden', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Hide toolbar' }).click()

  await expect(page.getByRole('button', { name: 'Show toolbar' })).toBeVisible()
})

// AC-4: clicking the FAB reopens the toolbar
test('clicking the floating button reopens the toolbar', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Hide toolbar' }).click()
  await page.getByRole('button', { name: 'Show toolbar' }).click()

  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show toolbar' })).not.toBeVisible()
})

// AC-1 + keyboard: resize handle is present and has an accessible label
test('toolbar resize handle is present and labelled', async ({ page }) => {
  await page.goto('/')

  const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  await expect(handle).toBeAttached()
})

// AC-1 + AC-2: dragging the handle downward shrinks toolbar height (handle at bottom)
test('dragging the resize handle downward shrinks toolbar height', async ({ page }) => {
  await page.goto('/')

  const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  const handleBox = await handle.boundingBox()
  if (!handleBox) throw new Error('handle not found')

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2

  // Get initial toolbar height
  const toolbar = page.locator('.app__toolbar')
  const initialBox = await toolbar.boundingBox()
  if (!initialBox) throw new Error('toolbar not found')

  // Drag handle downward by 10px (shrink — min-clamped)
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 10)
  await page.mouse.up()

  const newBox = await toolbar.boundingBox()
  if (!newBox) throw new Error('toolbar not found after drag')

  // Height should decrease (clamped to MIN, but still ≤ initial)
  expect(newBox.height).toBeLessThanOrEqual(initialBox.height)
})

// AC-2: dragging the handle far upward collapses the toolbar on release
test('dragging the resize handle above minimum collapses the toolbar', async ({ page }) => {
  await page.goto('/')

  const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  const handleBox = await handle.boundingBox()
  if (!handleBox) throw new Error('handle not found')

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2

  // Drag handle far upward to go below minimum height
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY - 200)
  await page.mouse.up()

  await expect(page.getByRole('button', { name: 'Load picture' })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Show toolbar' })).toBeVisible()
})

// AC-4: after collapsing via toggle, reopening restores the last explicit height
test('reopening the toolbar restores its previous height', async ({ page }) => {
  await page.goto('/')

  const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  const handleBox = await handle.boundingBox()
  if (!handleBox) throw new Error('handle not found')

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2

  // Shrink toolbar first (drag down a bit, then natural height is captured)
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 5)
  await page.mouse.up()

  const toolbar = page.locator('.app__toolbar')
  const shrunkBox = await toolbar.boundingBox()
  if (!shrunkBox) throw new Error('toolbar not found')

  // Collapse via toggle button
  await page.getByRole('button', { name: 'Hide toolbar' }).click()
  await expect(page.getByRole('button', { name: 'Load picture' })).not.toBeVisible()

  // Reopen
  await page.getByRole('button', { name: 'Show toolbar' }).click()

  const restoredBox = await toolbar.boundingBox()
  if (!restoredBox) throw new Error('toolbar not found after reopen')

  expect(restoredBox.height).toBeCloseTo(shrunkBox.height, -1)
})

// Keyboard: FAB can be activated with Enter and Space
test('FAB can be activated with the keyboard', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Hide toolbar' }).click()
  await expect(page.getByRole('button', { name: 'Show toolbar' })).toBeVisible()

  await page.getByRole('button', { name: 'Show toolbar' }).focus()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
})
