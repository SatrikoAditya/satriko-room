# 01: Vision & Scope

## Purpose

A personal portfolio for **Satriko Aditya**, a Full Stack Software Engineer with 5+ years of experience in Node.js, TypeScript, React, Next.js and NestJS, based in Bogor, Indonesia. The site has two jobs:

1. **Help Satriko get hired.** Recruiters and hiring managers can find experience, skills, education and the resume quickly, and can contact Satriko easily.
2. **Be memorable.** It's a creative, interactive piece people want to share. The site itself demonstrates front-end, 3D and UX skill.

## Audience

**A balanced mix:** recruiters first, but a showcase too.

| Visitor | What they want | How the design serves them |
| --- | --- | --- |
| Recruiter / hiring manager (primary) | A quick read of experience, skills and the resume | Always-visible **Resume** and **Contact** buttons, the **phone menu** reaches any section in 2 taps, direct links (e.g. `/experience`) skip the intro |
| Engineers / tech leads | Depth, craft, personality | Polished 3D room, a themed PC panel, the phase 2 terminal |
| Dev community / social shares | Something delightful to explore | Hover reactions, Oyen the cat host, night mode, the radio, easter eggs |

## Concept

- **Setting:** a cozy **studio bedroom**, the room Satriko lives, works and games in.
- **Style:** **Animal Crossing–inspired** clay/toy look: chunky rounded furniture, warm pastel colors, soft light, soft shadows.
- **View:** **real 3D with a fixed isometric camera** (orthographic), showing two walls and the floor like a diorama.
- **Interaction:** **point-and-click.** Hover makes an object react, and clicking makes the camera glide to it and opens its panel (a modal covering about 80% of the screen, room still visible behind it). No walking character, no free camera.
- **Host:** **Oyen**, an orange cat, greets visitors, gives hints and reacts when clicked.

### Reference analysis: worawork.vercel.app

Satriko shared [worawork.vercel.app](https://worawork.vercel.app/) as the target look. Inspecting its production bundle showed:

- It's a **real-time 3D scene**, not 2D: React + React Three Fiber + drei, `GLTFLoader` / `DRACOLoader`, an orthographic camera, and HDR environment maps.
- Its models (`Models.glb`, `Player.glb`, `Duck.glb`) were **hand-made by a 3D artist**: the site's own skills list includes Blender and Substance Painter. The clay texture comes from hand-painted materials.

**What this means for us:** Satriko doesn't do 3D modeling, so we get close to this look with **CC0 low-poly model packs plus custom objects built in code from rounded shapes**, tuned with warm lighting and soft shadows. We **won't** match the hand-painted textures exactly. The style test (see Risks) checks that the look holds up before the full room is built.

### Inspired by, not copied

Animal Crossing is Nintendo's intellectual property. The site may use the *vibe* (cozy, rounded, pastel, toy-like) but **must not** use Nintendo's models, characters (e.g. Tom Nook, villagers), logos, interface designs (e.g. a copy of the NookPhone) or fonts that aren't properly licensed. Everything stays original: the phone menu is our own design, and the fonts are free look-alikes (see [04](04-ui-and-visual-design.md#typography)).

## Success criteria

| # | Criterion | How it's checked |
| --- | --- | --- |
| S1 | From the room, a visitor can reach the resume download in **≤ 2 clicks** (HUD **Resume**, then **Download PDF**); with a section panel open it takes **3**, because the panel is closed first (deviation D11) | E2E test + manual |
| S2 | A direct link (e.g. `/experience`) shows the panel **text before the 3D finishes loading** | E2E test; panel HTML is server-rendered |
| S3 | All 12 sections are reachable **by keyboard alone and without WebGL** | E2E tests with keyboard and with WebGL disabled |
| S4 | Works and feels smooth on a **mid-range phone** (≥ 30 fps target; graphics drop to the low tier automatically) | Manual device QA |
| S5 | 3D assets total **≤ about 2 MB** compressed | Build size check |
| S6 | Lighthouse **Accessibility ≥ 95, SEO ≥ 95** on every route | Lighthouse CI / manual |
| S7 | No phone number or referee details appear anywhere on the site, and no referee details in the public PDF (which may show the phone number, decision #51) | Manual review |

Detailed budgets are in [07: Quality](07-quality.md#performance-budgets).

### Status at the end of the build (2026-10-22)

| # | Status | Evidence / what is still open |
| --- | --- | --- |
| S1 | Partly automated | The e2e suite checks the first click: the HUD **Resume** link opens `/resume` from the room (`e2e/navigation.spec.ts`, also with WebGL off in `e2e/no-webgl.spec.ts`), and the Resume panel serves the **Download PDF** button (`e2e/direct-links.spec.ts`). The download click itself and the 3-click path with a panel open are not tested end to end. The PDF file is still pending (checklist C5) |
| S2 | Verified by the automated suite | `e2e/direct-links.spec.ts` fetches each of the 12 URLs and asserts the panel text is in the server HTML, then checks the dialog after hydration |
| S3 | Partly automated | A keyboard-only spec opens a section through the phone menu (`e2e/keyboard.spec.ts`); the no-WebGL spec reaches Resume without the scene; all 12 sections are real links (phone menu, `SectionNav`) and each URL is covered by the direct-link spec. There is no single test that opens all 11 by keyboard |
| S4 | Awaits real devices | Not measurable under headless SwiftShader (about 10 fps there, tier drops to `low` automatically). Needs iPhone Safari and a mid-range Android |
| S5 | Verified by the build check | There are no 3D model files (0 KB); `yarn budgets` enforces the limit if any appear |
| S6 | Partly measured | Lighthouse (headless, 2026-10-22) gave Accessibility 100 and SEO 100 on `/experience` and `/`; axe runs on all 13 routes (the room and the 12 sections) in both themes, on desktop and mobile. Lighthouse was not run on every route, and not yet on the production URL |
| S7 | Verified | `src/content/content.test.ts` fails on forbidden patterns, and a repo-wide grep is clean. The public PDF (added 2026-10-22) was read in full: two pages, no referee page or names; it shows the phone number by Satriko's choice |

## Scope

### Phase 1: launch

- The 3D studio bedroom with **18 clickable things** (see [03](03-room-scene.md#interactive-objects)):
  - 12 panel objects → 12 sections: About, Experience, Projects, Skills, Education, Gaming, Travel, Hiking, Diving, Remote work, Contact, Resume
  - Oyen (speech bubble), the light switch (night mode), the radio (sound), the desk and bedside lamps (each switches its own light), the umbrella stand (calls the rain)
- The modal + URL model (one URL per panel, back button closes the panel)
- Loader + Enter gate on `/`; no gate on direct links
- On-screen controls: name tag, mute, day/night, help, phone menu, Resume and Contact buttons
- Extras: 3 live clocks, light switch / night mode, live window sky (Bogor time), radio with ambient music and sound effects
- Mobile: swipe to look around within limits, plus a bottom bar
- Graphics tiers, a static poster as fallback, SEO (metadata, OG image, sitemap, JSON-LD)
- Cozy empty-state placeholders for hobby panels whose content isn't ready yet

### Phase 2: after launch

- **PC terminal:** a Terminal tab inside the Experience panel with commands like `whoami` and `sudo hire satriko`
- **Oyen antics:** reactions to being petted, and pushing the mug off the desk to reveal a hidden note

Details are in [06](06-extras-and-easter-eggs.md#phase-2-easter-eggs).

### Parked: recorded, not planned

| Idea | Why it's parked |
| --- | --- |
| **Projects** object/section | Added later (decision #50): a rolling whiteboard beside the printer opens `/projects`. Placeholder cards until Satriko adds the real projects (C20) |
| Real **FOT-Seurat** font (the Animal Crossing font) | Commercial (Fontworks/Monotype). Legal web use needs a paid Adobe Fonts subscription or a Monotype license. Fonts are set in one place, so switching later is small |
| Konami-code retro mini-game on the TV | Fun, but not chosen for phase 2 |
| Discovery counter ("7/14 found") | Not chosen; the hints and phone menu cover findability |
| Rubber duck with debugging tips | Not chosen |
| A message in the browser console for developers | Not chosen (cheap to add later) |
| Bogor "Kota Hujan" rain in the window | Not chosen at first; built later with the umbrella stand (decision #49) |
| 404 room easter egg | Not chosen; a simple cozy 404 page is in scope |
| Bahasa Indonesia version | English only was chosen |
| World map view for travel | Travel is mostly within Indonesia for now; the Travel panel can add a "World" tab later |

## Non-goals

- A walking or controllable character, or free orbiting of the camera
- A CMS. Content lives in typed files in the repo, and editing it means editing a file
- A contact form or any backend
- Blog or multiple languages (for now)
- A pixel-perfect copy of worawork's hand-painted look

## Risks & mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Art quality:** CC0 packs plus code-built objects don't reach the cozy Animal Crossing look, or pack styles clash (outcome: the style test approved the all-code-built look, so no pack was needed) | High: the look is the whole point | **Style test first:** build one finished corner (desk, PC, framed photo, lighting, materials, hover) and approve it before building the rest of the room. Mix packs only after comparing their styles side by side; all custom objects follow one shared "rounded, chunky, matte" recipe |
| **Mobile performance and battery** | Medium | Device tiers (lower resolution, no ambient occlusion on phones), throttled rendering, a ≤ 2 MB asset budget, a static poster fallback |
| **Findability:** visitors don't realize what's clickable | High for recruiters | Phone menu, always-visible Resume/Contact buttons, hover labels, Oyen's idle hints with sparkles, always-visible floating labels on mobile |
| **Empty hobby content at launch** | Low | Cozy placeholder panels ("Oyen is still sorting these photos…"), so hobby content can be filled in later without blocking launch |
| **Accessibility and SEO** of a canvas-based site | Medium | All text lives in normal HTML panels that are server-rendered per URL; the canvas is decorative and hidden from screen readers; everything is reachable by keyboard and without WebGL |
| **Licensing** (models, sounds, music, fonts) | Medium | Only CC0 / open-licensed / properly licensed assets; licenses recorded in a credits list (see [03](03-room-scene.md#assets--licenses)) |
| **Scope creep** from extras and easter eggs | Medium | Easter eggs are explicitly phase 2; parked ideas are listed above |
