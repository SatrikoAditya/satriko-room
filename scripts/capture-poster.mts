import { chromium } from '@playwright/test'
import sharp from 'sharp'

const base = process.env.POSTER_BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
})
for (const theme of ['day', 'night'] as const) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  })
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t === 'night' ? 'dark' : 'light')
  }, theme)
  await page.goto(`${base}/?poster=1`)
  await page.waitForSelector('main[data-phase="ready"]', { timeout: 60_000 })
  await page.waitForSelector('main[data-webgl="supported"]', {
    timeout: 60_000,
  })
  await page.waitForTimeout(3000)
  const png = await page.locator('[data-testid="scene"]').screenshot()
  await sharp(png)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/poster/room-${theme}.webp`)
  if (theme === 'day')
    await sharp(png)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .png()
      .toFile('public/poster/og.png')
  await page.close()
}
await browser.close()
console.log('posters written')
