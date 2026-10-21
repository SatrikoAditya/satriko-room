import { expect, test } from '@playwright/test'

test('the room renders (loose visual check)', async ({ page }) => {
  // Software WebGL is slow under parallel load; give the stable-screenshot loop room.
  test.setTimeout(60_000)
  await page.goto('/')
  await page.getByRole('button', { name: /Enter/ }).click()
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', {
    timeout: 15_000,
  })
  await page.waitForTimeout(1500)
  await expect(page.getByTestId('scene')).toHaveScreenshot('room-default.png', {
    maxDiffPixelRatio: 0.08,
    timeout: 30_000,
  })
})
