import { expect, test } from '@playwright/test'

import { expectSettled } from './helpers'

test('mobile shows the bottom bar and a sheet-style panel', async ({
  page,
}) => {
  await page.goto('/contact')
  const dialog = page.getByRole('dialog', { name: 'Contact' })
  await expect(dialog).toBeVisible()
  await expectSettled(dialog)
  const vp = page.viewportSize()!
  // The sheet grows into place, so poll its geometry until it settles.
  await expect
    .poll(async () => (await dialog.boundingBox())!.width)
    .toBeGreaterThan(vp.width * 0.9)
  await expect
    .poll(async () => {
      const box = (await dialog.boundingBox())!
      return box.y + box.height
    })
    .toBeGreaterThan(vp.height - 4)
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(
    page.getByRole('button', { name: 'Open phone menu' }),
  ).toBeVisible()
})
