import { expect, test } from '@playwright/test'

// The window sometimes shows rain (Bogor, the City of Rain). The address can
// fix the weather for previews and steady screenshots.
for (const weather of ['rain', 'clear'] as const) {
  test(`?weather=${weather} shows ${weather} in the window`, async ({
    page,
  }) => {
    await page.goto(`/?weather=${weather}`)
    await expect(page.locator('main')).toHaveAttribute('data-weather', weather)
  })
}
