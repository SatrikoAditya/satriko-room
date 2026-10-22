import { expect, test, type Page } from '@playwright/test'

// A spot on the floor at the front-left, clear of the greeting bubble and the HUD.
const FLOOR = { x: 360, y: 640 }

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
  await expect(page.locator('[data-testid="scene"] canvas')).toBeVisible()
}

test('scroll zooms in, a drag slides without opening anything, reset returns', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop wheel and mouse')
  test.setTimeout(60_000)
  await enterRoom(page)
  const main = page.locator('main')
  await expect(main).toHaveAttribute('data-zoomed', 'false')
  await expect(page.getByRole('button', { name: 'Reset view' })).toHaveCount(0)

  await page.mouse.move(FLOOR.x, FLOOR.y)
  await page.mouse.wheel(0, -500)
  await expect(main).toHaveAttribute('data-zoomed', 'true')
  const reset = page.getByRole('button', { name: 'Reset view' })
  await expect(reset).toBeVisible()

  await page.mouse.down()
  await page.mouse.move(FLOOR.x + 250, FLOOR.y - 40, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(300)
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await reset.click()
  await expect(main).toHaveAttribute('data-zoomed', 'false')
  await expect(reset).toHaveCount(0)
})

test('a panel opened while zoomed in returns to the zoomed view', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop wheel and mouse')
  test.setTimeout(60_000)
  await enterRoom(page)
  const main = page.locator('main')
  await page.mouse.move(FLOOR.x, FLOOR.y)
  await page.mouse.wheel(0, -500)
  await expect(main).toHaveAttribute('data-zoomed', 'true')

  await page.getByRole('button', { name: 'Open phone menu' }).click()
  await page.getByRole('link', { name: 'Skills' }).click()
  await expect(page.getByRole('dialog', { name: 'Skills' })).toBeVisible()
  // The panel can flash before the camera's focus glide; wait until it's really open.
  await expect(main).toHaveAttribute('data-transition', 'open', {
    timeout: 15_000,
  })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(main).toHaveAttribute('data-transition', 'idle', {
    timeout: 15_000,
  })
  await expect(main).toHaveAttribute('data-zoomed', 'true')
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
})

test('a two-finger pinch zooms in on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phones only')
  await enterRoom(page)
  const canvas = page.locator('[data-testid="scene"] canvas')
  const fire = (type: string, id: number, x: number, y: number) =>
    canvas.dispatchEvent(type, {
      pointerId: id,
      pointerType: 'touch',
      isPrimary: id === 1,
      clientX: x,
      clientY: y,
      bubbles: true,
    })
  await fire('pointerdown', 1, 180, 420)
  await fire('pointerdown', 2, 230, 420)
  for (let i = 1; i <= 10; i++) {
    await fire('pointermove', 2, 230 + i * 6, 420)
    await fire('pointermove', 1, 180 - i * 6, 420)
  }
  await fire('pointerup', 1, 120, 420)
  await fire('pointerup', 2, 290, 420)
  await expect(page.locator('main')).toHaveAttribute('data-zoomed', 'true')
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
})
