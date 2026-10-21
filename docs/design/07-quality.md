# 07: Quality

## Error handling

| Failure | How it's detected | What happens | What the visitor sees |
| --- | --- | --- | --- |
| No WebGL support | Capability check before mounting the canvas (`src/utils/webgl.ts`) | `useSceneStore.webgl = 'unsupported'`; the canvas is never mounted | A static room poster; the phone menu, buttons and panels work normally. The loader button reads **Enter (simple view)** |
| WebGL context lost mid-visit | `webglcontextlost` event | `webgl = 'lost'`; the canvas is unmounted | The poster fades in; whatever panel was open stays open |
| 3D crash (render error) | Error boundary around `three/SceneCanvas` | Same as context lost | Poster; the site keeps working |
| One model fails to load | Suspense + an error boundary **per object** | That object isn't rendered; its section stays reachable through the phone menu | The room without that object |
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

- **Everything is reachable without the 3D scene and without a mouse:** the phone menu, the on-screen buttons and real `<a href>` links cover all 11 sections.
- **The canvas is decorative:** `aria-hidden="true"` on the canvas wrapper, plus a visually hidden description ("An illustrated 3D room. Use the phone menu to explore sections.").
- **Skip link:** "Skip to menu" as the first focusable element.
- **Modals and the Help sheet:** built on the Radix Dialog (via shadcn/ui), so they have `role="dialog"`, `aria-modal`, `aria-labelledby`, a focus trap, **Esc** to close, and focus returned to what opened them.
- **Phone menu:** arrow-key grid navigation, Enter to open, Esc to close.
- **Visible focus:** a 3 px accent-color focus outline with an offset on every focusable element, in both themes.
- **Touch targets** ≥ 44×44 CSS px, including the enlarged 3D hit areas for small objects ([03](03-room-scene.md#interactions)).
- **Contrast:** every text/background pair meets AA (4.5:1 for body text, 3:1 for large text and UI). Checked for both day and night palettes ([04](04-ui-and-visual-design.md#palette)).
- **Oyen's speech bubble:** text is mirrored to an `aria-live="polite"` region right away.
- **Images:** meaningful images (Satriko's photo, hobby photos) have descriptive `alt` text; decorative SVGs have `alt=""` / `aria-hidden`.
- **Reduced motion:** honored everywhere ([04](04-ui-and-visual-design.md#reduced-motion)).
- **Text resizing:** text can scale to 200% inside panels without being cut off (panels scroll).
- **Sound:** off by default, and never needed to understand content.
- **Language:** `<html lang="en">`.

### Keyboard map

| Key | Context | Action |
| --- | --- | --- |
| Tab / Shift+Tab | Anywhere | Skip link → name tag → mute → day/night → help → Resume → Contact → phone |
| Enter / Space | Focused button or tile | Activate |
| Arrow keys | Phone menu | Move through the app grid |
| Esc | Modal, Help sheet, phone menu | Close |
| Enter | Speech bubble focused | Finish the line / next line |

## SEO

- **Per-route metadata** from the registry: `title`, `description`, canonical URL, Open Graph and Twitter card tags ([copy in 05](05-content.md#seo-copy)).
- **OG / Twitter image:** the room poster cropped to 1200×630 (day version). Optionally a per-section crop focused on that object.
- **`sitemap.ts`** lists `/` and all 11 section URLs; **`robots.ts`** allows everything and points to the sitemap.
- **Server-rendered panel text** on every section URL, so crawlers and no-JS visitors get real content.
- **JSON-LD `Person`** on `/`:
  - `name`: Satriko Aditya; `jobTitle`: Full Stack Software Engineer
  - `address`: Bogor, Indonesia
  - `email`; `sameAs`: LinkedIn and GitHub URLs (checklist C3/C4)
  - `worksFor`: Jitera
  - `alumniOf`: Hacktiv8, SMK Negeri 3 Bogor (and BINUS once graduated; until then, mention it in the description only)
- **The canonical domain** is set once the domain is decided (checklist C18).

## Performance budgets

| Metric | Budget / target | Notes |
| --- | --- | --- |
| 3D assets (GLB + textures), compressed | **≤ 2 MB** total | KayKit's shared atlas keeps this small ([03](03-room-scene.md#asset-pipeline)) |
| Initial JS on a direct-link route (excluding the lazy 3D chunk) | ≤ about 200 KB gzip | The 3D libraries live in the lazy `SceneCanvas` chunk |
| Lazy 3D chunk (three + R3F + drei) | ≤ about 350 KB gzip | Import only the drei helpers we use |
| LCP on direct-link pages | ≤ 2.5s on mid-range mobile / 4G | The LCP element is the server-rendered panel text or the poster |
| CLS | < 0.1 | Fixed-size HUD; the poster reserves the canvas space |
| Room interactive after Enter (mid-range phone, 4G) | ≤ about 4s | Assets preloaded while the loader shows |
| Frame rate | ≥ 50 fps desktop, ≥ 30 fps mid-range phone | Steps down a graphics tier automatically ([03](03-room-scene.md#performance-tiers)) |
| Audio | Music loaded on first play only; each sound effect ≤ about 30 KB | Not part of the initial load |
| Lighthouse | **Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95**; Performance ≥ 80 (mobile) on direct-link pages | The `/` route with 3D may score lower on Performance; that's accepted, since the loader is intentional |

## Testing strategy

| Level | Tool | What it covers |
| --- | --- | --- |
| **Unit** | Vitest (tests next to the code, e.g. `src/utils/time.test.ts`) | **Registry** (unique slugs and `objectId`s, every slug has a camera pose, SEO copy and a content file). **Time** (`time.ts`: Bogor / Singapore / Abu Dhabi conversion and overlap hours; `sky.ts`: phase boundaries). **`skills.ts`**: the "used at" mapping matches the table in [05](05-content.md#skills-skills-bookshelf). **`history.ts`**: push / back / replace decisions. **`storage.ts`**: works when `localStorage` throws |
| **Component** | React Testing Library | **ModalHost / PanelFrame** (focus trap, Esc, focus returns, `aria-*`). **Each panel** renders its content and its empty state. **PhoneMenu** keyboard grid. **SpeechBubble** live region. **CopyEmailButton** fallback |
| **End-to-end** | Playwright (`e2e/`) | **Direct links:** each of the 11 URLs shows its panel text in the server HTML and after hydration. **Back button** closes the panel and returns to `/`. **Panel switching** via the phone uses replace semantics. **Keyboard only:** reach and open every section. **No WebGL** (launched with WebGL disabled): poster plus everything still reachable. **Mobile viewports** (e.g. iPhone 14, Pixel 7): bottom bar and sheet modal, swipe-to-close. **Reduced motion** emulation: no glides |
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
- **Caching:** hashed JS/CSS files are cached indefinitely. Models and audio in `public/` use **versioned file names** (e.g. `room.v3.glb`) so they can also be cached long-term.
- **Environment variables:** none required (no backend).
- **Domain:** to be decided (checklist C18). Set the canonical URL and sitemap base from a single constant.
- **Analytics:** none by default. Vercel Web Analytics is the option if wanted (checklist C19).
- **Before launch:**
  - every checklist item marked blocking for launch is done ([05](05-content.md#content-checklist));
  - `CREDITS.md` is complete;
  - no phone number or referee details anywhere (success criterion S7);
  - the Lighthouse and axe targets above are met.
