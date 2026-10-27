# Maintaining the site

Notes for updating and deploying Satriko's Room. Paths are relative to the repo root. The launch checklist that used to live in the README is folded in here (decision #70).

## Before every deploy

Run the full gate:

```sh
yarn lint && yarn typecheck && yarn test && yarn build && yarn budgets && yarn e2e
```

`src/content/content.test.ts` fails if a phone number or referee name appears in `src/content/` or `src/constants/site.ts`. It does not check the PDF (see below).

## Content

- **Resume PDF:** `public/resume/Satriko-Aditya-Resume.pdf`, without the referee page. The phone number is allowed in it (decision #51). After replacing it, open it and check that no referee page came back.
- **Work, about, skills, education:** `src/content/experience.ts`, `about.ts`, `skills.ts`, `education.ts`. Tool names in each job must match the skill names in `skills.ts`; the Skills panel's "Used at" is computed from them.
- **Projects:** `src/content/projects.ts`; screenshots in `public/images/projects/`.
- **Travel, hikes, dives:** `src/content/travel.ts`, `hiking.ts`, `diving.ts`; photos in `public/images/<section>/`, with EXIF/GPS stripped. An empty section shows the "Oyen is still sorting these photos..." state.
- **Games:** `yarn games:sync` refreshes the Gaming panel. Put `PSN_NPSSO=...` (copied from `https://ca.account.sony.com/api/v1/ssocookie` after signing in at playstation.com) in `.env.local`, run it, then commit `src/content/gaming.snapshot.json` and `public/images/gaming/`. The NPSSO lasts about 60 days and never goes to Vercel ([05](design/05-content.md#gaming-gaming-tv), decision #52).
- **Music:** the radio plays a 90 s loop of "Lofi Restaurant" by alex-morgan on Pixabay. To swap it, run `yarn music:loop <licensed-track.mp3> [startSeconds] [durationSeconds]`, then update its row in `CREDITS.md` and the Help credits in `src/content/help.ts`. `yarn budgets` keeps the loop at most 1.5 MB.
- **Posters** (`public/poster/`: day, night and the Open Graph image): after a layout change, run `yarn build && yarn start`, then `yarn poster` in another shell during Bogor daytime (the day poster uses the real sky). `POSTER_BASE_URL` overrides the address.

## Deploy (Vercel)

Static output, no environment variables. Pushing to `main` deploys.

- **Project settings:** framework preset Next.js, build command `yarn build`, Node.js Version 24 (matches `.nvmrc`).
- **Domain:** `https://satriko-room.vercel.app` is `site.url` in `src/constants/site.ts` (decision #68). The sitemap, robots, canonical URLs, Open Graph URLs and JSON-LD all derive from it. For a custom domain, add it in Vercel, change `site.url`, and redeploy.
- **Caching:** `vercel.json` sets `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` for `/audio`, `/poster` and `/images` (file names are not versioned, so no `immutable`).
- **After a deploy:**
  - `PLAYWRIGHT_BASE_URL=https://satriko-room.vercel.app yarn e2e` runs the Playwright suite against the live site. The visual check has a macOS-only baseline.
  - Paste a link such as `/experience` into <https://www.opengraph.xyz> and check the title, description and image.
  - Run Lighthouse on the live URL (Accessibility and SEO at least 95 on `/experience`).

## Still open

- **Real-device checks:** iPhone Safari and a mid-range Android. Check that drag and pinch stay within limits, tags are tappable, the bottom bar and sheet swipe-to-close work, and the room runs at 30 fps or more (or drops to the low tier automatically). Lighthouse Performance under headless SwiftShader (39) is not representative.
- **Optional decisions:** the label for skills no job lists is `'Side projects & learning'` (`UNLINKED_SKILL_LABEL` in `src/content/skills.ts`); analytics is none (C19).

## Other commands

| Command | What it does |
| --- | --- |
| `yarn e2e:ui` | The Playwright suite in UI mode |
| `yarn prettier` | Format the code (it writes files) |
| `yarn analyze` / `yarn analyze:export` | Bundle analysis with `next analyze` |
| `yarn map:build` | Rebuild the Indonesia map data from `world-atlas` |
| `yarn audio:convert` | Convert the CC0 `.ogg` sources in `public/audio` to the shipped MP3s |
| `yarn rain:loop` | Rebuild the rain ambience loop |
