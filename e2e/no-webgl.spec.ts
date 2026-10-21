import { expect, test } from '@playwright/test'

test('without WebGL the poster shows and everything still works', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('main')).toHaveAttribute(
    'data-webgl',
    'unsupported',
  )
  await page.getByRole('button', { name: 'Enter (simple view)' }).click()
  await expect(page.getByTestId('scene')).toHaveCount(0)
  await page.getByTestId('hud').getByRole('link', { name: 'Resume' }).click()
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible()
})
