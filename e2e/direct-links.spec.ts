import { expect, test } from '@playwright/test'

const sections: [string, string, RegExp][] = [
  ['about', 'About me', /Hi, I'm Satriko!/],
  ['experience', 'Work experience', /Agile Collaboration/],
  ['skills', 'Skills', /Languages & Runtimes/],
  ['education', 'Education', /Honors Graduate/],
  ['gaming', 'Gaming', /Oyen is still choosing/],
  ['travel', 'Travel', /Oyen is still pinning/],
  ['hiking', 'Hiking', /trail photos/],
  ['diving', 'Diving', /dive photos/],
  ['remote-work', 'Remote work', /Overlap|No shared/],
  ['contact', 'Contact', /satrikoaditya@gmail.com/],
  ['resume', 'Resume', /Download PDF/],
]

for (const [slug, title, text] of sections) {
  test(`/${slug} serves its panel text in the HTML and shows the dialog`, async ({
    page,
    request,
  }) => {
    // The panel itself is a client-side portal, so the server HTML carries the
    // section's own <title>, canonical URL and crawlable nav link instead.
    const html = await (await request.get(`/${slug}`)).text()
    expect(html).toMatch(/<title>[^<]*Satriko Aditya<\/title>/)
    expect(html).toMatch(new RegExp(`rel="canonical" href="[^"]*/${slug}"`))
    expect(html).toContain(`<a href="/${slug}">`)
    await page.goto(`/${slug}`)
    await expect(page.getByRole('dialog', { name: title })).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText(text)
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready')
  })
}

test('unknown slugs return 404', async ({ request }) => {
  expect((await request.get('/nope')).status()).toBe(404)
})
