# Satriko's Room

A portfolio site presented as a cozy 3D room: visitors explore Satriko's desk, shelves and gadgets, and each object opens a part of his work and story.

Docs: see `docs/design/README.md` (design docs, synced with the code) and `docs/plans/` (implementation plan).

## Commands

Node 24 via `nvm use` (`.nvmrc`; `engines` requires Node >= 22.22) and yarn.

- `yarn dev` / `yarn build` / `yarn start`: develop, build, serve the production build
- `yarn test` / `yarn lint` / `yarn typecheck` / `yarn prettier`: unit tests, ESLint, types, formatting
- `yarn e2e`: Playwright suite (builds and starts the site itself; set `PLAYWRIGHT_BASE_URL` to test a deployment instead)
- `yarn e2e:ui`: the same suite in Playwright's UI mode
- `yarn poster`: re-capture `public/poster/*` (day, night, OG) from the running site (start it first with `yarn start`; `POSTER_BASE_URL` overrides the address)
- `yarn budgets`: check the asset and JS size budgets (run `yarn build` first)
- `yarn analyze`: bundle analysis with `next analyze`; `yarn analyze:export` exports its data
- `yarn map:build`: rebuild the Indonesia map data from `world-atlas`
- `yarn audio:convert`: convert CC0 `.ogg` sources in `public/audio` to the shipped MP3s

## Launch checklist (for Satriko)

The code is done. These items need Satriko before the production launch. Paths are relative to the repo root.

1. **Public CV PDF (blocking, checklist C5).** Export a public version of the CV to `public/resume/Satriko-Aditya-Resume.pdf` with **no phone number and no referees**. Until it exists, the Resume download and the error page's "Download resume" button return 404. Verify (must print `0`):
   `pdftotext public/resume/Satriko-Aditya-Resume.pdf - | grep -ciE "[+]62|referee"`
2. **Production domain (blocking, C18).** Set `url` in `src/constants/site.ts` (now the placeholder `https://example.com`) to the real domain, then rebuild. The sitemap, robots, canonical URLs, Open Graph URLs and JSON-LD all derive from it. Verify: `yarn build`, then `curl -s localhost:3000/sitemap.xml` (after `yarn start`) lists the new domain.
3. **Posters in daylight.** The current `public/poster/*` captures were taken at about 04:20 WIB, so the window shows the night sky in both the day and night posters. In Bogor daytime run `yarn build && yarn start`, then in another shell `yarn poster`, and check `room-day.webp` shows a day sky. Commit the three images.
4. **Real-device checks.** Lighthouse Performance under headless SwiftShader was 39 and is not representative. Test iPhone Safari and a mid-range Android: drag and pinch within limits, tags tappable, bottom bar, sheet swipe-to-close, at least 30 fps (or the automatic drop to the low tier). Also run Lighthouse on the production URL (Accessibility and SEO >= 95 on `/experience`).
5. **Optional: music track (C17).** Add a CC0 or properly licensed loop, at most about 1.5 MB, as `public/audio/music-cozy.mp3`, and add its row (source, license) to `CREDITS.md`. Without it the radio stays silent (it fails quietly). Verify: `ls -l public/audio/music-cozy.mp3` and click the radio in the room.
6. **Optional: hobby content (C10 to C13).** Games, Indonesia pins, hikes and dives go in `src/content/gaming.ts`, `travel.ts`, `hiking.ts` and `diving.ts`; photos go in `public/images/<section>/`. Empty ones show the "Oyen is still sorting these photos..." state. Verify: `yarn test && yarn build`, then open the panel.
7. **Optional decisions.** Wording for skills with no job link is the default `'Side projects & learning'` (`UNLINKED_SKILL_LABEL` in `src/content/skills.ts`); analytics is none (C19).
8. **Final check before deploying:** `yarn lint && yarn typecheck && yarn test && yarn build && yarn budgets && yarn e2e`. The content test (`src/content/content.test.ts`) fails if a phone number or referee name appears in the site content.

Then deploy (below).

## Deploy

Vercel, static output, no environment variables.

1. In Vercel choose **Add New > Project** and import this git repository. The framework preset **Next.js** is detected automatically; the build command is `yarn build`.
2. In the project settings set **Node.js Version** to **24** (matches `.nvmrc`; `package.json` `engines` says `>=22.22`).
3. `vercel.json` already sets `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` for `/audio`, `/poster` and `/images` (file names are not versioned, so no `immutable`).
4. Add the production domain in the Vercel project, put it in `site.url` (`src/constants/site.ts`), commit, and redeploy so the sitemap, canonical URLs and OG tags use it.
5. After the deploy, from this repo:
   - `PLAYWRIGHT_BASE_URL=https://<your-deployment> yarn e2e` runs the Playwright suite against the deployment (no local server is started). The visual check has a macOS-only baseline, so it can fail on first run elsewhere.
   - Share a link such as `/experience` in https://www.opengraph.xyz and confirm the title, description and image.
   - Run Lighthouse on the production URL.

## Credits

Fonts, the Indonesia outline and the sound effects are listed with their sources and licenses in `CREDITS.md`.
