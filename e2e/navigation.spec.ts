import { expect, test } from '@playwright/test'

// Software WebGL under parallel load can starve frames for seconds (the scene
// drops to the low tier), so closing gets the same 15 s as opening, and each
// test the 60 s that visual.spec.ts uses. The assertions are unchanged.
const SLOW = { timeout: 15_000 }
test.describe.configure({ timeout: 60_000 })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Enter/ }).click()
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', {
    timeout: 15_000,
  })
})

test('phone menu opens a section, back closes it with the room URL restored', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open phone menu' }).click()
  await page
    .getByRole('grid', { name: 'Sections' })
    .getByRole('link', { name: 'Skills' })
    .click()
  await expect(page.getByRole('dialog', { name: 'Skills' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page).toHaveURL(/\/skills$/)
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'open',
    {
      timeout: 15_000,
    },
  )
  await page.goBack()
  await expect(page.getByRole('dialog')).toHaveCount(0, SLOW)
  await expect(page).toHaveURL(/\/$/, SLOW)
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'idle',
    SLOW,
  )
})

test('opening a panel adds one history entry so one Back returns to the room', async ({
  page,
}) => {
  await page.getByTestId('hud').getByRole('link', { name: 'Resume' }).click()
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page).toHaveURL(/\/resume$/)
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'open',
    {
      timeout: 15_000,
    },
  )
  await page.goBack()
  await expect(page).toHaveURL(/\/$/, SLOW)
  await expect(page.getByRole('dialog')).toHaveCount(0, SLOW)
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'idle',
    SLOW,
  )
})

test('Escape and the close button close the panel', async ({ page }) => {
  const contact = page.getByTestId('hud').getByRole('link', { name: 'Contact' })
  await contact.click()
  await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'open',
    {
      timeout: 15_000,
    },
  )
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/$/, SLOW)
  await expect(page.getByRole('dialog')).toHaveCount(0, SLOW)
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'idle',
    SLOW,
  )
  await contact.click()
  await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator('main')).toHaveAttribute(
    'data-transition',
    'open',
    {
      timeout: 15_000,
    },
  )
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0, SLOW)
})

test('clicking the PC in the scene opens Experience', async ({ page }) => {
  await expect(page.locator('[data-testid="scene"] canvas')).toBeVisible()
  const box = await page.getByTestId('scene').boundingBox()
  const x = box!.x + box!.width * 0.6375
  const y = box!.y + box!.height * 0.4644
  // With reduced motion the phase is ready before the scene has settled, so
  // keep nudging the pointer until the hover tag proves the raycast hit the PC.
  await expect(async () => {
    await page.mouse.move(x - 2, y)
    await page.mouse.move(x, y)
    await expect(page.getByText('Work experience').first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 20_000 })
  await page.mouse.click(x, y)
  await expect(
    page.getByRole('dialog', { name: 'Work experience' }),
  ).toBeVisible({ timeout: 15_000 })
})
