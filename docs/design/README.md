# Satriko's Room: Design Docs

> **Status:** Design approved on 2026-10-21 (brainstorming session). The site is built (implementation plan in `docs/plans/`, 28 tasks) and these documents were synced with the code on 2026-10-22: where the build differs from the original design, an *Implementation note* or the table in [08](08-decision-log.md#deviations-from-the-design-docs) says so. Remaining launch steps are in the repository `README.md`.
> **Owner:** Satriko Aditya, Full Stack Software Engineer, Bogor, Indonesia

## The idea in one paragraph

This is a portfolio site that feels like visiting Satriko's room. The room is a cozy, **Animal Crossing–inspired studio bedroom**, rendered in **real 3D with a fixed isometric camera**. Visitors point and click: hovering an object makes it bounce and shows its name. Clicking it makes the camera **glide in**, and the object then **grows into a panel** covering about 80% of the screen, with the room still visible behind it. The PC shows work experience, the bookshelf shows skills, the TV shows gaming, the Indonesia map on the wall shows travel, and so on. **Oyen**, an orange cat, is the host: Oyen greets visitors and gives hints. Each panel has its own URL, so a recruiter can be sent straight to `/experience`. People in a hurry have a **phone menu** and always-visible **Resume** and **Contact** buttons.

## Documents

| # | File | What's inside |
| --- | --- | --- |
| 01 | [Vision & scope](01-vision-and-scope.md) | Goals, audience, success criteria, phase 1 / phase 2 / parked, non-goals, risks |
| 02 | [Architecture](02-architecture.md) | Stack, modal + URL model, routing, section registry, state, data flow, folder layout |
| 03 | [Room scene](03-room-scene.md) | Layout, art direction, assets and licenses, camera, interactions, Oyen, mobile, performance, fallback |
| 04 | [UI & visual design](04-ui-and-visual-design.md) | Loader, on-screen controls, phone menu, modal, speech bubble, fonts, palette, motion |
| 05 | [Content](05-content.md) | What each panel contains (from the CV), plus the **content checklist** of what's still needed |
| 06 | [Extras & easter eggs](06-extras-and-easter-eggs.md) | Clocks, light switch / night mode, live sky, radio and sound; phase 2 terminal and Oyen antics |
| 07 | [Quality](07-quality.md) | Error handling, accessibility, SEO, performance budgets, testing, deployment |
| 08 | [Decision log](08-decision-log.md) | Every decision: the options, the choice, and why, plus the deviations from these docs found during the build |

## Decisions at a glance

- **Audience:** a balanced mix. Recruiters come first, so information is never more than about 2 clicks away, but the site should still be a memorable showcase.
- **Look:** Animal Crossing / clay-toy style, isometric, warm and cozy colors. It's *inspired by* the game: no Nintendo models, characters, logos, interface or fonts.
- **Rendering:** real 3D with React Three Fiber and a fixed orthographic camera. Point-and-click only, no walking character.
- **Art source:** everything is built in code from rounded primitives (the style test approved it, so the CC0 model packs, KayKit and Kenney, are an optional upgrade that was not used). No 3D modeling needed from Satriko.
- **Room:** a studio bedroom with **18 clickable things**: 12 objects that open panels, plus Oyen, the light switch, the radio, the two lamps and the umbrella stand.
- **Click flow:** the camera glides in (about 0.6s), then the modal grows out of the object (about 80% of the screen on desktop, about 95% on mobile).
- **URLs:** one URL per panel, using `history.pushState`. It feels like a single-page app, but direct links, the back button and SEO all work.
- **Entry:** on `/`: loader, then an **Enter** button. Direct links skip the gate and show the panel text immediately.
- **Quick menu:** a phone with app icons, plus always-visible Resume and Contact buttons.
- **Extras (phase 1):** 3 live clocks (Bogor / Singapore / Abu Dhabi), a light switch for night mode, a live window sky, and a radio for ambient sound (off by default).
- **Easter eggs (phase 2):** PC terminal commands and Oyen antics.
- **Privacy:** only email, LinkedIn and GitHub are public. No phone number, no referees.
- **Language:** English only.
- **Fonts:** M PLUS Rounded 1c (kept after the style test against Zen Maru Gothic) and Nunito. JetBrains Mono inside the PC panel, VT323 inside the TV panel.
- **Projects:** added later (decision #50), on a rolling whiteboard beside the printer; placeholder cards until the real projects arrive (C20).
- **Code structure:** follows Satriko's Jitera Next.js project, so it feels familiar: `src/` with path aliases, thin `app/` routes, atomic design components (atoms, molecules, organisms, templates, pages), one Zustand store per concern in `store/`, plus `constants/`, `hooks/`, `interfaces/`, `models/`, `utils/`, next-themes, shadcn/ui, and the same Prettier/ESLint conventions. Two additions: `components/three/` for the 3D scene and `content/` for site content ([02](02-architecture.md#project-structure)).

## What's next

1. Work through the **Launch checklist** in the repository `README.md` (public PDF, real domain, optional music and hobby content, poster re-capture, real-device checks, deploy). Content status is in the [content checklist](05-content.md#content-checklist); missing hobby content isn't blocking, since those panels have cozy placeholders.
2. Phase 2 (PC terminal and Oyen antics) gets its own plan after launch.
