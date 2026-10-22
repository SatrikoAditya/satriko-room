# 02: Architecture

## Stack

| Layer | Choice | Role / notes |
| --- | --- | --- |
| Framework | **Next.js (App Router)**, TypeScript `strict` | Static generation for every route, metadata API, `next/font`, `next/image`. Built with Turbopack (the Next 16 default) and `reactCompiler: true` in `next.config.ts` |
| Styling | **Tailwind CSS v4** + `clsx` / `tailwind-merge` (`cn` helper) | Design tokens from [04](04-ui-and-visual-design.md) as CSS variables; day/night themes switched with `data-theme`. Tailwind runs through the `@tailwindcss/turbopack` loader (a `turbopack.rules` entry for `*.css` in `next.config.ts`); there is no `postcss.config` |
| Theme | **next-themes** | Same library as the reference project. Handles the saved choice, the system preference and the no-flash script. Configured with `attribute="data-theme"` and values `day` / `night`. *Implementation note:* next-themes' own theme names stay `light` / `dark` (it only resolves the system preference to those two); the `value` prop maps them to the `day` / `night` attribute values, so `resolvedTheme` is `'light' \| 'dark'` (see `src/components/templates/providers.tsx`) |
| UI primitives | **shadcn/ui (Radix)**, *only the primitives we actually use* | Same setup as the reference project. Main use: **Dialog** as the accessible base of the modal and Help sheet (focus trap, Esc, `aria-modal`), with our own styling and `motion` animations on top |
| 2D motion | **`motion`** (Framer Motion) | Modal grow/shrink, phone menu, buttons, speech bubble. Only for the 2D UI, not inside the 3D scene |
| Icons | **Lucide React** | Phone app icons and on-screen controls |
| 3D | **`three`**, **`@react-three/fiber`**, **`@react-three/drei`** | Scene, orthographic camera, `CameraControls`, `ContactShadows`, `Outlines`, `PerformanceMonitor`, `useGLTF`, `useProgress`, `Html` |
| 3D post-processing | `@react-three/postprocessing` (**optional**) | Ambient occlusion on the desktop high tier only. Kept only if it fits the performance budget |
| Shared state | **Zustand**, one store per concern | Shared by the 2D UI and the 3D scene. Animation loops can read state with `getState()` without re-rendering React, which matters for 60 fps. Same pattern as the reference project |
| Code style | **Prettier + ESLint**, using the reference project's conventions | See [Code conventions](#code-conventions) |
| Testing | Vitest, React Testing Library, Playwright, `@axe-core/playwright` | See [07](07-quality.md#testing-strategy). Vitest resolves the path aliases with Vite 8's built-in `resolve.tsconfigPaths` (`vitest.config.mts`), so `vite-tsconfig-paths` is not installed |
| Runtime | **Node 24** (`.nvmrc` says `24`), yarn | `engines.node` in `package.json` is `>=22.22` |
| Hosting | **Vercel** | Every route static; no server functions needed |

**Agent notes:** `AGENTS.md` at the repo root is generated and re-added by `next dev`; commit it as-is instead of editing it.

**Versions:** use the latest stable releases when implementation starts. `@react-three/fiber`'s major version must match React's (e.g. R3F v9 needs React 19), so check compatibility before pinning. The reference project is on Next 14 / React 18; this project can be newer, and the structure and conventions carry over the same.

## Big picture

```text
                         ┌───────────────────────────────────────────────┐
  Request /experience →  │  src/app/[[...section]]/page.tsx  (Server)    │
                         │  • validate slug via @constants/sections      │
                         │  • generateMetadata (title, description, OG)  │
                         │  • render <Room initialSection="experience"/> │
                         └──────────────────────┬────────────────────────┘
                                                │ server-rendered HTML includes the
                                                │ open panel's text (SEO / no-JS)
                         ┌──────────────────────▼────────────────────────┐
                         │  @components/pages/Room  (Client)             │
                         │                                               │
                         │  ┌──────────────┐  ┌───────────────────────┐  │
                         │  │ three/       │  │ organisms/Hud         │  │
                         │  │ SceneCanvas  │  │ name tag · mute · ☀/🌙 │  │
                         │  │ Room, objects│  │ help · phone · Resume │  │
                         │  │ Oyen, camera │  │ Contact · Loader      │  │
                         │  └──────┬───────┘  └──────────┬────────────┘  │
                         │         │  src/store/use*Store │               │
                         │         └────────┬────────────┘               │
                         │  ┌───────────────▼──────────┐  ┌───────────┐  │
                         │  │ organisms/ModalHost      │  │ molecules/│  │
                         │  │ → PanelFrame             │  │ Speech-   │  │
                         │  │ → organisms/<X>Panel     │  │ Bubble    │  │
                         │  └──────────────────────────┘  └───────────┘  │
                         └───────────────────────────────────────────────┘
                                   ▲
   src/content/*.ts (typed with @models) ──┘   @constants/sections (registry) feeds everything
```

## Routing

- **One optional catch-all route:** `src/app/[[...section]]/page.tsx`. It handles `/` and every section slug with the same page component, so the room is never remounted.
- **Thin route files**, as in the reference project. The route file only does Next.js wiring (`generateStaticParams`, `generateMetadata`, slug validation) and renders the page component from `@components/pages/Room`. All UI and logic live in `src/components/`.
- `generateStaticParams()` returns every slug from the registry, so everything is pre-built at build time.
- `generateMetadata()` returns a title, description, canonical URL and OG image per slug (copy in [05](05-content.md#seo-copy)).
- Anything else (e.g. `/foo` or `/experience/extra`) → `notFound()` → `src/app/not-found.tsx`, which re-exports `@components/pages/Page404` (a simple cozy 404 with a link back to the room).
- `src/app/error.tsx` re-exports `@components/pages/Page500` for unexpected runtime errors.
- `src/app/sitemap.ts` and `src/app/robots.ts` are generated from the registry.

### Section slugs

| Slug | Section | Object in the room |
| --- | --- | --- |
| `/` | Room (no panel) | n/a |
| `/about` | About me | Framed photo on the desk |
| `/experience` | Work experience | PC / workstation |
| `/skills` | Skills | Bookshelf |
| `/education` | Education | Picture frames on the wall |
| `/gaming` | Gaming | TV + game console |
| `/travel` | Travel | Indonesia map on the wall |
| `/hiking` | Hiking | Backpack + boots in the outdoor-hobby corner |
| `/diving` | Diving | Scuba tank with mask, snorkel and fins |
| `/remote-work` | Remote work | 3 wall clocks |
| `/contact` | Contact | Mailbox by the door |
| `/resume` | Resume | Printer |

Oyen, the light switch and the radio have **no URL**. They trigger in-place behavior (speech bubble, night mode, sound).

## The modal + URL model

**Goal:** it should feel like a single-page app (the room never reloads, and every open and close is animated) while each panel still has a real, shareable URL.

### How it works

1. **The URL is the source of truth for which panel is open.** `useActiveSection()` (`src/hooks/useActiveSection.ts`) reads the pathname and maps it to the active section through the registry; the `Room` page's co-located `useRoom.ts` hook syncs the phases and transitions around it.
2. **Opening a panel in the app** (clicking an object, a phone app, or the Resume/Contact buttons) goes through `useSectionNavigation()` (`src/hooks/`), which calls `window.history.pushState(null, '', '/experience')`. The Next.js App Router supports the native `pushState` / `replaceState` and keeps `usePathname()` in sync, so there's **no server round-trip and no remount**.
3. **Every open and close is a reaction to the pathname changing.** Clicking ✕, pressing Esc, clicking outside, and pressing the browser back button all end up as "pathname became `/`", which plays the same close animation. So the back button closes a panel *with* animation.
4. **On a direct load** (`/experience` opened from a link), the server-rendered HTML already contains the open panel and its text.
5. **Progressive enhancement:** every navigational control (phone apps, Resume/Contact buttons, ✕) is a real `<a href="/slug">`. With JavaScript, clicks are intercepted and turned into the animated flow. Without JavaScript, they're normal links to the pre-built pages. Middle-click / "open in new tab" works too.

### History rules

The rule for visitors: **"Back" always means close the panel and return to the room.** The history helpers live in `src/utils/history.ts` and are used only through `useSectionNavigation()`.

| Action | History operation | Resulting stack (example) |
| --- | --- | --- |
| Open a panel from the room (in the app) | `pushState('/x')` | `[…, /, /x]` |
| Close via UI, when the panel was opened in the app | `history.back()` | `[…, /]` |
| Close via UI, when the panel came from a direct load | `replaceState('/')` | `[/]`, so Back then leaves the site as expected |
| Switch panel x → y (e.g. via the phone while x is open) | `replaceState('/y')` | `[…, /, /y]`, so Back closes y and returns to the room |
| Browser Back while a panel is open | (browser) | Pathname becomes `/`, and the close animation plays |
| Browser Forward to `/x` | (browser) | Pathname becomes `/x`, and the open animation plays |

`useRoomStore` keeps an `openedInApp` flag to choose between `history.back()` and `replaceState('/')`.

*Implementation note:* code inside the R3F `<Canvas>` cannot use Next's router context (React contexts do not cross the Canvas boundary), so scene objects call `openFromScene(slug)` from `src/utils/history.ts`, which reads the slug from `window.location`. Other scene-side needs (theme toggle, reduced motion, coarse pointer) are passed in through `SceneBridgeProvider` / `useSceneBridge()` in `src/components/three/SceneCanvas/SceneBridge.tsx`.

### Interaction state machine

```text
             (on "/")                         (direct link "/x")
  loading ──► gate ──[Enter]──► entering ──► ready ◄──────── loading(x)
                                               │                │ panel shown at once;
                                               │                │ 3D loads behind and
                                               ▼                │ snaps to x's pose (no glide)
   ready ──[open x]──► focusing(x) ──► open(x) ──[close]──► closing(x) ──► ready
                         camera glide     modal grows          modal shrinks,
                         (~0.6s)          from object          camera glides back

   open(x) ──[open y]──► closing(x) ──► focusing(y) ──► open(y)
```

- **Rapid input:** a new target arriving mid-transition **cancels** the current one and redirects (no queue of stale animations).
- **Reduced motion:** `focusing` and `closing` become instant camera cuts with a fade only (see [04](04-ui-and-visual-design.md#reduced-motion)).
- **If the 3D isn't ready yet** (direct link, or the visitor closes before it loads), closing shows the poster image with a small "room loading…" indicator, and the room fades in when ready.
- **No WebGL:** the same states, but there's no camera; panels open with a centered grow/fade from the poster (see [03](03-room-scene.md#fallback)).

### "Grow out of the object"

When `focusing(x)` finishes, the scene projects the object's world-space bounding box (`Box3`, 8 corners → `Vector3.project(camera)`, helper in `src/utils/projectRect.ts`) into a **screen rectangle** and stores it as `originRect` in `useRoomStore`. `ModalHost` animates the panel frame from `originRect` to its final rectangle, then fades in the content. Closing does the reverse. If no `originRect` exists (fallback mode), the panel grows from the center of the screen.

*Implementation note:* `ModalHost` renders the Radix `Dialog` **inline, without a `Dialog.Portal`** (see the comment in `src/components/organisms/ModalHost/index.tsx`). A portal would render nothing on the server, so a direct link such as `/experience` would have no panel text in its HTML. The final rectangle comes from `src/utils/modalRect.ts`.

## Section registry

`src/constants/sections.ts` is the **single source of truth**. It works like the reference project's `constants/navItems.ts`: static app configuration lives in `constants/`. The scene, phone menu, on-screen buttons, sitemap, metadata and tests all read from it. Its types live in `src/interfaces/section.ts`.

```ts
// Types in src/interfaces/section.ts (CameraPose is the as-built shape: poses stay valid
// when the default fit changes with the viewport size)
export type SectionSlug =
  | 'about' | 'experience' | 'skills' | 'education' | 'gaming'
  | 'travel' | 'hiking' | 'diving' | 'remote-work' | 'contact' | 'resume'

export interface CameraPose {
  target: Vec3      // look-at point (the object)
  offset: Vec3      // camera position = target + offset
  zoomFactor: number // multiplied with the fitted default zoom (1 = default)
}

export interface Section {
  slug: SectionSlug
  title: string            // panel title, e.g. "Work Experience"
  label: string            // short hover/phone label, e.g. "Experience"
  icon: LucideIcon         // phone app icon (component from lucide-react)
  objectId: string         // which 3D object opens it, e.g. 'pc' (an ObjectId)
  cameraPose: CameraPose
  theme: PanelTheme        // 'monitor' | 'tv' | 'scrapbook' | 'shelf' | ...
  seo: { title: string; description: string }
}
```

**Adding a section later (e.g. Projects)** takes one registry entry, one object in `three/objects/` (plus its entry in `three/RoomObjects/index.tsx`), one content file in `src/content/`, one model type in `src/models/`, and one `organisms/<X>Panel`. Nothing else changes.

## State (Zustand stores)

Following the reference project's pattern: **one store per concern**, one file each, named `use<Name>Store.ts`, in `src/store/`.

| Store | State | Written by | Read by |
| --- | --- | --- | --- |
| **`useRoomStore`** | `phase` (`loading` · `gate` · `entering` · `ready`), `transition` (`idle` · `focusing` · `open` · `closing`), `originRect`, `openedInApp`. The active section is not stored: it is derived from the pathname by `useActiveSection()` | Loader, Enter button, `useRoom` (pathname sync), `useSectionNavigation`, the scene (`originRect`) | Camera director, ModalHost, Hud |
| **`useSceneStore`** | `hovered` (`objectId \| null`), `hint` (`objectId \| null`), `tier` (`high` · `low`), `webgl` (`unknown` · `supported` · `unsupported` · `lost`), `theme` (`day` · `night`, a mirror of next-themes' resolved theme, for the 3D lighting), `sceneReady`, `progress` (loader progress, 0 to 100), `bubble` (speech-bubble text, a DOM element outside the Canvas), `oyenAnchor` (screen position of Oyen for the bubble). There is no `pointer` field: the scene uses R3F's own `state.pointer` | Scene pointer events, the idle hint hook, `PerformanceMonitor`, the capability check / context-lost handler, the theme sync, the loader | Labels, sound effects, sparkles, scene settings, `Room` (poster swap), `SpeechBubble`, `Loader` |
| **`useSoundStore`** | `master` (all audio), `music` (radio), `hydrate()` (reads the saved `master` flag after mount, so the server and first client render agree) | Mute button, radio, `hydrate` | Audio manager (`src/utils/audio.ts`) |

- **Theme** is owned by **next-themes** (the saved choice, the system preference, the no-flash script). A small sync effect copies `resolvedTheme` into `useSceneStore.theme`, so the 3D scene and `useFrame` loops can read it without React context.
- **Other saved preferences** (`room:sound` and `room:interacted`, keys in `src/constants/storage.ts`) go through `src/utils/storage.ts`, which wraps every `localStorage` read and write in **try/catch** and falls back to safe defaults when storage is unavailable.

## Content layer

- `src/content/*.ts`: one **typed** file per section, typed with the content models in `src/models/` (`IJob`, `ISkillShelf`, …). No CMS, no MDX.
- **Derived data** is computed from content, never duplicated by hand. Example: *skill → companies where it was used* is computed in `src/utils/skills.ts` from the tool lists in `src/content/experience.ts`.
- Panel components (`src/components/organisms/<X>Panel/`) are **pure presentation**: they take content as props, use no browser APIs, and are safe to render on the server.

## Rendering rules

- **The canvas is client-only:** `three/SceneCanvas` is loaded with `next/dynamic` and `ssr: false`, as a separate lazy chunk. The server HTML shows the **poster image** in its place, which also gives a fast first paint.
- **Panels render on the server** for direct loads, so their text is in the HTML (the dialog is rendered inline, see [the modal model](#grow-out-of-the-object)). Panels therefore import only server-safe helpers: for example `formatRange` lives in `src/utils/dates.ts`, not in a client module.
- **Anything that depends on the current time** (clocks, the phone's Bogor time, window sky) renders **only after mount**, to avoid hydration mismatches. The server renders a neutral placeholder.
- **No theme flash:** next-themes injects its script so `data-theme` is set before first paint. `<html>` gets `suppressHydrationWarning`, as in the reference project's root layout.

---

## Project structure

### Reference project

The structure and conventions follow **a Next.js App Router project Satriko works on at Jitera**, so the codebase feels familiar. Only the **folder structure and code conventions** are carried over. No client code, business logic or client names come into this repo.

What the reference project does, and what this project adopts:

| Reference project pattern | Adopted here |
| --- | --- |
| Everything under `src/`, with path aliases (`@components/*`, `@constants/*`, `@hooks/*`, `@interfaces/*`, `@models/*`, `@utils/*`, `@styles/*`, `@assets/*`) | ✅ Same aliases, plus `@store/*` and `@content/*` |
| Thin `src/app/**/page.tsx` files that hand off to `@components/pages/<Page>` | ✅ (the catch-all route also exports `generateStaticParams` / `generateMetadata`) |
| `app/layout.tsx` sets the font CSS variables on `<html>`, imports `@styles/globals.css`, and wraps children in `@components/templates/providers` | ✅ |
| `app/not-found.tsx`, `app/error.tsx` at the root, delegating to `components/pages/Page404` / `Page500` | ✅ |
| **Atomic design:** `components/atoms`, `molecules`, `organisms`, `templates`, `pages` | ✅ For all 2D UI |
| `components/shadcn/components/ui/*` for shadcn primitives, aliased as `@/components/ui/*`, with `cn` in `components/shadcn/utils.ts` | ✅ Only for the primitives we use (Dialog first) |
| One folder per component: `ComponentName/index.tsx` (default export), with co-located sub-components and a co-located **logic hook** (`useComponentName.ts`) for page/organism logic | ✅ |
| `src/store/use<Name>Store.ts`: one Zustand store per concern, created with `create` | ✅ `useRoomStore`, `useSceneStore`, `useSoundStore` |
| `src/constants/*.ts`: one file per topic (e.g. `fonts.ts` with `next/font` objects exposing `variable: '--font-…'`, `navItems.ts` for navigation config) | ✅ `fonts.ts`, `sections.ts` (the registry), `roomLayout.ts`, … |
| `src/hooks/`: shared hooks | ✅ Named `useX.ts` (the reference mixes `useX.ts` and `x.hook.ts`; we use `useX.ts` only) |
| `src/interfaces/`: app/UI types; `src/models/`: data models with an `I` prefix (`IEvent`) | ✅ `interfaces/section.ts`; `models/job.ts` (`IJob`), … |
| `src/utils/`: pure helpers, one file per topic | ✅ |
| `src/styles/globals.css` | ✅ Tailwind v4 + theme tokens |
| `src/assets/` (`icons/Svg.tsx`, `images/`, `index.ts`) | ⚪ Planned for custom 2D SVGs; not needed in the build (the Oyen loader art is inline in `Loader/OyenWalk.tsx`), so the folder does not exist |
| `next-themes` theme provider | ✅ With `attribute="data-theme"` |
| Prettier + ESLint configuration | ✅ See [Code conventions](#code-conventions) |
| `src/services/` (API clients, React Query), `src/providers/QueryProvider`, auth, i18n | ❌ Not needed: there's no backend, no auth, English only |
| Storybook | ⚪ Optional: useful for atoms and panels, but not required for phase 1 |

**Deliberate additions** (things the reference project doesn't have):

| Addition | Why |
| --- | --- |
| `src/components/three/` | 3D scene components aren't DOM UI and don't map onto atoms/molecules/organisms. They get their own top-level folder next to the atomic folders, the same way the reference project keeps `shadcn/` separate. Inside, it still follows the **one folder per component, `index.tsx` entry** rule |
| `src/content/` | Satriko's content (experience, hobbies, …) is the part edited most often. Keeping it apart from technical `constants/` makes content edits safe and obvious |
| `e2e/` at the repo root | Playwright tests; the reference project has no test folder |

### Folder tree

```text
.
├── public/
│   ├── models/          # not used: every object is built in code (see 03)
│   ├── audio/           # sound effects + music (licenses in CREDITS.md)
│   ├── images/          # about/, gaming/, travel/, hiking/, diving/
│   ├── poster/          # room-day / room-night (fallback + OG images)
│   └── resume/          # Satriko-Aditya-Resume.pdf (public version)
├── e2e/                 # Playwright specs: a11y, direct-links, keyboard, mobile, navigation,
│                        # no-webgl, visual (+ helpers.ts)
├── scripts/             # build-indonesia-map.mjs, convert-audio.mjs, capture-poster.mts,
│                        # check-budgets.mjs
├── src/
│   ├── app/
│   │   ├── [[...section]]/
│   │   │   └── page.tsx     # thin: generateStaticParams, generateMetadata, <Room initialSection/>
│   │   ├── layout.tsx       # font variables (@constants/fonts), @styles/globals.css, <Providers>
│   │   ├── not-found.tsx    # → @components/pages/Page404
│   │   ├── error.tsx        # → @components/pages/Page500
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── assets/          # planned for custom 2D SVGs; the folder was never needed, so it does not
│   │                    # exist (the `@assets/*` alias is still configured in tsconfig)
│   ├── components/
│   │   ├── atoms/           # Button, IconButton, StitchedLabel, Chip, ProgressBar,
│   │   │                    # Typewriter, VisuallyHidden
│   │   ├── molecules/       # SpeechBubble, PhoneAppTile, HoverLabel, SkillBook,
│   │   │                    # CertificateFrame, ClockFace, MapPin, EmptyState,
│   │   │                    # CopyEmailButton
│   │   ├── organisms/       # Hud, PhoneMenu, Loader, HelpSheet, ModalHost, PanelFrame,
│   │   │                    # AboutPanel, ExperiencePanel, SkillsPanel, EducationPanel,
│   │   │                    # GamingPanel, TravelPanel, HikingPanel, DivingPanel,
│   │   │                    # RemoteWorkPanel, ContactPanel, ResumePanel
│   │   ├── templates/
│   │   │   └── providers.tsx    # next-themes ThemeProvider, motion MotionConfig
│   │   ├── pages/
│   │   │   ├── Room/            # index.tsx + useRoom.ts (pathname ↔ store, phases)
│   │   │   ├── Page404/
│   │   │   └── Page500/
│   │   ├── three/               # 3D only
│   │   │   ├── SceneCanvas/     # <Canvas>, tiers, PerformanceMonitor, error boundary,
│   │   │   │                    # SceneBridge (context bridge into the Canvas), SceneReady
│   │   │   ├── Room/            # walls, floor, base, lighting presets, decor
│   │   │   ├── CameraDirector/  # default/focus poses, glide, parallax, mobile limits
│   │   │   ├── Interactive/     # shared hover / click / outline / label wrapper
│   │   │   ├── Oyen/            # cat built from shapes, idle animation, day/night poses
│   │   │   ├── RoomObjects/     # aggregator that mounts every object (named apart from
│   │   │   │                    # objects/ because objects/ vs Objects/ collide on macOS)
│   │   │   └── objects/         # Pc/, Bookshelf/, PhotoFrame/, EduFrames/, Tv/,
│   │   │                        # IndonesiaMap/, HikingGear/, DiveGear/, Clocks/,
│   │   │                        # Mailbox/, Printer/, LightSwitch/, Radio/, WindowSky/
│   │   └── shadcn/
│   │       ├── components/ui/   # only the primitives we use (dialog.tsx, …)
│   │       └── utils.ts         # cn()
│   ├── constants/       # sections.ts (registry), site.ts, roomLayout.ts, roomPalette.ts,
│   │                    # camera.ts, fonts.ts, timezones.ts, sky.ts, audio.ts, storage.ts,
│   │                    # hints.ts, loader.ts, indonesiaMap.ts
│   ├── content/         # about.ts, experience.ts, skills.ts, education.ts, gaming.ts,
│   │                    # travel.ts, hiking.ts, diving.ts, remoteWork.ts, contact.ts,
│   │                    # resume.ts, oyen.ts
│   ├── hooks/           # useSectionNavigation.ts, useActiveSection.ts, useBogorTime.ts,
│   │                    # useIdleHint.ts, useWebGLSupport.ts, useThemeSync.ts,
│   │                    # useSoundEffects.ts, useViewportSize.ts, useIsCoarsePointer.ts,
│   │                    # usePrefersReducedMotion.ts
│   ├── interfaces/      # section.ts (Section, CameraPose, PanelTheme), scene.ts, ui.ts
│   ├── models/          # about.ts (IAbout), job.ts (IJob), skill.ts (ISkillShelf),
│   │                    # education.ts (IEducation), game.ts (IGame),
│   │                    # travel.ts (ITravelPin), hike.ts (IHike), dive.ts (IDive)
│   ├── store/           # useRoomStore.ts, useSceneStore.ts, useSoundStore.ts
│   ├── styles/          # globals.css (Tailwind v4, day/night tokens)
│   └── utils/           # time.ts, dates.ts (formatRange, server-safe), sky.ts, skills.ts,
│                        # history.ts, storage.ts, webgl.ts, projectRect.ts, modalRect.ts,
│                        # map.ts, audio.ts
├── CREDITS.md           # every model / sound / music / font with source + license
└── docs/design/         # these documents
```

The component names above are the **planned starting set**; the built tree is close to it. Additions during the build: molecules `Poster` and `ProgressPill`, organisms `JsonLd` and `SectionNav`, and the `scripts/` and `RoomObjects/` folders described above.

### Component folder anatomy

Same as the reference project:

```text
components/organisms/ExperiencePanel/
├── index.tsx              # default export: the component (view only)
├── useExperiencePanel.ts  # co-located logic hook (state, derived data, handlers)
├── CompanySidebar.tsx     # co-located sub-component used only here
└── utils.ts               # optional local helpers
```

- **Folders** are PascalCase and match the component name. The reference project has a few kebab-case legacy folders (`user-nav`, `header`); this project uses **PascalCase only**.
- **Entry file:** `index.tsx` with a **default export**, so imports read `import ExperiencePanel from '@components/organisms/ExperiencePanel'`.
- **Props types** are exported next to the component as `export interface <Component>Props`.
- **View / logic split:** when a component has non-trivial logic, keep the JSX in `index.tsx` and the logic in a co-located `use<Component>.ts` hook (the reference project's page pattern, e.g. a list page with its own `use<Page>.tsx`).
- **Styling:** Tailwind classes, combined with `cn()`. CSS modules (`index.module.css`, used by some atoms in the reference project) only when Tailwind can't express something cleanly, e.g. the stitched-border pattern.
- **Client components:** add `'use client'` only where needed (the store files, `pages/Room`, `three/*`, interactive organisms). Panels stay server-safe.
- **3D components** (`three/`) follow the same anatomy, e.g. `three/objects/Pc/index.tsx` + `three/objects/Pc/usePcHover.ts`.

### Code conventions

Carried over from the reference project:

- **Prettier:** `singleQuote: true`, `semi: false`, `trailingComma: 'all'`, `endOfLine: 'auto'`, with `@ianvs/prettier-plugin-sort-imports` and `prettier-plugin-tailwindcss`.
- **Import order** (the reference project's groups, adapted to this project's aliases):
  1. `react`, then `next`
  2. third-party packages
  3. `@components/*`
  4. `@store/*`, `@hooks/*`
  5. `@constants/*`, `@content/*`, `@models/*`, `@interfaces/*`, `@utils/*`, `@styles/*`
  6. relative imports, then CSS
- **ESLint:** `next/core-web-vitals`, `@typescript-eslint/recommended`, `react/recommended`, `prettier`, plus `unused-imports/no-unused-imports: error`, `@typescript-eslint/no-shadow: error`, `@typescript-eslint/no-explicit-any: warn`, and unused variables allowed when prefixed with `_`.
- **Naming:**
  - Stores: `use<Name>Store`.
  - Hooks: `use<Name>`.
  - Models: an `I` prefix (`IJob`).
  - Constants: `camelCase` for exported config objects/arrays (as in `navItems`), and `UPPER_SNAKE_CASE` for primitive constants (e.g. `HINT_DELAY_MS = 8000`).
- **TypeScript:** `strict: true`, plus `baseUrl` and the `paths` aliases above.
