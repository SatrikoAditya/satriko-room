# 08: Decision Log

Every decision made during the brainstorming session on **2026-10-21**, in the order it was made.

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

## Design sections reviewed and approved

| Part | Covered | Result |
| --- | --- | --- |
| 1 | Architecture and URLs | Approved; then refined by decision #16 (modal + URLs) |
| 2 | Room and interactions (layout, look, hover/click, Oyen, mobile, performance, fallback) | Approved |
| 3 | On-screen UI and the modal | Changes requested → palette kept (#24), fonts changed (#25) |
| 4 | Panel contents | Approved, plus the Indonesia map (#12), Oyen (#7), and filling in content later (#26) |
| 5 | Extras, phase 2, quality, docs structure | Approved |

## Still open

These are tracked in the [content checklist](05-content.md#content-checklist): photo and intro, LinkedIn/GitHub URLs, the public CV PDF, labels for skills with no job link, certificates, hobby content, Oyen's markings, music track, domain name, analytics.
