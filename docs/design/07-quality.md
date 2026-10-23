# 07: Quality

## Error handling

| Failure | How it's detected | What happens | What the visitor sees |
| --- | --- | --- | --- |
| No WebGL support | Capability check before mounting the canvas (`src/utils/webgl.ts`) | `useSceneStore.webgl = 'unsupported'`; the canvas is never mounted | A static room poster; the phone menu, buttons and panels work normally. The loader button reads **Enter (simple view)** |
| WebGL context lost mid-visit | `webglcontextlost` event | `webgl = 'lost'`; the canvas is unmounted | The poster fades in; whatever panel was open stays open |
| 3D crash (render error) | Error boundary around `three/SceneCanvas` | Same as context lost | Poster; the site keeps working |
| One model fails to load | *Not applicable as built:* every object is code-built, so there are no model files to fail (an error boundary per object was never added). The single `SceneErrorBoundary` covers any render error | Same as "3D crash" | Poster |
| Slow 3D load on a direct link | `useProgress` | The panel shows at once; the room loads behind it | A "Room loading… 63%" corner pill |
| Audio fails to load or play (autoplay blocked, decode error) | Promise rejection from play/decode | Caught and ignored; the sound state stays as chosen | Silence, no error |
| `localStorage` unavailable (private mode, blocked) | try/catch in `src/utils/storage.ts` | Fall back to defaults in memory | Preferences aren't remembered next visit; everything else works |
| Unknown URL | `notFound()` in the catch-all route | `app/not-found.tsx` → `pages/Page404` | A cozy 404 with a "Back to the room" link |
| Unexpected runtime error | `app/error.tsx` → `pages/Page500` | Error boundary at the root | A friendly error page with a retry button and a link to the resume PDF |
| Empty hobby content | Content array is empty | The panel renders its themed empty state | "Oyen is still sorting these photos…" |
| Clipboard API unavailable (Copy email) | `navigator.clipboard` missing or rejects | Fall back to selecting the email text | "Press ⌘/Ctrl+C to copy" hint |

**Rule:** the 3D scene is an **enhancement**. Every piece of information must still be reachable if all 3D fails.

## Accessibility

**Target:** WCAG 2.2 AA.

### Requirements

- **Everything is reachable without the 3D scene and without a mouse:** the phone menu, the on-screen buttons and real `<a href>` links cover all 12 sections.
- **The canvas is decorative:** `aria-hidden="true"` on the canvas wrapper, plus a visually hidden `<h1>` ("Satriko's Room") and description ("An illustrated 3D room. Use the phone menu to explore sections.").
- **Skip navigation:** as built, the first focusable element is a visually hidden `SectionNav` (`<nav aria-label="Sections">`, a list of links to all 12 sections) that appears when it receives focus. While the loader gate is up on `/`, everything behind it is `inert`, so the loader's own controls are the only Tab stops: **Enter the room** (focused when the gate opens) and "Skip to my resume →".
- **Modals and the Help sheet:** built on the Radix Dialog (via shadcn/ui), so they have `role="dialog"`, `aria-modal`, `aria-labelledby`, a focus trap, **Esc** to close, and focus returned to what opened them.
- **Phone menu:** arrow-key grid navigation, Enter to open, Esc to close.
- **Visible focus:** a 3 px accent-color focus outline with an offset on every focusable element, in both themes.
- **Touch targets** ≥ 44×44 CSS px, including the enlarged 3D hit areas for small objects ([03](03-room-scene.md#interactions)).
- **Contrast:** every text/background pair meets AA (4.5:1 for body text, 3:1 for large text and UI). Checked for both day and night palettes ([04](04-ui-and-visual-design.md#palette)).
- **Oyen's speech bubble:** text is mirrored to an `aria-live="polite"` region right away.
- **Images:** meaningful images (Satriko's photo, hobby photos) have descriptive `alt` text; decorative SVGs have `alt=""` / `aria-hidden`.
- **Reduced motion:** honored everywhere ([04](04-ui-and-visual-design.md#reduced-motion)).
- **Text resizing:** text can scale to 200% inside panels without being cut off (panels scroll). The scrolling area is a focusable region named after the panel, so panels without links can still be scrolled by keyboard (axe `scrollable-region-focusable`).
- **Sound:** off by default, and never needed to understand content.
- **Language:** `<html lang="en">`.

### Keyboard map

| Key | Context | Action |
| --- | --- | --- |
| Tab / Shift+Tab | Anywhere | Section links → name tag → mute → day/night → help → Resume → phone → Contact (DOM order; the phone button sits between Resume and Contact) |
| Enter / Space | Focused button or tile | Activate |
| Arrow keys | Phone menu | Move through the app grid |
| Esc | Modal, Help sheet, phone menu | Close |
| Enter | Speech bubble focused | Finish the line / next line |

## SEO

- **Per-route metadata** from the registry: `title`, `description`, canonical URL, Open Graph and Twitter card tags ([copy in 05](05-content.md#seo-copy)).
- **OG / Twitter image:** the room poster cropped to 1200×630 (day version), `public/poster/og.png`, captured by `yarn poster`. All routes share it (no per-section crop). `twitter:card` is `summary_large_image`.
- **`sitemap.ts`** lists `/` and all 11 section URLs; **`robots.ts`** allows everything and points to the sitemap. Both, the canonical URLs, the OG URLs and the JSON-LD `url` derive from `site.url` in `src/constants/site.ts`.
- **Server-rendered panel text** on every section URL, so crawlers and no-JS visitors get real content.
- **JSON-LD `Person`** on `/`:
  - `name`: Satriko Aditya; `jobTitle`: Full Stack Software Engineer
  - `address`: Bogor, Indonesia
  - `email`; `sameAs`: LinkedIn and GitHub URLs (checklist C3/C4)
  - `worksFor`: Jitera
  - `alumniOf`: computed from the education content, completed programs only (Hacktiv8, SMK Negeri 3 Bogor; BINUS is excluded while it is "present")
- **The canonical domain** is set once the domain is decided (checklist C18). Until then `site.url` is the placeholder `https://example.com`, which must be replaced before the production launch.

## Performance budgets

| Metric | Budget / target | Notes |
| --- | --- | --- |
| 3D assets (GLB + textures), compressed | **≤ 2 MB** total | As built there are no 3D model files (everything is code-built), so this is 0 KB; `yarn budgets` still checks `public/models/*.glb` if any appear |
| Initial JS on a direct-link route (excluding the lazy 3D chunk) | ≤ 250 KB gzip | The 3D libraries live in the lazy `SceneCanvas` chunk. The Travel, Hiking and Diving panels load in their own chunks with `next/dynamic` (still server-rendered), which took the first load from 251 to 242 KB on 2026-10-23. 250 KB: the design asked for ~200 KB, but React/Next runtime alone measured ~216 KB (analyzer, 2026-10-22); motion LazyMotion slimming is a tracked follow-up |
| Lazy 3D chunk (three + R3F + drei) | ≤ about 350 KB gzip | Import only the drei helpers we use |
| LCP on direct-link pages | ≤ 2.5s on mid-range mobile / 4G | The LCP element is the server-rendered panel text or the poster |
| CLS | < 0.1 | Fixed-size HUD; the poster reserves the canvas space |
| Room interactive after Enter (mid-range phone, 4G) | ≤ about 4s | Assets preloaded while the loader shows |
| Frame rate | ≥ 50 fps desktop, ≥ 30 fps mid-range phone | Steps down a graphics tier automatically ([03](03-room-scene.md#performance-tiers)) |
| Audio | Music loaded on first play only, music loop ≤ 1.5 MB; each sound effect ≤ about 30 KB | Not part of the initial load; both limits are checked by `yarn budgets` |
| Game covers | `public/images/gaming/` ≤ 450 KB (six `.webp` covers of up to 512 px, about 40–70 KB each, sharp on 2× screens) | Saved by `yarn games:sync` (decision #52); checked by `yarn budgets` |
| Hobby photos | Each photo in `public/images/travel/`, `hiking/` or `diving/` ≤ 250 KB (1200 px `.webp`, quality 80, no metadata) | Prepared by Claude from the photos Satriko sends (decisions #53, #54, #56); checked by `yarn budgets` |
| Lighthouse | **Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95**; Performance ≥ 80 (mobile) on direct-link pages | The `/` route with 3D may score lower on Performance; that's accepted, since the loader is intentional. The Performance numbers under headless SwiftShader (below) are not representative; re-measure on production and on real devices |

### Measured (2026-10-22)

| Metric | Result |
| --- | --- |
| First Load JS gzip, `/experience` (excl. noModule polyfills) | **238 KB** (budget 250 KB: ok; 216 KB of it is Next/React runtime, no `three` in it) |
| Lazy scene chunk gzip (three + R3F + drei) | **268 KB** (budget ~350 KB: ok) |
| Lighthouse `/experience` (mobile preset, headless + SwiftShader) | Performance 39, Accessibility 100, Best Practices 100, SEO 100 (Performance 87 with WebGL off: LCP 4.0 s, TBT 10 ms) |
| Lighthouse `/` | Performance 34, Accessibility 100, Best Practices 100, SEO 100 |
| Idle fps / tier drop (software rendering, so a lower bound, not real hardware) | about 10 fps; tier fell to `low` 2.3 s after the room was ready, before any CPU throttle was applied |
| Assets | 3D models 0 KB, sound effects 15 KB, rain loop 75 KB (separate 150 KB ambience budget), posters 64 KB (all within budget) |

## Testing strategy

*Implementation note (as built):* Vitest runs with `yarn test`; Playwright specs live in `e2e/` and run with `yarn e2e`. `playwright.config.ts` starts `yarn build && yarn start` itself (`webServer`, reusing a server already on port 3000 when not in CI), uses 2 workers (software WebGL is CPU-bound and starves animation frames when more run in parallel), and launches Chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` so the scene renders without a GPU. Projects:

| Project | Config | Specs |
| --- | --- | --- |
| `desktop` | Desktop Chrome, 1440×900, SwiftShader | every spec except `mobile` and `no-webgl` |
| `mobile` | Pixel 7, SwiftShader | `mobile`, `direct-links`, `a11y`, `zoom` |
| `no-webgl` | Desktop Chrome with `--disable-3d-apis` | `no-webgl` |
| `reduced-motion` | Desktop Chrome with `reducedMotion: 'reduce'`, SwiftShader | `navigation`, `oyen` |

The axe suite (`a11y.spec.ts`) scans all 13 routes (`/` and the 12 sections) in both themes (26 scans per project, on desktop and mobile) and fails on serious or critical violations. The visual check (`visual.spec.ts`) compares the scene to a baseline screenshot with `maxDiffPixelRatio: 0.08`; the committed baseline is **darwin-only** (`room-default-desktop-darwin.png`), so on Linux CI it needs its own baseline first. Setting `PLAYWRIGHT_BASE_URL` points the suite at a deployment instead (see [Deployment](#deployment)).

| Level | Tool | What it covers |
| --- | --- | --- |
| **Unit** | Vitest (tests next to the code, e.g. `src/utils/time.test.ts`) | **Registry** (unique slugs and `objectId`s, every slug has a camera pose, SEO copy and a content file). **Time** (`time.ts`: Bogor / Singapore / Abu Dhabi conversion and overlap hours; `sky.ts`: phase boundaries; `weather.ts`: rain about a third of the time, `?weather=` parsing; `useWeather`: forced weather, checks, rain called by the umbrella; rain streaks stay inside the window; the rain sound stays silent when muted). **`skills.ts`**: the "used at" mapping matches the table in [05](05-content.md#skills-skills-bookshelf). **`history.ts`**: push / back / replace decisions. **`storage.ts`**: works when `localStorage` throws. **`freeView.ts`**: `panRange` / `clampPan` keep desktop's recentring at 1× and let a cropped phone view reach the whole room. **`games.ts`**: PSN playtime to hours, platform names, safe cover names, and the snapshot keeps only the listed fields. **Content privacy** (`content.test.ts`): no phone number or referee name in the content, and no PSN Online ID, account ID or token field in `gaming.snapshot.json`. Tests read the committed snapshot and never call PlayStation |
| **Component** | React Testing Library | **ModalHost / PanelFrame** (focus trap, Esc, focus returns, `aria-*`). **Each panel** renders its content and its empty state. **PhoneMenu** keyboard grid. **Hud**: the phone Settings menu opens and closes on Esc or a tap outside; the Labels switch shows only on touch screens and toggles `aria-pressed`; `useLabelStore` persists hiding the tags. **SpeechBubble** live region. **CopyEmailButton** fallback. **TravelPanel**: places newest first (the place list is the keyboard path; map pins are pointer-only, which keeps axe's `nested-interactive` rule clean) and selected on open, the postcard carousel (buttons, ← → keys, "Photo 2 of 3" announced) and the stamp tile without photos. **DivingPanel**: the dive stats, dives newest first and selected on open, the depth stamp and the note. **HikingPanel**: the mountains stats, latest climb first and selected on open, the trip line and the elevation stamp. **`diving.ts`** (utils): dive stats, the depth scale (≥ 20 m, rounded up to 5 m) and "about N m". **`hiking.ts`** (utils): mountain stats, peak heights with the floor, the trip line, and `mountainPath` (the outline runs base to base, the summit and vent land on the right points). **Content**: every mountain has a shape. **`travel.ts`** (utils): newest-first order (places without a year last) and close pins pushed apart within the 12 px cap |
| **End-to-end** | Playwright (`e2e/`) | **Direct links:** each of the 12 URLs shows its panel text in the server HTML and after hydration. **Back button** closes the panel and returns to `/`. **Panel switching** via the phone uses replace semantics. **Phone menu labels** stay on one line, centred under their icons, in the 320 px phone. **Keyboard only:** reach and open every section. **No WebGL** (launched with WebGL disabled): poster plus everything still reachable. **Mobile viewports** (e.g. iPhone 14, Pixel 7): bottom bar and sheet modal, swipe-to-close. **Reduced motion** emulation: no glides. **Zoom** (`zoom.spec.ts`): scroll zooms in and shows Reset view, a drag doesn't open a panel, reset returns to 1×, a panel opened while zoomed returns to the zoomed view, and a two-finger pinch zooms on a phone. **Weather** (`weather.spec.ts`): `?weather=rain` and `?weather=clear` set `<main data-weather>`; the visual check opens `/?weather=clear` so random rain can't change its screenshot. **Oyen** (`oyen.spec.ts`): wanders after 6 s of quiet and sits on a key press; stays seated with reduced motion and asleep at night |
| **Accessibility** | `@axe-core/playwright` | An axe scan on `/` and on every section with its modal open, in both themes: zero serious or critical violations |
| **Visual** | Playwright screenshots | Room default view (day/night), one focused pose, the modal frame. Loose thresholds, because WebGL output varies a little |
| **Manual QA** | Real devices | iPhone Safari, a mid-range Android on Chrome, desktop Chrome/Safari/Firefox, trackpad and mouse, keyboard only, VoiceOver smoke test, sound on/off, theme toggle, slow 4G throttling |

## Browser support

- The **latest 2 versions** of Chrome, Edge, Firefox and Safari (macOS and iOS).
- 3D needs **WebGL 2**. Browsers without it get the poster fallback automatically.

## Deployment

- **Vercel**, static output.
  - **Preview deployments** for every branch / PR.
  - **Production** from the main branch.
- **Caching:** hashed JS/CSS files are cached indefinitely by Next. The files in `public/` are **not** versioned (`/audio`, `/poster`, `/images`), so `vercel.json` gives them `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` (one day fresh, one week stale-while-revalidate) and not `immutable`. If a file ever gets versioned names, it can be made immutable.
- **Environment variables:** none required (no backend). `PSN_NPSSO` lives only in Satriko's `.env.local` for `yarn games:sync` and never goes on Vercel (decision #52).
- **Domain:** to be decided (checklist C18). The canonical URL and sitemap base come from the single constant `site.url` in `src/constants/site.ts`; set it to the production domain and redeploy.
- **Analytics:** none by default. Vercel Web Analytics is the option if wanted (checklist C19).
- **Vercel setup:** import the git repository; framework preset Next.js (auto-detected); build command `yarn build`; Node.js 24 in the project settings (`.nvmrc` says 24, and `engines.node` is `>=22.22`); no environment variables. Then add the domain, set `site.url`, and redeploy. The step-by-step version is in the README "Deploy" section.
- **Post-deploy checks:** `PLAYWRIGHT_BASE_URL=https://<deployment> yarn e2e` (when set, `playwright.config.ts` uses it as `baseURL` and does not start a local server); an OG preview check with https://www.opengraph.xyz; Lighthouse on the production URL.
- **Before launch:** the checklist lives in the README, section "Launch checklist (for Satriko)". It covers the public PDF (C5), the real domain in `site.url` (C18), hobby content, re-capturing the posters in Bogor daytime, and the real-device checks. Also required: every checklist item marked blocking for launch is done ([05](05-content.md#content-checklist)); `CREDITS.md` is complete; no phone number or referee details anywhere (success criterion S7); the Lighthouse and axe targets above are met.
