# Satriko's Room: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the cozy 3D point-and-click portfolio designed in `docs/design/` (README + docs 01–08): a Next.js site where visitors click objects in an Animal Crossing–style room to open panels about Satriko Aditya, with one URL per panel, a phone quick-menu, Oyen the cat, night mode, live clocks, a live sky, and a radio.

**Architecture:** One optional catch-all route (`src/app/[[...section]]/page.tsx`) renders a single client page (`components/pages/Room`) that holds the lazily loaded React Three Fiber canvas, the on-screen controls, and a modal host. The URL (via `usePathname`) is the source of truth for which panel is open; in-app opens use `history.pushState` so the room never remounts. Panels are plain HTML components fed by typed content files, server-rendered for SEO. The folder structure and code conventions follow Satriko's Jitera project (see design doc 02, "Project structure").

**Tech Stack:** Next.js (App Router, TypeScript strict), Tailwind CSS v4, `motion` (Framer Motion), Lucide React, three + `@react-three/fiber` + `@react-three/drei`, Zustand, next-themes, Radix Dialog, Vitest + React Testing Library, Playwright + axe, yarn, Vercel.

## Global Constraints

Copied from the design docs; every task implicitly includes these.

- **No implementation of Phase 2** (PC terminal, Oyen antics): out of scope for this plan. Parked ideas stay parked.
- **Privacy:** the site, the content files and the public PDF contain **only email, LinkedIn and GitHub**. Never add the phone number or any referee name/contact. "References available on request."
- **Legal:** Animal Crossing–*inspired* only. No Nintendo assets, characters, logos, UI copies or the FOT-Seurat font. Every model/sound/music/font must be CC0 or properly licensed and listed in `CREDITS.md`.
- **Text is always HTML**, never baked into the 3D scene. The canvas is decorative (`aria-hidden`). Everything must work by keyboard and without WebGL.
- **Sound is off by default**; music never auto-plays; the `AudioContext` is unlocked only by a user click.
- **Reduced motion** (`prefers-reduced-motion`) is honored: no camera glides, no parallax, fades only, no typing effect.
- **Budgets:** 3D assets ≤ 2 MB compressed; initial JS on a direct-link route ≤ ~200 KB gzip (3D is a lazy chunk ≤ ~350 KB gzip); Lighthouse Accessibility ≥ 95 and SEO ≥ 95 on every route.
- **Conventions (from the Jitera reference project):** everything under `src/`; path aliases `@components/*`, `@constants/*`, `@content/*`, `@hooks/*`, `@interfaces/*`, `@models/*`, `@store/*`, `@utils/*`, `@styles/*`, `@assets/*`, plus `@/components/ui/*` → `src/components/shadcn/components/ui/*`; thin `app/` routes that hand off to `components/pages/<Page>`; atomic design folders; **PascalCase** component folders with `index.tsx` default export and a co-located `use<Component>.ts` logic hook when logic is non-trivial; stores named `use<Name>Store.ts`, one per concern; models with `I` prefix (`IJob`); hooks `use<Name>.ts`; `UPPER_SNAKE_CASE` primitive constants, `camelCase` config objects; Prettier `singleQuote`, `semi: false`, `trailingComma: 'all'`; ESLint `unused-imports/no-unused-imports: error`, `@typescript-eslint/no-shadow: error`.
- **Package manager:** yarn. **Git:** initialized in Task 1; every task ends with a commit on `main`; nothing is pushed.
- **Commit message format:** conventional prefix (`feat:`, `test:`, `chore:`, `docs:`), one line, then a blank line, then exactly: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Content facts** come verbatim from `docs/design/05-content.md`. Content items marked 📝 there (photo, intro, LinkedIn/GitHub URLs, public PDF, hobby data…) are **not invented**: the plan ships typed placeholders/empty states and the launch task (Task 26) lists what Satriko must provide.
- **Fonts:** `next/font/google` only, imported **only** in `src/app/layout.tsx` (components use the CSS variables), so Vitest never loads `next/font`.
- **Tests:** unit tests sit next to the code as `*.test.ts(x)` and run with Vitest + jsdom; 3D components are **not** unit-tested in jsdom (their pure math is unit-tested in `src/utils/`, and their behavior is covered by Playwright in Milestone 4).

---

## How to execute this plan

- Work through milestones in order. Each milestone ends with working software:
  - **M0 Foundation:** scaffold, tokens, registry, content, routes → every section URL serves real text.
  - **M1 2D product:** stores, navigation, modal, all 11 panels, phone menu, HUD, loader, poster fallback → a complete, accessible site with a static room picture.
  - **M2 3D room:** canvas, room, 14 clickable things, camera glides, Oyen → the real experience (ends with the **style-test checkpoint**).
  - **M3 Extras:** live clocks, night mode, live sky, radio + sound.
  - **M4 Quality & launch:** Playwright + axe, SEO assets (poster/OG, JSON-LD), performance budget, Vercel.
- **Design references:** each task names the design doc section it implements. Read that section before starting the task.
- **Verification commands** (available after Task 1): `yarn lint`, `yarn typecheck`, `yarn test` (Vitest), `yarn build`, `yarn dev`; after Task 23: `yarn e2e`.
- The **Shared Interfaces** section below is the contract between tasks. If you change a name there, update every task that uses it.

---

## Shared Interfaces (the contract between tasks)

### Types: `src/interfaces/section.ts`

```ts
import type { LucideIcon } from 'lucide-react'

export type SectionSlug =
  | 'about' | 'experience' | 'skills' | 'education' | 'gaming' | 'travel'
  | 'hiking' | 'diving' | 'remote-work' | 'contact' | 'resume'

export type PanelTheme =
  | 'scrapbook' | 'monitor' | 'shelf' | 'frames' | 'tv' | 'map'
  | 'journal' | 'logbook' | 'clocks' | 'envelope' | 'paper'

export type ObjectId =
  | 'photo-frame' | 'pc' | 'bookshelf' | 'edu-frames' | 'tv' | 'indonesia-map'
  | 'hiking-gear' | 'dive-gear' | 'clocks' | 'mailbox' | 'printer'
  | 'oyen' | 'light-switch' | 'radio'

export type Vec3 = readonly [number, number, number]

/** Camera pose when focused on an object. position = target + offset. */
export interface CameraPose {
  target: Vec3
  offset: Vec3
  zoomFactor: number // multiplied with the fitted default zoom (1 = default)
}

export interface Section {
  slug: SectionSlug
  title: string   // panel title, e.g. 'Work Experience'
  label: string   // short label for hover tags / phone, e.g. 'Experience'
  icon: LucideIcon
  objectId: Exclude<ObjectId, 'oyen' | 'light-switch' | 'radio'>
  cameraPose: CameraPose
  theme: PanelTheme
  seo: { title: string; description: string }
}
```

### Types: `src/interfaces/ui.ts`

```ts
export interface Rect { x: number; y: number; width: number; height: number }
export type Phase = 'loading' | 'gate' | 'entering' | 'ready'
export type Transition = 'idle' | 'focusing' | 'open' | 'closing'
export type Tier = 'high' | 'low'
export type WebglStatus = 'unknown' | 'supported' | 'unsupported' | 'lost'
export type SceneTheme = 'day' | 'night'
```

### Registry: `src/constants/sections.ts`

```ts
export const sections: readonly Section[]            // 11 entries, in phone-menu order
export const sectionSlugs: readonly SectionSlug[]
export function isSectionSlug(value: string): value is SectionSlug
export function sectionBySlug(slug: SectionSlug): Section
export function sectionByObject(objectId: ObjectId): Section | undefined
export function slugFromPathname(pathname: string): SectionSlug | null // '/experience' → 'experience'; '/' → null
```

### Stores: `src/store/`

```ts
// useRoomStore.ts
interface RoomState {
  phase: Phase;             setPhase(phase: Phase): void
  transition: Transition;   setTransition(t: Transition): void
  originRect: Rect | null;  setOriginRect(r: Rect | null): void
  openedInApp: boolean;     setOpenedInApp(v: boolean): void
}
// useSceneStore.ts
interface SceneState {
  hovered: ObjectId | null; setHovered(id: ObjectId | null): void
  hint: ObjectId | null;    setHint(id: ObjectId | null): void
  tier: Tier;               setTier(t: Tier): void
  webgl: WebglStatus;       setWebgl(s: WebglStatus): void
  theme: SceneTheme;        setTheme(t: SceneTheme): void
  sceneReady: boolean;      setSceneReady(v: boolean): void
  progress: number;         setProgress(p: number): void          // 0–100, mirrored from the scene
  bubble: string | null;    setBubble(text: string | null): void  // Oyen's current line (DOM bubble)
  oyenAnchor: { x: number; y: number } | null; setOyenAnchor(a): void // Oyen's head in CSS px (bubble position)
}
// useSoundStore.ts
interface SoundState {
  master: boolean; music: boolean
  setMaster(v: boolean): void; setMusic(v: boolean): void
  toggleMaster(): void; toggleMusic(): void
}
```

`activeSection` is **not** in a store: it is always derived from the URL with `useActiveSection()` (below), so server rendering and hydration agree.

### Hooks: `src/hooks/`

```ts
useActiveSection(): SectionSlug | null                 // slugFromPathname(usePathname())
useSectionNavigation(): { open(slug): void; close(): void; switchTo(slug): void; linkProps(slug): { href: string; onClick(e: React.MouseEvent): void } }
useWebGLSupport(): void                                // sets useSceneStore.webgl once on mount
useThemeSync(): void                                   // next-themes resolvedTheme → useSceneStore.theme ('dark' → 'night')
useBogorTime(): ClockTime | null                       // null on the server, ticks every second after mount
useIdleHint(): void                                    // Oyen hints after HINT_DELAY_MS on first visit
usePrefersReducedMotion(): boolean
useIsCoarsePointer(): boolean
useViewportSize(): { width: number; height: number } | null  // null until mounted
```

### Scene bridge: `src/components/three/SceneCanvas/SceneBridge.tsx`

React contexts from outside the R3F `<Canvas>` (Next router, next-themes) are not available inside it. `SceneCanvas` reads what the scene needs outside the Canvas and re-provides it inside through one small context:

```ts
interface SceneBridgeValue { toggleTheme(): void; reducedMotion: boolean; coarsePointer: boolean }
useSceneBridge(): SceneBridgeValue   // only valid inside <Canvas>
```
Navigation from the scene uses `openFromScene(slug)` (plain function); stores are plain Zustand and work on both sides.

### Utils: `src/utils/`

```ts
// history.ts — plain functions, usable from React hooks AND from inside the R3F Canvas
// (React contexts such as Next's router are not available inside <Canvas>, so the scene never calls usePathname).
export type CloseStrategy = 'back' | 'replace'
export function decideClose(openedInApp: boolean): CloseStrategy
export function pushPath(path: string): void       // window.history.pushState(null, '', path)
export function replacePath(path: string): void    // window.history.replaceState(null, '', path)
export function currentSlug(): SectionSlug | null  // slugFromPathname(window.location.pathname)
export function openSection(active: SectionSlug | null, slug: SectionSlug): void   // push from the room, replace when switching
export function closeSection(active: SectionSlug | null): void                     // back or replace('/') per decideClose
export function openFromScene(slug: SectionSlug): void                             // openSection(currentSlug(), slug)

// storage.ts
export function readJSON<T>(key: string, fallback: T): T   // never throws
export function writeJSON(key: string, value: unknown): void // never throws

// modalRect.ts
export function finalRect(viewportWidth: number, viewportHeight: number): Rect
export function growTransform(from: Rect, to: Rect): { x: number; y: number; scaleX: number; scaleY: number }

// projectRect.ts
export function ndcPointsToRect(points: ReadonlyArray<{ x: number; y: number }>, width: number, height: number): Rect
export function objectScreenRect(object: THREE.Object3D, camera: THREE.Camera, width: number, height: number): Rect

// skills.ts
export function usedAt(skill: string, jobs: readonly IJob[]): string[]   // company names in job order

// time.ts
export interface ClockTime { h: number; m: number; s: number }
export function zonedTime(date: Date, timeZone: string): ClockTime
export function clockAngles(t: ClockTime): { hour: number; minute: number }     // degrees, clockwise from 12
export function utcOffsetMinutes(date: Date, timeZone: string): number
export function overlapWindow(date: Date, zones: readonly string[], baseZone: string, workStart?: number, workEnd?: number): { start: number; end: number } | null // minutes of the day in baseZone
export function formatHHMM(t: ClockTime): string

// sky.ts
export type SkyPhase = 'dawn' | 'day' | 'sunset' | 'night'
export function skyPhase(minutesOfDay: number): SkyPhase
export function sunHeight(minutesOfDay: number): number   // 0..1, 0 at the horizon
export const skyColors: Record<SkyPhase, { top: string; bottom: string; light: string }>

// map.ts
export function mercatorXY(lat: number, lon: number, scale: number, translate: readonly [number, number]): { x: number; y: number }

// audio.ts
export type SfxName = 'tick' | 'pop' | 'whoosh' | 'switch' | 'printer' | 'meow' | 'radio'
export const audio: { unlock(): void; playSfx(name: SfxName): void; startMusic(): void; stopMusic(): void; setMuted(muted: boolean): void }

// webgl.ts
export function detectWebGL(): boolean
```

### Constants: `src/constants/`

```ts
// roomLayout.ts — positions/sizes of every object (see Task 13 for values)
export const roomLayout: Record<ObjectId | DecorId, Placement>  // Placement = { position: Vec3; rotationY?: number; size?: Vec3 }
// camera.ts
export const DEFAULT_CAMERA_TARGET: Vec3; export const DEFAULT_CAMERA_OFFSET: Vec3
export const CAMERA_SMOOTH_TIME = 0.35; export const FOCUS_TIMEOUT_MS = 1500
// timezones.ts
export const clockZones = [{ id: 'bogor', city: 'Bogor', timeZone: 'Asia/Jakarta', label: 'WIB' }, { id: 'singapore', ... 'Asia/Singapore' }, { id: 'abu-dhabi', ... 'Asia/Dubai' }] as const
export const BASE_ZONE = 'Asia/Jakarta'; export const WORK_START = 9 * 60; export const WORK_END = 18 * 60
// hints.ts
export const HINT_DELAY_MS = 8000; export const MAX_HINTS = 3; export const hintOrder: ObjectId[] = ['pc', 'bookshelf', 'printer']
// storage.ts
export const STORAGE_KEYS = { sound: 'room:sound', interacted: 'room:interacted' } as const
```

### Component props (2D)

```ts
PanelFrame: { section: Section; children: ReactNode; onClose(): void; originRect: Rect | null; closing?: boolean }
ModalHost: {}  // reads useActiveSection + stores; renders panelComponents[slug]
SpeechBubble: { text: string; visible: boolean; anchor: { x: number; y: number } | null; onAdvance(): void }
PhoneMenu: { open: boolean; onOpenChange(open: boolean): void }
Hud: {}  // name tag, mute, theme, help, resume, contact, phone button
Loader: { onEnter(): void }
EmptyState: { message: string }
```

### Component props (3D)

```ts
Interactive: { id: ObjectId; label: string; hitSize: Vec3; hitOffset?: Vec3; labelHeight: number; onActivate(): void; children: ReactNode }
SceneCanvas: {}  // reads stores; sets sceneReady, webgl 'lost', tier
CameraDirector: {} // reads useActiveSection + useRoomStore.transition; writes originRect + transition
```

---

## File map

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Fonts (`@constants/fonts`), `@styles/globals.css`, `<Providers>`, `suppressHydrationWarning` |
| `src/app/[[...section]]/page.tsx` | `generateStaticParams`, `generateMetadata`, slug validation, renders `<Room initialSection>` |
| `src/app/not-found.tsx`, `src/app/error.tsx` | Re-export `Page404` / `Page500` |
| `src/app/sitemap.ts`, `src/app/robots.ts` | Generated from the registry |
| `src/components/templates/providers.tsx` | next-themes `ThemeProvider`, motion `MotionConfig` |
| `src/components/pages/Room/` | `index.tsx` composes Poster/SceneCanvas (dynamic), Hud, Loader, ModalHost, SpeechBubble; `useRoom.ts` runs the transition state machine |
| `src/components/pages/Page404/`, `Page500/` | Cozy error pages |
| `src/components/atoms/*` | `Button`, `IconButton`, `StitchedLabel`, `Chip`, `ProgressBar`, `Typewriter`, `VisuallyHidden` |
| `src/components/molecules/*` | `SpeechBubble`, `PhoneAppTile`, `HoverLabel`, `SkillBook`, `CertificateFrame`, `ClockFace`, `MapPin`, `EmptyState`, `CopyEmailButton`, `ProgressPill` |
| `src/components/organisms/*` | `Hud`, `PhoneMenu`, `Loader`, `HelpSheet`, `ModalHost` (+ `panels.ts` map), `PanelFrame`, 11 `<X>Panel` |
| `src/components/three/SceneCanvas/` | `<Canvas>`, tiers, `PerformanceMonitor`, error boundary, context-lost, `sceneReady` |
| `src/components/three/Room/` | Walls, floor, base, rug, bed, beanbag, lamps, plant, door, `Lighting` (day/night presets) |
| `src/components/three/CameraDirector/` | drei `CameraControls`, fit-to-room, focus glides, originRect projection, parallax, mobile limits |
| `src/components/three/Interactive/` | Hover lift + emissive highlight + label + hit box + click |
| `src/components/three/Oyen/` | Cat built from primitives, idle animation, day/night poses, click → bubble |
| `src/components/three/objects/<Name>/` | One folder per clickable object (14) + `WindowSky` |
| `src/components/shadcn/components/ui/dialog.tsx` | Radix Dialog wrapper (focus trap, Esc, aria) |
| `src/constants/*` | `sections.ts`, `roomLayout.ts`, `camera.ts`, `fonts.ts`, `timezones.ts`, `hints.ts`, `storage.ts`, `sky.ts`, `indonesiaMap.ts` (generated), `site.ts` (name, title, email, URLs, domain) |
| `src/content/*` | `about.ts`, `experience.ts`, `skills.ts`, `education.ts`, `gaming.ts`, `travel.ts`, `hiking.ts`, `diving.ts`, `remoteWork.ts`, `contact.ts`, `resume.ts`, `oyen.ts`, `help.ts` |
| `src/models/*` | `IAbout`, `IJob`, `ISkillShelf`, `IEducation`, `IGame`, `ITravelPin`, `IHike`, `IDive` |
| `src/store/*` | `useRoomStore`, `useSceneStore`, `useSoundStore` |
| `src/utils/*` | `history`, `storage`, `modalRect`, `projectRect`, `skills`, `time`, `sky`, `map`, `audio`, `webgl` |
| `scripts/` | `build-indonesia-map.mjs`, `capture-poster.ts` |
| `e2e/` | Playwright specs |
| `public/` | `poster/`, `audio/`, `images/`, `resume/`, `models/` (only if the optional pack task runs) |
| `CREDITS.md` | Every asset with source + license |

---

## Milestone 0: Foundation

### Task 1: Scaffold the project, tooling and git

Implements: design doc 02 "Stack", "Project structure", "Code conventions".

**Files:**
- Create (via create-next-app): `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/*`, `.gitignore`
- Create: `.prettierrc`, `eslint.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`, `src/components/shadcn/utils.ts`, `src/components/shadcn/utils.test.ts`, `README.md`, `CREDITS.md`
- Modify: `tsconfig.json` (paths), `package.json` (scripts)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `@components/shadcn/utils`; yarn scripts `dev`, `build`, `start`, `lint`, `lint:fix`, `prettier`, `typecheck`, `test`, `test:watch`.

- [ ] **Step 1: Check prerequisites**

Run: `node -v && yarn -v && git -v`
Expected: **Node ≥ 22.22** (Vitest 5, jsdom 30 and jest-dom 7 require it; run `nvm install 22 && nvm use 22` if lower), yarn 1.x or 4.x, git present. The folder contains only `README.md` (empty) and `docs/`.

- [ ] **Step 2: Scaffold Next.js (the empty README must go first, or create-next-app refuses the non-empty folder)**

```bash
cd /Users/satrikoaditya/Documents/project/personal-project-home-3d
rm README.md
yarn create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-yarn --no-cache-components --yes
```
Expected: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `postcss.config.mjs` with `@tailwindcss/postcss`, `eslint.config.mjs`. (If the generator asks about Turbopack or React Compiler, accept defaults.)
**Why `--no-cache-components`:** Next 16.4's generator enables Cache Components by default, which removes `dynamicParams` (used in Task 6 to 404 unknown slugs). If the installed generator doesn't know the flag, set `cacheComponents: false` in `next.config.ts` instead.

- [ ] **Step 3: Install runtime and dev dependencies**

```bash
yarn add motion lucide-react zustand next-themes radix-ui clsx tailwind-merge three @react-three/fiber @react-three/drei
yarn add -D @types/three vite vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-tailwindcss eslint-config-prettier eslint-plugin-unused-imports
```
Then compare the installed versions with the **Versions** section at the end of this plan (verified 2026-10-21): `@react-three/fiber` 9.x needs React 19; `vite` 8 is a required peer of Vitest 5 and `@vitejs/plugin-react` 6. Do **not** install drei 11 alpha or fiber 10 alpha.

- [ ] **Step 4: Replace `tsconfig.json` `compilerOptions.paths` and keep strict mode**

```json
"baseUrl": ".",
"paths": {
  "@/components/ui/*": ["src/components/shadcn/components/ui/*"],
  "@/*": ["src/*"],
  "@components/*": ["src/components/*"],
  "@constants/*": ["src/constants/*"],
  "@content/*": ["src/content/*"],
  "@hooks/*": ["src/hooks/*"],
  "@interfaces/*": ["src/interfaces/*"],
  "@models/*": ["src/models/*"],
  "@store/*": ["src/store/*"],
  "@utils/*": ["src/utils/*"],
  "@styles/*": ["src/styles/*"],
  "@assets/*": ["src/assets/*"]
}
```
Also ensure `"strict": true` and add `"src/**/*.test.ts", "src/**/*.test.tsx"` are not excluded.

- [ ] **Step 5: Write `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false,
  "endOfLine": "auto",
  "importOrder": [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@components/(.*)$",
    "^@/components/(.*)$",
    "",
    "^@store/(.*)$",
    "^@hooks/(.*)$",
    "",
    "^@constants/(.*)$",
    "^@content/(.*)$",
    "^@models/(.*)$",
    "^@interfaces/(.*)$",
    "^@utils/(.*)$",
    "^@styles/(.*)$",
    "^@assets/(.*)$",
    "",
    "^[./]"
  ],
  "plugins": ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 6: Write `eslint.config.mjs`**

```js
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'playwright-report/**', 'test-results/**'] },
]
```
If the installed `eslint-config-next` does not export `/core-web-vitals` and `/typescript` as flat-config arrays, use the `FlatCompat` form from the Next.js ESLint docs with `compat.extends('next/core-web-vitals', 'next/typescript')` and keep the same rules block.

- [ ] **Step 7: Write `vitest.config.mts` and `vitest.setup.ts`**

```ts
// vitest.config.mts
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
```
```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 8: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "prettier": "prettier --write 'src/**/*.{ts,tsx,css}' 'e2e/**/*.ts' 'scripts/**/*.{ts,mjs}'",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 9: Write the failing test for `cn()`**

```ts
// src/components/shadcn/utils.test.ts
import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('p-2', false && 'hidden', 'p-4')).toBe('p-4')
  })
})
```
Run: `yarn test`
Expected: FAIL, cannot find module `./utils`.

- [ ] **Step 10: Implement `cn()`**

```ts
// src/components/shadcn/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
Run: `yarn test`
Expected: PASS (1 test).

- [ ] **Step 11: Write `README.md` and `CREDITS.md`**

`README.md`: title "Satriko's Room", one paragraph (the idea), "Docs: see `docs/design/README.md`", "Commands: yarn dev / build / test / lint / typecheck", "Node ≥ 20, yarn".
`CREDITS.md`: heading "Credits & licenses" and a table with columns `Asset | Source | License | Used for`, with one row already filled: `Fonts: M PLUS Rounded 1c, Nunito, JetBrains Mono, VT323 | Google Fonts via next/font | SIL OFL 1.1 | UI typography`.

- [ ] **Step 12: Verify the toolchain**

Run: `yarn lint && yarn typecheck && yarn test && yarn build`
Expected: all pass; `yarn build` prints the `/` route as static (○).

- [ ] **Step 13: Initialize git and commit**

```bash
git init -b main
git add -A
git commit -m "chore: scaffold Next.js app with tooling and conventions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 2: Theme tokens, fonts, providers and root layout

Implements: design doc 04 "Typography", "Palette"; doc 02 "Rendering rules" (no theme flash), "Stack" (next-themes with `data-theme`).

**Files:**
- Create: `src/constants/fonts.ts`, `src/constants/site.ts`, `src/styles/globals.css`, `src/styles/globals.test.ts`, `src/components/templates/providers.tsx`
- Modify: `src/app/layout.tsx`
- Delete: `src/app/globals.css` (replaced by `src/styles/globals.css`)

**Interfaces:**
- Produces: CSS color tokens `paper`, `paper-2`, `ink`, `ink-muted`, `wood`, `wood-dark`, `mint`, `sky`, `peach`, `lavender`, `accent`, `accent-soft`, `on-accent` usable as Tailwind classes (`bg-paper`, `text-ink`…); font utilities `font-display`, `font-body`, `font-mono`, `font-pixel`; radius `rounded-frame`; class `.stitched`; `dark:` variant keyed on `[data-theme='night']`; `site` constant.
- Theme naming: next-themes keeps its internal names `light` / `dark` (system detection only yields those), and the `value` prop maps them to the DOM attribute `data-theme="day" | "night"`, exactly as design doc 04 specifies. Code that reads `resolvedTheme` sees `'light' | 'dark'`; CSS and the 3D scene use `day` / `night`.

- [ ] **Step 1: Write the failing token test**

```ts
// src/styles/globals.test.ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8')
const tokens = ['--paper', '--paper-2', '--ink', '--ink-muted', '--wood', '--wood-dark', '--mint', '--sky', '--peach', '--lavender', '--accent', '--accent-soft', '--on-accent', '--bg-top', '--bg-bottom']

describe('globals.css theme tokens', () => {
  it('defines every token for the light theme (:root)', () => {
    const root = css.split(':root')[1].split('}')[0]
    for (const t of tokens) expect(root).toContain(`${t}:`)
  })
  it('redefines every token for the night theme', () => {
    const night = css.split(`[data-theme='night']`)[1].split('}')[0]
    for (const t of tokens) expect(night).toContain(`${t}:`)
  })
  it('exposes tokens to Tailwind and keys the dark variant on data-theme', () => {
    expect(css).toContain('@theme inline')
    expect(css).toContain('--color-paper: var(--paper)')
    expect(css).toContain(`@custom-variant dark`)
  })
})
```
Run: `yarn test`
Expected: FAIL, `globals.css` not found in `src/styles`.

- [ ] **Step 2: Write `src/styles/globals.css`**

```css
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme='night'], [data-theme='night'] *));

:root {
  --bg-top: #f7e3c6;
  --bg-bottom: #efcfa8;
  --paper: #fff7e8;
  --paper-2: #f6e7cc;
  --ink: #4a3426;
  --ink-muted: #7a6252;
  --wood: #b9875a;
  --wood-dark: #7a5235;
  --mint: #9fd8c3;
  --sky: #a9d6f2;
  --peach: #ffc8a2;
  --lavender: #d9c8f0;
  --accent: #b8553a;
  --accent-soft: #d2694a;
  --on-accent: #ffffff;
}

[data-theme='night'] {
  --bg-top: #2b2238;
  --bg-bottom: #1e1828;
  --paper: #3a2f48;
  --paper-2: #463a56;
  --ink: #fff1dc;
  --ink-muted: #d9c7b0;
  --wood: #b9875a;
  --wood-dark: #7a5235;
  --mint: #7cc4ae;
  --sky: #24365c;
  --peach: #e0a98c;
  --lavender: #6e5c8f;
  --accent: #f2a65a;
  --accent-soft: #f2a65a;
  --on-accent: #2b2238;
}

@theme inline {
  --color-paper: var(--paper);
  --color-paper-2: var(--paper-2);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-wood: var(--wood);
  --color-wood-dark: var(--wood-dark);
  --color-mint: var(--mint);
  --color-sky: var(--sky);
  --color-peach: var(--peach);
  --color-lavender: var(--lavender);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-on-accent: var(--on-accent);
  --font-display: var(--font-mplus);
  --font-body: var(--font-nunito);
  --font-mono: var(--font-jetbrains);
  --font-pixel: var(--font-vt323);
  --radius-frame: 28px;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  background: linear-gradient(180deg, var(--bg-top), var(--bg-bottom)) fixed;
  color: var(--ink);
  font-family: var(--font-body);
  overflow: hidden; /* the page itself never scrolls; panels scroll inside */
}

.stitched {
  border: 2px dashed color-mix(in srgb, var(--wood) 40%, transparent);
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Write `src/constants/fonts.ts` and `src/constants/site.ts`**

```ts
// src/constants/fonts.ts
import { JetBrains_Mono, M_PLUS_Rounded_1c, Nunito, VT323 } from 'next/font/google'

export const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  variable: '--font-mplus',
  display: 'swap',
})
export const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' })
export const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })
export const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323', display: 'swap' })
```
```ts
// src/constants/site.ts
export const site = {
  name: 'Satriko Aditya',
  shortName: 'Satriko',
  title: 'Full Stack Engineer',
  location: 'Bogor, Indonesia',
  email: 'satrikoaditya@gmail.com',
  // Provided later (content checklist C3/C4/C18). Keep null until then; UI hides missing links.
  linkedin: null as string | null,
  github: null as string | null,
  url: 'https://example.com', // replaced by the real domain in Task 28
  resumePdf: '/resume/Satriko-Aditya-Resume.pdf',
} as const
```

- [ ] **Step 4: Write `src/components/templates/providers.tsx`**

```tsx
'use client'

import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem themes={['light', 'dark']} value={{ light: 'day', dark: 'night' }} disableTransitionOnChange>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}
```

- [ ] **Step 5: Rewrite `src/app/layout.tsx` and delete `src/app/globals.css`**

```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import Providers from '@components/templates/providers'

import { jetbrainsMono, mPlusRounded, nunito, vt323 } from '@constants/fonts'
import { site } from '@constants/site'

import '@styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} · ${site.title}`,
  description: `Step into Satriko's cozy room and explore 5+ years of full stack work with Node.js, TypeScript, React, Next.js and NestJS.`,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mPlusRounded.variable} ${nunito.variable} ${jetbrainsMono.variable} ${vt323.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```
Replace the generated `src/app/page.tsx` body with a temporary `<main className="p-8 font-display text-3xl">Satriko's Room</main>` (it is replaced in Task 6).

- [ ] **Step 6: Verify visually**

Run: `yarn dev`, open `http://localhost:3000`. In DevTools, set `<html data-theme="night">`: the background becomes plum, text cream. The heading uses the rounded display font. Then `yarn lint && yarn typecheck && yarn build`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add theme tokens, fonts and providers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 3: Section registry and interfaces

Implements: design doc 02 "Section registry", "Section slugs"; doc 05 "SEO copy"; doc 03 "Camera" (focus poses, initial values).

**Files:**
- Create: `src/interfaces/section.ts`, `src/interfaces/ui.ts`, `src/constants/sections.ts`, `src/constants/sections.test.ts`

**Interfaces:**
- Produces: everything listed under "Shared Interfaces → Types" and "→ Registry".

- [ ] **Step 1: Write the failing registry test**

```ts
// src/constants/sections.test.ts
import { describe, expect, it } from 'vitest'

import { isSectionSlug, sectionByObject, sectionBySlug, sectionSlugs, sections, slugFromPathname } from './sections'

describe('sections registry', () => {
  it('has the 11 sections in phone-menu order', () => {
    expect(sectionSlugs).toEqual(['about', 'experience', 'skills', 'education', 'gaming', 'travel', 'hiking', 'diving', 'remote-work', 'contact', 'resume'])
  })
  it('has unique slugs and unique objectIds', () => {
    expect(new Set(sections.map((s) => s.slug)).size).toBe(11)
    expect(new Set(sections.map((s) => s.objectId)).size).toBe(11)
  })
  it('gives every section a title, label, icon, camera pose and seo copy', () => {
    for (const s of sections) {
      expect(s.title.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.icon).toBeTypeOf('object')
      expect(s.cameraPose.zoomFactor).toBeGreaterThan(1)
      expect(s.seo.title).toContain('Satriko Aditya')
      expect(s.seo.description.length).toBeGreaterThan(20)
    }
  })
  it('looks sections up by slug, object and pathname', () => {
    expect(isSectionSlug('skills')).toBe(true)
    expect(isSectionSlug('nope')).toBe(false)
    expect(sectionBySlug('resume').objectId).toBe('printer')
    expect(sectionByObject('pc')?.slug).toBe('experience')
    expect(sectionByObject('oyen')).toBeUndefined()
    expect(slugFromPathname('/')).toBeNull()
    expect(slugFromPathname('/experience')).toBe('experience')
    expect(slugFromPathname('/experience/')).toBe('experience')
    expect(slugFromPathname('/unknown')).toBeNull()
  })
})
```
Run: `yarn test src/constants`
Expected: FAIL, module not found.

- [ ] **Step 2: Write the interfaces** (`src/interfaces/section.ts` and `src/interfaces/ui.ts` exactly as in "Shared Interfaces → Types").

- [ ] **Step 3: Write `src/constants/sections.ts`**

```ts
import { BookOpen, Clock, FileText, Gamepad2, GraduationCap, Mail, MapPin, Monitor, Mountain, UserRound, Waves } from 'lucide-react'

import type { ObjectId, Section, SectionSlug } from '@interfaces/section'

const by = (t: string) => `${t} · Satriko Aditya`

export const sections: readonly Section[] = [
  { slug: 'about', title: 'About me', label: 'About', icon: UserRound, objectId: 'photo-frame', theme: 'scrapbook',
    cameraPose: { target: [-0.9, 0.95, -4.1], offset: [3.2, 2.4, 3.2], zoomFactor: 2.6 },
    seo: { title: by('About'), description: 'Full stack engineer from Bogor, Indonesia, working remotely across Singapore and Abu Dhabi.' } },
  { slug: 'experience', title: 'Work experience', label: 'Experience', icon: Monitor, objectId: 'pc', theme: 'monitor',
    cameraPose: { target: [0, 1.3, -4.4], offset: [3.4, 2.6, 3.4], zoomFactor: 2.2 },
    seo: { title: by('Experience'), description: 'Full stack roles at Jitera, Charcentric and PT Immobi Solusi Prima.' } },
  { slug: 'skills', title: 'Skills', label: 'Skills', icon: BookOpen, objectId: 'bookshelf', theme: 'shelf',
    cameraPose: { target: [2.4, 1.4, -4.4], offset: [3.4, 2.4, 3.4], zoomFactor: 2.0 },
    seo: { title: by('Skills'), description: 'Node.js, TypeScript, React, Next.js, NestJS, React Native, PostgreSQL, AWS, Docker and more.' } },
  { slug: 'education', title: 'Education', label: 'Education', icon: GraduationCap, objectId: 'edu-frames', theme: 'frames',
    cameraPose: { target: [-4.8, 3.5, 2], offset: [3.6, 1.6, 3.0], zoomFactor: 2.2 },
    seo: { title: by('Education'), description: 'BSc Computer Science at BINUS, Hacktiv8 Honors Graduate, SMK Negeri 3 Bogor.' } },
  { slug: 'gaming', title: 'Gaming', label: 'Gaming', icon: Gamepad2, objectId: 'tv', theme: 'tv',
    cameraPose: { target: [-1.2, 0.9, 1.0], offset: [3.6, 2.2, 3.0], zoomFactor: 2.2 },
    seo: { title: by('Gaming'), description: 'What Satriko is playing right now.' } },
  { slug: 'travel', title: 'Travel', label: 'Travel', icon: MapPin, objectId: 'indonesia-map', theme: 'map',
    cameraPose: { target: [2.4, 3.9, -4.85], offset: [3.0, 1.4, 3.6], zoomFactor: 2.2 },
    seo: { title: by('Travel'), description: 'Places Satriko has explored around Indonesia.' } },
  { slug: 'hiking', title: 'Hiking', label: 'Hiking', icon: Mountain, objectId: 'hiking-gear', theme: 'journal',
    cameraPose: { target: [4.4, 0.5, -3.6], offset: [3.0, 2.4, 3.4], zoomFactor: 2.6 },
    seo: { title: by('Hiking'), description: 'Mountains and trails Satriko has hiked.' } },
  { slug: 'diving', title: 'Diving', label: 'Diving', icon: Waves, objectId: 'dive-gear', theme: 'logbook',
    cameraPose: { target: [-3.8, 0.6, -1.2], offset: [3.2, 2.4, 3.4], zoomFactor: 2.6 },
    seo: { title: by('Diving'), description: "Satriko's dive log." } },
  { slug: 'remote-work', title: 'Remote work', label: 'Remote work', icon: Clock, objectId: 'clocks', theme: 'clocks',
    cameraPose: { target: [0, 4.2, -4.85], offset: [3.0, 1.2, 3.6], zoomFactor: 2.4 },
    seo: { title: by('Remote work'), description: 'How Satriko works remotely across Bogor, Singapore and Abu Dhabi time zones.' } },
  { slug: 'contact', title: 'Contact', label: 'Contact', icon: Mail, objectId: 'mailbox', theme: 'envelope',
    cameraPose: { target: [3.4, 1.0, -4.85], offset: [3.0, 2.0, 3.6], zoomFactor: 2.8 },
    seo: { title: by('Contact'), description: 'Get in touch with Satriko by email, LinkedIn or GitHub.' } },
  { slug: 'resume', title: 'Resume', label: 'Resume', icon: FileText, objectId: 'printer', theme: 'paper',
    cameraPose: { target: [-2.2, 0.7, -4.3], offset: [3.4, 2.4, 3.4], zoomFactor: 2.6 },
    seo: { title: by('Resume'), description: "Download Satriko Aditya's resume (PDF)." } },
]

export const sectionSlugs: readonly SectionSlug[] = sections.map((s) => s.slug)

export function isSectionSlug(value: string): value is SectionSlug {
  return (sectionSlugs as readonly string[]).includes(value)
}

export function sectionBySlug(slug: SectionSlug): Section {
  const found = sections.find((s) => s.slug === slug)
  if (!found) throw new Error(`Unknown section: ${slug}`)
  return found
}

export function sectionByObject(objectId: ObjectId): Section | undefined {
  return sections.find((s) => s.objectId === objectId)
}

export function slugFromPathname(pathname: string): SectionSlug | null {
  const clean = pathname.replace(/\/+$/, '').replace(/^\//, '')
  return clean !== '' && isSectionSlug(clean) ? clean : null
}
```
Run: `yarn test src/constants`
Expected: PASS (4 tests).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add section registry and shared interfaces

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: Content models, content files and the skills "used at" mapping

Implements: design doc 05 (all panel content, verbatim CV facts, empty states, Oyen copy); doc 02 "Content layer".

**Files:**
- Create: `src/models/about.ts`, `src/models/job.ts`, `src/models/skill.ts`, `src/models/education.ts`, `src/models/game.ts`, `src/models/travel.ts`, `src/models/hike.ts`, `src/models/dive.ts`
- Create: `src/content/about.ts`, `experience.ts`, `skills.ts`, `education.ts`, `gaming.ts`, `travel.ts`, `hiking.ts`, `diving.ts`, `remoteWork.ts`, `contact.ts`, `resume.ts`, `oyen.ts`, `help.ts`
- Create: `src/utils/skills.ts`, `src/utils/skills.test.ts`, `src/content/content.test.ts`

**Interfaces:**
- Produces: the models below; named exports `about`, `jobs`, `skillShelves`, `education`, `games`, `travelPins`, `hikes`, `dives`, `remoteWork`, `contact`, `resume`, `oyenLines`, `helpContent`; `usedAt(skill, jobs)`.

- [ ] **Step 1: Write the models**

```ts
// src/models/about.ts
export interface IAbout {
  name: string; title: string; location: string
  photo: { src: string; alt: string } | null
  intro: string; summary: string; facts: string[]
}
// src/models/job.ts
export type JobId = 'jitera' | 'charcentric' | 'immobi' | 'ipb'
export interface IJob {
  id: JobId; company: string; role: string; kind: 'full-time' | 'internship'
  location: string; remote: boolean; start: string; end: string | 'present'
  highlights: { title: string; text: string }[]; tools: string[]
}
// src/models/skill.ts
export interface ISkillShelf { id: string; title: string; color: 'mint' | 'sky' | 'peach' | 'lavender' | 'wood'; skills: string[] }
// src/models/education.ts
export interface IEducation { id: string; program: string; institution: string; location: string; start: string; end: string | 'present'; note?: string; honors?: boolean }
// src/models/game.ts
export interface IGame { title: string; platform: string; cover: string | null; why: string; nowPlaying?: boolean }
// src/models/travel.ts
export interface ITravelPin { id: string; place: string; region: string; lat: number; lon: number; year: number; photos: { src: string; alt: string }[]; note: string }
// src/models/hike.ts
export interface IHike { id: string; name: string; location: string; elevationM: number; date: string; photos: { src: string; alt: string }[]; story: string }
// src/models/dive.ts
export interface IDive { id: string; site: string; location: string; maxDepthM: number; date: string; highlights: string; photos: { src: string; alt: string }[] }
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/utils/skills.test.ts
import { describe, expect, it } from 'vitest'

import { jobs } from '@content/experience'

import { usedAt } from './skills'

describe('usedAt', () => {
  it('lists companies in job order for a skill used in several jobs', () => {
    expect(usedAt('React.js', jobs)).toEqual(['Jitera', 'Charcentric', 'PT Immobi Solusi Prima'])
  })
  it('matches case-insensitively and returns an empty list for unused skills', () => {
    expect(usedAt('nestjs', jobs)).toEqual(['Jitera'])
    expect(usedAt('Vue.js', jobs)).toEqual([])
  })
})
```
```ts
// src/content/content.test.ts
import { describe, expect, it } from 'vitest'

import { about } from './about'
import { contact } from './contact'
import { education } from './education'
import { jobs } from './experience'
import { skillShelves } from './skills'

const forbidden = [/\+62/, /0851/, /Sugeng/, /Gilang/, /Fadel/, /Zaidan/]

describe('content', () => {
  it('has the four roles with exact dates', () => {
    expect(jobs.map((j) => [j.company, j.start, j.end])).toEqual([
      ['Jitera', '2024-10', 'present'],
      ['Charcentric', '2022-01', '2024-10'],
      ['PT Immobi Solusi Prima', '2020-12', '2021-12'],
      ['Institut Pertanian Bogor (IPB) University', '2019-01', '2019-05'],
    ])
  })
  it('has five skill shelves and the Hacktiv8 honors', () => {
    expect(skillShelves.map((s) => s.id)).toEqual(['languages', 'frontend', 'backend', 'devops', 'toolbox'])
    expect(education.find((e) => e.id === 'hacktiv8')?.honors).toBe(true)
  })
  it('never contains a phone number or referee details', () => {
    const blob = JSON.stringify({ about, contact, education, jobs, skillShelves })
    for (const re of forbidden) expect(blob).not.toMatch(re)
  })
})
```
Run: `yarn test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Write `src/content/experience.ts`** (text verbatim from the CV / design doc 05)

```ts
import type { IJob } from '@models/job'

export const jobs: readonly IJob[] = [
  {
    id: 'jitera', company: 'Jitera', role: 'Full Stack Developer', kind: 'full-time',
    location: 'Singapore', remote: true, start: '2024-10', end: 'present',
    highlights: [
      { title: 'Agile Collaboration and Coordination', text: 'Work closely with cross-functional teams, including managers, team leads, designers, QA, and developers, to align project objectives, ensure clear communication, and deliver high-quality solutions within set timelines.' },
      { title: 'Code Quality and Compliance', text: 'Perform in-depth code reviews and automated/manual testing to validate that software adheres to functional requirements, coding standards, and architectural best practices, ensuring seamless deployment readiness.' },
      { title: 'Security and Compliance', text: 'Ensure applications adhere to industry security standards and compliance requirements by implementing robust measures during the development lifecycle.' },
    ],
    tools: ['Git', 'Node.js', 'TypeScript', 'NestJS', 'React.js', 'Next.js', 'React Native', 'Tailwind', 'Zustand', 'Zod', 'TypeORM', 'MySQL', 'Supabase', 'AWS', 'Docker', 'Jira', 'Presentation and Public Speaking'],
  },
  {
    id: 'charcentric', company: 'Charcentric', role: 'Software Engineer', kind: 'full-time',
    location: 'Abu Dhabi, United Arab Emirates', remote: true, start: '2022-01', end: '2024-10',
    highlights: [
      { title: 'Software Lifecycle Management', text: 'Engage in researching, designing, and managing software programs, ensuring their seamless lifecycle progression.' },
      { title: 'Code Enhancement and Testing', text: 'Developing, modifying software to rectify errors and enhance performance, and rigorously test and evaluate new programs for optimal functionality.' },
      { title: 'Collaborative Development and Support', text: 'Collaborate with engineering staff, follow internal development processes, and communicate effectively within the team, clients, and stakeholders. Additionally, provide technical support to clients and monitor reported issues for swift resolution.' },
    ],
    tools: ['Git', 'Node.js', 'TypeScript', 'Python', 'React.js', 'Next.js', 'React Native', 'Ionic', 'Capacitor.js', 'Tailwind', 'Storybook', 'Prisma', 'PostgreSQL', 'AWS', 'Vercel', 'Sentry', 'Docker', 'Jira', 'Presentation and Public Speaking'],
  },
  {
    id: 'immobi', company: 'PT Immobi Solusi Prima', role: 'Full Stack Developer', kind: 'full-time',
    location: 'Jakarta, Indonesia', remote: false, start: '2020-12', end: '2021-12',
    highlights: [
      { title: 'Application Development for Internal Teams', text: "Spearheaded the design and development of applications tailored for Telkomsel's internal teams, focusing on user needs and seamless integration within the existing infrastructure." },
      { title: 'Collaborative Development', text: 'Worked closely with other engineers, sharing knowledge, and coordinating efforts to ensure cohesive development processes and successful project outcomes.' },
      { title: 'Performance Monitoring and Optimization', text: 'Ensured the consistent performance of applications through continuous monitoring and proactive optimization, addressing potential issues before they impact operations.' },
      { title: 'Error Resolution and Debugging', text: 'Led the debugging process, identifying, and resolving software issues to maintain application stability and reliability.' },
    ],
    tools: ['Git', 'Node.js', 'Express.js', 'Sequelize', 'PHP', 'Laravel', 'MySQL', 'React.js', 'Ext.js', 'Presentation and Public Speaking'],
  },
  {
    id: 'ipb', company: 'Institut Pertanian Bogor (IPB) University', role: 'Information Technology Support Engineer', kind: 'internship',
    location: 'Bogor, Indonesia', remote: false, start: '2019-01', end: '2019-05',
    highlights: [
      { title: 'Systems and Network Maintenance', text: 'Ensured the smooth operation of computers, applications, and LAN networks to support uninterrupted learning activities, minimizing downtime, and enhancing user experience.' },
      { title: 'Technical Troubleshooting and Support', text: 'Provided expert troubleshooting for hardware and network issues, quickly diagnosing and resolving problems to maintain optimal system performance.' },
      { title: 'Software and OS Installation', text: 'Managed the installation and configuration of applications and operating systems, ensuring that all systems were up-to-date and equipped to meet user requirements.' },
    ],
    tools: [],
  },
]
```

- [ ] **Step 4: Write the other content files**

```ts
// src/content/skills.ts
import type { ISkillShelf } from '@models/skill'

export const skillShelves: readonly ISkillShelf[] = [
  { id: 'languages', title: 'Languages & Runtimes', color: 'peach', skills: ['Node.js', 'TypeScript', 'PHP', 'Python'] },
  { id: 'frontend', title: 'Frontend', color: 'sky', skills: ['React.js', 'Redux', 'Next.js', 'React Native', 'Ionic', 'Vue.js'] },
  { id: 'backend', title: 'Backend & Data', color: 'mint', skills: ['NestJS', 'Express.js', 'Laravel', 'GraphQL', 'Redis', 'MySQL', 'PostgreSQL', 'MongoDB'] },
  { id: 'devops', title: 'DevOps & Cloud', color: 'lavender', skills: ['Docker', 'AWS', 'Vercel', 'Sentry'] },
  { id: 'toolbox', title: 'Toolbox', color: 'wood', skills: ['Tailwind', 'Zustand', 'Zod', 'TypeORM', 'Prisma', 'Sequelize', 'Supabase', 'Storybook', 'Capacitor.js', 'Ext.js', 'Git', 'Jira'] },
]
/** Appears in every job's tool list; shown as a shelf bookend (design doc 05, proposal pending C8). */
export const SOFT_SKILL = 'Presentation and Public Speaking'
/** Skills in the CV that no job lists; labelled until checklist item C6 decides otherwise. */
export const UNLINKED_SKILL_LABEL = 'Side projects & learning'
```
```ts
// src/content/education.ts
import type { IEducation } from '@models/education'

export const education: readonly IEducation[] = [
  { id: 'binus', program: "Computer Science, Bachelor's degree", institution: 'BINUS (Bina Nusantara) University (Online Program)', location: 'Jakarta, Indonesia', start: '2023-05', end: 'present', note: 'In progress' },
  { id: 'hacktiv8', program: 'Immersive Full Stack JavaScript', institution: 'Hacktiv8', location: 'Jakarta, Indonesia', start: '2020-07', end: '2020-10', note: 'Honors Graduate, final score 94.79/100', honors: true },
  { id: 'smkn3', program: 'Computer & Network Engineering', institution: 'SMK Negeri 3 Bogor', location: 'Bogor, Indonesia', start: '2017-07', end: '2020-07', note: 'Final score 84/100' },
]
```
```ts
// src/content/about.ts
import type { IAbout } from '@models/about'

export const about: IAbout = {
  name: 'Satriko Aditya',
  title: 'Full Stack Software Engineer',
  location: 'Bogor, Indonesia',
  photo: null, // checklist C1: set to { src: '/images/about/satriko.jpg', alt: 'Satriko Aditya' }
  intro: "Hi, I'm Satriko! I'm a full stack engineer from Bogor who loves building fast, friendly web and mobile apps with TypeScript, React, Next.js and NestJS. When I'm not coding you'll find me gaming, hiking a mountain, diving somewhere blue, or exploring Indonesia.",
  summary: "Full Stack Software Engineer with 5+ years of professional experience specializing in Node.js, TypeScript, React.js, Next.js, and NestJS. Strong background in building, optimizing, and maintaining scalable web and mobile applications. Currently pursuing a Bachelor's degree in Computer Science at BINUS University. Passionate about continuous learning and delivering high-quality solutions in collaborative, and fast paced environments.",
  facts: ['5+ years experience', 'Remote across 3 time zones (Bogor, Singapore, Abu Dhabi)', 'Currently: Full Stack Developer @ Jitera', 'Studying: BSc Computer Science @ BINUS'],
}
```
```ts
// src/content/gaming.ts
import type { IGame } from '@models/game'
export const games: readonly IGame[] = [] // checklist C10
export const platforms: readonly string[] = []

// src/content/travel.ts
import type { ITravelPin } from '@models/travel'
export const travelPins: readonly ITravelPin[] = [] // checklist C11

// src/content/hiking.ts
import type { IHike } from '@models/hike'
export const hikes: readonly IHike[] = [] // checklist C12

// src/content/diving.ts
import type { IDive } from '@models/dive'
export const dives: readonly IDive[] = [] // checklist C13
export const certification: string | null = null
```
```ts
// src/content/remoteWork.ts
export const remoteWork = {
  note: "I've worked remotely for teams in Singapore and Abu Dhabi from my desk in Bogor. I keep a few hours of overlap every day, write things down, and keep the async updates flowing.", // checklist C14
}

// src/content/contact.ts
import { site } from '@constants/site'
export const contact = {
  email: site.email,
  linkedin: site.linkedin,
  github: site.github,
  references: 'References available on request.',
}

// src/content/resume.ts
import { site } from '@constants/site'
export const resume = {
  pdf: site.resumePdf, // checklist C5: public PDF without phone number or referees
  topSkills: ['Node.js', 'TypeScript', 'React.js', 'Next.js', 'NestJS', 'React Native', 'PostgreSQL', 'MySQL', 'AWS', 'Docker'],
}

// src/content/oyen.ts
export const oyenLines = {
  greeting: "Meow! I'm Oyen. Welcome to Satriko's room! Click anything that looks interesting.",
  hints: ["Psst… try the PC. That's where the work stuff lives.", "The bookshelf has all of Satriko's skills!", "Need the resume? The printer's warmed up."],
  chatter: [
    'Satriko worked remotely for Singapore and Abu Dhabi, all from this desk.',
    'Flip the light switch for night mode. I nap better that way.',
    'Turn on the radio if you want some cozy tunes.',
    "Use the phone if you're in a hurry. I won't be offended. Much.",
    'The window shows the real sky in Bogor right now.',
  ],
  sleeping: 'Zzz… (Oyen is asleep. Maybe check the map instead?)',
  empty: {
    gaming: 'Oyen is still choosing a game… check back soon!',
    travel: 'Oyen is still pinning the map… check back soon!',
    hiking: 'Oyen is still sorting the trail photos… check back soon!',
    diving: 'Oyen is drying off the dive photos… check back soon!',
  },
} as const

// src/content/help.ts
export const helpContent = {
  explore: ['Hover an object to see what it is, click it to open.', 'On a phone: drag to look around, pinch to zoom, tap a tag to open.', 'Use the phone button for a menu of every section.'],
  keyboard: ['Tab moves between controls.', 'Enter opens, Esc closes.', 'Arrow keys move around the phone menu.'],
  sound: 'Sound is off by default. The radio or the speaker button turns it on.',
  credits: [
    { name: 'KayKit Furniture Bits', by: 'Kay Lousberg', url: 'https://kaylousberg.itch.io/furniture-bits', license: 'CC0' },
    { name: 'Kenney assets', by: 'Kenney', url: 'https://kenney.nl', license: 'CC0' },
    { name: 'Fonts', by: 'Google Fonts', url: 'https://fonts.google.com', license: 'SIL OFL' },
  ],
}
```

- [ ] **Step 5: Implement `src/utils/skills.ts`**

```ts
import type { IJob } from '@models/job'

export function usedAt(skill: string, jobs: readonly IJob[]): string[] {
  const needle = skill.toLowerCase()
  return jobs.filter((job) => job.tools.some((t) => t.toLowerCase() === needle)).map((job) => job.company)
}
```
Run: `yarn test`
Expected: PASS (all).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add content models, content files and skills mapping

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: The 11 panels, EmptyState and CopyEmailButton (pure, server-safe)

Implements: design doc 04 "Themed interiors", "Empty states"; doc 05 panel contents.

**Files:**
- Create: `src/components/atoms/Chip/index.tsx`, `src/components/atoms/StitchedLabel/index.tsx`, `src/components/atoms/Button/index.tsx`
- Create: `src/components/molecules/EmptyState/index.tsx`, `src/components/molecules/CopyEmailButton/index.tsx`, `src/components/molecules/CopyEmailButton/CopyEmailButton.test.tsx`, `src/components/molecules/SkillBook/index.tsx`, `src/components/molecules/CertificateFrame/index.tsx`
- Create: `src/components/organisms/AboutPanel/index.tsx`, `ExperiencePanel/index.tsx` + `ExperiencePanel/useExperiencePanel.ts` + `ExperiencePanel/CompanySidebar.tsx`, `SkillsPanel/index.tsx` + `SkillsPanel/useSkillsPanel.ts`, `EducationPanel/index.tsx`, `GamingPanel/index.tsx`, `TravelPanel/index.tsx`, `HikingPanel/index.tsx`, `DivingPanel/index.tsx`, `RemoteWorkPanel/index.tsx`, `ContactPanel/index.tsx`, `ResumePanel/index.tsx`
- Create: `src/components/organisms/panels.test.tsx`

**Interfaces:**
- Produces: `Button { variant?: 'primary' | 'ghost'; href?: string; ...ButtonHTMLAttributes }` (renders `<a>` when `href`), `Chip { children; color?: ShelfColor }`, `StitchedLabel { children; className? }`, `EmptyState { message }`, `CopyEmailButton { email }`, `SkillBook { skill; color; usedAt: string[]; unlinkedLabel: string }`, `CertificateFrame { item: IEducation }`, and each panel as `default export function <X>Panel(props?)` with optional content props defaulting to the content files (e.g. `ExperiencePanel({ jobs = defaultJobs })`).
- Consumes: content exports from Task 4, `cn`.

- [ ] **Step 1: Write the failing panel tests**

```tsx
// src/components/organisms/panels.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AboutPanel from './AboutPanel'
import ContactPanel from './ContactPanel'
import DivingPanel from './DivingPanel'
import EducationPanel from './EducationPanel'
import ExperiencePanel from './ExperiencePanel'
import GamingPanel from './GamingPanel'
import HikingPanel from './HikingPanel'
import ResumePanel from './ResumePanel'
import SkillsPanel from './SkillsPanel'
import TravelPanel from './TravelPanel'

describe('panels', () => {
  it('ExperiencePanel lists the four roles and shows the first one', () => {
    render(<ExperiencePanel />)
    expect(screen.getByRole('button', { name: /jitera/i })).toBeInTheDocument()
    expect(screen.getByText(/Agile Collaboration and Coordination/)).toBeInTheDocument()
    expect(screen.getByText('Remote · Singapore')).toBeInTheDocument()
  })
  it('SkillsPanel renders five shelves and derives "Used at"', () => {
    render(<SkillsPanel />)
    expect(screen.getAllByRole('list', { name: /shelf/i })).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'NestJS' })).toBeInTheDocument()
  })
  it('EducationPanel marks Hacktiv8 as honors', () => {
    render(<EducationPanel />)
    expect(screen.getByText(/Honors Graduate/)).toBeInTheDocument()
  })
  it('hobby panels show the empty state when there is no content', () => {
    render(<GamingPanel />)
    expect(screen.getByText(/Oyen is still choosing a game/)).toBeInTheDocument()
    render(<TravelPanel />)
    expect(screen.getByText(/Oyen is still pinning the map/)).toBeInTheDocument()
    render(<HikingPanel />)
    expect(screen.getByText(/trail photos/)).toBeInTheDocument()
    render(<DivingPanel />)
    expect(screen.getByText(/dive photos/)).toBeInTheDocument()
  })
  it('ContactPanel shows the email and hides missing links', () => {
    render(<ContactPanel />)
    expect(screen.getByText('satrikoaditya@gmail.com')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /linkedin/i })).toBeNull()
    expect(screen.getByText('References available on request.')).toBeInTheDocument()
  })
  it('ResumePanel links to the PDF and AboutPanel shows the intro', () => {
    render(<ResumePanel />)
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', '/resume/Satriko-Aditya-Resume.pdf')
    render(<AboutPanel />)
    expect(screen.getByText(/Hi, I'm Satriko!/)).toBeInTheDocument()
  })
})
```
```tsx
// src/components/molecules/CopyEmailButton/CopyEmailButton.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CopyEmailButton from '.'

describe('CopyEmailButton', () => {
  it('copies the email and shows "Copied!"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CopyEmailButton email="satrikoaditya@gmail.com" />)
    await userEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(writeText).toHaveBeenCalledWith('satrikoaditya@gmail.com')
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })
  it('falls back to a hint when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined })
    render(<CopyEmailButton email="satrikoaditya@gmail.com" />)
    await userEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText(/⌘\/Ctrl\+C/)).toBeInTheDocument()
  })
})
```
Run: `yarn test`
Expected: FAIL, modules not found.

- [ ] **Step 2: Write the atoms**

```tsx
// src/components/atoms/Button/index.tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@components/shadcn/utils'

type Variant = 'primary' | 'ghost'
type Common = { variant?: Variant; className?: string; children: ReactNode }
export type ButtonProps = Common & (({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>))

const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-display text-[15px] font-bold transition-transform active:scale-95'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent shadow-md hover:brightness-105',
  ghost: 'bg-paper-2 text-ink hover:bg-paper',
}

export default function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], className)
  if ('href' in rest && rest.href) {
    const { href, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    return <a href={href} className={classes} {...a}>{children}</a>
  }
  return <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
}
```
```tsx
// src/components/atoms/Chip/index.tsx
import type { ReactNode } from 'react'
import { cn } from '@components/shadcn/utils'
import type { ISkillShelf } from '@models/skill'

const colors: Record<ISkillShelf['color'], string> = { mint: 'bg-mint', sky: 'bg-sky', peach: 'bg-peach', lavender: 'bg-lavender', wood: 'bg-wood text-on-accent' }
export default function Chip({ children, color = 'peach', className }: { children: ReactNode; color?: ISkillShelf['color']; className?: string }) {
  return <span className={cn('inline-block rounded-full px-3 py-1 font-display text-sm font-bold text-ink', colors[color], className)}>{children}</span>
}
```
```tsx
// src/components/atoms/StitchedLabel/index.tsx
import type { ReactNode } from 'react'
import { cn } from '@components/shadcn/utils'
export default function StitchedLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('stitched inline-flex items-center gap-2 rounded-xl bg-paper-2 px-3 py-1 font-display font-bold text-ink shadow-sm', className)}>{children}</span>
}
```

- [ ] **Step 3: Write the molecules**

```tsx
// src/components/molecules/EmptyState/index.tsx
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-ink-muted">
      <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden="true"><ellipse cx="36" cy="40" rx="26" ry="12" fill="#F2A03D" /><circle cx="36" cy="22" r="14" fill="#F2A03D" /><path d="M24 12l4-10 8 8zM48 12l-4-10-8 8z" fill="#F2A03D" /><circle cx="31" cy="21" r="2" fill="#4A3426" /><circle cx="41" cy="21" r="2" fill="#4A3426" /></svg>
      <p className="font-display text-lg">{message}</p>
    </div>
  )
}
```
```tsx
// src/components/molecules/CopyEmailButton/index.tsx
'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Button from '@components/atoms/Button'

export default function CopyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle')
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('fallback')
    }
    setTimeout(() => setState('idle'), 2500)
  }
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button variant="ghost" onClick={copy} aria-label="Copy email">{state === 'copied' ? <Check size={18} /> : <Copy size={18} />} Copy</Button>
      <span role="status" className="text-sm text-ink-muted">{state === 'copied' ? 'Copied!' : state === 'fallback' ? 'Select the address and press ⌘/Ctrl+C to copy' : ''}</span>
    </span>
  )
}
```
```tsx
// src/components/molecules/SkillBook/index.tsx
'use client'
import { useState } from 'react'
import Chip from '@components/atoms/Chip'
import { cn } from '@components/shadcn/utils'
import type { ISkillShelf } from '@models/skill'

export default function SkillBook({ skill, color, usedAt, unlinkedLabel }: { skill: string; color: ISkillShelf['color']; usedAt: string[]; unlinkedLabel: string }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('min-h-11 rounded-t-md rounded-b-sm border-b-4 border-wood-dark/40 px-2 py-3 font-display text-sm font-bold text-ink shadow-sm transition-transform hover:-translate-y-1', { mint: 'bg-mint', sky: 'bg-sky', peach: 'bg-peach', lavender: 'bg-lavender', wood: 'bg-wood text-on-accent' }[color])}>
        {skill}
      </button>
      {open && (
        <div role="note" className="stitched absolute left-0 top-full z-10 mt-1 w-max max-w-64 rounded-xl bg-paper p-3 text-sm shadow-md">
          <p className="mb-1 font-bold">Used at</p>
          {usedAt.length ? <ul className="flex flex-wrap gap-1">{usedAt.map((c) => <li key={c}><Chip color={color}>{c}</Chip></li>)}</ul> : <p className="text-ink-muted">{unlinkedLabel}</p>}
        </div>
      )}
    </li>
  )
}
```
```tsx
// src/components/molecules/CertificateFrame/index.tsx
import type { IEducation } from '@models/education'
export default function CertificateFrame({ item }: { item: IEducation }) {
  return (
    <li className="rounded-xl border-8 border-wood bg-paper p-4 shadow-md">
      <p className="font-display text-lg font-extrabold">{item.program}</p>
      <p className="text-ink-muted">{item.institution} · {item.location}</p>
      <p className="text-sm">{item.start} – {item.end === 'present' ? 'Present' : item.end}</p>
      {item.note && <p className={item.honors ? 'mt-2 inline-block rounded-full bg-accent px-3 py-1 font-display text-sm font-bold text-on-accent' : 'mt-2 text-sm'}>{item.honors ? '🎀 ' : ''}{item.note}</p>}
    </li>
  )
}
```

- [ ] **Step 4: Write the panels** (each default-exports a component whose root is a `<div>`; no fixed heights; no browser APIs except where marked `'use client'`)

```tsx
// src/components/organisms/ExperiencePanel/useExperiencePanel.ts
'use client'
import { useState } from 'react'
import type { IJob, JobId } from '@models/job'

export function formatRange(job: IJob) {
  const f = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${f(job.start)} – ${job.end === 'present' ? 'Present' : f(job.end)}`
}
export function useExperiencePanel(jobs: readonly IJob[]) {
  const [selectedId, setSelectedId] = useState<JobId>(jobs[0].id)
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0]
  return { selected, selectedId, setSelectedId }
}
```
```tsx
// src/components/organisms/ExperiencePanel/CompanySidebar.tsx
import { cn } from '@components/shadcn/utils'
import type { IJob, JobId } from '@models/job'
export default function CompanySidebar({ jobs, selectedId, onSelect }: { jobs: readonly IJob[]; selectedId: JobId; onSelect: (id: JobId) => void }) {
  return (
    <ul className="flex gap-2 overflow-x-auto sm:flex-col" aria-label="Companies">
      {jobs.map((job) => (
        <li key={job.id}>
          <button type="button" aria-pressed={job.id === selectedId} onClick={() => onSelect(job.id)} className={cn('min-h-11 w-full rounded-lg px-3 py-2 text-left font-mono text-sm', job.id === selectedId ? 'bg-sky text-ink' : 'hover:bg-paper-2')}>
            📄 {job.id}.md
            <span className="block font-body text-xs text-ink-muted">{job.company}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
```
```tsx
// src/components/organisms/ExperiencePanel/index.tsx
'use client'
import Chip from '@components/atoms/Chip'
import { jobs as defaultJobs } from '@content/experience'
import type { IJob } from '@models/job'
import CompanySidebar from './CompanySidebar'
import { formatRange, useExperiencePanel } from './useExperiencePanel'

export default function ExperiencePanel({ jobs = defaultJobs }: { jobs?: readonly IJob[] }) {
  const { selected, selectedId, setSelectedId } = useExperiencePanel(jobs)
  return (
    <div className="rounded-2xl border-[10px] border-ink/80 bg-paper p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-accent" /><span className="h-3 w-3 rounded-full bg-peach" /><span className="h-3 w-3 rounded-full bg-mint" /><span className="ml-2 font-mono text-xs text-ink-muted">~/experience</span></div>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <CompanySidebar jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />
        <article aria-live="polite">
          <h3 className="font-display text-2xl font-extrabold">{selected.role}</h3>
          <p className="font-bold">{selected.company}{selected.kind === 'internship' ? ' · Internship' : ''}</p>
          <p className="text-ink-muted">{selected.remote ? `Remote · ${selected.location}` : selected.location} · {formatRange(selected)}</p>
          <ul className="my-4 space-y-3">{selected.highlights.map((h) => <li key={h.title}><strong>{h.title}:</strong> {h.text}</li>)}</ul>
          {selected.tools.length > 0 && <ul className="flex flex-wrap gap-2" aria-label="Tools">{selected.tools.map((t) => <li key={t}><Chip color="sky">{t}</Chip></li>)}</ul>}
        </article>
      </div>
    </div>
  )
}
```
```tsx
// src/components/organisms/SkillsPanel/useSkillsPanel.ts
import { jobs } from '@content/experience'
import type { ISkillShelf } from '@models/skill'
import { usedAt } from '@utils/skills'
export function shelvesWithUsage(shelves: readonly ISkillShelf[]) {
  return shelves.map((shelf) => ({ ...shelf, books: shelf.skills.map((skill) => ({ skill, usedAt: usedAt(skill, jobs) })) }))
}
```
```tsx
// src/components/organisms/SkillsPanel/index.tsx
import SkillBook from '@components/molecules/SkillBook'
import { SOFT_SKILL, UNLINKED_SKILL_LABEL, skillShelves as defaultShelves } from '@content/skills'
import { jobs } from '@content/experience'
import type { ISkillShelf } from '@models/skill'
import { usedAt } from '@utils/skills'
import { shelvesWithUsage } from './useSkillsPanel'

export default function SkillsPanel({ shelves = defaultShelves }: { shelves?: readonly ISkillShelf[] }) {
  return (
    <div className="space-y-6">
      {shelvesWithUsage(shelves).map((shelf) => (
        <section key={shelf.id}>
          <h3 className="mb-2 font-display text-lg font-extrabold">{shelf.title}</h3>
          <ul aria-label={`${shelf.title} shelf`} className="flex flex-wrap items-end gap-1 rounded-b-lg border-b-8 border-wood bg-paper-2 p-2">
            {shelf.books.map((b) => <SkillBook key={b.skill} skill={b.skill} color={shelf.color} usedAt={b.usedAt} unlinkedLabel={UNLINKED_SKILL_LABEL} />)}
          </ul>
        </section>
      ))}
      <p className="text-sm text-ink-muted">Bookend: <strong>{SOFT_SKILL}</strong> · {usedAt(SOFT_SKILL, jobs).join(', ')}</p>
    </div>
  )
}
```
```tsx
// src/components/organisms/EducationPanel/index.tsx
import CertificateFrame from '@components/molecules/CertificateFrame'
import { education as defaultEducation } from '@content/education'
import type { IEducation } from '@models/education'
export default function EducationPanel({ items = defaultEducation }: { items?: readonly IEducation[] }) {
  return <ul className="grid gap-4 sm:grid-cols-3">{items.map((e) => <CertificateFrame key={e.id} item={e} />)}</ul>
}
```
```tsx
// src/components/organisms/AboutPanel/index.tsx
import Chip from '@components/atoms/Chip'
import { about as defaultAbout } from '@content/about'
import type { IAbout } from '@models/about'
export default function AboutPanel({ content = defaultAbout }: { content?: IAbout }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <figure className="rotate-[-2deg] rounded-lg bg-paper p-2 shadow-md">
        {content.photo ? <img src={content.photo.src} alt={content.photo.alt} width={220} height={220} className="rounded" /> : <div aria-hidden="true" className="flex aspect-square items-center justify-center rounded bg-peach font-display text-6xl">🐾</div>}
        <figcaption className="pt-2 text-center font-display font-bold">{content.name}</figcaption>
      </figure>
      <div>
        <p className="font-display text-xl font-extrabold">{content.title} · {content.location}</p>
        <p className="my-3 text-lg">{content.intro}</p>
        <ul className="mb-3 flex flex-wrap gap-2">{content.facts.map((f) => <li key={f}><Chip color="mint">{f}</Chip></li>)}</ul>
        <p className="text-ink-muted">{content.summary}</p>
      </div>
    </div>
  )
}
```
```tsx
// src/components/organisms/GamingPanel/index.tsx
import EmptyState from '@components/molecules/EmptyState'
import { games as defaultGames } from '@content/gaming'
import { oyenLines } from '@content/oyen'
import type { IGame } from '@models/game'
export default function GamingPanel({ games = defaultGames }: { games?: readonly IGame[] }) {
  return (
    <div className="rounded-2xl border-[12px] border-ink/80 bg-[#0d0f1a] p-4 font-pixel text-xl text-mint">
      <p className="mb-3">▶ SELECT GAME</p>
      {games.length === 0 ? <EmptyState message={oyenLines.empty.gaming} /> : (
        <ul className="grid gap-3 sm:grid-cols-3">{games.map((g) => <li key={g.title} className="rounded bg-ink/60 p-3">{g.cover && <img src={g.cover} alt="" className="mb-2 w-full rounded" />}<p>{g.nowPlaying ? '★ ' : ''}{g.title}</p><p className="text-base text-paper">{g.platform} · {g.why}</p></li>)}</ul>
      )}
    </div>
  )
}
```
```tsx
// src/components/organisms/TravelPanel/index.tsx  (map drawing is added in Task 16; this version lists pins)
import EmptyState from '@components/molecules/EmptyState'
import { oyenLines } from '@content/oyen'
import { travelPins as defaultPins } from '@content/travel'
import type { ITravelPin } from '@models/travel'
export default function TravelPanel({ pins = defaultPins }: { pins?: readonly ITravelPin[] }) {
  return pins.length === 0 ? <EmptyState message={oyenLines.empty.travel} /> : (
    <ul className="grid gap-3 sm:grid-cols-2">{pins.map((p) => <li key={p.id} className="rounded-xl bg-paper-2 p-3"><p className="font-display font-bold">{p.place} · {p.year}</p><p className="text-sm text-ink-muted">{p.region}</p><p>{p.note}</p></li>)}</ul>
  )
}
```
`HikingPanel` and `DivingPanel` follow the same shape as `TravelPanel` with `hikes` / `dives` (`IHike`: name, location, `${elevationM} m`, date, story; `IDive`: site, location, `${maxDepthM} m`, date, highlights, plus a line "Certification: {certification}" when not null) and the `oyenLines.empty.hiking` / `.diving` messages.
```tsx
// src/components/organisms/RemoteWorkPanel/index.tsx  (live clocks + overlap bar are added in Task 21)
import { remoteWork } from '@content/remoteWork'
import { clockZones } from '@constants/timezones'
export default function RemoteWorkPanel() {
  return (
    <div>
      <ul className="mb-4 grid gap-3 sm:grid-cols-3">{clockZones.map((z) => <li key={z.id} className="rounded-xl bg-paper-2 p-3 text-center font-display font-bold">{z.city}<span className="block text-sm text-ink-muted">{z.timeZone}</span></li>)}</ul>
      <p>{remoteWork.note}</p>
    </div>
  )
}
```
Create `src/constants/timezones.ts` now (values from "Shared Interfaces → Constants").
```tsx
// src/components/organisms/ContactPanel/index.tsx
import Button from '@components/atoms/Button'
import CopyEmailButton from '@components/molecules/CopyEmailButton'
import { contact as defaultContact } from '@content/contact'
export default function ContactPanel({ content = defaultContact }: { content?: typeof defaultContact }) {
  return (
    <div className="stitched rounded-xl bg-paper-2 p-6">
      <p className="font-display text-lg font-extrabold">Dear visitor,</p>
      <p className="my-3">The best way to reach me is email:</p>
      <p className="font-mono text-lg">{content.email}</p>
      <div className="my-4 flex flex-wrap gap-3">
        <CopyEmailButton email={content.email} />
        <Button href={`mailto:${content.email}`}>Send email</Button>
        {content.linkedin && <Button variant="ghost" href={content.linkedin} target="_blank" rel="noreferrer">LinkedIn</Button>}
        {content.github && <Button variant="ghost" href={content.github} target="_blank" rel="noreferrer">GitHub</Button>}
      </div>
      <p className="text-ink-muted">{content.references}</p>
    </div>
  )
}
```
```tsx
// src/components/organisms/ResumePanel/index.tsx
import Button from '@components/atoms/Button'
import Chip from '@components/atoms/Chip'
import { about } from '@content/about'
import { jobs } from '@content/experience'
import { resume as defaultResume } from '@content/resume'
import { formatRange } from '@components/organisms/ExperiencePanel/useExperiencePanel'
export default function ResumePanel({ content = defaultResume }: { content?: typeof defaultResume }) {
  return (
    <div className="bg-paper p-6 shadow-inner">
      <h3 className="font-display text-2xl font-extrabold">{about.name}</h3>
      <p className="text-ink-muted">{about.title} · {about.location}</p>
      <p className="my-3">{about.summary}</p>
      <ul className="mb-3 space-y-1">{jobs.map((j) => <li key={j.id}><strong>{j.role}</strong>, {j.company} · {formatRange(j)}</li>)}</ul>
      <ul className="mb-4 flex flex-wrap gap-2">{content.topSkills.map((s) => <li key={s}><Chip>{s}</Chip></li>)}</ul>
      <Button href={content.pdf} download>Download PDF</Button>
    </div>
  )
}
```
Run: `yarn test`
Expected: PASS (all panel and CopyEmailButton tests).

- [ ] **Step 5: Lint, typecheck, commit**

Run: `yarn lint && yarn typecheck`
```bash
git add -A
git commit -m "feat: add the eleven content panels with empty states

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 6: Catch-all route, Room page shell, 404/500, sitemap and robots

Implements: design doc 02 "Routing", "Rendering rules"; doc 07 "SEO" (metadata per route, sitemap, robots).

**Files:**
- Create: `src/app/[[...section]]/page.tsx`, `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`
- Create: `src/components/pages/Room/index.tsx`, `src/components/pages/Page404/index.tsx`, `src/components/pages/Page500/index.tsx`, `src/components/organisms/ModalHost/panels.ts`, `src/components/organisms/ModalHost/index.tsx` (static v1), `src/components/organisms/SectionNav/index.tsx`, `src/components/molecules/Poster/index.tsx`, `src/hooks/useActiveSection.ts`
- Delete: `src/app/page.tsx`

**Interfaces:**
- Produces: `panelComponents: Record<SectionSlug, ComponentType>`; `useActiveSection()`; `<Room initialSection>`; `<Poster />` (gradient placeholder + `<img src="/poster/room-day.webp">` hidden on error); `<SectionNav />` (visually hidden `<nav>` of real links, kept permanently for no-JS/SEO).
- `ModalHost` v1 renders the active panel inside `<section aria-labelledby>` with a close link; Task 9 replaces its internals.

- [ ] **Step 1: Write the route**

```tsx
// src/app/[[...section]]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Room from '@components/pages/Room'

import { isSectionSlug, sectionBySlug, sectionSlugs } from '@constants/sections'
import { site } from '@constants/site'

type Params = { section?: string[] }
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return [{ section: [] }, ...sectionSlugs.map((s) => ({ section: [s] }))]
}

function resolve(section?: string[]) {
  if (!section || section.length === 0) return null
  if (section.length === 1 && isSectionSlug(section[0])) return section[0]
  return undefined // unknown
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const slug = resolve((await params).section)
  if (slug === undefined) return {}
  const base = { openGraph: { images: ['/poster/og.png'] }, twitter: { card: 'summary_large_image' as const } }
  if (slug === null) return { ...base, alternates: { canonical: '/' } }
  const s = sectionBySlug(slug)
  return { ...base, title: s.seo.title, description: s.seo.description, alternates: { canonical: `/${slug}` }, openGraph: { ...base.openGraph, title: s.seo.title, description: s.seo.description, url: `${site.url}/${slug}` } }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const slug = resolve((await params).section)
  if (slug === undefined) notFound()
  return <Room initialSection={slug} />
}
```
(Next 16 makes `params` a Promise in both `page` and `generateMetadata`; `dynamicParams = false` works because the app was scaffolded with `--no-cache-components`. If Cache Components ever gets turned on, `dynamicParams` is unavailable and unknown slugs must be rejected with `notFound()` alone, as `resolve()` already does.)

- [ ] **Step 2: Write the hook, nav, poster, panel map and ModalHost v1**

```ts
// src/hooks/useActiveSection.ts
'use client'
import { usePathname } from 'next/navigation'
import { slugFromPathname } from '@constants/sections'
export function useActiveSection() {
  return slugFromPathname(usePathname() ?? '/')
}
```
```tsx
// src/components/organisms/SectionNav/index.tsx
import { sections } from '@constants/sections'
export default function SectionNav() {
  return (
    <nav aria-label="Sections" className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:left-2 focus-within:top-2 focus-within:z-50 focus-within:rounded-xl focus-within:bg-paper focus-within:p-3">
      <ul>{sections.map((s) => <li key={s.slug}><a href={`/${s.slug}`}>{s.label}</a></li>)}</ul>
    </nav>
  )
}
```
```tsx
// src/components/molecules/Poster/index.tsx
'use client'
import { useState } from 'react'
export default function Poster() {
  const [broken, setBroken] = useState(false)
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--paper-2),transparent_70%)]">
      {!broken && <img src="/poster/room-day.webp" alt="" onError={() => setBroken(true)} className="h-full w-full object-contain" />}
    </div>
  )
}
```
```ts
// src/components/organisms/ModalHost/panels.ts
import type { ComponentType } from 'react'
import AboutPanel from '@components/organisms/AboutPanel'
import ContactPanel from '@components/organisms/ContactPanel'
import DivingPanel from '@components/organisms/DivingPanel'
import EducationPanel from '@components/organisms/EducationPanel'
import ExperiencePanel from '@components/organisms/ExperiencePanel'
import GamingPanel from '@components/organisms/GamingPanel'
import HikingPanel from '@components/organisms/HikingPanel'
import RemoteWorkPanel from '@components/organisms/RemoteWorkPanel'
import ResumePanel from '@components/organisms/ResumePanel'
import SkillsPanel from '@components/organisms/SkillsPanel'
import TravelPanel from '@components/organisms/TravelPanel'
import type { SectionSlug } from '@interfaces/section'
export const panelComponents: Record<SectionSlug, ComponentType> = {
  about: AboutPanel, experience: ExperiencePanel, skills: SkillsPanel, education: EducationPanel, gaming: GamingPanel,
  travel: TravelPanel, hiking: HikingPanel, diving: DivingPanel, 'remote-work': RemoteWorkPanel, contact: ContactPanel, resume: ResumePanel,
}
```
```tsx
// src/components/organisms/ModalHost/index.tsx  (v1, replaced in Task 9)
'use client'
import { useActiveSection } from '@hooks/useActiveSection'
import { sectionBySlug } from '@constants/sections'
import { panelComponents } from './panels'
export default function ModalHost() {
  const slug = useActiveSection()
  if (!slug) return null
  const section = sectionBySlug(slug)
  const Panel = panelComponents[slug]
  return (
    <section aria-labelledby="panel-title" className="stitched fixed inset-4 z-40 overflow-auto rounded-frame bg-paper p-6 shadow-2xl">
      <h2 id="panel-title" className="font-display text-3xl font-extrabold">{section.title}</h2>
      <a href="/" className="absolute right-4 top-4 font-display font-bold">Close ✕</a>
      <div className="mt-4"><Panel /></div>
    </section>
  )
}
```
```tsx
// src/components/pages/Room/index.tsx  (v1; grows in Tasks 8–11)
'use client'
import Poster from '@components/molecules/Poster'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'
import type { SectionSlug } from '@interfaces/section'

export default function Room({ initialSection }: { initialSection: SectionSlug | null }) {
  return (
    <main className="relative h-dvh w-full overflow-hidden" data-initial-section={initialSection ?? ''}>
      <SectionNav />
      <Poster />
      <ModalHost />
    </main>
  )
}
```

- [ ] **Step 3: Write 404/500 pages, sitemap and robots**

```tsx
// src/components/pages/Page404/index.tsx
import Button from '@components/atoms/Button'
export default function Page404() {
  return <main className="flex h-dvh flex-col items-center justify-center gap-4 text-center"><p className="font-display text-6xl">🐾</p><h1 className="font-display text-3xl font-extrabold">Oyen can't find that room.</h1><Button href="/">Back to the room</Button></main>
}
// src/components/pages/Page500/index.tsx
'use client'
import Button from '@components/atoms/Button'
import { site } from '@constants/site'
export default function Page500({ reset }: { reset: () => void }) {
  return <main className="flex h-dvh flex-col items-center justify-center gap-4 text-center"><h1 className="font-display text-3xl font-extrabold">Something knocked the mug over.</h1><div className="flex gap-3"><Button onClick={reset}>Try again</Button><Button variant="ghost" href={site.resumePdf}>Download resume</Button></div></main>
}
```
```tsx
// src/app/not-found.tsx
import Page404 from '@components/pages/Page404'
export default Page404
// src/app/error.tsx
'use client'
import Page500 from '@components/pages/Page500'
export default Page500
```
```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { sectionSlugs } from '@constants/sections'
import { site } from '@constants/site'
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, priority: 1 }, ...sectionSlugs.map((s) => ({ url: `${site.url}/${s}`, priority: 0.8 }))]
}
// src/app/robots.ts
import type { MetadataRoute } from 'next'
import { site } from '@constants/site'
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${site.url}/sitemap.xml` }
}
```

- [ ] **Step 4: Verify server rendering of panel text**

Run: `yarn build && yarn start` then in another shell:
`curl -s http://localhost:3000/experience | grep -c "Agile Collaboration and Coordination"` → Expected: `1` or more.
`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/nope` → Expected: `404`.
`curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"` → Expected: `12`.
`yarn build` output lists `/`, `/about`, … `/resume` as static (●/○).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add catch-all route, room page shell and error pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Milestone 1: The 2D product (stores, navigation, modal, HUD, phone)

### Task 7: Zustand stores and the safe storage util

Implements: design doc 02 "State (Zustand stores)"; doc 07 error handling for `localStorage`.

**Files:**
- Create: `src/constants/storage.ts`, `src/utils/storage.ts`, `src/utils/storage.test.ts`, `src/store/useRoomStore.ts`, `src/store/useSceneStore.ts`, `src/store/useSoundStore.ts`, `src/store/stores.test.ts`

**Interfaces:**
- Produces: the three stores exactly as in "Shared Interfaces → Stores" (`progress` is mirrored from the scene so drei never enters the main bundle; `bubble`/`oyenAnchor` carry Oyen's speech bubble to the DOM), plus `useSoundStore.hydrate(): void` (reads the saved `master` flag after mount; stores never read storage during render, so server and client HTML match).

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/storage.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { readJSON, writeJSON } from './storage'

describe('storage', () => {
  afterEach(() => { window.localStorage.clear(); vi.restoreAllMocks() })
  it('round-trips JSON values', () => {
    writeJSON('k', { a: 1 })
    expect(readJSON('k', { a: 0 })).toEqual({ a: 1 })
  })
  it('returns the fallback for missing keys and invalid JSON', () => {
    expect(readJSON('missing', 'x')).toBe('x')
    window.localStorage.setItem('bad', '{oops')
    expect(readJSON('bad', 'x')).toBe('x')
  })
  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => writeJSON('k', 1)).not.toThrow()
    expect(readJSON('k', 'fallback')).toBe('fallback')
  })
})
```
```ts
// src/store/stores.test.ts
import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@constants/storage'

import { useRoomStore } from './useRoomStore'
import { useSceneStore } from './useSceneStore'
import { useSoundStore } from './useSoundStore'

describe('stores', () => {
  beforeEach(() => { window.localStorage.clear(); useSoundStore.setState({ master: false, music: false }) })
  it('room store starts idle and loading', () => {
    const s = useRoomStore.getState()
    expect([s.phase, s.transition, s.originRect, s.openedInApp]).toEqual(['loading', 'idle', null, false])
    s.setTransition('focusing'); expect(useRoomStore.getState().transition).toBe('focusing')
  })
  it('scene store defaults', () => {
    const s = useSceneStore.getState()
    expect([s.hovered, s.tier, s.webgl, s.theme, s.sceneReady, s.progress]).toEqual([null, 'high', 'unknown', 'day', false, 0])
  })
  it('sound store persists the master flag and hydrates it', () => {
    useSoundStore.getState().setMaster(true)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.sound)!)).toEqual({ master: true })
    useSoundStore.setState({ master: false })
    useSoundStore.getState().hydrate()
    expect(useSoundStore.getState().master).toBe(true)
  })
  it('toggleMaster off also silences music', () => {
    useSoundStore.setState({ master: true, music: true })
    useSoundStore.getState().toggleMaster()
    expect(useSoundStore.getState()).toMatchObject({ master: false, music: true })
  })
})
```
Run: `yarn test`
Expected: FAIL, modules not found.

- [ ] **Step 2: Write the constants and util**

```ts
// src/constants/storage.ts
export const STORAGE_KEYS = { sound: 'room:sound', interacted: 'room:interacted' } as const
```
```ts
// src/utils/storage.ts
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, blocked, SSR): preferences simply aren't remembered.
  }
}
```

- [ ] **Step 3: Write the stores**

```ts
// src/store/useRoomStore.ts
'use client'
import { create } from 'zustand'

import type { Phase, Rect, Transition } from '@interfaces/ui'

interface RoomState {
  phase: Phase; setPhase: (phase: Phase) => void
  transition: Transition; setTransition: (transition: Transition) => void
  originRect: Rect | null; setOriginRect: (originRect: Rect | null) => void
  openedInApp: boolean; setOpenedInApp: (openedInApp: boolean) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  phase: 'loading', setPhase: (phase) => set({ phase }),
  transition: 'idle', setTransition: (transition) => set({ transition }),
  originRect: null, setOriginRect: (originRect) => set({ originRect }),
  openedInApp: false, setOpenedInApp: (openedInApp) => set({ openedInApp }),
}))
```
```ts
// src/store/useSceneStore.ts
'use client'
import { create } from 'zustand'

import type { ObjectId } from '@interfaces/section'
import type { SceneTheme, Tier, WebglStatus } from '@interfaces/ui'

interface SceneState {
  hovered: ObjectId | null; setHovered: (id: ObjectId | null) => void
  hint: ObjectId | null; setHint: (id: ObjectId | null) => void
  tier: Tier; setTier: (tier: Tier) => void
  webgl: WebglStatus; setWebgl: (webgl: WebglStatus) => void
  theme: SceneTheme; setTheme: (theme: SceneTheme) => void
  sceneReady: boolean; setSceneReady: (sceneReady: boolean) => void
  progress: number; setProgress: (progress: number) => void
  bubble: string | null; setBubble: (bubble: string | null) => void
  oyenAnchor: { x: number; y: number } | null; setOyenAnchor: (oyenAnchor: { x: number; y: number } | null) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  hovered: null, setHovered: (hovered) => set({ hovered }),
  hint: null, setHint: (hint) => set({ hint }),
  tier: 'high', setTier: (tier) => set({ tier }),
  webgl: 'unknown', setWebgl: (webgl) => set({ webgl }),
  theme: 'day', setTheme: (theme) => set({ theme }),
  sceneReady: false, setSceneReady: (sceneReady) => set({ sceneReady }),
  progress: 0, setProgress: (progress) => set({ progress }),
  bubble: null, setBubble: (bubble) => set({ bubble }),
  oyenAnchor: null, setOyenAnchor: (oyenAnchor) => set({ oyenAnchor }),
}))
```
```ts
// src/store/useSoundStore.ts
'use client'
import { create } from 'zustand'

import { STORAGE_KEYS } from '@constants/storage'
import { readJSON, writeJSON } from '@utils/storage'

interface SoundState {
  master: boolean; music: boolean
  setMaster: (master: boolean) => void; setMusic: (music: boolean) => void
  toggleMaster: () => void; toggleMusic: () => void
  hydrate: () => void
}

const persist = (master: boolean) => writeJSON(STORAGE_KEYS.sound, { master })

export const useSoundStore = create<SoundState>((set, get) => ({
  master: false,
  music: false,
  setMaster: (master) => { persist(master); set({ master }) },
  setMusic: (music) => set({ music }),
  toggleMaster: () => get().setMaster(!get().master),
  toggleMusic: () => set({ music: !get().music }),
  hydrate: () => set({ master: readJSON(STORAGE_KEYS.sound, { master: false }).master }),
}))
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add room, scene and sound stores with safe storage

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: History rules, section navigation hook and the transition state machine

Implements: design doc 02 "The modal + URL model" (how it works, history rules, interaction state machine).

**Files:**
- Create: `src/utils/history.ts`, `src/utils/history.test.ts`, `src/hooks/useSectionNavigation.ts`, `src/hooks/useSectionNavigation.test.tsx`, `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useIsCoarsePointer.ts`, `src/constants/camera.ts`, `src/components/pages/Room/useRoom.ts`, `src/components/pages/Room/useRoom.test.tsx`

**Interfaces:**
- Produces: `decideClose`, `pushPath`, `replacePath`, `currentSlug`, `openSection`, `closeSection`, `openFromScene` (plain functions; the 3D scene calls `openFromScene` because React contexts don't cross the R3F Canvas boundary); `useSectionNavigation()` → `{ open, close, switchTo, linkProps }` where `linkProps(slug)` returns `{ href: string; onClick: (e: React.MouseEvent) => void }` for real links that are intercepted in-app (modifier-clicks and middle-clicks fall through to the browser); `useRoom(initialSection)` → `{ active, phase, transition, showLoader }`; `DEFAULT_CAMERA_TARGET`, `DEFAULT_CAMERA_OFFSET`, `CAMERA_SMOOTH_TIME`, `FOCUS_TIMEOUT_MS`, `ENTER_SWOOP_OFFSET`, `ENTER_TIMEOUT_MS`.
- Consumes: stores (Task 7), `slugFromPathname` (Task 3), `useActiveSection` (Task 6).

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/history.test.ts
import { describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import { closeSection, currentSlug, decideClose, openFromScene, openSection, pushPath, replacePath } from './history'

describe('history', () => {
  it('goes back only when the panel was opened in the app', () => {
    expect(decideClose(true)).toBe('back')
    expect(decideClose(false)).toBe('replace')
  })
  it('pushes and replaces with the native History API', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    pushPath('/skills'); replacePath('/')
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('openSection pushes from the room and replaces when switching', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: false })
    openSection(null, 'skills')
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(useRoomStore.getState().openedInApp).toBe(true)
    openSection('skills', 'contact')
    expect(replace).toHaveBeenCalledWith(null, '', '/contact')
    openSection('contact', 'contact')
    expect(replace).toHaveBeenCalledTimes(1)
  })
  it('closeSection goes back when opened in-app, otherwise replaces with /', () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: true }); closeSection('skills'); expect(back).toHaveBeenCalled()
    useRoomStore.setState({ openedInApp: false }); closeSection('skills'); expect(replace).toHaveBeenCalledWith(null, '', '/')
    closeSection(null); expect(replace).toHaveBeenCalledTimes(1)
  })
  it('openFromScene reads the slug from window.location', () => {
    window.history.replaceState(null, '', '/about')
    expect(currentSlug()).toBe('about')
    const replace = vi.spyOn(window.history, 'replaceState')
    openFromScene('resume')
    expect(replace).toHaveBeenCalledWith(null, '', '/resume')
    window.history.replaceState(null, '', '/')
  })
})
```
```tsx
// src/hooks/useSectionNavigation.test.tsx
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import { useSectionNavigation } from './useSectionNavigation'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

describe('useSectionNavigation', () => {
  beforeEach(() => { pathname = '/'; useRoomStore.setState({ openedInApp: false }); vi.restoreAllMocks() })

  it('open from the room pushes a new entry and marks openedInApp', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useSectionNavigation())
    act(() => result.current.open('skills'))
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(useRoomStore.getState().openedInApp).toBe(true)
  })
  it('open while another panel is open replaces the entry', () => {
    pathname = '/skills'
    const replace = vi.spyOn(window.history, 'replaceState')
    const { result } = renderHook(() => useSectionNavigation())
    act(() => result.current.open('contact'))
    expect(replace).toHaveBeenCalledWith(null, '', '/contact')
  })
  it('close goes back when opened in-app, otherwise replaces with /', () => {
    pathname = '/skills'
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: true })
    const { result, rerender } = renderHook(() => useSectionNavigation())
    act(() => result.current.close())
    expect(back).toHaveBeenCalled()
    useRoomStore.setState({ openedInApp: false })
    rerender()
    act(() => result.current.close())
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('linkProps intercepts plain clicks but not modified clicks', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useSectionNavigation())
    const props = result.current.linkProps('resume')
    expect(props.href).toBe('/resume')
    const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, preventDefault: vi.fn() }
    act(() => props.onClick(plain as unknown as React.MouseEvent))
    expect(plain.preventDefault).toHaveBeenCalled()
    expect(push).toHaveBeenCalledTimes(1)
    const meta = { ...plain, metaKey: true, preventDefault: vi.fn() }
    act(() => props.onClick(meta as unknown as React.MouseEvent))
    expect(meta.preventDefault).not.toHaveBeenCalled()
  })
})
```
```tsx
// src/components/pages/Room/useRoom.test.tsx
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import { useRoom } from './useRoom'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

describe('useRoom', () => {
  beforeEach(() => {
    pathname = '/'
    useRoomStore.setState({ phase: 'loading', transition: 'idle', originRect: null })
    useSceneStore.setState({ sceneReady: false })
    vi.useRealTimers()
  })
  it('a direct link skips the gate and shows the panel at once', () => {
    pathname = '/experience'
    const { result } = renderHook(() => useRoom('experience'))
    expect(result.current.showLoader).toBe(false)
    expect(useRoomStore.getState().phase).toBe('ready')
    expect(result.current.transition).toBe('idle')
  })
  it('opening in-app focuses when the scene is ready, otherwise opens directly', () => {
    useSceneStore.setState({ sceneReady: true })
    const { rerender } = renderHook(() => useRoom(null))
    pathname = '/skills'; rerender()
    expect(useRoomStore.getState().transition).toBe('focusing')
    useSceneStore.setState({ sceneReady: false })
    pathname = '/'; rerender()
    expect(useRoomStore.getState().transition).toBe('closing')
    pathname = '/contact'; rerender()
    expect(useRoomStore.getState().transition).toBe('open')
  })
  it('never stays in focusing longer than FOCUS_TIMEOUT_MS', () => {
    vi.useFakeTimers()
    useSceneStore.setState({ sceneReady: true })
    const { rerender } = renderHook(() => useRoom(null))
    pathname = '/skills'; rerender()
    act(() => { vi.advanceTimersByTime(1600) })
    expect(useRoomStore.getState().transition).toBe('open')
  })
})
```
Run: `yarn test`
Expected: FAIL, modules not found.

- [ ] **Step 2: Write the util, constants and hooks**

```ts
// src/utils/history.ts
import { useRoomStore } from '@store/useRoomStore'

import { slugFromPathname } from '@constants/sections'
import type { SectionSlug } from '@interfaces/section'

export type CloseStrategy = 'back' | 'replace'

export function decideClose(openedInApp: boolean): CloseStrategy {
  return openedInApp ? 'back' : 'replace'
}
export function pushPath(path: string): void {
  window.history.pushState(null, '', path)
}
export function replacePath(path: string): void {
  window.history.replaceState(null, '', path)
}
export function currentSlug(): SectionSlug | null {
  return slugFromPathname(window.location.pathname)
}
export function openSection(active: SectionSlug | null, slug: SectionSlug): void {
  if (active === slug) return
  if (active === null) {
    useRoomStore.getState().setOpenedInApp(true)
    pushPath(`/${slug}`)
  } else {
    replacePath(`/${slug}`)
  }
}
export function closeSection(active: SectionSlug | null): void {
  if (active === null) return
  const strategy = decideClose(useRoomStore.getState().openedInApp)
  useRoomStore.getState().setOpenedInApp(false)
  if (strategy === 'back') window.history.back()
  else replacePath('/')
}
/** For code inside the R3F <Canvas>, where Next's router context is unavailable. */
export function openFromScene(slug: SectionSlug): void {
  openSection(currentSlug(), slug)
}
```
```ts
// src/constants/camera.ts
import type { Vec3 } from '@interfaces/section'
export const DEFAULT_CAMERA_TARGET: Vec3 = [0, 1.4, 0]
export const DEFAULT_CAMERA_OFFSET: Vec3 = [10, 8.2, 10]
export const CAMERA_SMOOTH_TIME = 0.35
export const FOCUS_TIMEOUT_MS = 1500
export const ENTER_TIMEOUT_MS = 2500
export const ENTER_SWOOP_OFFSET: Vec3 = [16, 14, 16] // the camera starts further out, then swoops to default
export const MOBILE_ZOOM_FACTOR = 1.3
export const AZIMUTH_LIMIT = 0.61 // ±35° around the default view (mobile drag)
export const POLAR_MIN = 0.75
export const POLAR_MAX = 1.25
export const PARALLAX_AZIMUTH = 0.026
export const PARALLAX_POLAR = 0.017
```
```ts
// src/hooks/useSectionNavigation.ts
'use client'
import { useCallback, useMemo } from 'react'
import type { MouseEvent } from 'react'

import type { SectionSlug } from '@interfaces/section'
import { closeSection, openSection, replacePath } from '@utils/history'

import { useActiveSection } from './useActiveSection'

const isModified = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

export function useSectionNavigation() {
  const active = useActiveSection()
  const switchTo = useCallback((slug: SectionSlug) => { if (active !== slug) replacePath(`/${slug}`) }, [active])
  const open = useCallback((slug: SectionSlug) => openSection(active, slug), [active])
  const close = useCallback(() => closeSection(active), [active])

  const linkProps = useCallback((slug: SectionSlug) => ({
    href: `/${slug}`,
    onClick: (e: MouseEvent) => { if (isModified(e)) return; e.preventDefault(); open(slug) },
  }), [open])

  return useMemo(() => ({ open, close, switchTo, linkProps }), [open, close, switchTo, linkProps])
}
```
```ts
// src/hooks/usePrefersReducedMotion.ts
'use client'
import { useEffect, useState } from 'react'
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update(); mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
// src/hooks/useIsCoarsePointer.ts — identical shape with '(pointer: coarse)'
```
```ts
// src/components/pages/Room/useRoom.ts
'use client'
import { useEffect, useRef } from 'react'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useActiveSection } from '@hooks/useActiveSection'

import { FOCUS_TIMEOUT_MS } from '@constants/camera'
import type { SectionSlug } from '@interfaces/section'

export function useRoom(initialSection: SectionSlug | null) {
  const active = useActiveSection()
  const phase = useRoomStore((s) => s.phase)
  const transition = useRoomStore((s) => s.transition)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const prev = useRef<SectionSlug | null>(initialSection)

  // Direct links skip the loader gate.
  useEffect(() => {
    if (initialSection !== null) useRoomStore.getState().setPhase('ready')
  }, [initialSection])

  // The URL changed: open, close or switch.
  useEffect(() => {
    if (prev.current === active) return
    prev.current = active
    const { setTransition, setOriginRect } = useRoomStore.getState()
    if (active === null) { setTransition('closing'); return }
    setOriginRect(null)
    setTransition(useSceneStore.getState().sceneReady ? 'focusing' : 'open')
  }, [active, sceneReady])

  // Safety nets: never hang in 'focusing' or 'entering' if the camera can't report back.
  useEffect(() => {
    if (transition !== 'focusing') return
    const t = window.setTimeout(() => {
      if (useRoomStore.getState().transition === 'focusing') useRoomStore.getState().setTransition('open')
    }, FOCUS_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [transition])
  useEffect(() => {
    if (phase !== 'entering') return
    const t = window.setTimeout(() => {
      if (useRoomStore.getState().phase === 'entering') useRoomStore.getState().setPhase('ready')
    }, ENTER_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  const showLoader = active === null && (phase === 'loading' || phase === 'gate')
  return { active, phase, transition, showLoader }
}
```
(Import `ENTER_TIMEOUT_MS` next to `FOCUS_TIMEOUT_MS`.)
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add history rules, section navigation and the room state machine

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 9: Dialog primitive, PanelFrame and the animated ModalHost

Implements: design doc 04 "Modal" (size, backdrop, shared frame, grow/shrink, focus and semantics); doc 02 "Grow out of the object".

**Files:**
- Create: `src/components/shadcn/components/ui/dialog.tsx`, `src/utils/modalRect.ts`, `src/utils/modalRect.test.ts`, `src/hooks/useViewportSize.ts`, `src/components/atoms/IconButton/index.tsx`, `src/components/organisms/PanelFrame/index.tsx`, `src/components/organisms/ModalHost/ModalHost.test.tsx`
- Modify: `src/components/organisms/ModalHost/index.tsx` (replace v1), `src/components/pages/Room/index.tsx` (use `useRoom`)

**Interfaces:**
- Produces: `finalRect`, `growTransform`, `MOBILE_BREAKPOINT = 640`; `useViewportSize(): { width; height } | null` (null until mounted); `IconButton { label: string; children; onClick?; className?; pressed?: boolean }`; `PanelFrame { section; children; onClose; originRect: Rect | null; finalRect: Rect | null }` (when `finalRect` is null it lays out with CSS and skips the grow animation, which is the server/direct-link case); `ModalHost` sets `transition = 'idle'` after the exit animation.
- Consumes: `useRoom` (Task 8), stores, `panelComponents` (Task 6).

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/modalRect.test.ts
import { describe, expect, it } from 'vitest'

import { finalRect, growTransform } from './modalRect'

describe('modalRect', () => {
  it('centers an 80% panel capped at 1100px on desktop', () => {
    expect(finalRect(1920, 1000)).toEqual({ x: 410, y: 100, width: 1100, height: 800 })
    expect(finalRect(1000, 800)).toEqual({ x: 100, y: 80, width: 800, height: 640 })
  })
  it('uses a bottom sheet under 640px', () => {
    const r = finalRect(390, 844)
    expect(r.width).toBe(371); expect(r.height).toBe(776); expect(r.y).toBe(844 - 776)
  })
  it('computes the transform that maps the final rect onto the origin rect', () => {
    const to = { x: 100, y: 80, width: 800, height: 640 }
    expect(growTransform(to, to)).toEqual({ x: 0, y: 0, scaleX: 1, scaleY: 1 })
    expect(growTransform({ x: 300, y: 200, width: 200, height: 160 }, to)).toEqual({ x: 200, y: 120, scaleX: 0.25, scaleY: 0.25 })
  })
})
```
```tsx
// src/components/organisms/ModalHost/ModalHost.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionConfig } from 'motion/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import ModalHost from '.'

let pathname = '/experience'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

const renderHost = () => render(<MotionConfig reducedMotion="always"><ModalHost /></MotionConfig>)

describe('ModalHost', () => {
  beforeEach(() => { pathname = '/experience'; useRoomStore.setState({ transition: 'idle', originRect: null, openedInApp: false }) })
  it('renders the active panel as an accessible dialog and moves focus inside', async () => {
    renderHost()
    const dialog = await screen.findByRole('dialog', { name: 'Work experience' })
    expect(dialog).toBeInTheDocument()
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    expect(screen.getByText(/Agile Collaboration/)).toBeInTheDocument()
  })
  it('closes with Escape by replacing the URL when not opened in-app', async () => {
    const replace = vi.spyOn(window.history, 'replaceState')
    renderHost()
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('hides the panel while the camera is focusing', () => {
    useRoomStore.setState({ transition: 'focusing' })
    renderHost()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
```
Run: `yarn test`
Expected: FAIL.

- [ ] **Step 2: Write the util, hook, dialog primitive and IconButton**

```ts
// src/utils/modalRect.ts
import type { Rect } from '@interfaces/ui'
export const MOBILE_BREAKPOINT = 640
export function finalRect(viewportWidth: number, viewportHeight: number): Rect {
  if (viewportWidth < MOBILE_BREAKPOINT) {
    const width = Math.round(viewportWidth * 0.95)
    const height = Math.round(viewportHeight * 0.92)
    return { x: Math.round((viewportWidth - width) / 2), y: viewportHeight - height, width, height }
  }
  const width = Math.min(Math.round(viewportWidth * 0.8), 1100)
  const height = Math.round(viewportHeight * 0.8)
  return { x: Math.round((viewportWidth - width) / 2), y: Math.round((viewportHeight - height) / 2), width, height }
}
export function growTransform(from: Rect, to: Rect) {
  return { x: from.x - to.x, y: from.y - to.y, scaleX: from.width / to.width, scaleY: from.height / to.height }
}
```
```ts
// src/hooks/useViewportSize.ts
'use client'
import { useEffect, useState } from 'react'
export function useViewportSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update(); window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
```
```tsx
// src/components/shadcn/components/ui/dialog.tsx
'use client'
import { Dialog as DialogPrimitive } from 'radix-ui'
export const Dialog = DialogPrimitive.Root
export const DialogPortal = DialogPrimitive.Portal
export const DialogOverlay = DialogPrimitive.Overlay
export const DialogContent = DialogPrimitive.Content
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
export const DialogClose = DialogPrimitive.Close
```
```tsx
// src/components/atoms/IconButton/index.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@components/shadcn/utils'
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { label: string; children: ReactNode; pressed?: boolean }
export default function IconButton({ label, children, pressed, className, ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} className={cn('stitched inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-transform hover:scale-105 active:scale-95', className)} {...rest}>
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Write `PanelFrame`**

```tsx
// src/components/organisms/PanelFrame/index.tsx
'use client'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import IconButton from '@components/atoms/IconButton'
import StitchedLabel from '@components/atoms/StitchedLabel'
import { cn } from '@components/shadcn/utils'
import { DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog'

import { useSceneStore } from '@store/useSceneStore'

import type { Section } from '@interfaces/section'
import type { Rect } from '@interfaces/ui'
import { MOBILE_BREAKPOINT, growTransform } from '@utils/modalRect'

export interface PanelFrameProps { section: Section; children: ReactNode; onClose: () => void; originRect: Rect | null; finalRect: Rect | null }

const themeClass: Record<Section['theme'], string> = {
  scrapbook: 'bg-paper', monitor: 'bg-paper', shelf: 'bg-paper', frames: 'bg-paper-2', tv: 'bg-paper', map: 'bg-paper',
  journal: 'bg-paper-2', logbook: 'bg-sky/30', clocks: 'bg-paper', envelope: 'bg-peach/40', paper: 'bg-paper-2',
}

export default function PanelFrame({ section, children, onClose, originRect, finalRect: to }: PanelFrameProps) {
  const reduced = useReducedMotion()
  const tier = useSceneStore((s) => s.tier)
  const animated = to !== null && !reduced
  const from = animated && originRect ? growTransform(originRect, to) : { x: 0, y: 0, scaleX: 0.92, scaleY: 0.92 }
  const isSheet = to !== null && to.width + 2 * to.x < MOBILE_BREAKPOINT
  const Icon = section.icon
  const layout = to
    ? { left: to.x, top: to.y, width: to.width, height: to.height }
    : { left: '50%', top: '50%', width: 'min(80vw, 1100px)', height: '80vh', translate: '-50% -50%' }

  return (
    <>
      <DialogOverlay asChild forceMount>
        <motion.div className={cn('fixed inset-0 z-40 bg-[#2b2238]/35', tier === 'high' && 'backdrop-blur-[4px]')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      </DialogOverlay>
      <DialogContent asChild forceMount onEscapeKeyDown={onClose} onPointerDownOutside={onClose} aria-describedby={undefined}>
        <motion.div
          className={cn('stitched fixed z-50 flex flex-col rounded-frame shadow-[0_20px_60px_rgb(74_52_38/0.25)] outline-none', themeClass[section.theme])}
          style={{ ...layout, transformOrigin: '0 0' }}
          initial={animated ? { ...from, opacity: 0.6 } : false}
          animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
          exit={animated ? { ...from, opacity: 0 } : { opacity: 0 }}
          transition={animated ? { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 } : { duration: 0.15 }}
          drag={isSheet ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => { if (info.offset.y > 120) onClose() }}
        >
          {isSheet && <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-wood/50" />}
          <div className="flex items-center justify-between gap-3 px-5 pt-4">
            <DialogTitle asChild><h2 className="m-0"><StitchedLabel className="text-xl"><Icon size={20} /> {section.title}</StitchedLabel></h2></DialogTitle>
            <IconButton label="Close" onClick={onClose}><X /></IconButton>
          </div>
          <motion.div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: animated ? 0.25 : 0, duration: 0.15 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
            {children}
          </motion.div>
        </motion.div>
      </DialogContent>
    </>
  )
}
```

- [ ] **Step 4: Replace `ModalHost` and wire `useRoom` into `Room`**

```tsx
// src/components/organisms/ModalHost/index.tsx
'use client'
import { AnimatePresence } from 'motion/react'

import PanelFrame from '@components/organisms/PanelFrame'
import { Dialog, DialogPortal } from '@/components/ui/dialog'

import { useRoomStore } from '@store/useRoomStore'
import { useActiveSection } from '@hooks/useActiveSection'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { useViewportSize } from '@hooks/useViewportSize'

import { sectionBySlug } from '@constants/sections'
import { finalRect } from '@utils/modalRect'

import { panelComponents } from './panels'

export default function ModalHost() {
  const active = useActiveSection()
  const transition = useRoomStore((s) => s.transition)
  const originRect = useRoomStore((s) => s.originRect)
  const { close } = useSectionNavigation()
  const viewport = useViewportSize()
  const shown = active && transition !== 'focusing' ? active : null
  const to = viewport ? finalRect(viewport.width, viewport.height) : null

  return (
    <Dialog open={shown !== null} onOpenChange={(open) => { if (!open) close() }}>
      <DialogPortal forceMount>
        <AnimatePresence mode="wait" onExitComplete={() => { const s = useRoomStore.getState(); if (s.transition === 'closing') s.setTransition('idle') }}>
          {shown && (
            <PanelFrame key={shown} section={sectionBySlug(shown)} onClose={close} originRect={originRect} finalRect={to}>
              {(() => { const Panel = panelComponents[shown]; return <Panel /> })()}
            </PanelFrame>
          )}
        </AnimatePresence>
      </DialogPortal>
    </Dialog>
  )
}
```
```tsx
// src/components/pages/Room/index.tsx  (v2)
'use client'
import Poster from '@components/molecules/Poster'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'
import type { SectionSlug } from '@interfaces/section'
import { useRoom } from './useRoom'

export default function Room({ initialSection }: { initialSection: SectionSlug | null }) {
  const { phase, transition } = useRoom(initialSection)
  return (
    <main className="relative h-dvh w-full overflow-hidden" data-phase={phase} data-transition={transition}>
      <SectionNav />
      <Poster />
      <ModalHost />
    </main>
  )
}
```
Run: `yarn test`
Expected: PASS. Then `yarn dev`: open `/skills`, press Esc → the panel fades out and the URL becomes `/`; click a `SectionNav` link (Tab to it first) → the panel opens; browser Back closes it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add animated modal host with accessible panel frame

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 10: HUD, phone menu, help sheet and the time util

Implements: design doc 04 "Screen layout", "On-screen controls", "Phone menu", "Help sheet"; doc 06 clocks' time logic (shared with the phone status bar); doc 05 "Remote work" overlap maths.

**Files:**
- Create: `src/utils/time.ts`, `src/utils/time.test.ts`, `src/hooks/useBogorTime.ts`, `src/components/molecules/PhoneAppTile/index.tsx`, `src/components/organisms/PhoneMenu/index.tsx`, `src/components/organisms/PhoneMenu/usePhoneGrid.ts`, `src/components/organisms/HelpSheet/index.tsx`, `src/components/organisms/Hud/index.tsx`, `src/components/organisms/Hud/Hud.test.tsx`
- Modify: `src/components/pages/Room/index.tsx` (add `<Hud />`), `src/constants/timezones.ts` (add `BASE_ZONE`, `WORK_START`, `WORK_END` if not yet present)

**Interfaces:**
- Produces: everything under "Shared Interfaces → Utils → time.ts"; `useBogorTime()`; `PhoneAppTile { section: Section; onOpen(slug): void }`; `PhoneMenu { open; onOpenChange; onHelp(): void }`; `HelpSheet { open; onOpenChange }`; `Hud` (self-contained; owns phone/help open state).
- Consumes: `useSectionNavigation.linkProps`, `useSoundStore`, `useTheme` from next-themes, `helpContent`.

- [ ] **Step 1: Write the failing time tests**

```ts
// src/utils/time.test.ts
import { describe, expect, it } from 'vitest'

import { clockAngles, formatHHMM, overlapWindow, utcOffsetMinutes, zonedTime } from './time'

const at = (iso: string) => new Date(iso)

describe('time', () => {
  it('converts an instant into wall-clock time per zone', () => {
    const d = at('2026-10-21T05:04:09Z')
    expect(zonedTime(d, 'Asia/Jakarta')).toEqual({ h: 12, m: 4, s: 9 })
    expect(zonedTime(d, 'Asia/Singapore')).toEqual({ h: 13, m: 4, s: 9 })
    expect(zonedTime(d, 'Asia/Dubai')).toEqual({ h: 9, m: 4, s: 9 })
    expect(formatHHMM({ h: 9, m: 4, s: 9 })).toBe('09:04')
  })
  it('gives clock hand angles in degrees', () => {
    expect(clockAngles({ h: 3, m: 0, s: 0 })).toEqual({ hour: 90, minute: 0 })
    expect(clockAngles({ h: 12, m: 30, s: 0 })).toEqual({ hour: 15, minute: 180 })
  })
  it('knows UTC offsets', () => {
    const d = at('2026-10-21T05:00:00Z')
    expect(utcOffsetMinutes(d, 'Asia/Jakarta')).toBe(420)
    expect(utcOffsetMinutes(d, 'Asia/Dubai')).toBe(240)
  })
  it('computes the three-way working-hours overlap in Bogor minutes', () => {
    const d = at('2026-10-21T05:00:00Z')
    expect(overlapWindow(d, ['Asia/Jakarta', 'Asia/Singapore', 'Asia/Dubai'], 'Asia/Jakarta')).toEqual({ start: 12 * 60, end: 17 * 60 })
    expect(overlapWindow(d, ['Asia/Jakarta', 'America/Los_Angeles'], 'Asia/Jakarta')).toBeNull()
  })
})
```
Run: `yarn test src/utils/time`
Expected: FAIL.

- [ ] **Step 2: Implement `src/utils/time.ts`**

```ts
export interface ClockTime { h: number; m: number; s: number }

const partsOf = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { h: get('hour') % 24, m: get('minute'), s: get('second') }
}

export function zonedTime(date: Date, timeZone: string): ClockTime {
  return partsOf(date, timeZone)
}

export function clockAngles(t: ClockTime) {
  return { hour: ((t.h % 12) + t.m / 60) * 30, minute: (t.m + t.s / 60) * 6 }
}

export function utcOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  return Math.round((asUtc - date.getTime()) / 60000)
}

export function overlapWindow(date: Date, zones: readonly string[], baseZone: string, workStart = 9 * 60, workEnd = 18 * 60) {
  const base = utcOffsetMinutes(date, baseZone)
  let start = workStart, end = workEnd
  for (const zone of zones) {
    const shift = utcOffsetMinutes(date, zone) - base // minutes this zone is ahead of base
    start = Math.max(start, workStart - shift)
    end = Math.min(end, workEnd - shift)
  }
  return start < end ? { start, end } : null
}

export function formatHHMM(t: ClockTime): string {
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`
}
```
```ts
// src/hooks/useBogorTime.ts
'use client'
import { useEffect, useState } from 'react'
import { BASE_ZONE } from '@constants/timezones'
import { type ClockTime, zonedTime } from '@utils/time'
export function useBogorTime(): ClockTime | null {
  const [time, setTime] = useState<ClockTime | null>(null)
  useEffect(() => {
    const tick = () => setTime(zonedTime(new Date(), BASE_ZONE))
    tick(); const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}
```
Run: `yarn test src/utils/time`
Expected: PASS.

- [ ] **Step 3: Write the failing Hud test**

```tsx
// src/components/organisms/Hud/Hud.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Hud from '.'

const setTheme = vi.fn()
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme }) }))

describe('Hud', () => {
  beforeEach(() => setTheme.mockClear())
  it('shows the name tag and the always-visible controls', () => {
    render(<Hud />)
    expect(screen.getByRole('link', { name: /Satriko Aditya/ })).toHaveAttribute('href', '/about')
    for (const name of ['Sound on', 'Switch to night', 'Help', 'Resume', 'Contact', 'Open phone menu']) expect(screen.getByRole(name === 'Resume' || name === 'Contact' ? 'link' : 'button', { name })).toBeInTheDocument()
  })
  it('toggles the theme', async () => {
    render(<Hud />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to night' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
  it('opens the phone with 12 tiles and supports arrow-key movement', async () => {
    render(<Hud />)
    await userEvent.click(screen.getByRole('button', { name: 'Open phone menu' }))
    const grid = await screen.findByRole('grid', { name: 'Sections' })
    const tiles = screen.getAllByRole('gridcell')
    expect(tiles).toHaveLength(12)
    tiles[0].querySelector('a,button')!.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tiles[1].querySelector('a,button'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(tiles[4].querySelector('a,button'))
    expect(grid).toBeInTheDocument()
  })
})
```
Run: `yarn test src/components/organisms/Hud`
Expected: FAIL.

- [ ] **Step 4: Write PhoneAppTile, PhoneMenu (with roving focus), HelpSheet and Hud**

```tsx
// src/components/molecules/PhoneAppTile/index.tsx
import type { MouseEvent } from 'react'
import { cn } from '@components/shadcn/utils'
import type { Section } from '@interfaces/section'

const tileColor: Record<Section['slug'], string> = { about: 'bg-peach', experience: 'bg-sky', skills: 'bg-mint', education: 'bg-wood/40', gaming: 'bg-lavender', travel: 'bg-peach', hiking: 'bg-mint', diving: 'bg-sky', 'remote-work': 'bg-wood/40', contact: 'bg-accent/30', resume: 'bg-paper-2' }

export default function PhoneAppTile({ section, href, onClick }: { section: Section; href: string; onClick: (e: MouseEvent) => void }) {
  const Icon = section.icon
  return (
    <a href={href} onClick={onClick} className="flex min-h-11 flex-col items-center gap-1 rounded-2xl p-2 outline-none focus-visible:ring-4 focus-visible:ring-accent">
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm', tileColor[section.slug])}><Icon size={26} /></span>
      <span className="font-display text-xs font-bold">{section.label}</span>
    </a>
  )
}
```
```ts
// src/components/organisms/PhoneMenu/usePhoneGrid.ts
'use client'
import type { KeyboardEvent, RefObject } from 'react'
export const PHONE_COLUMNS = 3
export function usePhoneGrid(gridRef: RefObject<HTMLElement | null>) {
  return function onKeyDown(e: KeyboardEvent) {
    const items = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('[role="gridcell"] > a, [role="gridcell"] > button') ?? [])
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    const delta: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: PHONE_COLUMNS, ArrowUp: -PHONE_COLUMNS }
    const d = delta[e.key]
    if (d === undefined) return
    e.preventDefault()
    items[Math.min(items.length - 1, Math.max(0, index + d))]?.focus()
  }
}
```
```tsx
// src/components/organisms/PhoneMenu/index.tsx
'use client'
import { useRef } from 'react'
import { CircleQuestionMark } from 'lucide-react'
import { motion } from 'motion/react'

import PhoneAppTile from '@components/molecules/PhoneAppTile'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog'

import { useBogorTime } from '@hooks/useBogorTime'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { sections } from '@constants/sections'
import { formatHHMM } from '@utils/time'

import { usePhoneGrid } from './usePhoneGrid'

export default function PhoneMenu({ open, onOpenChange, onHelp }: { open: boolean; onOpenChange: (open: boolean) => void; onHelp: () => void }) {
  const { linkProps } = useSectionNavigation()
  const time = useBogorTime()
  const gridRef = useRef<HTMLDivElement>(null)
  const onKeyDown = usePhoneGrid(gridRef)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-[#2b2238]/20" />
        <DialogContent asChild aria-describedby={undefined}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="fixed bottom-20 right-4 z-50 flex h-[560px] w-[320px] max-w-[calc(100vw-2rem)] flex-col rounded-[36px] border-8 border-ink/80 bg-paper p-4 shadow-2xl outline-none max-sm:bottom-0 max-sm:right-0 max-sm:h-[90dvh] max-sm:w-full max-sm:rounded-b-none">
            <div className="flex justify-between font-display text-xs font-bold text-ink-muted"><span>{time ? `${formatHHMM(time)} WIB` : 'WIB'}</span><span aria-hidden="true">▂▄▆ 🔋</span></div>
            <DialogTitle className="my-3 font-display text-xl font-extrabold">Hi! Where to?</DialogTitle>
            <div ref={gridRef} role="grid" aria-label="Sections" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-2">
              {sections.map((s) => { const p = linkProps(s.slug); return <div key={s.slug} role="gridcell"><PhoneAppTile section={s} href={p.href} onClick={(e) => { p.onClick(e); if (!e.defaultPrevented) return; onOpenChange(false) }} /></div> })}
              <div role="gridcell"><button type="button" onClick={() => { onOpenChange(false); onHelp() }} className="flex min-h-11 w-full flex-col items-center gap-1 rounded-2xl p-2 outline-none focus-visible:ring-4 focus-visible:ring-accent"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-2 shadow-sm"><CircleQuestionMark size={26} /></span><span className="font-display text-xs font-bold">Help</span></button></div>
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
```
```tsx
// src/components/organisms/HelpSheet/index.tsx
'use client'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog'
import { helpContent } from '@content/help'
export default function HelpSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-[#2b2238]/35" />
        <DialogContent aria-describedby={undefined} className="stitched fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-frame bg-paper p-6 shadow-2xl outline-none">
          <DialogTitle className="font-display text-2xl font-extrabold">How to explore</DialogTitle>
          <ul className="my-3 list-disc pl-5">{helpContent.explore.map((t) => <li key={t}>{t}</li>)}</ul>
          <h3 className="font-display font-extrabold">Keyboard</h3>
          <ul className="my-3 list-disc pl-5">{helpContent.keyboard.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="my-3">{helpContent.sound}</p>
          <h3 className="font-display font-extrabold">Credits</h3>
          <ul className="my-3 list-disc pl-5">{helpContent.credits.map((c) => <li key={c.name}><a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.name}</a> by {c.by} ({c.license})</li>)}</ul>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
```
```tsx
// src/components/organisms/Hud/index.tsx
'use client'
import { useEffect, useState } from 'react'
import { CircleQuestionMark, FileDown, Mail, Moon, Smartphone, Sun, Volume2, VolumeX } from 'lucide-react'
import { useTheme } from 'next-themes'

import Button from '@components/atoms/Button'
import IconButton from '@components/atoms/IconButton'
import HelpSheet from '@components/organisms/HelpSheet'
import PhoneMenu from '@components/organisms/PhoneMenu'

import { useSoundStore } from '@store/useSoundStore'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { site } from '@constants/site'

export default function Hud() {
  const { linkProps } = useSectionNavigation()
  const { resolvedTheme, setTheme } = useTheme()
  const master = useSoundStore((s) => s.master)
  const toggleMaster = useSoundStore((s) => s.toggleMaster)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true); useSoundStore.getState().hydrate() }, [])
  const night = mounted && resolvedTheme === 'dark'
  const about = linkProps('about')
  return (
    <>
      <a {...about} className="stitched fixed left-4 top-4 z-30 rounded-xl bg-paper px-3 py-2 font-display text-sm font-bold shadow-md">{site.name} <span className="hidden text-ink-muted sm:inline">· {site.title}</span></a>
      <div className="fixed right-4 top-4 z-30 flex gap-2">
        <IconButton label={master ? 'Sound off' : 'Sound on'} pressed={master} onClick={toggleMaster}>{master ? <Volume2 /> : <VolumeX />}</IconButton>
        <IconButton label={night ? 'Switch to day' : 'Switch to night'} onClick={() => setTheme(night ? 'light' : 'dark')}>{night ? <Sun /> : <Moon />}</IconButton>
        <IconButton label="Help" onClick={() => setHelpOpen(true)}><CircleQuestionMark /></IconButton>
      </div>
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 max-sm:inset-x-0 max-sm:bottom-0 max-sm:justify-around max-sm:border-t max-sm:border-wood/30 max-sm:bg-paper/90 max-sm:p-2 max-sm:backdrop-blur">
        <Button variant="ghost" {...linkProps('resume')}><FileDown size={18} /> Resume</Button>
        <IconButton label="Open phone menu" onClick={() => setPhoneOpen(true)} className="h-14 w-14 bg-accent text-on-accent"><Smartphone /></IconButton>
        <Button variant="ghost" {...linkProps('contact')}><Mail size={18} /> Contact</Button>
      </div>
      <PhoneMenu open={phoneOpen} onOpenChange={setPhoneOpen} onHelp={() => setHelpOpen(true)} />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
```
Add `<Hud />` to `Room` after `<ModalHost />`.
Run: `yarn test`
Expected: PASS. Then `yarn dev`: phone opens, tiles open panels (the phone closes), Resume/Contact buttons open panels, theme toggles `data-theme`, Help shows credits; on a 390px-wide viewport the bottom bar appears.

- [ ] **Step 5: Lint, typecheck, build, commit**

```bash
yarn lint && yarn typecheck && yarn build
git add -A
git commit -m "feat: add HUD, phone menu, help sheet and time utilities

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Milestone 1 checkpoint:** every section opens from the phone, the buttons and direct links; Esc/✕/backdrop/Back close with animation; keyboard-only works; the room is still the static poster.

---

## Milestone 2: The 3D room

3D components are verified in the browser (`yarn dev`) and by the Playwright suite in Milestone 4; their pure maths live in `src/utils/` with unit tests. Objects are **built from primitives first** (design doc 03 allows "pack or code" per object); the CC0 model packs are an optional upgrade in Task 20 once the style test passes.

### Task 11: SceneCanvas, room shell, lighting, WebGL detection and the scene bridge

Implements: design doc 03 "The room", "Art direction", "Performance tiers", "Fallback"; doc 02 "Rendering rules" (client-only canvas).

**Files:**
- Create: `src/utils/webgl.ts`, `src/utils/webgl.test.ts`, `src/hooks/useWebGLSupport.ts`, `src/constants/roomPalette.ts`, `src/constants/roomLayout.ts`, `src/components/three/materials.ts`, `src/components/three/SceneCanvas/index.tsx`, `src/components/three/SceneCanvas/SceneBridge.tsx`, `src/components/three/SceneCanvas/SceneErrorBoundary.tsx`, `src/components/three/SceneCanvas/SceneErrorBoundary.test.tsx`, `src/components/three/SceneCanvas/SceneReady.tsx`, `src/components/three/Room/index.tsx`, `src/components/three/Room/Lighting.tsx`, `src/components/three/Room/Decor.tsx`, `src/components/three/RoomObjects/index.tsx`
- Modify: `src/components/pages/Room/index.tsx`, `src/components/molecules/Poster/index.tsx` (add `hidden` prop)

**Interfaces:**
- Produces: `detectWebGL()`, `useWebGLSupport()`, `palette` (room colors), `roomLayout` + `Placement` + `DecorId`, `clay(color)` material props, `SceneBridgeProvider` / `useSceneBridge()`, `<SceneCanvas />`, `ROOM = { size: 10, wallHeight: 6, wallThickness: 0.3 }`, named decor groups `mug`, `deskLamp`, `bedsideLamp`, `lampShade`, `lampLight` (used by Tasks 22 and phase 2).
- Coordinate system: floor is `x, z ∈ [-5, 5]`, `y` up; the **left wall** is the plane `x = -5`, the **right wall** is `z = -5`; the camera looks from `+x, +y, +z`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/webgl.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectWebGL } from './webgl'
describe('detectWebGL', () => {
  afterEach(() => vi.restoreAllMocks())
  it('is false when the browser returns no context (jsdom)', () => { expect(detectWebGL()).toBe(false) })
  it('is true when a context is returned', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never)
    expect(detectWebGL()).toBe(true)
  })
  it('is false when getContext throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => { throw new Error('x') })
    expect(detectWebGL()).toBe(false)
  })
})
```
```tsx
// src/components/three/SceneCanvas/SceneErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SceneErrorBoundary from './SceneErrorBoundary'
const Boom = () => { throw new Error('gl exploded') }
describe('SceneErrorBoundary', () => {
  it('reports the error and renders nothing', () => {
    const onError = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<SceneErrorBoundary onError={onError}><Boom /></SceneErrorBoundary>)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'gl exploded' }))
    expect(container).toBeEmptyDOMElement()
  })
})
```
Run: `yarn test`
Expected: FAIL.

- [ ] **Step 2: Write the util, hook, palette, layout and materials**

```ts
// src/utils/webgl.ts
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
// src/hooks/useWebGLSupport.ts
'use client'
import { useEffect } from 'react'
import { useSceneStore } from '@store/useSceneStore'
import { detectWebGL } from '@utils/webgl'
export function useWebGLSupport() {
  useEffect(() => {
    const { webgl, setWebgl } = useSceneStore.getState()
    if (webgl === 'unknown') setWebgl(detectWebGL() ? 'supported' : 'unsupported')
  }, [])
}
```
```ts
// src/constants/roomPalette.ts
export const palette = {
  wall: '#F6E7CC', wallTrim: '#E7CFAE', floor: '#B9875A', base: '#7A5235',
  cream: '#FFF1DC', ink: '#4A3426', wood: '#B9875A', woodDark: '#7A5235',
  mint: '#9FD8C3', sky: '#A9D6F2', peach: '#FFC8A2', lavender: '#D9C8F0', terracotta: '#B8553A',
  orange: '#F2A03D', orangeDark: '#D9842A', screen: '#1B2233', screenGlow: '#3A6EA5', lampGlow: '#F2A65A', nose: '#E58A8A', brass: '#D9B25F',
} as const
// src/components/three/materials.ts
export const clay = (color: string) => ({ color, roughness: 0.9, metalness: 0 }) as const
```
```ts
// src/constants/roomLayout.ts  (starting values; tuned in Task 19)
import type { ObjectId, Vec3 } from '@interfaces/section'
export type DecorId = 'bed' | 'nightstand' | 'bedsideLamp' | 'deskLamp' | 'desk' | 'sideTable' | 'mug' | 'rug' | 'beanbag' | 'plant' | 'door' | 'window' | 'oyenNight'
export interface Placement { position: Vec3; rotationY?: number; size?: Vec3 }
export const roomLayout: Record<ObjectId | DecorId, Placement> = {
  // left wall (x = -5)
  'edu-frames': { position: [-4.84, 3.5, 2.0] },
  window: { position: [-4.85, 3.1, -2.0], size: [0.08, 1.8, 2.4] },
  bed: { position: [-3.8, 0, 2.0], size: [2.2, 0.6, 3.4] },
  nightstand: { position: [-4.3, 0, 4.3], size: [0.8, 0.6, 0.8] },
  bedsideLamp: { position: [-4.3, 0.6, 4.3] },
  'dive-gear': { position: [-3.8, 0, -1.2] },
  // right wall (z = -5)
  desk: { position: [0, 0, -4.2], size: [3.0, 0.75, 1.2] },
  pc: { position: [0, 0.75, -4.5] },
  'photo-frame': { position: [-0.9, 0.75, -4.0], rotationY: 0.35 },
  mug: { position: [1.1, 0.75, -3.9] },
  deskLamp: { position: [1.25, 0.75, -4.5] },
  clocks: { position: [0, 4.2, -4.85] },
  sideTable: { position: [-2.2, 0, -4.3], size: [0.9, 0.6, 0.7] },
  printer: { position: [-2.2, 0.6, -4.3] },
  bookshelf: { position: [2.4, 0, -4.45], size: [1.6, 2.6, 0.5] },
  radio: { position: [2.4, 2.72, -4.45] },
  'indonesia-map': { position: [2.4, 3.9, -4.85], size: [1.8, 1.0, 0.06] },
  'light-switch': { position: [3.4, 2.0, -4.85] },
  mailbox: { position: [3.4, 1.0, -4.85] },
  door: { position: [4.1, 0, -4.85], size: [1.2, 2.6, 0.1] },
  'hiking-gear': { position: [4.4, 0, -3.6] },
  // floor
  rug: { position: [0.8, 0.02, 0.8], size: [5, 0.04, 4] },
  tv: { position: [-1.2, 0, 1.0], rotationY: Math.PI / 2 },
  beanbag: { position: [1.8, 0, 2.2] },
  oyen: { position: [1.2, 0, 1.6], rotationY: Math.PI / 4 },
  oyenNight: { position: [-3.8, 0.92, 2.0], rotationY: Math.PI / 2 },
  plant: { position: [4.4, 0, 4.2] },
}
```

- [ ] **Step 3: Write the bridge, error boundary and ready reporter**

```tsx
// src/components/three/SceneCanvas/SceneBridge.tsx
'use client'
import { createContext, useContext, type ReactNode } from 'react'
export interface SceneBridgeValue { toggleTheme: () => void; reducedMotion: boolean; coarsePointer: boolean }
const SceneBridgeContext = createContext<SceneBridgeValue | null>(null)
export function SceneBridgeProvider({ value, children }: { value: SceneBridgeValue; children: ReactNode }) {
  return <SceneBridgeContext.Provider value={value}>{children}</SceneBridgeContext.Provider>
}
export function useSceneBridge(): SceneBridgeValue {
  const value = useContext(SceneBridgeContext)
  if (!value) throw new Error('useSceneBridge must be used inside <SceneCanvas>')
  return value
}
```
```tsx
// src/components/three/SceneCanvas/SceneErrorBoundary.tsx
'use client'
import { Component, type ErrorInfo, type ReactNode } from 'react'
interface Props { onError: (error: Error) => void; children: ReactNode }
export default class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, _info: ErrorInfo) { this.props.onError(error) }
  render() { return this.state.failed ? null : this.props.children }
}
```
```tsx
// src/components/three/SceneCanvas/SceneReady.tsx
'use client'
import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { useSceneStore } from '@store/useSceneStore'
export default function SceneReady() {
  const { active, progress } = useProgress()
  useEffect(() => { useSceneStore.getState().setProgress(active ? Math.floor(progress) : 100) }, [active, progress])
  useEffect(() => { const s = useSceneStore.getState(); s.setSceneReady(true); return () => s.setSceneReady(false) }, [])
  return null
}
```

- [ ] **Step 4: Write Lighting, Decor, Room and the (empty) RoomObjects list**

```tsx
// src/components/three/Room/Lighting.tsx  (day preset; Task 22 adds the night blend)
'use client'
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#fff1dc', '#b9875a', 0.9]} />
      <directionalLight position={[-6, 9, 3]} intensity={1.6} color="#fff4e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0004} />
      <ambientLight intensity={0.25} />
    </>
  )
}
```
```tsx
// src/components/three/Room/Decor.tsx  (non-clickable furniture)
'use client'
import { Html, RoundedBox } from '@react-three/drei'
import { DoubleSide } from 'three'

import { roomLayout as L } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { site } from '@constants/site'

import { clay } from '../materials'

type V3 = readonly [number, number, number]
const Box = ({ args, position, color, radius = 0.06, rotationY = 0 }: { args: V3; position: V3; color: string; radius?: number; rotationY?: number }) => (
  <RoundedBox args={[...args]} radius={Math.min(radius, Math.min(...args) / 2 - 0.001)} position={[...position]} rotation={[0, rotationY, 0]} castShadow receiveShadow>
    <meshStandardMaterial {...clay(color)} />
  </RoundedBox>
)

function Lamp({ position, name, scale = 1 }: { position: V3; name: 'bedsideLamp' | 'deskLamp'; scale?: number }) {
  const s = scale
  return (
    <group position={[...position]} name={name}>
      <mesh position={[0, 0.02 * s, 0]}><cylinderGeometry args={[0.14 * s, 0.16 * s, 0.04 * s, 16]} /><meshStandardMaterial {...clay(palette.woodDark)} /></mesh>
      <mesh position={[0, 0.3 * s, 0]}><cylinderGeometry args={[0.03 * s, 0.03 * s, 0.56 * s, 8]} /><meshStandardMaterial {...clay(palette.woodDark)} /></mesh>
      <mesh position={[0, 0.66 * s, 0]} name="lampShade" userData={{ noHighlight: true }}>
        <cylinderGeometry args={[0.16 * s, 0.24 * s, 0.26 * s, 16, 1, true]} />
        <meshStandardMaterial {...clay(palette.peach)} side={DoubleSide} emissive={palette.lampGlow} emissiveIntensity={0} />
      </mesh>
      <pointLight name="lampLight" position={[0, 0.6 * s, 0]} intensity={0} distance={4} color={palette.lampGlow} />
    </group>
  )
}

export default function Decor() {
  const { bed, nightstand: ns, desk, sideTable: st, rug, door, beanbag, plant, mug } = L
  return (
    <group>
      <Box args={bed.size!} position={[bed.position[0], bed.size![1] / 2, bed.position[2]]} color={palette.wood} />
      <Box args={[2.0, 0.3, 3.2]} position={[bed.position[0], 0.75, bed.position[2]]} color={palette.cream} radius={0.12} />
      <Box args={[1.6, 0.2, 0.6]} position={[bed.position[0], 0.98, bed.position[2] - 1.2]} color={palette.peach} radius={0.09} />
      <Box args={[2.0, 0.16, 2.0]} position={[bed.position[0], 0.95, bed.position[2] + 0.5]} color={palette.sky} radius={0.07} />
      <Box args={ns.size!} position={[ns.position[0], ns.size![1] / 2, ns.position[2]]} color={palette.woodDark} />
      <Lamp position={L.bedsideLamp.position} name="bedsideLamp" />
      <Lamp position={L.deskLamp.position} name="deskLamp" scale={0.7} />
      <Box args={[desk.size![0], 0.1, desk.size![2]]} position={[desk.position[0], desk.size![1] - 0.05, desk.position[2]]} color={palette.wood} />
      {[-1, 1].map((sx) => <Box key={sx} args={[0.12, desk.size![1] - 0.1, desk.size![2] - 0.2]} position={[desk.position[0] + sx * (desk.size![0] / 2 - 0.1), (desk.size![1] - 0.1) / 2, desk.position[2]]} color={palette.woodDark} radius={0.04} />)}
      <Box args={st.size!} position={[st.position[0], st.size![1] / 2, st.position[2]]} color={palette.woodDark} />
      <group position={[...mug.position]} name="mug">
        <mesh castShadow position={[0, 0.09, 0]}><cylinderGeometry args={[0.09, 0.08, 0.18, 16]} /><meshStandardMaterial {...clay(palette.mint)} /></mesh>
        <mesh position={[0.11, 0.1, 0]}><torusGeometry args={[0.05, 0.015, 8, 16]} /><meshStandardMaterial {...clay(palette.mint)} /></mesh>
      </group>
      <RoundedBox args={[...rug.size!]} radius={0.02} position={[...rug.position]} receiveShadow><meshStandardMaterial {...clay(palette.sky)} /></RoundedBox>
      <mesh position={[beanbag.position[0], 0.35, beanbag.position[2]]} scale={[1, 0.7, 1]} castShadow><sphereGeometry args={[0.6, 24, 16]} /><meshStandardMaterial {...clay(palette.lavender)} /></mesh>
      <group position={[...plant.position]}>
        <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.28, 0.22, 0.5, 16]} /><meshStandardMaterial {...clay(palette.peach)} /></mesh>
        {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.15, 0.8 + i * 0.1, Math.sin(i * 2.1) * 0.15]} castShadow><sphereGeometry args={[0.28, 16, 12]} /><meshStandardMaterial {...clay(palette.mint)} /></mesh>)}
      </group>
      <Box args={door.size!} position={[door.position[0], door.size![1] / 2, door.position[2]]} color={palette.woodDark} radius={0.04} />
      <mesh position={[door.position[0] + 0.45, 1.3, door.position[2] + 0.08]}><sphereGeometry args={[0.06, 12, 8]} /><meshStandardMaterial color={palette.brass} roughness={0.4} metalness={0.3} /></mesh>
      <Html transform occlude="blending" position={[door.position[0], 2.0, door.position[2] + 0.07]} scale={0.25} style={{ pointerEvents: 'none' }}>
        <div className="stitched rounded-md bg-paper px-3 py-1 font-display text-lg font-extrabold text-ink">{site.shortName}&rsquo;s Room</div>
      </Html>
    </group>
  )
}
```
```tsx
// src/components/three/Room/index.tsx
'use client'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import { useSceneStore } from '@store/useSceneStore'
import { palette } from '@constants/roomPalette'
import { clay } from '../materials'
import Decor from './Decor'

export const ROOM = { size: 10, wallHeight: 6, wallThickness: 0.3 } as const

export default function Room() {
  const tier = useSceneStore((s) => s.tier)
  const half = ROOM.size / 2
  const t = ROOM.wallThickness
  return (
    <group>
      <RoundedBox args={[ROOM.size, 0.4, ROOM.size]} radius={0.08} position={[0, -0.2, 0]} receiveShadow><meshStandardMaterial {...clay(palette.floor)} /></RoundedBox>
      <RoundedBox args={[ROOM.size + 1, 0.5, ROOM.size + 1]} radius={0.15} position={[0, -0.65, 0]}><meshStandardMaterial {...clay(palette.base)} /></RoundedBox>
      <RoundedBox args={[t, ROOM.wallHeight, ROOM.size + t]} radius={0.06} position={[-half - t / 2, ROOM.wallHeight / 2, -t / 2]} receiveShadow><meshStandardMaterial {...clay(palette.wall)} /></RoundedBox>
      <RoundedBox args={[ROOM.size + t, ROOM.wallHeight, t]} radius={0.06} position={[-t / 2, ROOM.wallHeight / 2, -half - t / 2]} receiveShadow><meshStandardMaterial {...clay(palette.wall)} /></RoundedBox>
      <mesh position={[-half + 0.06, 0.15, 0]}><boxGeometry args={[0.12, 0.3, ROOM.size]} /><meshStandardMaterial {...clay(palette.wallTrim)} /></mesh>
      <mesh position={[0, 0.15, -half + 0.06]}><boxGeometry args={[ROOM.size, 0.3, 0.12]} /><meshStandardMaterial {...clay(palette.wallTrim)} /></mesh>
      <Decor />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2.4} far={4} resolution={tier === 'high' ? 1024 : 512} frames={tier === 'high' ? Infinity : 1} />
    </group>
  )
}
```
```tsx
// src/components/three/RoomObjects/index.tsx  (one line per clickable object; Tasks 12–18 add them)
'use client'
export default function RoomObjects() {
  return <group name="objects" />
}
```
(The folder is `RoomObjects`, not `Objects`, because `objects/` and `Objects/` would collide on macOS's case-insensitive file system.)

- [ ] **Step 5: Write SceneCanvas and wire it into the page**

```tsx
// src/components/three/SceneCanvas/index.tsx
'use client'
import { Suspense } from 'react'
import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useTheme } from 'next-themes'
import { PCFShadowMap } from 'three'

import Room from '@components/three/Room'
import Lighting from '@components/three/Room/Lighting'
import RoomObjects from '@components/three/RoomObjects'

import { useSceneStore } from '@store/useSceneStore'
import { useIsCoarsePointer } from '@hooks/useIsCoarsePointer'
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion'

import { DEFAULT_CAMERA_OFFSET as O, DEFAULT_CAMERA_TARGET as T } from '@constants/camera'

import { SceneBridgeProvider } from './SceneBridge'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneReady from './SceneReady'

export default function SceneCanvas() {
  const tier = useSceneStore((s) => s.tier)
  const { resolvedTheme, setTheme } = useTheme()
  const reducedMotion = usePrefersReducedMotion()
  const coarsePointer = useIsCoarsePointer()
  const bridge = { toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'), reducedMotion, coarsePointer }
  return (
    <div aria-hidden="true" className="absolute inset-0" data-testid="scene">
      <SceneErrorBoundary onError={() => useSceneStore.getState().setWebgl('lost')}>
        <Canvas
          orthographic
          camera={{ zoom: 60, position: [T[0] + O[0], T[1] + O[1], T[2] + O[2]], near: -100, far: 200 }}
          dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
          shadows={tier === 'high' ? { type: PCFShadowMap } : false}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl, camera }) => {
            camera.lookAt(T[0], T[1], T[2])
            gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); useSceneStore.getState().setWebgl('lost') })
          }}
        >
          <SceneBridgeProvider value={bridge}>
            <PerformanceMonitor onDecline={() => useSceneStore.getState().setTier('low')} flipflops={1} />
            <Suspense fallback={null}>
              <Lighting />
              <Room />
              <RoomObjects />
              <SceneReady />
            </Suspense>
          </SceneBridgeProvider>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
```
```tsx
// src/components/molecules/Poster/index.tsx  (add the hidden prop)
'use client'
import { useState } from 'react'
import { cn } from '@components/shadcn/utils'
export default function Poster({ hidden = false }: { hidden?: boolean }) {
  const [broken, setBroken] = useState(false)
  return (
    <div aria-hidden="true" className={cn('absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--paper-2),transparent_70%)] transition-opacity duration-700', hidden && 'opacity-0')}>
      {!broken && <img src="/poster/room-day.webp" alt="" onError={() => setBroken(true)} className="h-full w-full object-contain" />}
    </div>
  )
}
```
```tsx
// src/components/pages/Room/index.tsx  (v3)
'use client'
import dynamic from 'next/dynamic'

import Poster from '@components/molecules/Poster'
import Hud from '@components/organisms/Hud'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'

import { useSceneStore } from '@store/useSceneStore'
import { useWebGLSupport } from '@hooks/useWebGLSupport'

import type { SectionSlug } from '@interfaces/section'

import { useRoom } from './useRoom'

const SceneCanvas = dynamic(() => import('@components/three/SceneCanvas'), { ssr: false })

export default function Room({ initialSection }: { initialSection: SectionSlug | null }) {
  const { phase, transition } = useRoom(initialSection)
  useWebGLSupport()
  const webgl = useSceneStore((s) => s.webgl)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  return (
    <main className="relative h-dvh w-full overflow-hidden" data-phase={phase} data-transition={transition} data-webgl={webgl}>
      <SectionNav />
      <Poster hidden={sceneReady} />
      {webgl === 'supported' && <SceneCanvas />}
      <ModalHost />
      <Hud />
    </main>
  )
}
```
Run: `yarn test && yarn typecheck && yarn lint`
Expected: PASS.

- [ ] **Step 6: Verify in the browser**

`yarn dev` → `/`: the diorama (walls, floor, bed, desk, door with nameplate, soft contact shadows) replaces the poster; no console errors. Resize the window: no crash. Launch Chrome with WebGL off (`open -na "Google Chrome" --args --disable-3d-apis http://localhost:3000`): `<main data-webgl="unsupported">`, the poster stays, panels still open. `yarn build`: the route's First Load JS stays under ~250 KB because the scene is a separate chunk.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add the 3D scene canvas, room shell and WebGL fallback

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 12: Interactive wrapper, hover label and the PC

Implements: design doc 03 "Interactions" (hit testing, hover, mobile labels); the first clickable object.

**Files:**
- Create: `src/components/molecules/HoverLabel/index.tsx`, `src/components/three/Interactive/index.tsx`, `src/components/three/objects/Pc/index.tsx`
- Modify: `src/components/three/RoomObjects/index.tsx`

**Interfaces:**
- Produces: `Interactive` with props from "Shared Interfaces → Component props (3D)". It names its outer group `id` (so `scene.getObjectByName(objectId)` finds it), lifts/scales on hover, tints every child mesh's `emissive` unless `mesh.userData.noHighlight`, renders an enlarged invisible hit box, shows `HoverLabel` on hover (desktop) or always (coarse pointer), and calls `onActivate` on click/tap.
- Consumes: `useSceneStore` (hovered/hint), `useSceneBridge`, `openFromScene`.

- [ ] **Step 1: Write HoverLabel and Interactive**

```tsx
// src/components/molecules/HoverLabel/index.tsx
export default function HoverLabel({ label, onClick }: { label: string; onClick?: () => void }) {
  const cls = 'stitched whitespace-nowrap rounded-xl bg-paper px-3 py-1 font-display text-sm font-bold text-ink shadow-md'
  return onClick ? <button type="button" tabIndex={-1} onClick={onClick} className={cls}>{label}</button> : <span className={cls}>{label}</span>
}
```
```tsx
// src/components/three/Interactive/index.tsx
'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { Html, Sparkles, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

import HoverLabel from '@components/molecules/HoverLabel'

import { useSceneStore } from '@store/useSceneStore'

import type { ObjectId, Vec3 } from '@interfaces/section'
import { palette } from '@constants/roomPalette'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'

export interface InteractiveProps { id: ObjectId; label: string; hitSize: Vec3; hitOffset?: Vec3; labelHeight: number; onActivate: () => void; children: ReactNode }

export default function Interactive({ id, label, hitSize, hitOffset = [0, 0, 0], labelHeight, onActivate, children }: InteractiveProps) {
  const inner = useRef<Group>(null)
  const lift = useRef(0)
  const hovered = useSceneStore((s) => s.hovered === id)
  const hinted = useSceneStore((s) => s.hint === id)
  const { reducedMotion, coarsePointer } = useSceneBridge()
  useCursor(hovered)

  useFrame((_, dt) => {
    const g = inner.current
    if (!g) return
    const target = hovered && !reducedMotion ? 1 : 0
    lift.current += (target - lift.current) * Math.min(1, dt * 12)
    g.position.y = lift.current * 0.08
    const s = 1 + lift.current * 0.03
    g.scale.set(s, s, s)
  })

  useEffect(() => {
    inner.current?.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh || mesh.userData.noHighlight) return
      const m = mesh.material as MeshStandardMaterial
      if (!m?.emissive) return
      m.emissive.set(hovered || hinted ? palette.lampGlow : '#000000')
      m.emissiveIntensity = hovered ? 0.18 : hinted ? 0.12 : 0
    })
  }, [hovered, hinted])

  const setHovered = useSceneStore.getState().setHovered
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(id) }
  const out = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); if (useSceneStore.getState().hovered === id) setHovered(null) }
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onActivate() }

  return (
    <group name={id} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>{children}</group>
      <mesh position={[...hitOffset]}><boxGeometry args={[...hitSize]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      {hinted && <Sparkles count={24} scale={[hitSize[0] + 0.4, hitSize[1] + 0.4, hitSize[2] + 0.4]} position={[...hitOffset]} size={5} speed={0.5} color={palette.lampGlow} />}
      {(hovered || coarsePointer) && (
        <Html center position={[0, labelHeight, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: coarsePointer ? 'auto' : 'none' }}>
          <HoverLabel label={label} onClick={coarsePointer ? onActivate : undefined} />
        </Html>
      )}
    </group>
  )
}
```

- [ ] **Step 2: Write the PC and register it**

```tsx
// src/components/three/objects/Pc/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function Pc() {
  return (
    <group position={[...roomLayout.pc.position]}>
      <Interactive id="pc" label="Work experience" hitSize={[1.5, 1.1, 0.9]} hitOffset={[0, 0.5, 0.2]} labelHeight={1.25} onActivate={() => openFromScene('experience')}>
        <RoundedBox args={[1.2, 0.8, 0.08]} radius={0.04} position={[0, 0.7, 0]} castShadow><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
        <mesh position={[0, 0.7, 0.045]} name="pcScreen" userData={{ noHighlight: true }}><planeGeometry args={[1.08, 0.68]} /><meshStandardMaterial color={palette.screen} emissive={palette.screenGlow} emissiveIntensity={0.5} roughness={0.6} /></mesh>
        <RoundedBox args={[0.12, 0.3, 0.12]} radius={0.03} position={[0, 0.15, 0]}><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
        <RoundedBox args={[0.5, 0.05, 0.3]} radius={0.02} position={[0, 0.025, 0]}><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
        <RoundedBox args={[0.9, 0.05, 0.3]} radius={0.02} position={[0, 0.025, 0.5]} castShadow><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
        <RoundedBox args={[0.14, 0.06, 0.22]} radius={0.04} position={[0.65, 0.03, 0.5]} castShadow><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
      </Interactive>
    </group>
  )
}
```
In `RoomObjects/index.tsx`, import `Pc` and render `<Pc />` inside the group.

- [ ] **Step 3: Verify, lint, commit**

`yarn dev`: hovering the PC lifts it, warms its color and shows the "Work experience" tag; clicking opens `/experience` (for now the panel appears after the 1.5 s focus timeout, because the camera director arrives in Task 13). Emulate a touch device in DevTools: the tag is always visible and tapping it opens the panel.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add interactive object wrapper and the PC

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 13: Camera director (fit, focus glides, enter swoop, parallax, mobile limits) and screen-rect projection

Implements: design doc 03 "Camera"; doc 02 "Grow out of the object", "Interaction state machine" (focusing → open, entering → ready).

**Files:**
- Create: `src/utils/projectRect.ts`, `src/utils/projectRect.test.ts`, `src/components/three/CameraDirector/cameraMath.ts`, `src/components/three/CameraDirector/cameraMath.test.ts`, `src/components/three/CameraDirector/index.tsx`
- Modify: `src/components/three/SceneCanvas/index.tsx` (render `<CameraDirector />` after `<RoomObjects />`)

**Interfaces:**
- Produces: `ndcPointsToRect`, `objectScreenRect`, `lookAtArgs(target, offset)`; `CameraDirector` reacts to `phase === 'entering'` (swoop, then `setPhase('ready')`), `transition === 'focusing'` (glide + zoom, then `setOriginRect` + `setTransition('open')`), `transition === 'idle' && no section` (return to default) and direct links (snap to the object's pose without animation).
- Install: `yarn add camera-controls` (drei's dependency, needed directly for the `ACTION` enum and the ref type).

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/projectRect.test.ts
import { describe, expect, it } from 'vitest'
import { ndcPointsToRect } from './projectRect'
describe('ndcPointsToRect', () => {
  it('maps the full NDC square onto the whole viewport', () => {
    expect(ndcPointsToRect([{ x: -1, y: 1 }, { x: 1, y: -1 }], 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })
  it('flips y and takes the bounding box of all points', () => {
    expect(ndcPointsToRect([{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0.25, y: 0.1 }], 200, 100)).toEqual({ x: 100, y: 25, width: 50, height: 25 })
  })
})
// src/components/three/CameraDirector/cameraMath.test.ts
import { describe, expect, it } from 'vitest'
import { lookAtArgs } from './cameraMath'
describe('lookAtArgs', () => {
  it('returns camera position then target', () => {
    expect(lookAtArgs([0, 1, 0], [10, 8, 10])).toEqual([10, 9, 10, 0, 1, 0])
  })
})
```
Run: `yarn test`
Expected: FAIL.

- [ ] **Step 2: Implement the utils**

```ts
// src/utils/projectRect.ts
import { Box3, Vector3, type Camera, type Object3D } from 'three'
import type { Rect } from '@interfaces/ui'

export function ndcPointsToRect(points: ReadonlyArray<{ x: number; y: number }>, width: number, height: number): Rect {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    const x = ((p.x + 1) / 2) * width
    const y = ((1 - p.y) / 2) * height
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function objectScreenRect(object: Object3D, camera: Camera, width: number, height: number): Rect {
  const box = new Box3().setFromObject(object)
  const corners: { x: number; y: number }[] = []
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const v = new Vector3(x, y, z).project(camera)
    corners.push({ x: v.x, y: v.y })
  }
  return ndcPointsToRect(corners, width, height)
}
```
```ts
// src/components/three/CameraDirector/cameraMath.ts
import type { Vec3 } from '@interfaces/section'
export function lookAtArgs(target: Vec3, offset: Vec3): [number, number, number, number, number, number] {
  return [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2], target[0], target[1], target[2]]
}
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Write the CameraDirector**

```tsx
// src/components/three/CameraDirector/index.tsx
'use client'
import { useCallback, useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import CameraControlsImpl from 'camera-controls'
import { Box3, Vector3 } from 'three'

import { useRoomStore } from '@store/useRoomStore'

import { AZIMUTH_LIMIT, CAMERA_SMOOTH_TIME, DEFAULT_CAMERA_OFFSET, DEFAULT_CAMERA_TARGET, ENTER_SWOOP_OFFSET, MOBILE_ZOOM_FACTOR, PARALLAX_AZIMUTH, PARALLAX_POLAR, POLAR_MAX, POLAR_MIN } from '@constants/camera'
import { sectionBySlug } from '@constants/sections'
import type { SectionSlug } from '@interfaces/section'
import { currentSlug } from '@utils/history'
import { objectScreenRect } from '@utils/projectRect'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'
import { lookAtArgs } from './cameraMath'

const { ACTION } = CameraControlsImpl
const ROOM_BOX = new Box3(new Vector3(-5.5, -0.9, -5.5), new Vector3(5.5, 6, 5.5))
const PADDING = { paddingTop: 0.4, paddingBottom: 0.2, paddingLeft: 0.3, paddingRight: 0.3 }

export default function CameraDirector() {
  const controls = useRef<CameraControlsImpl>(null)
  const { reducedMotion, coarsePointer } = useSceneBridge()
  const { camera, size, scene } = useThree()
  const fittedZoom = useRef(60)
  const defaultAngles = useRef({ azimuth: Math.PI / 4, polar: 1.0 })
  const token = useRef(0)
  const phase = useRoomStore((s) => s.phase)
  const transition = useRoomStore((s) => s.transition)

  const fitDefault = useCallback((animate: boolean) => {
    const c = controls.current
    if (!c) return
    c.setLookAt(...lookAtArgs(DEFAULT_CAMERA_TARGET, DEFAULT_CAMERA_OFFSET), animate)
    c.fitToBox(ROOM_BOX, animate, PADDING)
    if (coarsePointer) c.zoomTo(fittedZoom.current, animate)
  }, [coarsePointer])

  const applyPose = useCallback((slug: SectionSlug, animate: boolean) => {
    const c = controls.current
    if (!c) return Promise.resolve()
    const pose = sectionBySlug(slug).cameraPose
    return Promise.all([
      c.setLookAt(...lookAtArgs(pose.target, pose.offset), animate),
      c.zoomTo(fittedZoom.current * pose.zoomFactor, animate),
    ])
  }, [])

  // Input: desktop has no drag/zoom (parallax only); touch gets clamped rotate + pinch zoom.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.smoothTime = CAMERA_SMOOTH_TIME
    c.mouseButtons.left = ACTION.NONE; c.mouseButtons.middle = ACTION.NONE; c.mouseButtons.right = ACTION.NONE; c.mouseButtons.wheel = ACTION.NONE
    c.touches.one = coarsePointer ? ACTION.TOUCH_ROTATE : ACTION.NONE
    c.touches.two = coarsePointer ? ACTION.TOUCH_ZOOM_TRUCK : ACTION.NONE
    c.touches.three = ACTION.NONE
    c.setBoundary(ROOM_BOX)
  }, [coarsePointer])

  // Default framing on mount and resize; then read back the fitted zoom and set limits.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.setLookAt(...lookAtArgs(DEFAULT_CAMERA_TARGET, DEFAULT_CAMERA_OFFSET), false)
    c.fitToBox(ROOM_BOX, false, PADDING)
    const id = requestAnimationFrame(() => {
      fittedZoom.current = camera.zoom * (coarsePointer ? MOBILE_ZOOM_FACTOR : 1)
      defaultAngles.current = { azimuth: c.azimuthAngle, polar: c.polarAngle }
      c.minAzimuthAngle = c.azimuthAngle - AZIMUTH_LIMIT; c.maxAzimuthAngle = c.azimuthAngle + AZIMUTH_LIMIT
      c.minPolarAngle = POLAR_MIN; c.maxPolarAngle = POLAR_MAX
      c.minZoom = fittedZoom.current * 0.9; c.maxZoom = fittedZoom.current * 1.6
      const slug = currentSlug()
      if (slug) applyPose(slug, false) // direct link: snap to the object
      else if (coarsePointer) c.zoomTo(fittedZoom.current, false)
    })
    return () => cancelAnimationFrame(id)
  }, [size.width, size.height, coarsePointer, camera, applyPose])

  // Enter swoop, focus glide, return.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const mine = ++token.current
    const animate = !reducedMotion
    const slug = currentSlug()
    const done = (fn: () => void) => { if (mine === token.current) fn() }

    if (phase === 'entering') {
      c.setLookAt(...lookAtArgs(DEFAULT_CAMERA_TARGET, ENTER_SWOOP_OFFSET), false)
      fitDefault(animate)
      Promise.resolve(c.zoomTo(fittedZoom.current, animate)).then(() => done(() => useRoomStore.getState().setPhase('ready')))
      return
    }
    if (transition === 'focusing' && slug) {
      applyPose(slug, animate).then(() => done(() => {
        const target = scene.getObjectByName(sectionBySlug(slug).objectId)
        const s = useRoomStore.getState()
        s.setOriginRect(target ? objectScreenRect(target, camera, size.width, size.height) : null)
        s.setTransition('open')
      }))
      return
    }
    if (transition === 'idle' && slug === null && phase === 'ready') fitDefault(animate)
  }, [phase, transition, reducedMotion, fitDefault, applyPose, camera, scene, size.width, size.height])

  // Desktop parallax while idle in the room.
  useFrame((state) => {
    const c = controls.current
    if (!c || coarsePointer || reducedMotion) return
    const s = useRoomStore.getState()
    if (s.phase !== 'ready' || s.transition !== 'idle' || currentSlug() !== null) return
    const { azimuth, polar } = defaultAngles.current
    c.rotateTo(azimuth + state.pointer.x * PARALLAX_AZIMUTH, polar - state.pointer.y * PARALLAX_POLAR, true)
  })

  return <CameraControls ref={controls} makeDefault />
}
```
Render `<CameraDirector />` inside the `Suspense` in `SceneCanvas` after `<RoomObjects />`.

- [ ] **Step 4: Verify, commit**

`yarn dev`: clicking the PC glides the camera in (about 0.6 s) and then the panel **grows out of the monitor**; closing shrinks it back and the camera returns; `/experience` as a direct link loads already posed at the PC; moving the mouse gives a gentle parallax; with "Emulate CSS prefers-reduced-motion" the camera cuts instantly. On a touch emulation, one-finger drag rotates within limits and pinch zooms.
```bash
yarn lint && yarn typecheck && yarn test
git add -A
git commit -m "feat: add camera director with focus glides and object projection

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 14: Loader, Enter gate, progress pill and the entering swoop

Implements: design doc 04 "Loader"; doc 02 "Entry flow"; doc 07 (slow 3D load on a direct link → progress pill).

**Files:**
- Create: `src/constants/loader.ts`, `src/components/atoms/ProgressBar/index.tsx`, `src/components/organisms/Loader/index.tsx`, `src/components/organisms/Loader/OyenWalk.tsx`, `src/components/organisms/Loader/Loader.test.tsx`, `src/components/molecules/ProgressPill/index.tsx`
- Modify: `src/components/pages/Room/index.tsx` (render Loader while `showLoader`, ProgressPill on direct links, `enter()` handler)

**Interfaces:**
- Produces: `MIN_LOADER_MS = 600`, `MESSAGE_INTERVAL_MS = 1400`, `loaderMessages`; `Loader { onEnter(): void }` moves `phase` from `loading` to `gate` itself; `Room.enter()` sets `phase` to `entering` (scene ready) or `ready` (fallback). Task 24 adds `audio.unlock()` to `enter()`.

- [ ] **Step 1: Write the failing Loader test**

```tsx
// src/components/organisms/Loader/Loader.test.tsx
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import Loader from '.'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('Loader', () => {
  beforeEach(() => { vi.useFakeTimers(); useRoomStore.setState({ phase: 'loading' }); useSceneStore.setState({ webgl: 'unknown', sceneReady: false, progress: 0 }) })
  afterEach(() => vi.useRealTimers())

  it('opens the gate with a simple-view button when WebGL is unsupported', () => {
    useSceneStore.setState({ webgl: 'unsupported' })
    render(<Loader onEnter={() => {}} />)
    act(() => { vi.advanceTimersByTime(700) })
    expect(useRoomStore.getState().phase).toBe('gate')
    expect(screen.getByRole('button', { name: 'Enter (simple view)' })).toBeInTheDocument()
  })
  it('waits for the scene and the minimum time, then offers Enter', async () => {
    useSceneStore.setState({ webgl: 'supported' })
    const onEnter = vi.fn()
    render(<Loader onEnter={onEnter} />)
    act(() => { useSceneStore.setState({ sceneReady: true, progress: 100 }) })
    act(() => { vi.advanceTimersByTime(700) })
    const button = screen.getByRole('button', { name: 'Enter the room' })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(button)
    expect(onEnter).toHaveBeenCalled()
  })
})
```
Run: `yarn test src/components/organisms/Loader`
Expected: FAIL.

- [ ] **Step 2: Write the constants, atoms and Loader**

```ts
// src/constants/loader.ts
export const MIN_LOADER_MS = 600
export const MESSAGE_INTERVAL_MS = 1400
export const loaderMessages = ['Tidying up the room…', 'Fluffing the pillows…', 'Waking Oyen up…'] as const
```
```tsx
// src/components/atoms/ProgressBar/index.tsx
export default function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} className="h-3 w-64 overflow-hidden rounded-full bg-paper-2">
      <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${value}%` }} />
    </div>
  )
}
```
```tsx
// src/components/organisms/Loader/OyenWalk.tsx  (2D Oyen padding along the bar; CSS bob animation)
export default function OyenWalk({ progress }: { progress: number }) {
  return (
    <div className="relative h-16 w-64" aria-hidden="true">
      <svg viewBox="0 0 64 48" width="64" height="48" className="absolute -top-2 animate-bounce motion-reduce:animate-none" style={{ left: `calc(${Math.min(progress, 100)}% - 32px)`, transition: 'left 300ms' }}>
        <ellipse cx="34" cy="34" rx="22" ry="11" fill="#F2A03D" />
        <circle cx="16" cy="24" r="12" fill="#F2A03D" />
        <path d="M6 16l2-10 8 7zM26 16l-2-10-8 7z" fill="#F2A03D" />
        <circle cx="12" cy="23" r="1.8" fill="#4A3426" /><circle cx="20" cy="23" r="1.8" fill="#4A3426" />
        <path d="M14 28h4" stroke="#E58A8A" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 30c6-6 8 2 4 6" stroke="#F2A03D" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="24" y="40" width="5" height="7" rx="2.5" fill="#D9842A" /><rect x="40" y="40" width="5" height="7" rx="2.5" fill="#D9842A" />
      </svg>
    </div>
  )
}
```
```tsx
// src/components/organisms/Loader/index.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Button from '@components/atoms/Button'
import ProgressBar from '@components/atoms/ProgressBar'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { MESSAGE_INTERVAL_MS, MIN_LOADER_MS, loaderMessages } from '@constants/loader'

import OyenWalk from './OyenWalk'

export default function Loader({ onEnter }: { onEnter: () => void }) {
  const phase = useRoomStore((s) => s.phase)
  const progress = useSceneStore((s) => s.progress)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const webgl = useSceneStore((s) => s.webgl)
  const { linkProps } = useSectionNavigation()
  const [msg, setMsg] = useState(0)
  const mountedAt = useRef(Date.now())
  const fallback = webgl === 'unsupported' || webgl === 'lost'
  const shown = fallback || phase === 'gate' ? 100 : sceneReady ? progress : Math.min(progress, 90)

  useEffect(() => {
    const id = window.setInterval(() => setMsg((m) => (m + 1) % loaderMessages.length), MESSAGE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'loading') return
    const done = fallback || (sceneReady && progress >= 100)
    if (!done) return
    const wait = Math.max(0, MIN_LOADER_MS - (Date.now() - mountedAt.current))
    const t = window.setTimeout(() => useRoomStore.getState().setPhase('gate'), wait)
    return () => window.clearTimeout(t)
  }, [phase, fallback, sceneReady, progress])

  const skip = linkProps('resume')
  return (
    <motion.div role="status" aria-live="polite" className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-paper" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <OyenWalk progress={shown} />
      <ProgressBar value={shown} label="Loading the room" />
      <p className="font-display text-lg text-ink-muted">{phase === 'gate' ? 'Ready!' : loaderMessages[msg]}</p>
      <AnimatePresence>
        {phase === 'gate' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Button onClick={onEnter} className="text-lg">{fallback ? 'Enter (simple view)' : 'Enter the room'}</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <a href={skip.href} onClick={(e) => { skip.onClick(e); if (e.defaultPrevented) useRoomStore.getState().setPhase('ready') }} className="text-sm underline">Skip to my resume →</a>
    </motion.div>
  )
}
```
```tsx
// src/components/molecules/ProgressPill/index.tsx
'use client'
import { useSceneStore } from '@store/useSceneStore'
export default function ProgressPill() {
  const progress = useSceneStore((s) => s.progress)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const webgl = useSceneStore((s) => s.webgl)
  if (webgl !== 'supported' || sceneReady) return null
  return <div role="status" className="stitched fixed bottom-20 left-4 z-30 rounded-full bg-paper px-3 py-1 font-display text-xs font-bold shadow-md sm:bottom-4">Room loading… {progress}%</div>
}
```

- [ ] **Step 3: Wire the Loader into the Room page**

In `src/components/pages/Room/index.tsx`:
```tsx
import { AnimatePresence } from 'motion/react'
import Loader from '@components/organisms/Loader'
import ProgressPill from '@components/molecules/ProgressPill'
import { useRoomStore } from '@store/useRoomStore'
// inside the component:
const { phase, transition, active, showLoader } = useRoom(initialSection)
const enter = () => useRoomStore.getState().setPhase(webgl === 'supported' && sceneReady ? 'entering' : 'ready')
// in JSX, after <Hud />:
{active !== null && <ProgressPill />}
<AnimatePresence>{showLoader && <Loader key="loader" onEnter={enter} />}</AnimatePresence>
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 4: Verify, commit**

`yarn dev` → `/`: the loader shows Oyen padding along the bar, then "Enter the room"; clicking fades the loader and the camera swoops in. `/skills` direct link: no loader, the panel is visible at once with a "Room loading…" pill until the scene is ready. With WebGL disabled: "Enter (simple view)" shows the poster room.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add loader gate, progress pill and entering swoop

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 15: Desk-area objects: photo frame, printer, clocks

Implements: design doc 03 "Interactive objects" rows 1, 9, 11.

**Files:**
- Create: `src/components/three/objects/PhotoFrame/index.tsx`, `src/components/three/objects/Printer/index.tsx`, `src/components/three/objects/Clocks/index.tsx`
- Modify: `src/components/three/RoomObjects/index.tsx`

**Interfaces:**
- Produces: `Clocks` exposes hand meshes named `hourHand-<zoneId>` / `minuteHand-<zoneId>` (Task 21 animates them); `Printer` names its sheet `printerSheet` and slides it out while `/resume` is open.

- [ ] **Step 1: Write the three objects**

```tsx
// src/components/three/objects/PhotoFrame/index.tsx
'use client'
import { RoundedBox, useTexture } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { about } from '@content/about'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

function Photo({ src }: { src: string }) {
  const map = useTexture(src)
  return <mesh position={[0, 0.3, 0.03]} userData={{ noHighlight: true }}><planeGeometry args={[0.38, 0.46]} /><meshStandardMaterial map={map} roughness={0.8} /></mesh>
}

export default function PhotoFrame() {
  const p = roomLayout['photo-frame']
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive id="photo-frame" label="About me" hitSize={[0.7, 0.75, 0.5]} hitOffset={[0, 0.3, 0]} labelHeight={0.85} onActivate={() => openFromScene('about')}>
        <RoundedBox args={[0.5, 0.6, 0.05]} radius={0.03} position={[0, 0.3, 0]} castShadow><meshStandardMaterial {...clay(palette.wood)} /></RoundedBox>
        {about.photo ? <Photo src={about.photo.src} /> : <mesh position={[0, 0.3, 0.03]} userData={{ noHighlight: true }}><planeGeometry args={[0.38, 0.46]} /><meshStandardMaterial {...clay(palette.peach)} /></mesh>}
        <RoundedBox args={[0.04, 0.4, 0.3]} radius={0.015} position={[0, 0.2, -0.15]} rotation={[0.5, 0, 0]}><meshStandardMaterial {...clay(palette.woodDark)} /></RoundedBox>
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/Printer/index.tsx
'use client'
import { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { currentSlug, openFromScene } from '@utils/history'

export default function Printer() {
  const sheet = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (!sheet.current) return
    const target = currentSlug() === 'resume' ? 0.42 : 0.12
    sheet.current.position.z += (target - sheet.current.position.z) * Math.min(1, dt * 4)
  })
  return (
    <group position={[...roomLayout.printer.position]}>
      <Interactive id="printer" label="Resume" hitSize={[1.0, 0.6, 0.9]} hitOffset={[0, 0.2, 0.1]} labelHeight={0.7} onActivate={() => openFromScene('resume')}>
        <RoundedBox args={[0.8, 0.32, 0.6]} radius={0.06} position={[0, 0.16, 0]} castShadow><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
        <RoundedBox args={[0.6, 0.06, 0.3]} radius={0.02} position={[0, 0.36, -0.05]}><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
        <mesh ref={sheet} name="printerSheet" position={[0, 0.2, 0.12]} rotation={[-0.15, 0, 0]} userData={{ noHighlight: true }}><planeGeometry args={[0.42, 0.56]} /><meshStandardMaterial color="#ffffff" roughness={1} side={2} /></mesh>
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/Clocks/index.tsx  (static hands at 10:10; Task 21 drives them)
'use client'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { clockZones } from '@constants/timezones'
import { openFromScene } from '@utils/history'

export function Clock({ zoneId, x }: { zoneId: string; x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.06, 32]} /><meshStandardMaterial {...clay(palette.cream)} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.005]}><torusGeometry args={[0.28, 0.035, 12, 32]} /><meshStandardMaterial {...clay(palette.wood)} /></mesh>
      <group name={`hourHand-${zoneId}`} position={[0, 0, 0.04]} rotation={[0, 0, -Math.PI * (10 / 6)]}><mesh position={[0, 0.08, 0]}><boxGeometry args={[0.035, 0.16, 0.015]} /><meshStandardMaterial {...clay(palette.ink)} /></mesh></group>
      <group name={`minuteHand-${zoneId}`} position={[0, 0, 0.05]} rotation={[0, 0, -Math.PI * (2 / 6)]}><mesh position={[0, 0.11, 0]}><boxGeometry args={[0.025, 0.22, 0.015]} /><meshStandardMaterial {...clay(palette.terracotta)} /></mesh></group>
      <mesh position={[0, -0.42, 0]}><boxGeometry args={[0.44, 0.12, 0.03]} /><meshStandardMaterial {...clay(palette.wood)} /></mesh>
    </group>
  )
}

export default function Clocks() {
  return (
    <group position={[...roomLayout.clocks.position]}>
      <Interactive id="clocks" label="Remote work" hitSize={[2.4, 0.9, 0.3]} hitOffset={[0, -0.1, 0.05]} labelHeight={0.5} onActivate={() => openFromScene('remote-work')}>
        {clockZones.map((z, i) => <Clock key={z.id} zoneId={z.id} x={(i - 1) * 0.9} />)}
      </Interactive>
    </group>
  )
}
```
Register `<PhotoFrame />`, `<Printer />`, `<Clocks />` in `RoomObjects`.

- [ ] **Step 2: Verify, commit**

`yarn dev`: three new hover tags; the photo frame opens About; the printer's sheet slides out while Resume is open; the clocks open Remote work.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add photo frame, printer and wall clocks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 16: Bookshelf, radio, education frames, Indonesia map (generated from public-domain data) and the Travel panel map

Implements: design doc 03 rows 3, 4, 6, 14; doc 05 "Travel" (map from Natural Earth via `world-atlas`); doc 04 "Themed interiors" (map theme).

**Files:**
- Create: `scripts/build-indonesia-map.mjs`, `src/constants/indonesiaMap.ts` (generated), `src/utils/map.ts`, `src/utils/map.test.ts`, `src/components/molecules/MapPin/index.tsx`, `src/components/three/objects/Bookshelf/index.tsx`, `src/components/three/objects/Radio/index.tsx`, `src/components/three/objects/EduFrames/index.tsx`, `src/components/three/objects/IndonesiaMap/index.tsx`, `src/components/three/objects/IndonesiaMap/useMapTexture.ts`
- Modify: `src/components/organisms/TravelPanel/index.tsx`, `src/components/three/RoomObjects/index.tsx`, `package.json` (script `map:build`)
- Install: `yarn add -D world-atlas topojson-client d3-geo @types/topojson-client @types/d3-geo`

**Interfaces:**
- Produces: `indonesiaMap = { width: 1024, height: 512, scale, translate, path }`; `mercatorXY(lat, lon, scale, translate)`; `MapPin { pin: ITravelPin; x; y; selected; onSelect }`; `useMapTexture(): CanvasTexture` (draws the path + pins to an offscreen canvas).
- `Radio.onActivate` toggles `useSoundStore.music` (and switches `master` on when turning music on); Task 24 connects it to real audio.

- [ ] **Step 1: Write the failing map test**

```ts
// src/utils/map.test.ts
import { describe, expect, it } from 'vitest'
import { indonesiaMap } from '@constants/indonesiaMap'
import { mercatorXY } from './map'
describe('mercatorXY', () => {
  it('matches the Mercator formula', () => {
    expect(mercatorXY(0, 0, 100, [0, 0])).toEqual({ x: 0, y: 0 })
    expect(mercatorXY(0, 180, 100, [0, 0]).x).toBeCloseTo(100 * Math.PI, 5)
    expect(mercatorXY(45, 0, 100, [0, 0]).y).toBeCloseTo(-88.137, 2)
  })
  it('projects Jakarta inside the generated map board', () => {
    const { x, y } = mercatorXY(-6.2, 106.8, indonesiaMap.scale, indonesiaMap.translate)
    expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(indonesiaMap.width)
    expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(indonesiaMap.height)
  })
})
```
Run: `yarn test src/utils/map`
Expected: FAIL (`indonesiaMap` and `map` missing).

- [ ] **Step 2: Write the generator script and run it**

```js
// scripts/build-indonesia-map.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url), 'utf8'))
const countries = feature(topo, topo.objects.countries)
const indonesia = countries.features.find((f) => f.id === '360')
if (!indonesia) throw new Error('Indonesia (ISO numeric 360) not found in world-atlas')

const WIDTH = 1024, HEIGHT = 512, PAD = 24
const projection = geoMercator().fitExtent([[PAD, PAD], [WIDTH - PAD, HEIGHT - PAD]], indonesia)
const path = geoPath(projection)(indonesia)
const [tx, ty] = projection.translate()
const out = `// Generated by scripts/build-indonesia-map.mjs from world-atlas (Natural Earth, public domain). Do not edit by hand.
export const indonesiaMap = {
  width: ${WIDTH},
  height: ${HEIGHT},
  scale: ${projection.scale()},
  translate: [${tx}, ${ty}] as const,
  path: '${path}',
} as const
`
writeFileSync(new URL('../src/constants/indonesiaMap.ts', import.meta.url), out)
console.log('wrote src/constants/indonesiaMap.ts')
```
Add `"map:build": "node scripts/build-indonesia-map.mjs"` to `package.json` scripts, then run `yarn map:build`. Expected: the file exists and `path` starts with `M`.
```ts
// src/utils/map.ts
export function mercatorXY(lat: number, lon: number, scale: number, translate: readonly [number, number]) {
  const lambda = (lon * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  return { x: scale * lambda + translate[0], y: scale * -Math.log(Math.tan(Math.PI / 4 + phi / 2)) + translate[1] }
}
```
Run: `yarn test src/utils/map`
Expected: PASS. Add a row to `CREDITS.md`: `Indonesia outline | world-atlas (Natural Earth 4.1) | ISC / public domain | Travel map`.

- [ ] **Step 3: Write the Travel panel map**

```tsx
// src/components/molecules/MapPin/index.tsx
import type { ITravelPin } from '@models/travel'
export default function MapPin({ pin, x, y, selected, onSelect }: { pin: ITravelPin; x: number; y: number; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={selected ? 14 : 10} fill="#B8553A" stroke="#FFF7E8" strokeWidth={3} role="button" tabIndex={0} aria-label={pin.place} onClick={() => onSelect(pin.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pin.id) }} style={{ cursor: 'pointer' }} />
    </g>
  )
}
```
```tsx
// src/components/organisms/TravelPanel/index.tsx  (replaces the Task 5 version)
'use client'
import { useState } from 'react'
import EmptyState from '@components/molecules/EmptyState'
import MapPin from '@components/molecules/MapPin'
import { oyenLines } from '@content/oyen'
import { travelPins as defaultPins } from '@content/travel'
import { indonesiaMap } from '@constants/indonesiaMap'
import type { ITravelPin } from '@models/travel'
import { mercatorXY } from '@utils/map'

export default function TravelPanel({ pins = defaultPins }: { pins?: readonly ITravelPin[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(pins[0]?.id ?? null)
  const selected = pins.find((p) => p.id === selectedId) ?? null
  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <svg viewBox={`0 0 ${indonesiaMap.width} ${indonesiaMap.height}`} role="img" aria-label="Map of Indonesia with visited places" className="w-full rounded-xl bg-sky/40">
        <path d={indonesiaMap.path} fill="#9FD8C3" stroke="#7A5235" strokeWidth={2} strokeLinejoin="round" />
        {pins.map((p) => { const { x, y } = mercatorXY(p.lat, p.lon, indonesiaMap.scale, indonesiaMap.translate); return <MapPin key={p.id} pin={p} x={x} y={y} selected={p.id === selectedId} onSelect={setSelectedId} /> })}
      </svg>
      {pins.length === 0 ? <EmptyState message={oyenLines.empty.travel} /> : (
        <div>
          <ul className="mb-3 flex flex-wrap gap-2">{pins.map((p) => <li key={p.id}><button type="button" aria-pressed={p.id === selectedId} onClick={() => setSelectedId(p.id)} className="min-h-11 rounded-full bg-paper-2 px-3 font-display text-sm font-bold aria-pressed:bg-peach">{p.place}</button></li>)}</ul>
          {selected && <article aria-live="polite" className="rounded-xl bg-paper-2 p-3"><p className="font-display text-lg font-extrabold">{selected.place} · {selected.year}</p><p className="text-sm text-ink-muted">{selected.region}</p>{selected.photos[0] && <img src={selected.photos[0].src} alt={selected.photos[0].alt} className="my-2 w-full rounded-lg" />}<p>{selected.note}</p></article>}
        </div>
      )}
    </div>
  )
}
```
Run: `yarn test` → the Task 5 travel test (empty state) still passes.

- [ ] **Step 4: Write the four 3D objects**

```tsx
// src/components/three/objects/Bookshelf/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { skillShelves } from '@content/skills'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

const shelfColor: Record<string, string> = { peach: palette.peach, sky: palette.sky, mint: palette.mint, lavender: palette.lavender, wood: palette.wood }
const ROWS = 4, W = 1.6, H = 2.6, D = 0.5, ROW_H = (H - 0.1) / ROWS

export default function Bookshelf() {
  const p = roomLayout.bookshelf
  return (
    <group position={[...p.position]}>
      <Interactive id="bookshelf" label="Skills" hitSize={[W + 0.2, H, D + 0.3]} hitOffset={[0, H / 2, 0.1]} labelHeight={H + 0.35} onActivate={() => openFromScene('skills')}>
        <RoundedBox args={[W, H, D]} radius={0.04} position={[0, H / 2, 0]} castShadow receiveShadow><meshStandardMaterial {...clay(palette.woodDark)} /></RoundedBox>
        {Array.from({ length: ROWS }, (_, row) => {
          const shelf = skillShelves[row + 1] ?? skillShelves[0]
          const y = 0.08 + row * ROW_H
          let x = -W / 2 + 0.12
          return (
            <group key={row}>
              <mesh position={[0, y, 0.02]}><boxGeometry args={[W - 0.08, 0.04, D - 0.06]} /><meshStandardMaterial {...clay(palette.wood)} /></mesh>
              {shelf.skills.map((skill, i) => {
                const w = 0.09 + ((i * 7) % 5) * 0.012, h = 0.26 + ((i * 3) % 4) * 0.03
                const cx = x + w / 2; x += w + 0.015
                return <RoundedBox key={skill} args={[w, h, D - 0.16]} radius={0.015} position={[cx, y + 0.02 + h / 2, 0.04]}><meshStandardMaterial {...clay(shelfColor[shelf.color])} /></RoundedBox>
              })}
            </group>
          )
        })}
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/Radio/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSoundStore } from '@store/useSoundStore'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'

export default function Radio() {
  const music = useSoundStore((s) => s.music)
  const toggle = () => { const s = useSoundStore.getState(); if (!s.music && !s.master) s.setMaster(true); s.toggleMusic() }
  return (
    <group position={[...roomLayout.radio.position]}>
      <Interactive id="radio" label={music ? 'Radio: on' : 'Radio'} hitSize={[0.7, 0.5, 0.5]} hitOffset={[0, 0.15, 0]} labelHeight={0.5} onActivate={toggle}>
        <RoundedBox args={[0.5, 0.3, 0.25]} radius={0.05} position={[0, 0.15, 0]} castShadow><meshStandardMaterial {...clay(palette.terracotta)} /></RoundedBox>
        <mesh position={[-0.1, 0.15, 0.13]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.02, 24]} /><meshStandardMaterial {...clay(palette.ink)} /></mesh>
        <mesh position={[0.15, 0.15, 0.13]} rotation={[Math.PI / 2, 0, 0]} userData={{ noHighlight: true }}><cylinderGeometry args={[0.04, 0.04, 0.02, 16]} /><meshStandardMaterial color={palette.cream} emissive={palette.lampGlow} emissiveIntensity={music ? 1.2 : 0} /></mesh>
        <mesh position={[0.2, 0.42, 0]}><cylinderGeometry args={[0.008, 0.008, 0.3, 6]} /><meshStandardMaterial {...clay(palette.ink)} /></mesh>
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/EduFrames/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { education } from '@content/education'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function EduFrames() {
  return (
    <group position={[...roomLayout['edu-frames'].position]} rotation={[0, Math.PI / 2, 0]}>
      <Interactive id="edu-frames" label="Education" hitSize={[2.4, 1.0, 0.3]} hitOffset={[0, 0, 0.05]} labelHeight={0.7} onActivate={() => openFromScene('education')}>
        {education.map((e, i) => (
          <group key={e.id} position={[(i - 1) * 0.8, 0, 0]}>
            <RoundedBox args={[0.6, 0.8, 0.06]} radius={0.02} castShadow><meshStandardMaterial {...clay(palette.wood)} /></RoundedBox>
            <mesh position={[0, 0, 0.035]} userData={{ noHighlight: true }}><planeGeometry args={[0.48, 0.66]} /><meshStandardMaterial {...clay(palette.cream)} /></mesh>
            {e.honors && <mesh position={[0.18, -0.2, 0.05]}><cylinderGeometry args={[0.05, 0.05, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial {...clay(palette.terracotta)} /></mesh>}
          </group>
        ))}
      </Interactive>
    </group>
  )
}
```
```ts
// src/components/three/objects/IndonesiaMap/useMapTexture.ts
'use client'
import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { travelPins } from '@content/travel'
import { indonesiaMap } from '@constants/indonesiaMap'
import { palette } from '@constants/roomPalette'
import { mercatorXY } from '@utils/map'

export function useMapTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = indonesiaMap.width; canvas.height = indonesiaMap.height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = palette.sky; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = palette.mint; ctx.strokeStyle = palette.woodDark; ctx.lineWidth = 3
    const path = new Path2D(indonesiaMap.path); ctx.fill(path); ctx.stroke(path)
    ctx.fillStyle = palette.terracotta
    for (const pin of travelPins) { const { x, y } = mercatorXY(pin.lat, pin.lon, indonesiaMap.scale, indonesiaMap.translate); ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill() }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace
    return texture
  }, [])
}
```
```tsx
// src/components/three/objects/IndonesiaMap/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'
import { useMapTexture } from './useMapTexture'

export default function IndonesiaMap() {
  const p = roomLayout['indonesia-map']
  const [w, h] = [p.size![0], p.size![1]]
  const map = useMapTexture()
  return (
    <group position={[...p.position]}>
      <Interactive id="indonesia-map" label="Travel" hitSize={[w + 0.2, h + 0.2, 0.3]} hitOffset={[0, 0, 0.1]} labelHeight={h / 2 + 0.3} onActivate={() => openFromScene('travel')}>
        <RoundedBox args={[w + 0.12, h + 0.12, 0.06]} radius={0.02} castShadow><meshStandardMaterial {...clay(palette.wood)} /></RoundedBox>
        <mesh position={[0, 0, 0.035]} userData={{ noHighlight: true }}><planeGeometry args={[w, h]} /><meshStandardMaterial map={map} roughness={0.9} /></mesh>
      </Interactive>
    </group>
  )
}
```
Register `<Bookshelf />`, `<Radio />`, `<EduFrames />`, `<IndonesiaMap />` in `RoomObjects`.

- [ ] **Step 5: Verify, commit**

`yarn dev`: the bookshelf shows colored book rows, the map board shows Indonesia, the three frames hang over the bed; each opens its section; clicking the radio lights its dial (sound arrives in Task 24). `/travel` shows the SVG map with the empty state.
```bash
yarn lint && yarn typecheck && yarn test
git add -A
git commit -m "feat: add bookshelf, radio, education frames and the Indonesia map

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 17: Door and floor objects: mailbox, light switch, hiking gear, dive gear, TV

Implements: design doc 03 rows 5, 7, 8, 10, 13.

**Files:**
- Create: `src/components/three/objects/Mailbox/index.tsx`, `src/components/three/objects/LightSwitch/index.tsx`, `src/components/three/objects/HikingGear/index.tsx`, `src/components/three/objects/DiveGear/index.tsx`, `src/components/three/objects/Tv/index.tsx`
- Modify: `src/components/three/RoomObjects/index.tsx`

**Interfaces:**
- `LightSwitch.onActivate` calls `useSceneBridge().toggleTheme()`; its toggle mesh is named `switchToggle` and flips with `useSceneStore.theme` (Task 22 wires the theme into the store). `Tv` names its screen `tvScreen`.

- [ ] **Step 1: Write the five objects**

```tsx
// src/components/three/objects/Mailbox/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'
export default function Mailbox() {
  return (
    <group position={[...roomLayout.mailbox.position]}>
      <Interactive id="mailbox" label="Contact" hitSize={[0.6, 0.6, 0.5]} hitOffset={[0, 0, 0.15]} labelHeight={0.5} onActivate={() => openFromScene('contact')}>
        <RoundedBox args={[0.32, 0.42, 0.2]} radius={0.05} position={[0, 0, 0.1]} castShadow><meshStandardMaterial {...clay(palette.terracotta)} /></RoundedBox>
        <mesh position={[0, 0.1, 0.205]}><boxGeometry args={[0.2, 0.03, 0.01]} /><meshStandardMaterial {...clay(palette.ink)} /></mesh>
        <mesh position={[0.2, 0.12, 0.1]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.03, 0.18, 0.02]} /><meshStandardMaterial {...clay(palette.mint)} /></mesh>
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/LightSwitch/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'
import { useSceneStore } from '@store/useSceneStore'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
export default function LightSwitch() {
  const { toggleTheme } = useSceneBridge()
  const night = useSceneStore((s) => s.theme === 'night')
  return (
    <group position={[...roomLayout['light-switch'].position]}>
      <Interactive id="light-switch" label={night ? 'Lights: off' : 'Lights: on'} hitSize={[0.5, 0.5, 0.3]} hitOffset={[0, 0, 0.1]} labelHeight={0.35} onActivate={toggleTheme}>
        <RoundedBox args={[0.16, 0.22, 0.03]} radius={0.02} position={[0, 0, 0.015]}><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
        <RoundedBox name="switchToggle" args={[0.06, 0.1, 0.05]} radius={0.015} position={[0, night ? -0.03 : 0.03, 0.05]} rotation={[night ? 0.3 : -0.3, 0, 0]}><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/HikingGear/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'
export default function HikingGear() {
  return (
    <group position={[...roomLayout['hiking-gear'].position]} rotation={[0, -0.4, 0]}>
      <Interactive id="hiking-gear" label="Hiking" hitSize={[1.0, 0.9, 0.8]} hitOffset={[0, 0.4, 0]} labelHeight={1.0} onActivate={() => openFromScene('hiking')}>
        <RoundedBox args={[0.5, 0.7, 0.3]} radius={0.09} position={[0, 0.35, 0]} castShadow><meshStandardMaterial {...clay(palette.terracotta)} /></RoundedBox>
        <RoundedBox args={[0.36, 0.26, 0.12]} radius={0.05} position={[0, 0.22, 0.18]}><meshStandardMaterial {...clay(palette.orangeDark)} /></RoundedBox>
        <RoundedBox args={[0.3, 0.14, 0.34]} radius={0.05} position={[0, 0.74, 0]}><meshStandardMaterial {...clay(palette.orangeDark)} /></RoundedBox>
        {[-0.22, 0.22].map((x) => <group key={x} position={[0.45, 0, x]}><RoundedBox args={[0.3, 0.14, 0.16]} radius={0.05} position={[0, 0.07, 0]} castShadow><meshStandardMaterial {...clay(palette.woodDark)} /></RoundedBox><RoundedBox args={[0.16, 0.2, 0.16]} radius={0.05} position={[-0.06, 0.2, 0]}><meshStandardMaterial {...clay(palette.woodDark)} /></RoundedBox></group>)}
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/DiveGear/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'
export default function DiveGear() {
  return (
    <group position={[...roomLayout['dive-gear'].position]} rotation={[0, 0.5, 0]}>
      <Interactive id="dive-gear" label="Diving" hitSize={[0.9, 1.1, 0.7]} hitOffset={[0, 0.5, 0]} labelHeight={1.15} onActivate={() => openFromScene('diving')}>
        <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.03, 0.03, 0.9, 8]} /><meshStandardMaterial {...clay(palette.woodDark)} /></mesh>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.22, 0.24, 0.04, 16]} /><meshStandardMaterial {...clay(palette.woodDark)} /></mesh>
        <mesh position={[0, 0.85, 0.05]}><torusGeometry args={[0.16, 0.045, 12, 24]} /><meshStandardMaterial {...clay(palette.ink)} /></mesh>
        <mesh position={[0, 0.85, 0.05]} userData={{ noHighlight: true }}><circleGeometry args={[0.14, 24]} /><meshStandardMaterial color={palette.sky} roughness={0.2} transparent opacity={0.85} /></mesh>
        {[-0.14, 0.14].map((x) => <RoundedBox key={x} args={[0.16, 0.5, 0.04]} radius={0.03} position={[x, 0.3, -0.1]} rotation={[0.15, 0, x > 0 ? 0.1 : -0.1]}><meshStandardMaterial {...clay(palette.mint)} /></RoundedBox>)}
      </Interactive>
    </group>
  )
}
```
```tsx
// src/components/three/objects/Tv/index.tsx
'use client'
import { RoundedBox } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'
export default function Tv() {
  const p = roomLayout.tv
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive id="tv" label="Gaming" hitSize={[1.6, 1.5, 0.8]} hitOffset={[0, 0.7, 0.1]} labelHeight={1.6} onActivate={() => openFromScene('gaming')}>
        <RoundedBox args={[1.4, 0.5, 0.5]} radius={0.05} position={[0, 0.25, 0]} castShadow><meshStandardMaterial {...clay(palette.woodDark)} /></RoundedBox>
        <RoundedBox args={[1.3, 0.8, 0.08]} radius={0.04} position={[0, 0.95, 0]} castShadow><meshStandardMaterial {...clay(palette.ink)} /></RoundedBox>
        <mesh name="tvScreen" position={[0, 0.95, 0.045]} userData={{ noHighlight: true }}><planeGeometry args={[1.2, 0.7]} /><meshStandardMaterial color={palette.screen} emissive={palette.mint} emissiveIntensity={0.35} roughness={0.5} /></mesh>
        <RoundedBox args={[0.32, 0.08, 0.26]} radius={0.03} position={[-0.4, 0.54, 0.05]}><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
        <RoundedBox args={[0.22, 0.06, 0.12]} radius={0.03} position={[0.35, 0.53, 0.15]} rotation={[0, 0.4, 0]}><meshStandardMaterial {...clay(palette.lavender)} /></RoundedBox>
      </Interactive>
    </group>
  )
}
```
Register all five in `RoomObjects`. The list is now: Pc, PhotoFrame, Printer, Clocks, Bookshelf, Radio, EduFrames, IndonesiaMap, Mailbox, LightSwitch, HikingGear, DiveGear, Tv (13; Oyen is Task 18).

- [ ] **Step 2: Verify, commit**

`yarn dev`: all 13 objects have hover tags and open the right panel; the light switch toggles `data-theme` on `<html>` (the 3D lighting follows in Task 22).
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add mailbox, light switch, hiking gear, dive gear and TV

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 18: Oyen the host, speech bubble, greeting and idle hints

Implements: design doc 03 "Oyen, the host", "Interactions → Idle hints"; doc 04 "Oyen's speech bubble"; doc 05 "Oyen copy".

**Files:**
- Create: `src/constants/hints.ts`, `src/components/atoms/Typewriter/index.tsx`, `src/components/molecules/SpeechBubble/index.tsx`, `src/components/molecules/SpeechBubble/SpeechBubble.test.tsx`, `src/hooks/useIdleHint.ts`, `src/hooks/useIdleHint.test.tsx`, `src/components/three/Oyen/index.tsx`, `src/components/three/Oyen/useOyenAnimation.ts`
- Modify: `src/components/three/RoomObjects/index.tsx` (add `<Oyen />`), `src/components/pages/Room/index.tsx` (render `<SpeechBubble />`, call `useIdleHint()`, greet after entering)

**Interfaces:**
- Produces: `HINT_DELAY_MS = 8000`, `MAX_HINTS = 3`, `hintOrder: ObjectId[] = ['pc', 'bookshelf', 'printer']`; `Typewriter { text; speed?: number; onDone?(): void }`; `SpeechBubble` (reads `bubble` and `oyenAnchor` from the scene store, hides itself 6 s after the line finishes, click/Enter advances); `useIdleHint()`; `Oyen` writes `oyenAnchor` every frame (only when it moved ≥ 1 px) and sets `bubble` on click (rotating `oyenLines.chatter`, or `oyenLines.sleeping` at night).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/molecules/SpeechBubble/SpeechBubble.test.tsx
import { act, render, screen } from '@testing-library/react'
import { MotionConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSceneStore } from '@store/useSceneStore'
import SpeechBubble from '.'
describe('SpeechBubble', () => {
  beforeEach(() => { vi.useFakeTimers(); useSceneStore.setState({ bubble: null, oyenAnchor: { x: 300, y: 400 } }) })
  afterEach(() => vi.useRealTimers())
  it('announces the full line to assistive tech immediately and hides after 6s', () => {
    render(<MotionConfig reducedMotion="always"><SpeechBubble /></MotionConfig>)
    act(() => useSceneStore.getState().setBubble('Meow! Welcome.'))
    expect(screen.getByRole('status')).toHaveTextContent('Meow! Welcome.')
    act(() => { vi.advanceTimersByTime(6500) })
    expect(useSceneStore.getState().bubble).toBeNull()
  })
})
// src/hooks/useIdleHint.test.tsx
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useIdleHint } from './useIdleHint'
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
describe('useIdleHint', () => {
  beforeEach(() => { vi.useFakeTimers(); window.localStorage.clear(); useRoomStore.setState({ phase: 'ready' }); useSceneStore.setState({ hint: null, bubble: null }) })
  afterEach(() => vi.useRealTimers())
  it('hints the PC after 8s on a first visit, and stops once the visitor interacts', () => {
    renderHook(() => useIdleHint())
    act(() => { vi.advanceTimersByTime(8100) })
    expect(useSceneStore.getState().hint).toBe('pc')
    expect(useSceneStore.getState().bubble).toMatch(/try the PC/)
    act(() => { window.dispatchEvent(new Event('pointerdown')) })
    expect(useSceneStore.getState().hint).toBeNull()
    act(() => { vi.advanceTimersByTime(20000) })
    expect(useSceneStore.getState().hint).toBeNull()
  })
  it('does nothing on a returning visit', () => {
    window.localStorage.setItem('room:interacted', 'true')
    renderHook(() => useIdleHint())
    act(() => { vi.advanceTimersByTime(9000) })
    expect(useSceneStore.getState().hint).toBeNull()
  })
})
```
Run: `yarn test`
Expected: FAIL.

- [ ] **Step 2: Write the constants, Typewriter, SpeechBubble and useIdleHint**

```ts
// src/constants/hints.ts
import type { ObjectId } from '@interfaces/section'
export const HINT_DELAY_MS = 8000
export const MAX_HINTS = 3
export const BUBBLE_HIDE_MS = 6000
export const TYPEWRITER_CPS = 35
export const hintOrder: readonly ObjectId[] = ['pc', 'bookshelf', 'printer']
```
```tsx
// src/components/atoms/Typewriter/index.tsx
'use client'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { TYPEWRITER_CPS } from '@constants/hints'
export default function Typewriter({ text, onDone, skip = false }: { text: string; onDone?: () => void; skip?: boolean }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)
  useEffect(() => { setShown(0) }, [text])
  useEffect(() => {
    if (reduced || skip) { setShown(text.length); return }
    if (shown >= text.length) return
    const t = window.setTimeout(() => setShown((n) => n + 1), 1000 / TYPEWRITER_CPS)
    return () => window.clearTimeout(t)
  }, [shown, text, reduced, skip])
  useEffect(() => { if (shown >= text.length) onDone?.() }, [shown, text.length, onDone])
  return <span aria-hidden="true">{text.slice(0, shown)}</span>
}
```
```tsx
// src/components/molecules/SpeechBubble/index.tsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Typewriter from '@components/atoms/Typewriter'
import { useSceneStore } from '@store/useSceneStore'
import { BUBBLE_HIDE_MS } from '@constants/hints'

export default function SpeechBubble() {
  const text = useSceneStore((s) => s.bubble)
  const anchor = useSceneStore((s) => s.oyenAnchor)
  const [done, setDone] = useState(false)
  const [skip, setSkip] = useState(false)
  const [hover, setHover] = useState(false)
  useEffect(() => { setDone(false); setSkip(false) }, [text])
  useEffect(() => {
    if (!text || !done || hover) return
    const t = window.setTimeout(() => useSceneStore.getState().setBubble(null), BUBBLE_HIDE_MS)
    return () => window.clearTimeout(t)
  }, [text, done, hover])
  const advance = useCallback(() => { if (!done) setSkip(true); else useSceneStore.getState().setBubble(null) }, [done])
  const left = Math.min(Math.max((anchor?.x ?? 160) - 140, 8), (typeof window === 'undefined' ? 1200 : window.innerWidth) - 288)
  const top = Math.max((anchor?.y ?? 300) - 120, 8)
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">{text ?? ''}</div>
      <AnimatePresence>
        {text && (
          <motion.button type="button" key={text} onClick={advance} onKeyDown={(e) => { if (e.key === 'Enter') advance() }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{ left, top }} className="stitched fixed z-30 w-72 rounded-2xl bg-paper p-3 pt-5 text-left font-display text-[15px] font-bold text-ink shadow-lg">
            <span className="absolute -top-3 left-3 rounded-full bg-accent px-2 py-0.5 text-xs text-on-accent">Oyen</span>
            <Typewriter text={text} skip={skip} onDone={() => setDone(true)} />
            <span aria-hidden="true" className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 bg-paper" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
```
```ts
// src/hooks/useIdleHint.ts
'use client'
import { useEffect } from 'react'
import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { oyenLines } from '@content/oyen'
import { HINT_DELAY_MS, MAX_HINTS, hintOrder } from '@constants/hints'
import { STORAGE_KEYS } from '@constants/storage'
import { readJSON, writeJSON } from '@utils/storage'
import { currentSlug } from '@utils/history'
import { useActiveSection } from './useActiveSection'

export function useIdleHint() {
  const phase = useRoomStore((s) => s.phase)
  const active = useActiveSection()
  useEffect(() => {
    if (phase !== 'ready' || active !== null || readJSON(STORAGE_KEYS.interacted, false)) return
    let count = 0
    let timer = 0
    const stop = () => { window.clearTimeout(timer); useSceneStore.getState().setHint(null); window.removeEventListener('pointerdown', onInteract); window.removeEventListener('keydown', onInteract) }
    const onInteract = () => { writeJSON(STORAGE_KEYS.interacted, true); stop() }
    const schedule = () => { timer = window.setTimeout(() => {
      if (currentSlug() !== null || count >= MAX_HINTS) return stop()
      const s = useSceneStore.getState(); s.setHint(hintOrder[count]); s.setBubble(oyenLines.hints[count]); count += 1; schedule()
    }, HINT_DELAY_MS) }
    window.addEventListener('pointerdown', onInteract); window.addEventListener('keydown', onInteract)
    schedule()
    return stop
  }, [phase, active])
}
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Write Oyen**

```ts
// src/components/three/Oyen/useOyenAnimation.ts
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'
import { useSceneStore } from '@store/useSceneStore'

const headWorld = new Vector3()
export function useOyenAnimation(asleep: boolean, reducedMotion: boolean) {
  const body = useRef<Group>(null), head = useRef<Group>(null), tail = useRef<Group[]>([]), eyes = useRef<Mesh[]>([])
  const blink = useRef({ next: 2, closing: false })
  const last = useRef({ x: -1, y: -1 })
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (body.current && !reducedMotion) { const s = 1 + Math.sin(t * 2.1) * 0.02; body.current.scale.set(s, asleep ? s * 0.8 : s, s) }
    tail.current.forEach((seg, i) => { if (seg && !reducedMotion) seg.rotation.y = Math.sin(t * 2.4 + i * 0.6) * (asleep ? 0.08 : 0.28) })
    if (head.current) {
      const targetY = asleep ? 0.3 : Math.max(-0.52, Math.min(0.52, state.pointer.x * 0.5))
      const targetX = asleep ? 0.5 : Math.max(-0.3, Math.min(0.3, -state.pointer.y * 0.3))
      head.current.rotation.y += (targetY - head.current.rotation.y) * Math.min(1, dt * 5)
      head.current.rotation.x += (targetX - head.current.rotation.x) * Math.min(1, dt * 5)
      head.current.getWorldPosition(headWorld).project(state.camera)
      const x = ((headWorld.x + 1) / 2) * state.size.width, y = ((1 - headWorld.y) / 2) * state.size.height
      if (Math.abs(x - last.current.x) >= 1 || Math.abs(y - last.current.y) >= 1) { last.current = { x, y }; useSceneStore.getState().setOyenAnchor({ x, y }) }
    }
    if (t > blink.current.next || asleep) {
      const closed = asleep || (t - blink.current.next < 0.12)
      eyes.current.forEach((e) => { if (e) e.scale.y = closed ? 0.1 : 1 })
      if (!asleep && t - blink.current.next > 0.12) blink.current.next = t + 3 + Math.random() * 3
    }
  })
  return { body, head, tail, eyes }
}
```
```tsx
// src/components/three/Oyen/index.tsx
'use client'
import { Html } from '@react-three/drei'
import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'
import { useSceneStore } from '@store/useSceneStore'
import { oyenLines } from '@content/oyen'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { useOyenAnimation } from './useOyenAnimation'

let chatterIndex = 0
const O = palette.orange, OD = palette.orangeDark

export default function Oyen() {
  const asleep = useSceneStore((s) => s.theme === 'night')
  const { reducedMotion } = useSceneBridge()
  const { body, head, tail, eyes } = useOyenAnimation(asleep, reducedMotion)
  const place = asleep ? roomLayout.oyenNight : roomLayout.oyen
  const speak = () => {
    const s = useSceneStore.getState()
    if (asleep) return s.setBubble(oyenLines.sleeping)
    s.setBubble(oyenLines.chatter[chatterIndex % oyenLines.chatter.length]); chatterIndex += 1
  }
  return (
    <group position={[...place.position]} rotation={[0, place.rotationY ?? 0, 0]}>
      <Interactive id="oyen" label="Oyen" hitSize={[0.9, 0.8, 1.1]} hitOffset={[0, 0.35, 0]} labelHeight={0.95} onActivate={speak}>
        <group ref={body}>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.26, 0.4, 8, 16]} /><meshStandardMaterial {...clay(O)} /></mesh>
          <mesh position={[0, 0.22, 0.2]} scale={[1, 0.7, 1]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial {...clay(palette.cream)} /></mesh>
          {[-0.14, 0.14].map((x) => <mesh key={x} position={[x, 0.07, 0.32]} castShadow><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial {...clay(O)} /></mesh>)}
          <group ref={head} position={[0, 0.55, 0.3]}>
            <mesh castShadow scale={[1, 0.92, 1]}><sphereGeometry args={[0.27, 20, 16]} /><meshStandardMaterial {...clay(O)} /></mesh>
            {[-0.16, 0.16].map((x) => <mesh key={x} position={[x, 0.22, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}><coneGeometry args={[0.08, 0.16, 4]} /><meshStandardMaterial {...clay(OD)} /></mesh>)}
            {[-0.1, 0.1].map((x, i) => <mesh key={x} ref={(m) => { if (m) eyes.current[i] = m }} position={[x, 0.03, 0.24]} userData={{ noHighlight: true }}><sphereGeometry args={[0.04, 10, 8]} /><meshStandardMaterial color={palette.ink} roughness={0.3} /></mesh>)}
            <mesh position={[0, -0.05, 0.27]} userData={{ noHighlight: true }}><sphereGeometry args={[0.025, 8, 6]} /><meshStandardMaterial color={palette.nose} roughness={0.5} /></mesh>
          </group>
          {Array.from({ length: 5 }, (_, i) => (
            <group key={i} ref={(g) => { if (g) tail.current[i] = g }} position={[0, 0.34 + i * 0.07, -0.42 - i * 0.1]}>
              <mesh castShadow><sphereGeometry args={[0.07 - i * 0.006, 10, 8]} /><meshStandardMaterial {...clay(i === 4 ? OD : O)} /></mesh>
            </group>
          ))}
        </group>
        {asleep && <Html center position={[0.3, 0.9, 0]} style={{ pointerEvents: 'none' }}><span className="font-display text-sm font-bold text-ink-muted">Zzz</span></Html>}
      </Interactive>
    </group>
  )
}
```
Register `<Oyen />` in `RoomObjects` (14 objects complete).

- [ ] **Step 4: Wire the bubble, greeting and hints into the Room page**

In `src/components/pages/Room/index.tsx`: render `<SpeechBubble />` after `<Hud />`; call `useIdleHint()`; add the greeting effect:
```tsx
const prevPhase = useRef(phase)
useEffect(() => {
  if (prevPhase.current === 'entering' && phase === 'ready') useSceneStore.getState().setBubble(oyenLines.greeting)
  prevPhase.current = phase
}, [phase])
```
Run: `yarn test && yarn lint && yarn typecheck`
Expected: PASS.

- [ ] **Step 5: Verify, commit**

`yarn dev`: Oyen sits on the rug breathing, tail swaying, head following the cursor; after Enter the greeting bubble types out near Oyen's head; clicking Oyen cycles chatter; waiting 8 s on a fresh profile (clear site data) makes the PC sparkle with a hint bubble; any click stops hints for later visits.
```bash
git add -A
git commit -m "feat: add Oyen the cat host with speech bubble and idle hints

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 19: Style-test checkpoint (tune the look, choose the display font)

Implements: design doc 01 "Risks" (style test first), doc 03 "Art direction", doc 04 "Typography" (compare Zen Maru Gothic). This task is a **review gate**: Satriko approves the look before Milestone 3.

**Files:**
- Modify (tuning only): `src/constants/roomLayout.ts`, `src/constants/roomPalette.ts`, `src/components/three/Room/Lighting.tsx`, `src/components/three/CameraDirector/index.tsx` (`PADDING`), `src/constants/sections.ts` (`cameraPose` values), `src/constants/fonts.ts`

- [ ] **Step 1: Capture the current state**

`yarn dev`, then screenshot at 1440×900 and 390×844 (DevTools device toolbar): default view, PC hover, PC focused with the panel open, `/education` direct link. Save them under `docs/design/style-test/` with the date in the file name.

- [ ] **Step 2: Judge against the recipe and tune**

Checklist (design doc 03 "Art direction"): every object reads as **rounded and chunky**; materials are **matte** (no plastic shine); the palette is **warm cream / wood / mint / sky / peach**; shadows are **soft**; nothing clips through walls or furniture; every hover tag sits above its object; each focused pose frames its object with the panel still showing some room around it.
Tune in this order: (1) `roomLayout` positions/rotations, (2) `cameraPose.target/offset/zoomFactor` per section, (3) `Lighting` intensities and colors, (4) `palette`, (5) `ContactShadows` opacity/blur, (6) `PADDING` of the default fit. Re-screenshot after each round.

- [ ] **Step 3: Compare the display font**

In `src/constants/fonts.ts`, temporarily add `Zen_Maru_Gothic({ weight: ['500', '700', '900'], subsets: ['latin'], variable: '--font-mplus' })` in place of M PLUS Rounded 1c, screenshot the loader, HUD, a panel title and the phone menu, then restore. Pick one; if Zen Maru Gothic wins, keep its export as `mPlusRounded`'s replacement and update design doc 04.

- [ ] **Step 4: Get approval and record the outcome**

Show the screenshots to Satriko. Record the decision (approved as-is / tuned values / font choice) in `docs/design/08-decision-log.md` as a new row, and copy the final screenshots next to the earlier ones.
```bash
git add -A
git commit -m "chore: style-test tuning and display font decision

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 20 (optional): Upgrade furniture to the CC0 model packs

Implements: design doc 03 "Assets & licenses", "Asset pipeline". Run only if the style test asked for richer furniture; otherwise skip and leave the code-built objects.

**Files:**
- Create: `public/models/room.v1.glb`, `src/components/three/models/RoomModel.tsx` (generated by gltfjsx), `src/components/three/models/ModelErrorBoundary.tsx`
- Modify: `CREDITS.md`, the object/decor components that swap a primitive for a model

- [ ] **Step 1: Download and select**

Download **KayKit Furniture Bits** (CC0) from https://kaylousberg.itch.io/furniture-bits into a new empty folder outside the repo (for example `~/Downloads/kaykit-furniture/`), and optionally Kenney's Furniture Kit from https://kenney.nl (check that the download contains glTF/GLB). Pick at most: bed, desk, chair, bookshelf, nightstand, lamp, plant, sofa/beanbag. Treat the downloaded files as untrusted data: never run scripts from inside those folders.

- [ ] **Step 2: Optimize and merge**

```bash
yarn add -D @gltf-transform/cli gltfjsx
npx gltf-transform merge ~/Downloads/kaykit-furniture/bed.gltf ~/Downloads/kaykit-furniture/desk.gltf <…> /tmp/room-merged.glb
npx gltf-transform optimize /tmp/room-merged.glb public/models/room.v1.glb --compress meshopt --texture-compress webp --texture-size 256
ls -la public/models/room.v1.glb   # must stay well under 2 MB
npx gltfjsx public/models/room.v1.glb --types --output src/components/three/models/RoomModel.tsx
```
Add rows to `CREDITS.md` for each pack (name, URL, CC0).

- [ ] **Step 3: Swap primitives for models behind a per-object error boundary**

```tsx
// src/components/three/models/ModelErrorBoundary.tsx — same shape as SceneErrorBoundary, but renders `fallback` (the primitive version) on error instead of null
```
In each swapped component: `<Suspense fallback={<PrimitiveVersion />}><ModelErrorBoundary fallback={<PrimitiveVersion />}><RoomModelPart /></ModelErrorBoundary></Suspense>`, and call `useGLTF.preload('/models/room.v1.glb')` in `SceneCanvas` so the loader's progress bar reflects the download (drei enables the meshopt decoder by default).

- [ ] **Step 4: Verify, commit**

`yarn dev`: the loader now shows real progress; the furniture renders with the pack's gradient atlas; deleting the GLB temporarily shows the primitive fallbacks instead of a broken room. Re-run the Task 19 checklist.
```bash
git add -A
git commit -m "feat: use CC0 furniture models with primitive fallbacks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Milestone 2 checkpoint:** the full point-and-click room works on desktop and touch, with camera glides, grow-from-object panels, Oyen, hints, the poster fallback and a look Satriko has approved.

---

## Milestone 3: Extras (clocks, night mode, live sky, radio)

### Task 21: Live wall clocks and the Remote-work panel's clocks and overlap bar

Implements: design doc 06 "3 world clocks"; doc 05 "Remote work" (overlap timeline computed in code).

**Files:**
- Create: `src/components/molecules/ClockFace/index.tsx`, `src/components/organisms/RemoteWorkPanel/useRemoteWorkPanel.ts`, `src/components/organisms/RemoteWorkPanel/OverlapBar.tsx`, `src/components/organisms/RemoteWorkPanel/RemoteWorkPanel.test.tsx`, `src/components/three/objects/Clocks/useClockHands.ts`
- Modify: `src/components/organisms/RemoteWorkPanel/index.tsx`, `src/components/three/objects/Clocks/index.tsx`

**Interfaces:**
- Produces: `ClockFace { city: string; label?: string; time: ClockTime | null }` (SVG, hands from `clockAngles`); `OverlapBar { window: { start; end } | null; zones }`; `useRemoteWorkPanel()` → `{ times: Record<zoneId, ClockTime | null>; overlap }` ticking every second after mount; `useClockHands(zoneId)` rotates the `hourHand-*` / `minuteHand-*` groups once per second.
- Consumes: `zonedTime`, `clockAngles`, `overlapWindow`, `clockZones`, `BASE_ZONE`, `WORK_START`, `WORK_END` (Task 10).

- [ ] **Step 1: Write the failing panel test**

```tsx
// src/components/organisms/RemoteWorkPanel/RemoteWorkPanel.test.tsx
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RemoteWorkPanel from '.'
describe('RemoteWorkPanel', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T05:04:09Z')) })
  afterEach(() => vi.useRealTimers())
  it('shows the three live times and the overlap window after mount', () => {
    render(<RemoteWorkPanel />)
    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByText('12:04')).toBeInTheDocument()  // Bogor
    expect(screen.getByText('13:04')).toBeInTheDocument()  // Singapore
    expect(screen.getByText('09:04')).toBeInTheDocument()  // Abu Dhabi
    expect(screen.getByText(/Overlap: 12:00–17:00 WIB/)).toBeInTheDocument()
  })
})
```
Run: `yarn test src/components/organisms/RemoteWorkPanel`
Expected: FAIL.

- [ ] **Step 2: Write the hook, molecules and panel**

```ts
// src/components/organisms/RemoteWorkPanel/useRemoteWorkPanel.ts
'use client'
import { useEffect, useState } from 'react'
import { BASE_ZONE, WORK_END, WORK_START, clockZones } from '@constants/timezones'
import { type ClockTime, overlapWindow, zonedTime } from '@utils/time'
export function useRemoteWorkPanel() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { const tick = () => setNow(new Date()); tick(); const id = window.setInterval(tick, 1000); return () => window.clearInterval(id) }, [])
  const times: Record<string, ClockTime | null> = {}
  for (const z of clockZones) times[z.id] = now ? zonedTime(now, z.timeZone) : null
  const overlap = now ? overlapWindow(now, clockZones.map((z) => z.timeZone), BASE_ZONE, WORK_START, WORK_END) : null
  return { times, overlap }
}
```
```tsx
// src/components/molecules/ClockFace/index.tsx
import { type ClockTime, clockAngles, formatHHMM } from '@utils/time'
export default function ClockFace({ city, label, time }: { city: string; label?: string; time: ClockTime | null }) {
  const a = time ? clockAngles(time) : { hour: 300, minute: 60 }
  return (
    <figure className="flex flex-col items-center gap-1 rounded-xl bg-paper-2 p-3">
      <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#FFF7E8" stroke="#B9875A" strokeWidth="6" />
        <line x1="50" y1="50" x2="50" y2="26" stroke="#4A3426" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a.hour} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="16" stroke="#B8553A" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a.minute} 50 50)`} />
        <circle cx="50" cy="50" r="3" fill="#4A3426" />
      </svg>
      <figcaption className="text-center font-display font-bold">{city}{label ? ` · ${label}` : ''}<span className="block font-mono text-lg">{time ? formatHHMM(time) : '--:--'}</span></figcaption>
    </figure>
  )
}
```
```tsx
// src/components/organisms/RemoteWorkPanel/OverlapBar.tsx
import { BASE_ZONE, WORK_END, WORK_START, clockZones } from '@constants/timezones'
import { formatHHMM, utcOffsetMinutes } from '@utils/time'
const toHHMM = (m: number) => formatHHMM({ h: Math.floor(m / 60), m: m % 60, s: 0 })
export default function OverlapBar({ window: w, now }: { window: { start: number; end: number } | null; now: Date | null }) {
  const base = now ? utcOffsetMinutes(now, BASE_ZONE) : 0
  return (
    <div>
      <ul className="space-y-1">
        {clockZones.map((z) => { const shift = now ? utcOffsetMinutes(now, z.timeZone) - base : 0; const s = WORK_START - shift, e = WORK_END - shift; return (
          <li key={z.id} className="grid grid-cols-[90px_1fr] items-center gap-2 text-sm"><span className="font-display font-bold">{z.city}</span><div className="relative h-5 rounded-full bg-paper-2"><div className="absolute h-full rounded-full bg-sky" style={{ left: `${(s / 1440) * 100}%`, width: `${((e - s) / 1440) * 100}%` }} /></div></li>
        ) })}
      </ul>
      <p className="mt-2 font-display font-bold">{w ? `Overlap: ${toHHMM(w.start)}–${toHHMM(w.end)} WIB` : 'No shared working hours'}</p>
    </div>
  )
}
```
```tsx
// src/components/organisms/RemoteWorkPanel/index.tsx
'use client'
import ClockFace from '@components/molecules/ClockFace'
import { remoteWork } from '@content/remoteWork'
import { clockZones } from '@constants/timezones'
import OverlapBar from './OverlapBar'
import { useRemoteWorkPanel } from './useRemoteWorkPanel'
export default function RemoteWorkPanel() {
  const { times, overlap, now } = useRemoteWorkPanel()
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">{clockZones.map((z) => <ClockFace key={z.id} city={z.city} label={'label' in z ? z.label : undefined} time={times[z.id]} />)}</div>
      <OverlapBar window={overlap} now={now} />
      <p>{remoteWork.note}</p>
    </div>
  )
}
```
(Return `now` from `useRemoteWorkPanel` too.) Make sure `src/constants/timezones.ts` reads:
```ts
export const clockZones = [
  { id: 'bogor', city: 'Bogor', timeZone: 'Asia/Jakarta', label: 'WIB' },
  { id: 'singapore', city: 'Singapore', timeZone: 'Asia/Singapore' },
  { id: 'abu-dhabi', city: 'Abu Dhabi', timeZone: 'Asia/Dubai' },
] as const
export const BASE_ZONE = 'Asia/Jakarta'
export const WORK_START = 9 * 60
export const WORK_END = 18 * 60
```
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Drive the 3D clock hands**

```ts
// src/components/three/objects/Clocks/useClockHands.ts
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { clockAngles, zonedTime } from '@utils/time'
const deg = Math.PI / 180
export function useClockHands(timeZone: string) {
  const hour = useRef<Group>(null), minute = useRef<Group>(null), last = useRef(-1)
  useFrame(() => {
    const now = Date.now()
    if (now - last.current < 1000) return
    last.current = now
    const a = clockAngles(zonedTime(new Date(now), timeZone))
    if (hour.current) hour.current.rotation.z = -a.hour * deg
    if (minute.current) minute.current.rotation.z = -a.minute * deg
  })
  return { hour, minute }
}
```
In `Clocks/index.tsx`, give `Clock` a `timeZone` prop, call `const { hour, minute } = useClockHands(timeZone)`, attach `ref={hour}` / `ref={minute}` to the two hand groups, and remove the static rotations. Pass `z.timeZone` from `Clocks`.

- [ ] **Step 4: Verify, commit**

`yarn dev`: the wall clocks show the current Bogor / Singapore / Abu Dhabi time; `/remote-work` shows live clock faces and "Overlap: 12:00–17:00 WIB".
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add live world clocks and the remote-work overlap bar

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 22: Night mode in the scene (theme sync, lighting blend, lamps, Oyen's nap)

Implements: design doc 06 "Light switch → night mode"; doc 03 "Lighting (night)".

**Files:**
- Create: `src/hooks/useThemeSync.ts`, `src/hooks/useThemeSync.test.tsx`, `src/components/three/Room/lightingPresets.ts`, `src/components/three/Room/useLampGlow.ts`
- Modify: `src/components/three/Room/Lighting.tsx`, `src/components/three/Room/Decor.tsx` (lamps read the glow), `src/components/pages/Room/index.tsx` (call `useThemeSync()`)

**Interfaces:**
- Produces: `useThemeSync()` (next-themes `resolvedTheme` → `useSceneStore.theme`, `'dark'` → `'night'`); `lightingPresets: Record<SceneTheme, { hemiSky; hemiGround; hemiIntensity; sunIntensity; sunColor; ambient; lamp; screenGlow; moon }>`; the lights blend toward the active preset in `useFrame` over about 0.8 s (instant with reduced motion).
- Oyen's day/night pose already keys on `useSceneStore.theme` (Task 18); the light switch's toggle too (Task 17).

- [ ] **Step 1: Write the failing hook test**

```tsx
// src/hooks/useThemeSync.test.tsx
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSceneStore } from '@store/useSceneStore'
import { useThemeSync } from './useThemeSync'
let resolved = 'light'
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: resolved }) }))
describe('useThemeSync', () => {
  it('mirrors next-themes into the scene store as day/night', () => {
    const { rerender } = renderHook(() => useThemeSync())
    expect(useSceneStore.getState().theme).toBe('day')
    resolved = 'dark'; rerender()
    expect(useSceneStore.getState().theme).toBe('night')
  })
})
```
Run: `yarn test src/hooks/useThemeSync`
Expected: FAIL.

- [ ] **Step 2: Write the hook, presets and blending**

```ts
// src/hooks/useThemeSync.ts
'use client'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSceneStore } from '@store/useSceneStore'
export function useThemeSync() {
  const { resolvedTheme } = useTheme()
  useEffect(() => { useSceneStore.getState().setTheme(resolvedTheme === 'dark' ? 'night' : 'day') }, [resolvedTheme])
}
```
```ts
// src/components/three/Room/lightingPresets.ts
import type { SceneTheme } from '@interfaces/ui'
export const lightingPresets: Record<SceneTheme, { hemiSky: string; hemiGround: string; hemiIntensity: number; sunIntensity: number; sunColor: string; ambient: number; lamp: number; screenGlow: number; moon: number }> = {
  day: { hemiSky: '#fff1dc', hemiGround: '#b9875a', hemiIntensity: 0.9, sunIntensity: 1.6, sunColor: '#fff4e0', ambient: 0.25, lamp: 0, screenGlow: 0.5, moon: 0 },
  night: { hemiSky: '#2b3a5c', hemiGround: '#1e1828', hemiIntensity: 0.35, sunIntensity: 0.25, sunColor: '#9fb4ff', ambient: 0.08, lamp: 2.2, screenGlow: 1.1, moon: 0.5 },
}
export const THEME_BLEND_SECONDS = 0.8
```
```tsx
// src/components/three/Room/Lighting.tsx  (replaces Task 11's version)
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type AmbientLight, type DirectionalLight, type HemisphereLight, type Mesh, type MeshStandardMaterial, type PointLight } from 'three'
import { useSceneStore } from '@store/useSceneStore'
import { useSceneBridge } from '../SceneCanvas/SceneBridge'
import { THEME_BLEND_SECONDS, lightingPresets } from './lightingPresets'

const tmp = new Color()
export default function Lighting() {
  const hemi = useRef<HemisphereLight>(null), sun = useRef<DirectionalLight>(null), amb = useRef<AmbientLight>(null), moon = useRef<DirectionalLight>(null)
  const { reducedMotion } = useSceneBridge()
  useFrame((state, dt) => {
    const p = lightingPresets[useSceneStore.getState().theme]
    const k = reducedMotion ? 1 : Math.min(1, dt / THEME_BLEND_SECONDS)
    if (hemi.current) { hemi.current.intensity += (p.hemiIntensity - hemi.current.intensity) * k; hemi.current.color.lerp(tmp.set(p.hemiSky), k); hemi.current.groundColor.lerp(tmp.set(p.hemiGround), k) }
    if (sun.current) { sun.current.intensity += (p.sunIntensity - sun.current.intensity) * k; sun.current.color.lerp(tmp.set(p.sunColor), k) }
    if (amb.current) amb.current.intensity += (p.ambient - amb.current.intensity) * k
    if (moon.current) moon.current.intensity += (p.moon - moon.current.intensity) * k
    state.scene.traverse((o) => {
      if (o.name === 'lampLight') { const l = o as PointLight; l.intensity += (p.lamp - l.intensity) * k }
      if (o.name === 'lampShade') { const m = (o as Mesh).material as MeshStandardMaterial; m.emissiveIntensity += (p.lamp / 2.2 - m.emissiveIntensity) * k }
      if (o.name === 'pcScreen' || o.name === 'tvScreen') { const m = (o as Mesh).material as MeshStandardMaterial; m.emissiveIntensity += (p.screenGlow - m.emissiveIntensity) * k }
    })
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff1dc', '#b9875a', 0.9]} />
      <directionalLight ref={sun} position={[-6, 9, 3]} intensity={1.6} color="#fff4e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0004} />
      <directionalLight ref={moon} position={[-8, 6, -2]} intensity={0} color="#9fb4ff" />
      <ambientLight ref={amb} intensity={0.25} />
    </>
  )
}
```
(The `scene.traverse` runs once per frame over about 150 objects: cheap. If profiling in Task 27 shows otherwise, cache the matched objects in a ref on first run.) Call `useThemeSync()` in `pages/Room/index.tsx`.
Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Verify, commit**

`yarn dev`: clicking the wall switch or the moon button dims the room over ~0.8 s, the two lamps glow amber, the screens glow brighter, Oyen hops onto the bed with "Zzz", and the UI switches to the night palette; reload keeps the choice; clear site data + OS dark mode → starts in night.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add night mode lighting blend and theme sync

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 23: Live window sky (Bogor time)

Implements: design doc 06 "Live window sky".

**Files:**
- Create: `src/utils/sky.ts`, `src/utils/sky.test.ts`, `src/constants/sky.ts`, `src/components/three/objects/WindowSky/index.tsx`, `src/components/three/objects/WindowSky/useSkyTexture.ts`
- Modify: `src/components/three/Room/Decor.tsx` (render `<WindowSky />` at `roomLayout.window`)

**Interfaces:**
- Produces: `skyPhase(minutesOfDay)`, `sunHeight(minutesOfDay)`, `skyColors`; `SKY_BOUNDS = { dawn: 300, day: 390, sunset: 1050, night: 1125 }`; `useSkyTexture(phase)` → `CanvasTexture` gradient; `WindowSky` (frame + sky plane + sun/moon + stars + 2 clouds), updating the phase once a minute and blending over ~3 s.

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/sky.test.ts
import { describe, expect, it } from 'vitest'
import { skyPhase, sunHeight } from './sky'
describe('sky', () => {
  it('maps Bogor minutes-of-day to phases', () => {
    expect(skyPhase(4 * 60)).toBe('night'); expect(skyPhase(5 * 60)).toBe('dawn'); expect(skyPhase(6 * 60 + 30)).toBe('day')
    expect(skyPhase(17 * 60 + 30)).toBe('sunset'); expect(skyPhase(18 * 60 + 45)).toBe('night'); expect(skyPhase(23 * 60)).toBe('night')
  })
  it('sun height peaks around noon and is 0 at night', () => {
    expect(sunHeight(12 * 60)).toBeCloseTo(1, 1); expect(sunHeight(6 * 60)).toBeCloseTo(0.07, 1); expect(sunHeight(2 * 60)).toBe(0)
  })
})
```
Run: `yarn test src/utils/sky`
Expected: FAIL.

- [ ] **Step 2: Implement**

```ts
// src/constants/sky.ts
export const SKY_BOUNDS = { dawn: 5 * 60, day: 6 * 60 + 30, sunset: 17 * 60 + 30, night: 18 * 60 + 45 } as const
export const SKY_UPDATE_MS = 60_000
export const SKY_BLEND_SECONDS = 3
// src/utils/sky.ts
import { SKY_BOUNDS } from '@constants/sky'
export type SkyPhase = 'dawn' | 'day' | 'sunset' | 'night'
export function skyPhase(minutesOfDay: number): SkyPhase {
  const m = ((minutesOfDay % 1440) + 1440) % 1440
  if (m < SKY_BOUNDS.dawn) return 'night'
  if (m < SKY_BOUNDS.day) return 'dawn'
  if (m < SKY_BOUNDS.sunset) return 'day'
  if (m < SKY_BOUNDS.night) return 'sunset'
  return 'night'
}
export function sunHeight(minutesOfDay: number): number {
  const rise = 5 * 60 + 50, set = 18 * 60
  if (minutesOfDay <= rise || minutesOfDay >= set) return 0
  return Math.sin(((minutesOfDay - rise) / (set - rise)) * Math.PI)
}
export const skyColors: Record<SkyPhase, { top: string; bottom: string; light: string }> = {
  dawn: { top: '#7FA8D8', bottom: '#FFC8A2', light: '#ffd9b8' },
  day: { top: '#7FB8E8', bottom: '#CFE9FA', light: '#fff4e0' },
  sunset: { top: '#6A5A9A', bottom: '#FF9A6A', light: '#ffb48a' },
  night: { top: '#0F1A3A', bottom: '#2B3A5C', light: '#9fb4ff' },
}
```
```ts
// src/components/three/objects/WindowSky/useSkyTexture.ts
'use client'
import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { type SkyPhase, skyColors } from '@utils/sky'
export function useSkyTexture(phase: SkyPhase) {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, skyColors[phase].top); g.addColorStop(1, skyColors[phase].bottom)
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 128)
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t
  }, [phase])
}
```
```tsx
// src/components/three/objects/WindowSky/index.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { RoundedBox, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { clay } from '@components/three/materials'
import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { SKY_BLEND_SECONDS, SKY_UPDATE_MS } from '@constants/sky'
import { BASE_ZONE } from '@constants/timezones'
import { skyPhase, sunHeight } from '@utils/sky'
import { zonedTime } from '@utils/time'
import { useSkyTexture } from './useSkyTexture'

const minutesNow = () => { const t = zonedTime(new Date(), BASE_ZONE); return t.h * 60 + t.m }

export default function WindowSky() {
  const w = roomLayout.window, [, H, W] = w.size!
  const [minutes, setMinutes] = useState(minutesNow)
  useEffect(() => { const id = window.setInterval(() => setMinutes(minutesNow()), SKY_UPDATE_MS); return () => window.clearInterval(id) }, [])
  const phase = skyPhase(minutes)
  const texture = useSkyTexture(phase)
  const sky = useRef<Mesh>(null), clouds = useRef<Group>(null), sun = useRef<Mesh>(null)
  useFrame((state, dt) => {
    const m = sky.current?.material as MeshStandardMaterial | undefined
    if (m && m.map !== texture) { m.opacity = Math.max(0, m.opacity - dt / SKY_BLEND_SECONDS); if (m.opacity <= 0) { m.map = texture; m.needsUpdate = true } }
    else if (m && m.opacity < 1) m.opacity = Math.min(1, m.opacity + dt / SKY_BLEND_SECONDS)
    if (clouds.current) clouds.current.position.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.3
    if (sun.current) sun.current.position.y = -H / 2 + 0.2 + sunHeight(minutes) * (H - 0.5)
  })
  return (
    <group position={[...w.position]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[W + 0.2, H + 0.2, 0.08]} radius={0.03}><meshStandardMaterial {...clay(palette.cream)} /></RoundedBox>
      <mesh ref={sky} position={[0, 0, 0.05]}><planeGeometry args={[W, H]} /><meshStandardMaterial map={texture} transparent opacity={1} roughness={1} /></mesh>
      <mesh ref={sun} position={[W / 3, 0, 0.06]}><circleGeometry args={[0.16, 24]} /><meshStandardMaterial color={phase === 'night' ? '#fff7d6' : '#ffe27a'} emissive={phase === 'night' ? '#fff7d6' : '#ffd25a'} emissiveIntensity={0.8} /></mesh>
      {phase !== 'night' && <group ref={clouds}>{[-0.5, 0.4].map((z, i) => <mesh key={i} position={[z, 0.3 - i * 0.5, 0.07]} scale={[1.6, 0.6, 1]}><sphereGeometry args={[0.22, 12, 8]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>)}</group>}
      {phase === 'night' && <Sparkles count={30} scale={[W - 0.3, H - 0.3, 0.05]} position={[0, 0, 0.07]} size={2} speed={0.1} color="#ffffff" />}
      <mesh position={[0, 0, 0.09]}><boxGeometry args={[0.06, H, 0.02]} /><meshStandardMaterial {...clay(palette.cream)} /></mesh>
      <mesh position={[0, 0, 0.09]}><boxGeometry args={[W, 0.06, 0.02]} /><meshStandardMaterial {...clay(palette.cream)} /></mesh>
      {[-1, 1].map((s) => <RoundedBox key={s} args={[0.5, H + 0.3, 0.1]} radius={0.04} position={[s * (W / 2 + 0.2), 0, 0.1]}><meshStandardMaterial {...clay(palette.peach)} /></RoundedBox>)}
    </group>
  )
}
```
Render `<WindowSky />` from `Decor`. Run: `yarn test`
Expected: PASS.

- [ ] **Step 3: Verify, commit**

`yarn dev`: the window shows the sky phase for the current Bogor time (temporarily override `minutesNow` to `() => 18 * 60` to see the sunset, then revert). Toggling night mode doesn't change the window — only the lamps.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add the live Bogor window sky

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 24: Audio: sound effects, radio music, mute, unlock on Enter

Implements: design doc 06 "Radio & sound" (states, rules, sound effects list, licenses).

**Files:**
- Create: `src/constants/audio.ts`, `src/utils/audio.ts`, `src/utils/audio.test.ts`, `src/hooks/useSoundEffects.ts`, `public/audio/{tick,pop,whoosh,switch,printer,meow,radio}.mp3`, `public/audio/music-cozy.mp3`
- Modify: `src/components/pages/Room/index.tsx` (`enter()` calls `audio.unlock()`; call `useSoundEffects()`), `src/components/organisms/Hud/index.tsx` (mute → `audio.setMuted`), `CREDITS.md`

**Interfaces:**
- Produces: `audio` manager from "Shared Interfaces → Utils → audio.ts"; `SFX: Record<SfxName, string>` paths; `useSoundEffects()` subscribes to the stores: hover → `tick`, section open → `pop` + `whoosh`, close → `whoosh`, `/resume` → `printer`, theme change → `switch`, Oyen bubble from a click → `meow`, music on → `radio` blip then `startMusic()`, music off → `stopMusic()`, `master` → `setMuted(!master)`.

- [ ] **Step 1: Source CC0 audio and record licenses**

Download into a new empty folder outside the repo: Kenney's "Interface Sounds" and "UI Audio" packs (CC0, https://kenney.nl/assets/interface-sounds, https://kenney.nl/assets/ui-audio) for `tick`, `pop`, `whoosh`, `switch`, `radio`; a CC0 cat meow and a printer sound from https://freesound.org (filter License = Creative Commons 0); a CC0 cozy/lo-fi loop from https://freepd.com or a CC0-licensed track on https://freesound.org. Convert to MP3 ≤ 30 KB per effect (`ffmpeg -i in.wav -ac 1 -ar 32000 -b:a 48k public/audio/tick.mp3`), music ≤ ~1.5 MB. Add one `CREDITS.md` row per file with the exact source URL and license; **do not ship any file whose license is not CC0 or equivalent**.

- [ ] **Step 2: Write the failing manager test**

```ts
// src/utils/audio.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAudioManager } from './audio'
describe('audio manager', () => {
  const play = vi.fn().mockResolvedValue(undefined), pause = vi.fn()
  beforeEach(() => { play.mockClear(); pause.mockClear(); vi.stubGlobal('Audio', vi.fn(() => ({ play, pause, loop: false, volume: 1, currentTime: 0 }))) })
  it('never plays music before unlock and plays after', () => {
    const a = createAudioManager()
    a.startMusic(); expect(play).not.toHaveBeenCalled()
    a.unlock(); a.startMusic(); expect(play).toHaveBeenCalledTimes(1)
  })
  it('mute pauses music and unmute resumes it', () => {
    const a = createAudioManager(); a.unlock(); a.startMusic()
    a.setMuted(true); expect(pause).toHaveBeenCalled()
    a.setMuted(false); expect(play).toHaveBeenCalledTimes(2)
  })
  it('swallows playback errors', async () => {
    play.mockRejectedValueOnce(new Error('NotAllowedError'))
    const a = createAudioManager(); a.unlock()
    expect(() => a.startMusic()).not.toThrow()
    await Promise.resolve()
  })
})
```
Run: `yarn test src/utils/audio`
Expected: FAIL.

- [ ] **Step 3: Implement the manager and the effects hook**

```ts
// src/constants/audio.ts
export const SFX = { tick: '/audio/tick.mp3', pop: '/audio/pop.mp3', whoosh: '/audio/whoosh.mp3', switch: '/audio/switch.mp3', printer: '/audio/printer.mp3', meow: '/audio/meow.mp3', radio: '/audio/radio.mp3' } as const
export const MUSIC_SRC = '/audio/music-cozy.mp3'
export const MUSIC_VOLUME = 0.35
export const SFX_VOLUME = 0.5
```
```ts
// src/utils/audio.ts
import { MUSIC_SRC, MUSIC_VOLUME, SFX, SFX_VOLUME } from '@constants/audio'
export type SfxName = keyof typeof SFX

export function createAudioManager() {
  let unlocked = false, muted = true, musicWanted = false
  let music: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null
  const buffers = new Map<SfxName, AudioBuffer>()
  const safe = (p: Promise<unknown> | undefined) => { p?.catch(() => {}) }

  const ensureMusic = () => { if (!music) { music = new Audio(MUSIC_SRC); music.loop = true; music.volume = MUSIC_VOLUME } return music }
  const syncMusic = () => { if (!unlocked) return; if (musicWanted && !muted) safe(ensureMusic().play()); else music?.pause() }

  return {
    unlock() { unlocked = true; try { ctx ??= new AudioContext(); safe(ctx.resume()) } catch { ctx = null } syncMusic() },
    setMuted(value: boolean) { muted = value; syncMusic() },
    startMusic() { musicWanted = true; syncMusic() },
    stopMusic() { musicWanted = false; music?.pause() },
    playSfx(name: SfxName) {
      if (!unlocked || muted || !ctx) return
      const play = (buffer: AudioBuffer) => { const src = ctx!.createBufferSource(); const gain = ctx!.createGain(); gain.gain.value = SFX_VOLUME; src.buffer = buffer; src.connect(gain).connect(ctx!.destination); src.start() }
      const cached = buffers.get(name)
      if (cached) return play(cached)
      safe(fetch(SFX[name]).then((r) => r.arrayBuffer()).then((b) => ctx!.decodeAudioData(b)).then((buffer) => { buffers.set(name, buffer); play(buffer) }))
    },
  }
}
export const audio = createAudioManager()
```
```ts
// src/hooks/useSoundEffects.ts
'use client'
import { useEffect } from 'react'
import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useSoundStore } from '@store/useSoundStore'
import { audio } from '@utils/audio'
import { currentSlug } from '@utils/history'
import { useActiveSection } from './useActiveSection'

export function useSoundEffects() {
  const active = useActiveSection()
  useEffect(() => {
    const unsubs = [
      useSoundStore.subscribe((s, prev) => {
        if (s.master !== prev.master) audio.setMuted(!s.master)
        if (s.music !== prev.music) { if (s.music) { audio.playSfx('radio'); audio.startMusic() } else audio.stopMusic() }
      }),
      useSceneStore.subscribe((s, prev) => {
        if (s.hovered && s.hovered !== prev.hovered) audio.playSfx('tick')
        if (s.theme !== prev.theme) audio.playSfx('switch')
        if (s.bubble && s.bubble !== prev.bubble && s.hint === null) audio.playSfx('meow')
      }),
      useRoomStore.subscribe((s, prev) => {
        if (s.transition === 'focusing' && prev.transition !== 'focusing') audio.playSfx('pop')
        if ((s.transition === 'open' && prev.transition !== 'open') || (s.transition === 'closing' && prev.transition !== 'closing')) audio.playSfx('whoosh')
        if (s.transition === 'open' && prev.transition !== 'open' && currentSlug() === 'resume') audio.playSfx('printer')
      }),
    ]
    audio.setMuted(!useSoundStore.getState().master)
    return () => unsubs.forEach((u) => u())
  }, [])
  useEffect(() => { const onVis = () => { if (document.hidden) audio.setMuted(true); else audio.setMuted(!useSoundStore.getState().master) }; document.addEventListener('visibilitychange', onVis); return () => document.removeEventListener('visibilitychange', onVis) }, [])
  void active
}
```
In `pages/Room/index.tsx`: `useSoundEffects()`; `enter()` becomes `() => { audio.unlock(); useRoomStore.getState().setPhase(…) }`; the Loader's skip link handler also calls `audio.unlock()`. In `Hud`, the mute button only toggles the store (the hook does the rest). Also unlock on the first `pointerdown` for direct links: `useEffect(() => { const once = () => audio.unlock(); window.addEventListener('pointerdown', once, { once: true }); return () => window.removeEventListener('pointerdown', once) }, [])`.
Run: `yarn test`
Expected: PASS.

- [ ] **Step 4: Verify, commit**

`yarn dev`: everything is silent until 🔊 or the radio is used; the radio plays the loop with a blip; hover ticks, open pops, the printer whirrs on Resume, Oyen meows; switching tabs pauses the music; 🔊 state survives a reload, music does not auto-resume.
```bash
yarn lint && yarn typecheck
git add -A
git commit -m "feat: add radio music and sound effects with safe unlock

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Milestone 3 checkpoint:** the four extras work (live clocks, night mode, live sky, radio + sfx), all off-by-default rules hold, and every asset is listed in `CREDITS.md`.

---

## Milestone 4: Quality and launch

### Task 25: Playwright end-to-end suite with axe

Implements: design doc 07 "Testing strategy" (end-to-end, accessibility, visual), "Accessibility" requirements, "Error handling" (no-WebGL).

**Files:**
- Create: `playwright.config.ts`, `e2e/direct-links.spec.ts`, `e2e/navigation.spec.ts`, `e2e/keyboard.spec.ts`, `e2e/no-webgl.spec.ts`, `e2e/mobile.spec.ts`, `e2e/a11y.spec.ts`, `e2e/visual.spec.ts`
- Modify: `package.json` (`"e2e": "playwright test"`, `"e2e:ui": "playwright test --ui"`), `.gitignore` (`playwright-report/`, `test-results/`)
- Install: `yarn add -D @playwright/test @axe-core/playwright && yarn playwright install chromium`

**Interfaces:**
- The suite runs against `yarn build && yarn start` (production build) via `webServer`. Projects: `desktop` (Chromium 1440×900), `mobile` (Pixel 7 emulation), `no-webgl` (Chromium with `--disable-3d-apis`), `reduced-motion` (`reducedMotion: 'reduce'`).
- Test hooks already in the DOM: `main[data-phase]`, `main[data-transition]`, `main[data-webgl]`, `[data-testid="scene"]`, `role="dialog"` with the section title, the phone `role="grid"`.

- [ ] **Step 1: Write the config**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'yarn build && yarn start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 180_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile|direct-links|a11y/ },
    { name: 'no-webgl', use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--disable-3d-apis'] } }, testMatch: /no-webgl/ },
    { name: 'reduced-motion', use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } }, testMatch: /navigation/ },
  ],
})
```

- [ ] **Step 2: Write the specs**

```ts
// e2e/direct-links.spec.ts
import { expect, test } from '@playwright/test'
const sections: [string, string, RegExp][] = [
  ['about', 'About me', /Hi, I'm Satriko!/], ['experience', 'Work experience', /Agile Collaboration/], ['skills', 'Skills', /Languages & Runtimes/],
  ['education', 'Education', /Honors Graduate/], ['gaming', 'Gaming', /Oyen is still choosing/], ['travel', 'Travel', /Oyen is still pinning/],
  ['hiking', 'Hiking', /trail photos/], ['diving', 'Diving', /dive photos/], ['remote-work', 'Remote work', /Overlap|No shared/],
  ['contact', 'Contact', /satrikoaditya@gmail.com/], ['resume', 'Resume', /Download PDF/],
]
for (const [slug, title, text] of sections) {
  test(`/${slug} serves its panel text in the HTML and shows the dialog`, async ({ page, request }) => {
    const html = await (await request.get(`/${slug}`)).text()
    expect(html).toContain(title)
    await page.goto(`/${slug}`)
    await expect(page.getByRole('dialog', { name: title })).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText(text)
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready')
  })
}
test('unknown slugs return 404', async ({ request }) => { expect((await request.get('/nope')).status()).toBe(404) })
```
```ts
// e2e/navigation.spec.ts
import { expect, test } from '@playwright/test'
test.beforeEach(async ({ page }) => { await page.goto('/'); await page.getByRole('button', { name: /Enter/ }).click(); await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', { timeout: 15_000 }) })
test('phone menu opens a section, back closes it with the room URL restored', async ({ page }) => {
  await page.getByRole('button', { name: 'Open phone menu' }).click()
  await page.getByRole('link', { name: 'Skills' }).click()
  await expect(page.getByRole('dialog', { name: 'Skills' })).toBeVisible()
  await expect(page).toHaveURL(/\/skills$/)
  await page.goBack()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('main')).toHaveAttribute('data-transition', 'idle')
})
test('switching panels replaces history so one Back returns to the room', async ({ page }) => {
  await page.getByRole('link', { name: /Resume/ }).click()
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible()
  await page.getByRole('button', { name: 'Open phone menu' }).click()
  await page.getByRole('link', { name: 'Contact' }).click()
  await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})
test('Escape and the close button close the panel', async ({ page }) => {
  await page.getByRole('link', { name: /Contact/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('link', { name: /Contact/ }).click()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
test('clicking the PC in the scene opens Experience', async ({ page }) => {
  const scene = page.getByTestId('scene')
  const box = await scene.boundingBox()
  // The PC sits right of center on the back wall in the default framing; click its screen area.
  await page.mouse.click(box!.x + box!.width * 0.56, box!.y + box!.height * 0.42)
  await expect(page.getByRole('dialog', { name: 'Work experience' })).toBeVisible({ timeout: 5000 })
})
```
```ts
// e2e/keyboard.spec.ts
import { expect, test } from '@playwright/test'
test('every section is reachable by keyboard alone', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  await page.getByRole('button', { name: /Enter/ }).focus(); await page.keyboard.press('Enter')
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Open phone menu' }).focus(); await page.keyboard.press('Enter')
  const first = page.getByRole('gridcell').first().locator('a'); await first.focus()
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Work experience' })).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Jitera')
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open phone menu' })).toBeFocused()
})
```
```ts
// e2e/no-webgl.spec.ts
import { expect, test } from '@playwright/test'
test('without WebGL the poster shows and everything still works', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main')).toHaveAttribute('data-webgl', 'unsupported')
  await page.getByRole('button', { name: 'Enter (simple view)' }).click()
  await expect(page.getByTestId('scene')).toHaveCount(0)
  await page.getByRole('link', { name: /Resume/ }).click()
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible()
})
```
```ts
// e2e/mobile.spec.ts
import { expect, test } from '@playwright/test'
test('mobile shows the bottom bar and a sheet-style panel', async ({ page }) => {
  await page.goto('/contact')
  const dialog = page.getByRole('dialog', { name: 'Contact' })
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox(); const vp = page.viewportSize()!
  expect(box!.width).toBeGreaterThan(vp.width * 0.9)
  expect(box!.y + box!.height).toBeGreaterThan(vp.height - 4)
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('button', { name: 'Open phone menu' })).toBeVisible()
})
```
```ts
// e2e/a11y.spec.ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
for (const path of ['/', '/experience', '/skills', '/contact', '/resume', '/travel']) {
  for (const theme of ['day', 'night']) {
    test(`axe: ${path} (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => { try { localStorage.setItem('theme', t === 'night' ? 'dark' : 'light') } catch {} }, theme)
      await page.goto(path)
      const results = await new AxeBuilder({ page }).exclude('[data-testid="scene"]').analyze()
      expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
    })
  }
}
```
```ts
// e2e/visual.spec.ts
import { expect, test } from '@playwright/test'
test('the room renders (loose visual check)', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: /Enter/ }).click()
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready', { timeout: 15_000 })
  await page.waitForTimeout(1500)
  await expect(page.getByTestId('scene')).toHaveScreenshot('room-default.png', { maxDiffPixelRatio: 0.08 })
})
```
Run: `yarn e2e --update-snapshots` once (creates `room-default.png`), then `yarn e2e`.
Expected: all projects pass. If the in-scene PC click misses after layout tuning, adjust the two ratios in `navigation.spec.ts` from a screenshot.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add Playwright end-to-end, accessibility and visual checks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 26: SEO assets: poster capture, Open Graph image, JSON-LD

Implements: design doc 03 "Fallback" (poster from our own scene), doc 07 "SEO".

**Files:**
- Create: `scripts/capture-poster.ts`, `public/poster/room-day.webp`, `public/poster/room-night.webp`, `public/poster/og.png`, `src/components/organisms/JsonLd/index.tsx`
- Modify: `src/app/[[...section]]/page.tsx` (render `<JsonLd />` on `/`), `src/components/molecules/Poster/index.tsx` (night variant by theme), `package.json` (`"poster": "tsx scripts/capture-poster.ts"`)
- Install: `yarn add -D tsx sharp`

- [ ] **Step 1: Add a poster mode to the page and the capture script**

In `pages/Room/index.tsx`, read `const poster = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('poster')` and, when true, hide the HUD/loader (`phase` forced to `ready` on mount, no Oyen bubble) so the scene can be captured cleanly.
```ts
// scripts/capture-poster.ts
import { chromium } from '@playwright/test'
import sharp from 'sharp'
const base = process.env.POSTER_BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] })
for (const theme of ['day', 'night'] as const) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
  await page.addInitScript((t) => localStorage.setItem('theme', t === 'night' ? 'dark' : 'light'), theme)
  await page.goto(`${base}/?poster=1`)
  await page.waitForSelector('main[data-phase="ready"]', { timeout: 60_000 })
  await page.waitForTimeout(2500)
  const png = await page.locator('[data-testid="scene"]').screenshot()
  await sharp(png).webp({ quality: 82 }).toFile(`public/poster/room-${theme}.webp`)
  if (theme === 'day') await sharp(png).resize(1200, 630, { fit: 'cover', position: 'centre' }).png().toFile('public/poster/og.png')
  await page.close()
}
await browser.close()
console.log('posters written')
```
Run: `yarn build && yarn start &` then `yarn poster`. Expected: three files under `public/poster/`, each webp under 300 KB.

- [ ] **Step 2: Night poster and JSON-LD**

`Poster` picks `/poster/room-night.webp` when `useTheme().resolvedTheme === 'dark'` after mount (day on the server).
```tsx
// src/components/organisms/JsonLd/index.tsx
import { education } from '@content/education'
import { site } from '@constants/site'
export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org', '@type': 'Person', name: site.name, jobTitle: 'Full Stack Software Engineer', email: `mailto:${site.email}`, url: site.url,
    address: { '@type': 'PostalAddress', addressLocality: 'Bogor', addressCountry: 'ID' },
    worksFor: { '@type': 'Organization', name: 'Jitera' },
    alumniOf: education.filter((e) => e.end !== 'present').map((e) => ({ '@type': 'EducationalOrganization', name: e.institution })),
    sameAs: [site.linkedin, site.github].filter(Boolean),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
```
Render `<JsonLd />` from the route's `Page` when `slug === null`. Validate with `curl -s localhost:3000 | grep -o 'application/ld+json'`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add poster and OG images, JSON-LD person data

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 27: Performance budget check

Implements: design doc 07 "Performance budgets".

**Files:**
- Create: `scripts/check-budgets.mjs`
- Modify: `package.json` (`"budgets": "node scripts/check-budgets.mjs"`), `next.config.ts` (bundle analyzer behind `ANALYZE=1`)
- Install: `yarn add -D @next/bundle-analyzer`

- [ ] **Step 1: Write the budget script**

```js
// scripts/check-budgets.mjs — fails (exit 1) when a budget is exceeded
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
const sum = (dir, pred) => readdirSync(dir, { withFileTypes: true }).reduce((t, e) => { const p = join(dir, e.name); return t + (e.isDirectory() ? sum(p, pred) : pred(e.name) ? statSync(p).size : 0) }, 0)
const kb = (n) => Math.round(n / 1024)
const checks = [
  ['public/models', (n) => n.endsWith('.glb'), 2 * 1024 * 1024, '3D models'],
  ['public/audio', (n) => n.endsWith('.mp3') && !n.startsWith('music'), 7 * 30 * 1024, 'sound effects'],
  ['public/poster', (n) => n.endsWith('.webp'), 2 * 300 * 1024, 'posters'],
]
let failed = false
for (const [dir, pred, limit, label] of checks) {
  let size = 0; try { size = sum(dir, pred) } catch { size = 0 }
  const ok = size <= limit; failed ||= !ok
  console.log(`${ok ? 'OK ' : 'FAIL'} ${label}: ${kb(size)} KB (limit ${kb(limit)} KB)`)
}
process.exit(failed ? 1 : 0)
```
Run: `yarn budgets` → all OK.

- [ ] **Step 2: Measure JS and runtime**

`ANALYZE=1 yarn build`: confirm `three`/`@react-three/*` live only in the lazily loaded SceneCanvas chunk and that a direct-link route's First Load JS is ≤ ~200 KB gzip (the analyzer reports gzip sizes); the scene chunk ≤ ~350 KB gzip. If drei pulls in unused modules, import from the specific paths (`@react-three/drei/core/...`).
Lighthouse (Chrome DevTools, mobile preset) on `/experience`: Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95, Performance ≥ 80. On `/`, Performance may be lower (intentional loader); record the numbers in `docs/design/07-quality.md` under a new "Measured" line.
Runtime: in DevTools Performance, confirm ≥ 50 fps idle on desktop; with CPU 4× slowdown the `PerformanceMonitor` drops `tier` to `low` (check `useSceneStore.getState().tier` in the console) within a few seconds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add bundle and asset budget checks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 28: Launch checklist, docs sync and Vercel

Implements: design doc 07 "Deployment", "Before launch"; doc 05 "Content checklist".

**Files:**
- Modify: `src/constants/site.ts` (`url`, `linkedin`, `github`), `src/content/about.ts` (`photo`), `public/images/about/satriko.jpg`, `public/resume/Satriko-Aditya-Resume.pdf`, `CREDITS.md`, `README.md`, `docs/design/*.md` (deviations below), `vercel.json` (optional caching headers)

- [ ] **Step 1: Collect the blocking content from Satriko**

C1 photo → `public/images/about/satriko.jpg` + `about.photo = { src: '/images/about/satriko.jpg', alt: 'Satriko Aditya' }`; C2 intro (keep or edit the draft); C3/C4 LinkedIn and GitHub URLs → `site.linkedin` / `site.github`; C5 public PDF → `public/resume/Satriko-Aditya-Resume.pdf`; C6 wording for `UNLINKED_SKILL_LABEL`; C18 domain → `site.url`. Everything else in the checklist (games, pins, hikes, dives, Oyen's markings, analytics) is optional and lands as content-only commits later.

- [ ] **Step 2: Privacy and license sweep**

```bash
grep -rnE "\+62|0851|Sugeng|Gilang|Fadel|Zaidan|telkomsel\.co|charcentric\.com" src public docs --include=*.ts --include=*.tsx --include=*.md ; echo "exit=$?"   # expected: no matches, exit=1
pdftotext public/resume/Satriko-Aditya-Resume.pdf - | grep -ciE "\+62|referee"                                                       # expected: 0
```
Every file in `public/audio`, `public/models` and every font has a `CREDITS.md` row.

- [ ] **Step 3: Sync the design docs with the deviations recorded in this plan** (see "Deviations from the design docs" below): update doc 02 (store names, history helpers, `components/three/RoomObjects`, SceneBridge), doc 03 (Interactive uses an emissive highlight instead of drei `Outlines`; CameraPose is `target/offset/zoomFactor`; packs optional), doc 04 (`data-theme` values via next-themes `value` prop; CircleQuestionMark icon), doc 07 (measured numbers), doc 08 (new rows for Tasks 19 and these deviations).

- [ ] **Step 4: Deploy**

Vercel: import the git repository (or `npx vercel` from the folder), framework preset Next.js, build command `yarn build`, no environment variables. Add the production domain and set `site.url` to it before the production build. Optional `vercel.json` for long-lived caching of `/models/*`, `/audio/*`, `/poster/*` (file names are versioned when they change). After deploy: run `yarn e2e` with `POSTER_BASE_URL`/`baseURL` pointed at the preview URL (`PLAYWRIGHT_BASE_URL=https://<preview>.vercel.app yarn e2e` after reading `process.env.PLAYWRIGHT_BASE_URL` in `playwright.config.ts`), check the OG preview with https://www.opengraph.xyz, and re-run Lighthouse on production.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: launch content, docs sync and deployment config

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Deviations from the design docs (to be written back into `docs/design/` in Task 28)

| # | Design doc said | Plan does | Why |
|---|---|---|---|
| D1 | doc 04: `<html data-theme="day|night">` set by next-themes | Same attribute values, but next-themes' internal names stay `light`/`dark` (mapped with its `value` prop); `resolvedTheme` is `'light'|'dark'` | next-themes resolves the system preference only to `light`/`dark` |
| D2 | doc 02: `CameraPose { position, target, zoom }` | `CameraPose { target, offset, zoomFactor }` (position = target + offset; zoom relative to the fitted default) | Poses stay valid when the default fit changes with viewport size |
| D3 | doc 03: hover outline with drei `Outlines` | Emissive tint on the object's own materials (+ lift and label) | `Outlines` must be a child of each mesh; the emissive approach works per object with one effect |
| D4 | doc 03: CC0 packs for furniture, custom objects in code | Everything code-built first; packs are an optional upgrade (Task 20) | Fully executable without manual downloads; style test decides |
| D5 | doc 02 folder tree: `components/three/objects/` only | Adds `components/three/RoomObjects/` as the aggregator | `objects/` vs `Objects/` would collide on macOS |
| D6 | doc 02: hooks read Next's router from anywhere | Scene code uses `openFromScene()` and `useSceneBridge()` | React contexts don't cross the R3F Canvas boundary |
| D7 | doc 04: help icon `CircleHelp` | `CircleQuestionMark` | Canonical name in lucide-react ≥ 1.0 (`CircleHelp` is an alias) |
| D8 | doc 02: `useSceneStore` fields | Adds `progress`, `bubble`, `oyenAnchor`; no `pointer` (R3F's `state.pointer` is used instead) | Loader stays free of drei; the bubble is DOM outside the Canvas |
| D9 | doc 04: body `backdrop-blur` on the modal backdrop | Blur only on the high tier | Design doc 04 already allows this; made explicit |
| D10 | doc 03: low tier uses on-demand rendering while a panel covers the room | `frameloop="always"` on both tiers (browsers already pause rAF in hidden tabs); the low tier drops DPR, shadows and AO instead | Simpler; `frameloop="demand"` + `invalidate()` is the fallback if Task 27's phone measurements miss 30 fps |

## Verification (end-to-end, after Task 28)

1. `yarn lint && yarn typecheck && yarn test && yarn build && yarn budgets` → all green.
2. `yarn e2e` → desktop, mobile, no-webgl and reduced-motion projects pass (direct links, back-button close, panel switching, keyboard-only, poster fallback, sheet modal, axe in both themes, visual check).
3. Manual, on the production URL: Enter flow with the loader and swoop; hover/click every one of the 14 clickable things; phone menu; Resume download; Copy email; light switch / moon button; radio + mute; window sky matches Bogor's time; share `/experience` in a chat app and confirm the OG image and title; Lighthouse Accessibility ≥ 95 and SEO ≥ 95 on `/experience`.
4. Real devices: iPhone Safari and a mid-range Android (drag/pinch within limits, tags tappable, bottom bar, sheet swipe-to-close, ≥ 30 fps or automatic tier drop).
5. Success criteria S1–S7 from design doc 01 each checked off in `docs/design/08-decision-log.md`.

## Versions (verified against npm and official docs on 2026-10-21)

| Package | Version | Notes |
|---|---|---|
| next | 16.4.2 | `params` is a Promise; `--no-cache-components` keeps `dynamicParams`; `next lint` removed (use `eslint .`); Turbopack default |
| react / react-dom | 19.3.1 | |
| @react-three/fiber | 9.8.2 | Needs React 19; do not use the v10 alpha |
| @react-three/drei | 10.7.9 | `CameraControls` forwards `smoothTime`, limits, `mouseButtons`, `touches` to the instance; do not use the v11 alpha |
| camera-controls | 3.1.2 | `ACTION` via `CameraControlsImpl.ACTION`; `TOUCH_ROTATE`, `TOUCH_ZOOM_TRUCK`, `NONE` exist |
| three | 0.186.1 | `PCFSoftShadowMap` deprecated → `PCFShadowMap`; `Clock` deprecated (we use `state.clock` from R3F only) |
| @react-three/postprocessing | 3.2.1 | Exports `N8AO`; optional (Task 27 decides) |
| motion | 14.5.0 | `import … from 'motion/react'` |
| next-themes | 0.4.6 | `attribute="data-theme"`, `value` map, system → light/dark only |
| zustand | 5.0.15 | |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | `@custom-variant`, `@theme inline` |
| radix-ui | 1.8.1 | Unified package; `Dialog.Content` supports `asChild` + `forceMount` |
| lucide-react | 1.61.0 | Icons `aria-hidden` by default; `CircleQuestionMark`, `Waves` exist |
| vitest / vite / @vitejs/plugin-react | 5.0.5 / 8.3.5 / 6.1.2 | `vite` is a required peer; Node ≥ 22.12 |
| @testing-library/react / dom / jest-dom / user-event | 16.3.3 / 10.x / 7.0.1 / 14.6.8 | jest-dom 7 needs Node 22 |
| jsdom | 30.1.3 | Node ≥ 22.22 |
| vite-tsconfig-paths | 6.1.1 | Needed for the `@…/*` aliases in Vitest |
| @playwright/test / @axe-core/playwright | 1.64.1 / 4.14.0 | |
| world-atlas / topojson-client / d3-geo | 2.0.2 / 3.1.0 / 3.1.1 | ISC; Natural Earth data; Indonesia id `"360"` |
| @gltf-transform/cli / gltfjsx | 4.5.1 / 6.5.3 | Optional (Task 20) |
| @vercel/analytics | 2.0.1 | Optional (checklist C19) |

## Out of scope for this plan

- **Phase 2** (PC terminal commands, Oyen antics: petting reactions and the mug push) gets its own plan after launch; the hooks it needs already exist (`mug` and `pcScreen` names, `bubble`, `hint`).
- Parked ideas from design doc 01 (Projects pinboard, FOT-Seurat, Konami mini-game, discovery counter, rubber duck, console message, Bogor rain, 404 room, Bahasa Indonesia, world map).
