import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { expectSettled } from './helpers'

for (const path of [
  '/',
  '/experience',
  '/skills',
  '/contact',
  '/resume',
  '/travel',
]) {
  for (const theme of ['day', 'night']) {
    test(`axe: ${path} (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          localStorage.setItem('theme', t === 'night' ? 'dark' : 'light')
        } catch {}
      }, theme)
      await page.goto(path)
      if (path !== '/') {
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        await expectSettled(dialog)
      }
      const results = await new AxeBuilder({ page })
        .exclude('[data-testid="scene"]')
        .analyze()
      expect(
        results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        ),
      ).toEqual([])
    })
  }
}
