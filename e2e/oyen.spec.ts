import { expect, test, type Page } from '@playwright/test'

// Oyen starts wandering after 6 s without a click, tap or key press, once the
// greeting bubble has gone. Skipping the first-visit hints keeps the wait short.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('room:interacted', 'true')
    } catch {}
  })
})

async function enterRoom(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Enter/ }).click()
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', {
    timeout: 15_000,
  })
  // The greeting bubble opens under the Enter button and stays while hovered,
  // so move the mouse away as a visitor would (moving is not activity).
  await page.mouse.move(5, 450)
}

test('Oyen wanders when the room is quiet and stops on a key press', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'reduced-motion',
    'Oyen never walks with reduced motion',
  )
  test.setTimeout(60_000)
  await enterRoom(page)
  const main = page.locator('main')
  await expect(main).toHaveAttribute('data-oyen', 'walking', {
    timeout: 30_000,
  })
  await page.keyboard.press('Shift')
  await expect(main).toHaveAttribute('data-oyen', 'sitting', { timeout: 3_000 })
})

test('Oyen stays seated with reduced motion', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'reduced-motion',
    'Only meaningful with reduced motion',
  )
  test.setTimeout(45_000)
  await enterRoom(page)
  // Nothing should happen, so wait past the greeting and the 6 s quiet time.
  await page.waitForTimeout(14_000)
  await expect(page.locator('main')).toHaveAttribute('data-oyen', 'sitting')
})

test('Oyen stays asleep at night', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only')
  test.setTimeout(45_000)
  await page.addInitScript(() => {
    try {
      localStorage.setItem('theme', 'dark')
    } catch {}
  })
  await enterRoom(page)
  await page.waitForTimeout(14_000)
  await expect(page.locator('main')).toHaveAttribute('data-oyen', 'sitting')
})

test('a dark-mode device still starts in the day room with Oyen awake', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only')
  test.setTimeout(60_000)
  // No saved theme: the device's dark mode is ignored on a first visit.
  await page.emulateMedia({ colorScheme: 'dark' })
  await enterRoom(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await expect(page.locator('main')).toHaveAttribute('data-oyen', 'walking', {
    timeout: 30_000,
  })
})
