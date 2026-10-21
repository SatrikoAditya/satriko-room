import { expect, test } from '@playwright/test'

test('every section is reachable by keyboard alone', async ({ page }) => {
  await page.goto('/')
  const enter = page.getByRole('button', { name: /Enter/ })
  const skip = page.getByRole('link', { name: /Skip to my resume/ })
  const focusBehindLoader = () =>
    page.evaluate(
      () =>
        !!document.activeElement?.closest(
          '[data-testid="hud"], nav[aria-label="Sections"]',
        ),
    )
  // The gate moves focus to Enter.
  await expect(enter).toBeFocused({ timeout: 15_000 })
  // Everything behind the loader is inert: Shift+Tab leaves the page instead
  // of landing on a hidden HUD or SectionNav control.
  await page.keyboard.press('Shift+Tab')
  expect(await focusBehindLoader()).toBe(false)
  await expect(enter).not.toBeFocused()
  // From there, Tab alone reaches Enter, then the skip link, and nothing else.
  await page.keyboard.press('Tab')
  await expect(enter).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await page.keyboard.press('Tab')
  expect(await focusBehindLoader()).toBe(false)
  await page.keyboard.press('Tab')
  await expect(enter).toBeFocused()
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
