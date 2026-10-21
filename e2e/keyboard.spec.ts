import { expect, test } from '@playwright/test'

test('every section is reachable by keyboard alone', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: /Enter/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', {
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Open phone menu' }).focus()
  await page.keyboard.press('Enter')
  const first = page.getByRole('gridcell').first().locator('a')
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('dialog', { name: 'Work experience' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('dialog')).toContainText('Jitera')
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'open',
    {
      timeout: 15_000,
    },
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Open phone menu' }),
  ).toBeFocused()
})
