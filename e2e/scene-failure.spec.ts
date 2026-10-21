import { expect, test, type Page } from '@playwright/test'

// Simulates a failed download of the lazy 3D chunk (flaky network, CDN error).
async function failSceneChunk(page: Page) {
  const aborted: string[] = []
  await page.route('**/_next/static/chunks/**/*.js', async (route) => {
    const response = await route.fetch()
    if ((await response.text()).includes('WebGLRenderer')) {
      aborted.push(route.request().url())
      return route.abort()
    }
    return route.fulfill({ response })
  })
  return aborted
}

test('a direct link keeps its panel when the 3D chunk fails to load', async ({
  page,
}) => {
  const aborted = await failSceneChunk(page)
  await page.goto('/experience')
  await expect(page.locator('main')).toHaveAttribute('data-webgl', 'lost', {
    timeout: 15_000,
  })
  expect(aborted.length).toBeGreaterThan(0)
  await expect(
    page.getByRole('dialog', { name: 'Work experience' }),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Jitera')
  await expect(page.getByText('Something knocked the mug over.')).toHaveCount(0)
  await expect(page.getByTestId('scene')).toHaveCount(0)
})

test('the room falls back to the simple view when the 3D chunk fails to load', async ({
  page,
}) => {
  const aborted = await failSceneChunk(page)
  await page.goto('/')
  await expect(page.locator('main')).toHaveAttribute('data-webgl', 'lost', {
    timeout: 15_000,
  })
  expect(aborted.length).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Enter (simple view)' }).click()
  await expect(page.getByText('Something knocked the mug over.')).toHaveCount(0)
  await page.getByTestId('hud').getByRole('link', { name: 'Resume' }).click()
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible()
})
