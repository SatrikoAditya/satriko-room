import { expect, test } from '@playwright/test'

const sections: [string, string, RegExp][] = [
  ['about', 'About me', /Hi, I'm Satriko!/],
  ['experience', 'Work experience', /Agile Collaboration/],
  ['projects', 'Projects', /Satriko's Room/],
  ['skills', 'Skills', /Languages & Runtimes/],
  ['education', 'Education', /Honors Graduate/],
  ['gaming', 'Gaming', /Oyen is still choosing/],
  ['travel', 'Travel', /Oyen is still pinning/],
  ['hiking', 'Hiking', /trail photos/],
  ['diving', 'Diving', /dive photos/],
  ['remote-work', 'Remote work', /Overlap: 12:00–17:00 WIB/],
  ['contact', 'Contact', /satrikoaditya@gmail.com/],
  ['resume', 'Resume', /Download PDF/],
]

for (const [slug, title, text] of sections) {
  test(`/${slug} serves its panel text in the HTML and shows the dialog`, async ({
    page,
    request,
  }) => {
    // The panel text must be in the server HTML (SEO, screen readers, text before 3D).
    const html = await (await request.get(`/${slug}`)).text()
    const decoded = html
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
    expect(decoded).toContain(title)
    expect(decoded).toMatch(text)
    expect(html).toMatch(/<title>[^<]*Satriko Aditya<\/title>/)
    await page.goto(`/${slug}`)
    await expect(page.getByRole('dialog', { name: title })).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText(text)
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready')
  })
}

test('unknown slugs return 404', async ({ request }) => {
  expect((await request.get('/nope')).status()).toBe(404)
})

test('the radio music loop is served as MP3', async ({ request }) => {
  const response = await request.get('/audio/music-cozy.mp3')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('audio/mpeg')
})
