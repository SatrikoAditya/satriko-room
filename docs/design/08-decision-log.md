# 08: Decision Log

Every decision made during the brainstorming session on **2026-10-21**, in the order it was made. Rows 31 onwards were made during the build.

**"Decided by"** means:

- **Satriko**: chosen directly by Satriko.
- **Design**: proposed in the design and approved by Satriko in the section-by-section review.

| # | Topic | Options considered | Decision | Why | Decided by |
| --- | --- | --- | --- | --- | --- |
| 1 | Primary audience | Recruiters · personal brand / dev community · freelance clients · balanced mix | **Balanced mix** | Recruiters first (fast access, resume always visible), but still a showcase piece people want to explore and share | Satriko |
| 2 | Art style | Pixel art · flat vector · collage / hand-drawn (like the Olivia Rodrigo store) · isometric 2.5D | **Isometric 2.5D**, refined to an **Animal Crossing / clay-toy** look | Eye-catching diorama feel. Satriko then asked for the Animal Crossing style and shared worawork.vercel.app as the reference | Satriko |
| 3 | Art source | Model in a 3D tool and render to 2D · asset pack + fill-ins · commission an illustrator · code-drawn SVG | **CC0 3D model packs (KayKit, Kenney) + objects built in code** | Satriko doesn't do 3D modeling and asked for "code or asset packs". The packs are free, consistent and chunky enough for the Animal Crossing look | Satriko |
| 4 | Rendering | Real 3D with a fixed camera · 2D code-drawn SVG · 2D isometric sprite pack | **Real 3D (React Three Fiber), fixed isometric camera, point-and-click** | Inspecting the reference showed it's real-time 3D (R3F + drei, GLB, HDR, orthographic camera). Soft clay lighting can't be done in flat 2D. Most cozy isometric 2D packs are pixel art | Satriko |
| 5 | Projects section | Public personal projects · NDA-safe work projects · both · none yet | **None for now**; a slot is reserved (registry + wall space) | No projects to show yet; it can be added later without rework | Satriko |
| 6 | Avatar / host | Chibi avatar of Satriko · no avatar (object only) · a pet as host | **A pet as the host** | Cozy, and easier to make cute in low-poly than a human likeness | Satriko |
| 7 | Which pet | Cat · dog · sea turtle · other | **An orange cat named "Oyen"** | Satriko's choice. "Oyen" is the classic Indonesian name for orange cats, famous for mischief, which suits the antics | Satriko |
| 8 | Mobile behavior | Swipe to look around · zoomed-out full room · 2D layout on mobile | **Swipe to look around within limits** + bottom bar | Keeps the 3D experience on phones while objects stay big enough to tap | Satriko |
| 9 | Click flow | Camera zooms in, then panel · instant panel · zoom with content inside the 3D scene | **Camera zooms in, then the panel**, refined to: the **object grows into a modal covering about 80% of the screen** with the room visible behind it | Cinematic and connected to the object; the text stays normal HTML (readable, accessible). Satriko described the about-80% monitor-grows-into-modal behavior | Satriko |
| 10 | Panel style | Shared frame, themed inside · one uniform style · fully themed per object | **Shared frame, themed inside** | Feels like one app, with personality per object (monitor, TV, shelf…) | Satriko |
| 11 | Hobby objects | 3 separate objects · 1 map with 3 pin types · map + gear corner | **3 separate objects** (map, backpack + boots, dive mask + fins) | More to discover; each hobby gets its own spotlight | Satriko |
| 12 | Travel map | (follow-up) | **Indonesia map** with pins; pins added later | Satriko travels mostly around Indonesia; a World tab is parked | Satriko |
| 13 | Extras | 3 world clocks · light switch → night mode · radio → ambient sound · live window sky | **All four** | Each tells part of the story (remote across time zones, cozy vibe, Bogor's real sky) | Satriko |
| 14 | Easter eggs | PC terminal · discovery counter · Oyen antics · Konami mini-game (+ duck, console message, Bogor rain, 404 room) | **PC terminal + Oyen antics**, in **phase 2** | Developer delight plus character; phase 2 keeps launch scope tight | Satriko |
| 15 | Public contact details | Email + LinkedIn + GitHub · also phone / WhatsApp · contact form only | **Email + LinkedIn + GitHub only**; no referees; "References available on request"; a public PDF without the phone number or referees | Lowest spam and scam risk; protects the referees' personal details | Satriko |
| 16 | URLs | One URL per panel · single page. Revisited as: modal + URLs · modal on a single page | **Modal + one URL per panel** via `history.pushState` | Same single-page feel and animations (URLs don't limit animation), plus direct links for recruiters, back button to close, and SEO | Satriko |
| 17 | Language | English only · English + Bahasa Indonesia | **English only** | Matches the CV and the international remote roles; one copy to maintain | Satriko |
| 18 | Intro | Loader + Enter button · auto-enter | **Loader + Enter** on `/`; **direct links skip the gate** | The Enter click unlocks audio and gives an intro moment; recruiters on direct links never wait | Satriko (gate) / Design (skip on direct links) |
| 19 | Quick menu | Phone with app icons · top nav bar · hamburger drawer | **Phone with app icons** + always-visible Resume and Contact buttons | Fits the game feel while staying fast; an original design, not a NookPhone copy | Satriko |
| 20 | Contact and Resume objects | Contact on a phone vs. elsewhere; resume on the printer | **Contact → mailbox**, **Resume → printer** | The phone became the menu, so a separate contact object avoids confusion | Design |
| 21 | About Me object | Framed photo on the desk · door nameplate · work ID badge | **Framed photo on the desk** | Personal and recognizable | Satriko |
| 22 | Room type | Studio bedroom · home office / gamer den · small 2-room house | **Studio bedroom** | Feels the most lived-in, like an Animal Crossing room; the bed doubles as Oyen's nap spot | Satriko |
| 23 | Scene assembly | Composed in code · arranged in a visual editor (three.js editor) | **Composed in code** (components + a layout config) | One source of truth in git; mixes pack and code-built objects; no 3D tool needed from Satriko | Satriko |
| 24 | Palette | Forest & wood · ocean pastel · cozy gamer pastel · warm cozy | **Warm cozy** (cream, wood, mint, sky, peach, terracotta) | Satriko kept the original proposal | Satriko |
| 25 | Fonts | Fredoka/Baloo 2/Patrick Hand/Quicksand + Nunito → "like the Nintendo font" → real FOT-Seurat via Adobe Fonts · free look-alike · look-alike now, Seurat later | **Free look-alike: M PLUS Rounded 1c** (compare Zen Maru Gothic) + **Nunito**; JetBrains Mono (PC) and VT323 (TV) as accents | Animal Crossing uses FOT-Seurat (Fontworks/Monotype), which needs a paid license for web use; the look-alikes are free and hosted with the site | Satriko |
| 26 | Missing hobby content | (follow-up) | Fill in later; **cozy empty-state placeholders** at launch | Lets the site launch without waiting for photos and lists | Satriko (fill later) / Design (placeholders) |
| 27 | Deliverable of this session | (instruction) | **Detailed design docs only**: no implementation and no implementation plan yet | Satriko's explicit request | Satriko |
| 28 | Code structure | (request) | **Follow Satriko's Jitera Next.js project structure and conventions**: `src/` + aliases, thin `app/` routes → `components/pages`, atomic design, `store/use*Store.ts`, `constants/`, `hooks/`, `interfaces/`, `models/` (`I` prefix), `utils/`, Prettier/ESLint rules. Additions: `components/three/`, `src/content/`, `e2e/` | Familiar to Satriko, so the code is easy to work in. Only structure and conventions are carried over, no client code | Satriko (follow the reference) / Design (additions) |
| 29 | Theme and dialog libraries | Custom theme script vs. next-themes; custom modal semantics vs. a Radix Dialog base | **next-themes** (`data-theme`, day/night) and **shadcn/ui Radix Dialog** as the modal base | Both already used in the reference project; they handle no-flash theming and accessible dialogs without custom code | Design (follows #28) |
| 30 | State shape | One big store with slices vs. one store per concern | **One Zustand store per concern**: `useRoomStore`, `useSceneStore`, `useSoundStore` | Matches the reference project's store pattern | Design (follows #28) |
| 31 | Style test (Task 19) | ACES vs Neutral tone mapping; M PLUS Rounded 1c vs Zen Maru Gothic; mobile zoom 1.3 vs 1.15 | Tuned room + Neutral tone mapping; M PLUS Rounded 1c; mobile zoom 1.3 | Neutral keeps the pastels vivid; M PLUS reads more game-like; tighter mobile framing keeps objects tappable | Satriko |
| 32 | Controls while a panel is open (D11) | Keep the HUD and phone usable above the backdrop (original doc 04) vs. real modal semantics | **Modal semantics win:** the HUD and phone are not reachable while a section panel is open; close the panel first | A focus-trapped `aria-modal` dialog makes everything behind it inert, which is what screen-reader and keyboard users expect; mixing the two would break the trap | Design (found in the e2e work) |
| 33 | Bundle analysis (D12) | `@next/bundle-analyzer` vs. Next 16.4's built-in `next analyze` | **`next analyze`** (`yarn analyze`, `yarn analyze:export`) | `@next/bundle-analyzer` is webpack-only and the project builds with Turbopack; no new dependency | Design |
| 34 | First-load JS budget (D13) | Keep 200 KB vs. raise to 250 KB gzip | **250 KB** gzip, enforced by `yarn budgets` | The React/Next runtime alone measured about 216 KB. 250 KB is a regression guard above that floor; slimming `motion` with `LazyMotion` is a post-launch follow-up | Design |
| 35 | Model-pack upgrade (Task 20) | Add KayKit/Kenney models vs. keep everything code-built | **Skipped:** all objects stay code-built | Satriko approved the code-built look at the style-test gate (#31); no download, no `room.glb`, no asset pipeline needed | Satriko |
| 36 | Panel dialog and SSR | Radix `Dialog.Portal` vs. rendering the dialog inline | **Inline, no portal** for the section panels (`ModalHost`) | A portal renders nothing on the server, so direct links had no panel text in the HTML (success criterion S2). Found by the e2e SSR assertion | Design |
| 37 | Poster images | Hand-made art vs. screenshots of our own scene | **Captured from our own scene** with `?poster=1` and `yarn poster` (`scripts/capture-poster.mts`); the day capture, cropped to 1200×630, is the OG image | The poster always matches the real room and can be regenerated after any art change. The current captures were taken at night, so they must be re-run in daytime before launch | Design |

## Design sections reviewed and approved

| Part | Covered | Result |
| --- | --- | --- |
| 1 | Architecture and URLs | Approved; then refined by decision #16 (modal + URLs) |
| 2 | Room and interactions (layout, look, hover/click, Oyen, mobile, performance, fallback) | Approved |
| 3 | On-screen UI and the modal | Changes requested → palette kept (#24), fonts changed (#25) |
| 4 | Panel contents | Approved, plus the Indonesia map (#12), Oyen (#7), and filling in content later (#26) |
| 5 | Extras, phase 2, quality, docs structure | Approved |
| Style test | Task 19 screenshots (docs/design/style-test/) | Approved 2026-10-22 with Neutral tone mapping |

## Deviations from the design docs

Found while building; the design docs have been updated to match (see the *Implementation note* lines in 02, 03 and 04). Kept here so the log is self-contained.

| # | Design doc said | As built | Why |
| --- | --- | --- | --- |
| D1 | 04: `<html data-theme="day\|night">` set by next-themes | Same attribute values, but next-themes' internal names stay `light` / `dark` (mapped with its `value` prop); `resolvedTheme` is `'light' \| 'dark'` | next-themes resolves the system preference only to `light` / `dark` |
| D2 | 02: `CameraPose { position, target, zoom }` | `CameraPose { target, offset, zoomFactor }` (position = target + offset; zoom relative to the fitted default) | Poses stay valid when the default fit changes with the viewport size |
| D3 | 03: hover outline with drei `Outlines` | Emissive tint on the object's own materials (+ lift and label) | `Outlines` must be a child of each mesh; the emissive approach works per object with one effect |
| D4 | 03: CC0 packs for furniture, custom objects in code | Everything is code-built; packs are an optional upgrade, and Task 20 was skipped after the style test approved the look | Fully executable without manual downloads; the style test decided |
| D5 | 02 folder tree: `components/three/objects/` only | Adds `components/three/RoomObjects/` as the aggregator | `objects/` vs `Objects/` would collide on macOS |
| D6 | 02: hooks read Next's router from anywhere | Scene code uses `openFromScene()` and `useSceneBridge()` | React contexts do not cross the R3F Canvas boundary |
| D7 | 04: help icon `CircleHelp` | `CircleQuestionMark` | Canonical name in lucide-react 1.x (`CircleHelp` is an alias) |
| D8 | 02: `useSceneStore` fields | Adds `sceneReady`, `progress`, `bubble`, `oyenAnchor`; no `pointer` (R3F's `state.pointer` is used instead). `useSoundStore` gains `hydrate()` | The loader stays free of drei; the bubble is DOM outside the Canvas; the saved sound flag is read after mount |
| D9 | 04: backdrop blur on the modal backdrop | Blur only on the high tier | Doc 04 already allowed this; made explicit |
| D10 | 03: low tier uses on-demand rendering while a panel covers the room | `frameloop="always"` on both tiers (browsers already pause rAF in hidden tabs); the low tier drops DPR, shadows and contact-shadow cost instead | Simpler; `frameloop="demand"` + `invalidate()` is the fallback if real-device measurements miss 30 fps |
| D11 | 04: HUD and phone stay usable above the backdrop while a panel is open | They are not reachable while a panel is open (modal semantics) | See decision #32 |
| D12 | 07: `@next/bundle-analyzer` | Built-in `next analyze` | See decision #33 |
| D13 | 07: first-load JS ≤ 200 KB gzip | ≤ 250 KB gzip | See decision #34 |

Smaller as-built differences recorded in the docs themselves: no ambient occlusion and no `Environment` (03); every visit starts on the high tier (03); a visually hidden section nav instead of a "Skip to menu" link (07); `src/assets/` was never needed (02); the window does not tint the room light (06).

## Still open

Status of the [content checklist](05-content.md#content-checklist): **provided** C1 (photo), C2 (intro draft kept), C3 and C4 (LinkedIn and GitHub). **Pending:** C5 (public CV PDF), C17 (music track), C18 (domain name). **Default in use:** C6 (`'Side projects & learning'`), C19 (no analytics). **Hobby content** (games, Indonesia pins, hikes, dives; C10 to C13) is not written yet, so those panels show their empty states. The steps to finish are in the repository `README.md` (Launch checklist). Also open: re-capture the posters in Bogor daytime, real-device checks.
