import { expect, type Locator } from '@playwright/test'

/**
 * Waits until a panel has finished its grow animation (its box stops moving).
 * Software WebGL can starve animation frames, so require several unchanged
 * samples in a row rather than a single repeat.
 */
export async function expectSettled(dialog: Locator) {
  let previous = ''
  let streak = 0
  await expect
    .poll(
      async () => {
        const current = JSON.stringify(await dialog.boundingBox())
        streak = current === previous ? streak + 1 : 0
        previous = current
        return streak
      },
      { intervals: [400], timeout: 20_000 },
    )
    .toBeGreaterThanOrEqual(3)
}
