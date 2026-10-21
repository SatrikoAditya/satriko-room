# 03: Room Scene

## The room

A cozy **studio bedroom** (the room Satriko lives, works and games in), shown as a **cutaway diorama**: two walls and a floor sitting on a soft, rounded base, floating on a warm background color (day) or a deep plum one (night). The walls show their thickness at the cut edges, like a dollhouse or an Animal Crossing room.

### Layout

```text
              LEFT WALL                               RIGHT WALL
   [Edu frames ×3]  [ WINDOW: live sky ]   [3 clocks]    [Indonesia map]   [Door + "Satriko's Room"]
                    [curtains]            ┌───────────┐  ┌──────────┐      [Backpack + boots]
   ┌───────────┐                          │ DESK + PC │  │BOOKSHELF │      [Mailbox]  [light switch]
   │   BED     │  ← Oyen sleeps here      │ photo frame│  │ radio    │
   │           │    at night              └───────────┘  └──────────┘
   └───────────┘         [Dive mask + fins on a stand]   [printer on side table]
                     ╭──────────────── rug ────────────────╮
                     │   TV + console on low cabinet   ◉ beanbag │   ← Oyen sits here by day
                     ╰─────────────────────────────────────╯
   [ reserved wall slot for a future Projects pinboard: left wall, between the frames and the window ]
```

This is a starting layout. **Exact positions, rotations and scales are tuned during the build** with screenshots from the dev server, and kept in one config file (`src/constants/roomLayout.ts`; see [02: Project structure](02-architecture.md#project-structure)). A dev-only tuning panel (e.g. Leva) is optional and must not ship in the production bundle.

### Interactive objects

**14 clickable things:** 11 that open panels, and 3 that do something in place.

| # | `objectId` | Object | Where | Click does | Source | Hover label |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `photo-frame` | Framed photo of Satriko | On the desk | Opens `/about` | Code (frame) + photo texture | About me |
| 2 | `pc` | PC: monitor, keyboard, mouse | On the desk | Opens `/experience` | Pack or code | Work experience |
| 3 | `bookshelf` | Bookshelf with colored book spines | Right wall, next to the desk | Opens `/skills` | Pack (shelf) + code (books) | Skills |
| 4 | `edu-frames` | 3 certificate frames | Left wall, above the bed | Opens `/education` | Code | Education |
| 5 | `tv` | TV + game console on a low cabinet | Floor, on the rug | Opens `/gaming` | Pack or code | Gaming |
| 6 | `indonesia-map` | Illustrated Indonesia map with pins | Right wall | Opens `/travel` | Code (plane + illustrated texture) | Travel |
| 7 | `hiking-gear` | Backpack + hiking boots | By the door | Opens `/hiking` | Code | Hiking |
| 8 | `dive-gear` | Dive mask + fins on a stand | Floor, near the bed | Opens `/diving` | Code | Diving |
| 9 | `clocks` | 3 wall clocks: Bogor / Singapore / Abu Dhabi | Right wall, above the desk | Opens `/remote-work` | Code | Remote work |
| 10 | `mailbox` | Little mailbox | By the door | Opens `/contact` | Code | Contact |
| 11 | `printer` | Printer on a side table | Next to the desk | Opens `/resume` | Pack or code | Resume |
| 12 | `oyen` | Oyen, the orange cat | Rug (day) / bed (night) | Speech bubble | Code | Oyen |
| 13 | `light-switch` | Wall light switch | By the door | Toggles day/night | Code | Lights |
| 14 | `radio` | Small retro radio | On the bookshelf | Toggles music | Code | Radio |

**Decor (not clickable):** bed, rug, beanbag, desk chair, desk lamp and bedside lamp (they light up at night), curtains, plants, door with a wooden "Satriko's Room" nameplate, a mug on the desk (used by the phase 2 antics), small shelf trinkets.

## Art direction: the "Animal Crossing / clay toy" recipe

| Aspect | Rule |
| --- | --- |
| **Camera** | Orthographic. Default view about 45° around and about 30–35° above the room (true isometric is 35.26°; final angle chosen in the style test). The zoom always keeps the whole room in frame on resize |
| **Shapes** | Everything rounded: rounded boxes with a corner radius of at least about 15% of the smallest dimension, capsules and spheres for soft things. **No sharp edges** |
| **Proportions** | Chunky and toy-like: about 20% thicker than realistic, slightly oversized props |
| **Materials** | Matte `MeshStandardMaterial` (roughness 0.8–1.0, metalness 0). Pack models keep their gradient-atlas colors; code-built objects use a shared palette-matched material set. The style test also tries a softer, toon-like shading |
| **Colors** | Warm, cozy pastels (tokens in [04](04-ui-and-visual-design.md#palette)): cream walls, warm wood, mint, sky blue, peach, terracotta accents |
| **Lighting (day)** | A warm hemisphere light (cream sky, wood-toned ground), plus a warm main light from the window side with soft shadows. The window light is tinted by the current sky phase |
| **Lighting (night)** | Main light dimmed to about 15%; cool, low hemisphere light; warm point lights in the desk and bedside lamps with glowing shades; soft monitor and TV glow; bluish moonlight through the window. Day ↔ night blends over about 0.8s |
| **Reflections / environment** | drei `<Environment>` with **local `Lightformer`s**, so no HDR download from a CDN |
| **Shadows** | Soft contact shadows under objects on every tier; a soft directional shadow map on the high tier |
| **Ambient occlusion** | Desktop high tier only (e.g. N8AO via postprocessing), and only if it fits the budget |

## Assets & licenses

| Asset | Source | License | Used for |
| --- | --- | --- | --- |
| **KayKit Furniture Bits** (free base, 50+ models; optional "Extra" tier, $3.95, 20 more) | [kaylousberg.itch.io/furniture-bits](https://kaylousberg.itch.io/furniture-bits) | CC0 | Furniture: bed, desk, shelves, chairs, lamps, decor |
| **Kenney Furniture Kit** (about 120 objects) | kenney.nl (also [OpenGameArt](https://opengameart.org/content/furniture-kit)) | CC0 (**confirm the current download includes GLB/glTF**) | Fill-ins the KayKit pack doesn't have |
| Indonesia outline | Natural Earth | Public domain | Wall map texture and the Travel panel map |
| Fonts | Google Fonts | SIL Open Font License | UI typography |
| Sound effects | To choose (e.g. Kenney's CC0 audio packs) | CC0 (record per file) | Hover tick, click pop, meow, printer, switch |
| Music | To choose (royalty-free or CC0 cozy track) | Record the exact license | Radio |

- CC0 needs no attribution, but **KayKit, Kenney and every audio source are credited** in the Help sheet anyway.
- Keep a `CREDITS.md` (or similar) listing every asset, its source URL and license.
- **Compare pack styles side by side** in the style test before mixing them. If Kenney clashes with KayKit, prefer KayKit plus code-built objects.

### Asset pipeline

1. Download the packs and pick only the models we use.
2. Optimize with **gltf-transform**: prune, dedupe, weld, meshopt compression, and downsized textures (the KayKit atlas works down to 128×128).
3. Merge into as few GLB files as possible (ideally one `room.glb`) to cut requests.
4. Generate typed React components with **gltfjsx** (`--types`).
5. Preload with `useGLTF.preload`, and track progress with `useProgress` for the loader.

### Code-built objects

These are built from drei/three primitives using the clay recipe: photo frame, 3 education frames, book spines, Indonesia map board and pins, backpack and boots, dive mask and fins with their stand, 3 clocks with moving hands, mailbox, light switch, radio, **Oyen**. Pack models are used where they fit (desk, PC, TV, printer, bed); otherwise those are code-built too.

## Camera

| Mode | Behavior |
| --- | --- |
| **Default** | Full-room isometric framing with margins; refits on resize |
| **Focus** | Each section has a `cameraPose` (position, target, zoom) in the registry. Clicking glides there in **about 0.6s** with ease-in-out (drei `CameraControls`, `setLookAt(…, true)`) |
| **Return** | Closing a panel glides back to the default pose |
| **Parallax (desktop)** | The pointer position shifts the view slightly (about ±1.5° around, ±1° up/down), smoothed. Off while focused, on touch devices, and with reduced motion |
| **Mobile** | Tighter framing so objects stay big enough to tap. **One-finger drag** rotates around the room within a clamp (about ±35° from default) and pans within the room's bounds. **Gentle pinch zoom** (about 1×–1.6×) with inertia. Clamped so you can never look behind a wall or lose the room |
| **Reduced motion** | Instant camera cuts instead of glides; no parallax |

## Interactions

- **Hit testing:** R3F pointer events on each interactive group, with `stopPropagation()` so the nearest object wins (this solves overlapping objects in the isometric view). Small objects (light switch, clocks, mailbox, radio) get **invisible, enlarged hit areas** so touch targets are **≥ 44 CSS px** at the default zoom.
- **Hover (desktop):**
  - A springy lift (about 0.05–0.1 units up, about 1.03× scale), smoothed.
  - A soft outline (drei `<Outlines>`, warm cream/terracotta).
  - A stitched-style label (DOM via drei `<Html>`, so it uses the UI font).
  - A pointer cursor, and a tick sound effect if sound is on.
- **Click / tap:** the open flow from [02](02-architecture.md#interaction-state-machine).
- **Mobile labels:** since there's no hover, small floating label tags are **always visible** above clickable objects. Tapping a tag works the same as tapping the object.
- **Idle hints:**
  - **When:** on a first visit (`hasInteracted` not yet stored), after **about 8 seconds** without a click.
  - **What:** Oyen says a hint ("Psst… try the PC!") and the suggested object **sparkles** (small particle sprites).
  - **Order:** PC → bookshelf → printer → then unvisited objects.
  - **Stops:** after the first click or after 3 hints. Never while a panel is open.
- **Keyboard:** 3D objects aren't focusable. Keyboard users get the same functionality from the phone menu and on-screen buttons (see [07](07-quality.md#accessibility)).

## Oyen, the host

| Aspect | Spec |
| --- | --- |
| **Identity** | An **orange cat named "Oyen"**. Exact markings (tabby stripes? white paws or chest?) are in the [content checklist](05-content.md#content-checklist) |
| **Construction** | Built in code from rounded shapes: capsule body, slightly squashed sphere head, rounded triangle ears, a 5–6 segment tail chain, sphere paws, glossy oval eyes with highlights, a pink nose. No skeleton or rig |
| **Idle animation** | Breathing (body scale ±2% over about 3s), a tail sway that ripples down the segments, random blinks every 3–6s, an occasional ear twitch, and **head turning toward the cursor** (clamped to ±30°; on mobile, toward the last tap) |
| **Placement** | **Day:** sitting on the rug at the front, visible and inviting. **Night:** curled up asleep on the bed with a "Zzz" bubble. Toggling the theme switches poses with a quick hop/fade |
| **Click** | A speech bubble (see [04](04-ui-and-visual-design.md#oyens-speech-bubble)). The first click gives the greeting; later clicks rotate through fun lines and hints ([05](05-content.md#oyen-copy)). A purr sound effect if sound is on |
| **Phase 2** | Petting reactions and the mug push ([06](06-extras-and-easter-eggs.md#oyen-antics)) |

## Performance tiers

The starting tier is guessed from the device (`pointer: coarse` or a small screen → low). drei `PerformanceMonitor` **steps down** to low if the frame rate stays below about 45 fps for a few seconds. It doesn't step back up during the same visit, to avoid flicker.

| Setting | High (desktop) | Low (phones / weak GPUs) |
| --- | --- | --- |
| Resolution (device pixel ratio) | Up to 2 | Up to 1.5 |
| Shadows | Soft directional shadow map + contact shadows | Contact shadows rendered once, then static |
| Ambient occlusion | On (if within budget) | Off |
| Hover outline | On hover | On tap only |
| Parallax | On | Off |
| Render loop | Continuous while things animate; paused when the tab is hidden | Same, plus on-demand rendering while a panel covers the room |

**Budget:** 3D assets ≤ **about 2 MB** compressed in total (see [07](07-quality.md#performance-budgets)).

## Fallback

- **Before mounting the canvas:** a capability check tries to create a WebGL context. If that fails, `webgl = unsupported`.
- **During the visit:** the `webglcontextlost` event and a **canvas error boundary** both set `webgl = lost`.
- **In fallback mode:** the canvas is replaced by a **static poster** of the room. The phone menu, on-screen buttons and every panel keep working, and panels grow from the center of the screen.
- **The poster:** screenshots of **our own scene** (day and night) captured with a Playwright script from the running site, served as responsive AVIF/WebP. The same images, cropped to 1200×630, are the **OG link-preview images**.
- **A single model failing to load** (an error boundary per object) hides **only that object**; the rest of the room keeps working.
