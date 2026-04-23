# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: toolbar-toggle.spec.ts >> clicking the hide button collapses the toolbar
- Location: e2e/toolbar-toggle.spec.ts:4:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Load picture' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Load picture' })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | // AC-5: toggle button visible when toolbar is open, hides toolbar when clicked
  4   | test('clicking the hide button collapses the toolbar', async ({ page }) => {
  5   |   await page.goto('/')
  6   | 
> 7   |   await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  8   | 
  9   |   await page.getByRole('button', { name: 'Hide toolbar' }).click()
  10  | 
  11  |   await expect(page.getByRole('button', { name: 'Load picture' })).not.toBeVisible()
  12  | })
  13  | 
  14  | // AC-3: when toolbar is hidden, a FAB is shown so the user can reopen it
  15  | test('a floating button is visible when the toolbar is hidden', async ({ page }) => {
  16  |   await page.goto('/')
  17  | 
  18  |   await page.getByRole('button', { name: 'Hide toolbar' }).click()
  19  | 
  20  |   await expect(page.getByRole('button', { name: 'Show toolbar' })).toBeVisible()
  21  | })
  22  | 
  23  | // AC-4: clicking the FAB reopens the toolbar
  24  | test('clicking the floating button reopens the toolbar', async ({ page }) => {
  25  |   await page.goto('/')
  26  | 
  27  |   await page.getByRole('button', { name: 'Hide toolbar' }).click()
  28  |   await page.getByRole('button', { name: 'Show toolbar' }).click()
  29  | 
  30  |   await expect(page.getByRole('button', { name: 'Load picture' })).toBeVisible()
  31  |   await expect(page.getByRole('button', { name: 'Show toolbar' })).not.toBeVisible()
  32  | })
  33  | 
  34  | // AC-1 + keyboard: resize handle is present and has an accessible label
  35  | test('toolbar resize handle is present and labelled', async ({ page }) => {
  36  |   await page.goto('/')
  37  | 
  38  |   const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  39  |   await expect(handle).toBeAttached()
  40  | })
  41  | 
  42  | // AC-1 + AC-2: dragging the handle downward shrinks toolbar height (handle at bottom)
  43  | test('dragging the resize handle downward shrinks toolbar height', async ({ page }) => {
  44  |   await page.goto('/')
  45  | 
  46  |   const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  47  |   const handleBox = await handle.boundingBox()
  48  |   if (!handleBox) throw new Error('handle not found')
  49  | 
  50  |   const startX = handleBox.x + handleBox.width / 2
  51  |   const startY = handleBox.y + handleBox.height / 2
  52  | 
  53  |   // Get initial toolbar height
  54  |   const toolbar = page.locator('.app__toolbar')
  55  |   const initialBox = await toolbar.boundingBox()
  56  |   if (!initialBox) throw new Error('toolbar not found')
  57  | 
  58  |   // Drag handle downward by 10px (shrink — min-clamped)
  59  |   await page.mouse.move(startX, startY)
  60  |   await page.mouse.down()
  61  |   await page.mouse.move(startX, startY + 10)
  62  |   await page.mouse.up()
  63  | 
  64  |   const newBox = await toolbar.boundingBox()
  65  |   if (!newBox) throw new Error('toolbar not found after drag')
  66  | 
  67  |   // Height should decrease (clamped to MIN, but still ≤ initial)
  68  |   expect(newBox.height).toBeLessThanOrEqual(initialBox.height)
  69  | })
  70  | 
  71  | // AC-2: dragging the handle far upward collapses the toolbar on release
  72  | test('dragging the resize handle above minimum collapses the toolbar', async ({ page }) => {
  73  |   await page.goto('/')
  74  | 
  75  |   const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  76  |   const handleBox = await handle.boundingBox()
  77  |   if (!handleBox) throw new Error('handle not found')
  78  | 
  79  |   const startX = handleBox.x + handleBox.width / 2
  80  |   const startY = handleBox.y + handleBox.height / 2
  81  | 
  82  |   // Drag handle far upward to go below minimum height
  83  |   await page.mouse.move(startX, startY)
  84  |   await page.mouse.down()
  85  |   await page.mouse.move(startX, startY - 200)
  86  |   await page.mouse.up()
  87  | 
  88  |   await expect(page.getByRole('button', { name: 'Load picture' })).not.toBeVisible()
  89  |   await expect(page.getByRole('button', { name: 'Show toolbar' })).toBeVisible()
  90  | })
  91  | 
  92  | // AC-4: after collapsing via toggle, reopening restores the last explicit height
  93  | test('reopening the toolbar restores its previous height', async ({ page }) => {
  94  |   await page.goto('/')
  95  | 
  96  |   const handle = page.getByRole('separator', { name: 'Resize toolbar' })
  97  |   const handleBox = await handle.boundingBox()
  98  |   if (!handleBox) throw new Error('handle not found')
  99  | 
  100 |   const startX = handleBox.x + handleBox.width / 2
  101 |   const startY = handleBox.y + handleBox.height / 2
  102 | 
  103 |   // Shrink toolbar first (drag down a bit, then natural height is captured)
  104 |   await page.mouse.move(startX, startY)
  105 |   await page.mouse.down()
  106 |   await page.mouse.move(startX, startY + 5)
  107 |   await page.mouse.up()
```