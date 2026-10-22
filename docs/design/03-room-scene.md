# 03: Room Scene

## The room

A cozy **studio bedroom** (the room Satriko lives, works and games in), shown as a **cutaway diorama**: two walls and a floor sitting on a soft, rounded base, floating on a warm background color (day) or a deep plum one (night). The walls show their thickness at the cut edges, like a dollhouse or an Animal Crossing room.

### Layout

```text
              LEFT WALL                               RIGHT WALL
   [Edu frames ×3]  [ WINDOW: live sky ] [Indonesia map]   [3 clocks]                  [Door + "Satriko's Room"]
                    [curtains]                             ┌───────────┐  ┌──────────┐  [Mailbox]  [light switch]
   ┌───────────┐  [Backpack + boots] [Dive mask + fins]    │DESK+PC+lap│  │BOOKSHELF │
   │   BED     │   ↑ outdoor-hobby corner, under the map   │ photo frame│  │ radio    │
   │           │  ← Oyen sleeps here   [printer on         └───────────┘  └──────────┘
   └───────────┘    at night            side table]       [office chair, pulled out]
                     ╭──────────────── rug ────────────────╮
                     │   TV + console on low cabinet   ◉ beanbag │   ← Oyen starts here by day, then wanders
                     ╰─────────────────────────────────────╯
   [ reserved wall slot for a future Projects pinboard: left wall, between the frames and the window ]
```

This is a starting layout. **Exact positions, rotations and scales are tuned during the build** with screenshots from the dev server, and kept in one config file (`src/constants/roomLayout.ts`; see [02: Project structure](02-architecture.md#project-structure)). A dev-only tuning panel (e.g. Leva) is optional and must not ship in the production bundle.

### Interactive objects

**14 clickable things:** 11 that open panels, and 3 that do something in place.

*Implementation note:* every object is built in code (the "Source" column's pack options were not used; see [Assets & licenses](#assets--licenses)). Objects are mounted by `src/components/three/RoomObjects/index.tsx` and each one lives in `src/components/three/objects/<Name>/`.

| # | `objectId` | Object | Where | Click does | Source | Hover label |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `photo-frame` | Framed photo of Satriko | On the desk | Opens `/about` | Code (frame) + photo texture | About me |
| 2 | `pc` | PC: monitor, keyboard, mouse, and the laptop open on a stand to its right (one hover and click group, like Satriko's real desk) | On the desk | Opens `/experience` | Pack or code | Work experience |
| 3 | `bookshelf` | Bookshelf with colored book spines | Right wall, next to the desk | Opens `/skills` | Pack (shelf) + code (books) | Skills |
| 4 | `edu-frames` | 3 certificate frames | Left wall, above the bed | Opens `/education` | Code | Education |
| 5 | `tv` | TV setup like Satriko's: a wide TV on a white low cabinet (two drawers, open shelf), a soundbar, a white PS5 standing on the left and two controllers on the right | Floor, on the rug | Opens `/gaming` | Pack or code | Gaming |
| 6 | `indonesia-map` | Illustrated Indonesia map with pins | Back (right) wall, in the outdoor-hobby corner above the hiking and dive gear; its bottom edge lines up with the window's | Opens `/travel` | Code (plane + illustrated texture) | Travel |
| 7 | `hiking-gear` | Backpack + hiking boots | Outdoor-hobby corner, by the left wall | Opens `/hiking` | Code | Hiking |
| 8 | `dive-gear` | Dive mask + fins on a stand | Outdoor-hobby corner, against the back wall | Opens `/diving` | Code | Diving |
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
| **Camera** | Orthographic. Default view 45° around and about 30° above the room (look-at `[0, 1.4, 0]`, offset `[10, 8.2, 10]` in `src/constants/camera.ts`; true isometric is 35.26°, the final angle was chosen in the style test). The zoom always keeps the whole room in frame on resize |
| **Shapes** | Everything rounded: rounded boxes with a corner radius of at least about 15% of the smallest dimension, capsules and spheres for soft things. **No sharp edges** |
| **Proportions** | Chunky and toy-like: about 20% thicker than realistic, slightly oversized props |
| **Materials** | Matte `MeshStandardMaterial` (roughness 0.9, metalness 0) from the shared `clay(color)` helper in `src/components/three/materials.ts`, with colors from `src/constants/roomPalette.ts`. The window sky, sun and clouds are unlit `MeshBasicMaterial`s so they do not change with the room lights |
| **Colors** | Warm, cozy pastels (tokens in [04](04-ui-and-visual-design.md#palette)): cream walls, warm wood, mint, sky blue, peach, terracotta accents. The 3D palette is `src/constants/roomPalette.ts` (wall `#FBEFD9`, wall trim `#E7CFAE`, floor `#C29262`, base `#7A5235`, wood `#B9875A`, mint `#9FD8C3`, sky `#A9D6F2`, peach `#FFC8A2`, lavender `#D9C8F0`, terracotta `#B8553A`, Oyen orange `#F2A03D`, lamp glow `#F2A65A`) |
| **Lighting (day)** | A warm hemisphere light (sky `#fffcf7`, ground `#efe3d2`, intensity 2.4), a directional sun from the window side (`#fffaf2`, intensity 1.3, soft shadows) and a little ambient (0.3). Values are in `src/components/three/Room/lightingPresets.ts` |
| **Lighting (night)** | Sun dimmed to 0.21 (about 16% of day, `#9fb4ff`); cool hemisphere light (sky `#3a4a70`, ground `#2a2238`, intensity 1.5, lifted once after the night screenshot check); ambient 0.16; warm point lights in the desk and bedside lamps with glowing shades (`lamp` 2.2); monitor and TV glow raised (screen glow 1.1 against 0.5); a bluish moon light (0.5). Day ↔ night blends over 0.8s (`THEME_BLEND_SECONDS`), instantly with reduced motion |
| **Tone mapping** | `NeutralToneMapping` in `SceneCanvas`. R3F's default ACES greyed the pastels; Neutral keeps the palette close to its swatches (Satriko's decision at the style test) |
| **Reflections / environment** | *Not used.* The materials are matte, so there is no `<Environment>`, and no HDR or other environment download |
| **Shadows** | Contact shadows (drei `ContactShadows`) on every tier: continuous at 1024 on the high tier; at 512 on the low tier, rendered once and again while Oyen walks, so its shadow follows it. A directional shadow map (`PCFShadowMap`, 1024) on the high tier only |
| **Ambient occlusion** | *Not built.* `@react-three/postprocessing` is not installed; the look was approved without it |

## Assets & licenses

*Implementation note:* Task 20 (the optional model-pack upgrade) was **skipped**. Satriko approved the look with code-built objects at the style-test gate, so no model pack, no `room.glb` and no `public/models/` exist, and the pack rows below are an **optional upgrade, not used**. What ships is listed in `CREDITS.md`: the fonts, the Indonesia outline and the 7 sound effects.

| Asset | Source | License | Used for |
| --- | --- | --- | --- |
| *Optional upgrade, not used.* **KayKit Furniture Bits** (free base, 50+ models; optional "Extra" tier, $3.95, 20 more) | [kaylousberg.itch.io/furniture-bits](https://kaylousberg.itch.io/furniture-bits) | CC0 | Furniture: bed, desk, shelves, chairs, lamps, decor |
| *Optional upgrade, not used.* **Kenney Furniture Kit** (about 120 objects) | kenney.nl (also [OpenGameArt](https://opengameart.org/content/furniture-kit)) | CC0 (**confirm the current download includes GLB/glTF**) | Fill-ins the KayKit pack doesn't have |
| Indonesia outline | Natural Earth | Public domain | Wall map texture and the Travel panel map |
| Fonts | Google Fonts | SIL Open Font License | UI typography |
| Sound effects | Kenney Interface Sounds (6 files) and IgnasD's "Meow" on OpenGameArt (see `CREDITS.md`) | CC0 | Hover tick, click pop, modal whoosh, switch, printer, radio click, meow |
| Music | *Pending (checklist C17):* no track yet | Record the exact license | Radio |

- CC0 needs no attribution, but the audio sources are credited anyway. `CREDITS.md` lists every asset with its source URL and license; keep it current when anything is added.
- If a pack is ever added, **compare pack styles side by side** in a style test before mixing them.

### Asset pipeline (only if the pack upgrade is ever done)

1. Download the packs and pick only the models we use.
2. Optimize with **gltf-transform**: prune, dedupe, weld, meshopt compression, and downsized textures (the KayKit atlas works down to 128×128).
3. Merge into as few GLB files as possible (ideally one `room.glb`) to cut requests.
4. Generate typed React components with **gltfjsx** (`--types`).
5. Preload with `useGLTF.preload`, and track progress with `useProgress` for the loader.

### Code-built objects

Everything is built from drei/three primitives using the clay recipe: the room shell and decor, the PC, TV, printer, bed, desk and office chair (grey mesh and black, modelled on Satriko's real chair, pulled out and turned toward the room), photo frame, 3 education frames, book spines, Indonesia map board and pins, backpack and boots, dive mask and fins with their stand, 3 clocks with moving hands, mailbox, light switch, radio, the window sky, and **Oyen**.

## Camera

| Mode | Behavior |
| --- | --- |
| **Default** | Full-room isometric framing with margins; refits on resize. camera-controls' `fitToBox` snaps the view to the nearest axis and would destroy the isometric angle, so the fit is our own `fitIsometric()` in `CameraDirector/cameraMath.ts` (it projects the room box onto the view plane and returns the look-at point and zoom) |
| **Focus** | Each section has a `cameraPose` (`target`, `offset`, `zoomFactor`) in the registry. Clicking glides there with drei `CameraControls` (`setLookAt` and `zoomTo`, animated, `smoothTime` 0.35). Zoom limits are widened while a pose is applied (up to 4× the fitted zoom, against 1.6× in the room) so poses have headroom |
| **Return** | The glide back to the default pose starts as soon as the panel begins closing, and continues through the idle state |
| **Parallax (desktop)** | The pointer position shifts the view slightly (±0.026 rad, about 1.5°, around; ±0.017 rad, about 1°, up/down), smoothed. Off while a panel is open or focusing, on touch devices, and with reduced motion. Desktop has no drag or wheel zoom: all mouse buttons and the wheel are set to `NONE` |
| **Mobile** | Tighter framing so objects stay big enough to tap: the fitted zoom is multiplied by `MOBILE_ZOOM_FACTOR` = 1.3 (Satriko kept 1.3 at the style test; portrait phones crop the sides a little). **One-finger drag** rotates around the room within a clamp (±0.61 rad, about ±35° from default; polar angle 0.75 to 1.25). **Two-finger gesture** zooms and trucks, limited to 0.9×–1.6× of the fitted zoom, inside the room's bounding box. **Touch rotate and pinch are disabled while a pose is applied** (a panel is open or focusing) and restored when the camera returns |
| **Reduced motion** | Instant camera cuts instead of glides; no parallax |

## Interactions

- **Hit testing:** R3F pointer events on each interactive group, with `stopPropagation()` so the nearest object wins (this solves overlapping objects in the isometric view). Small objects (light switch, clocks, mailbox, radio) get **invisible, enlarged hit areas** so touch targets are **≥ 44 CSS px** at the default zoom.
- **Hover (desktop):**
  - A springy lift (about 0.05–0.1 units up, about 1.03× scale), smoothed.
  - A soft **emissive highlight** on the object's own materials (lamp-glow color `#F2A65A`, intensity 0.18 on hover, 0.12 while hinted) instead of drei `<Outlines>`. `Outlines` must be a child of every mesh, while the emissive effect works for a whole object from one effect in `Interactive` (meshes can opt out with `userData.noHighlight`).
  - A stitched-style label (DOM via drei `<Html>`, so it uses the UI font).
  - A pointer cursor, and a tick sound effect if sound is on.
- **Click / tap:** the open flow from [02](02-architecture.md#interaction-state-machine).
- **Mobile labels:** since there's no hover, small floating label tags (drei `Html`, the `HoverLabel` molecule) are **always visible** above clickable objects when the pointer is coarse. Tapping a tag works the same as tapping the object. On phones the tags can overlap each other (known, accepted).
- **Idle hints:**
  - **When:** on a first visit (`room:interacted` not yet stored), after **about 8 seconds** (`HINT_DELAY_MS`) without a click.
  - **What:** Oyen says a hint ("Psst… try the PC!") and the suggested object **sparkles** (small particle sprites).
  - **Order:** PC → bookshelf → printer → then unvisited objects.
  - **Stops:** after the first click or after 3 hints (`MAX_HINTS`). Never while a panel is open. Order and timing live in `src/constants/hints.ts`.
- **Keyboard:** 3D objects aren't focusable. Keyboard users get the same functionality from the phone menu and on-screen buttons (see [07](07-quality.md#accessibility)).

## Oyen, the host

| Aspect | Spec |
| --- | --- |
| **Identity** | An **orange cat named "Oyen"**. Exact markings (tabby stripes? white paws or chest?) are in the [content checklist](05-content.md#content-checklist) |
| **Construction** | Built in code from rounded shapes: capsule body, slightly squashed sphere head, rounded triangle ears, a 5–6 segment tail chain, sphere paws, glossy oval eyes with highlights, a pink nose. No skeleton or rig |
| **Idle animation** | Breathing (body scale ±2% over about 3s), a tail sway that ripples down the segments, random blinks every 3–6s, an occasional ear twitch, and **head turning toward the cursor** (clamped to ±30°; on mobile, toward the last tap) |
| **Placement** | **Day:** starts sitting on the rug at the front, visible and inviting, then wanders when the room is quiet (below). **Night:** curled up asleep on the bed with a "Zzz" bubble. Toggling the theme switches poses with a quick hop/fade |
| **Wandering** | By day, after **6 s with no click, tap or key press** (moving the mouse doesn't count), Oyen walks at about 0.7 units/s between 13 hand-placed floor spots (`oyenSpots` in `src/constants/oyen.ts`) along straight paths that clear the furniture, the floor edge and the strip in front of the desk, and never stops where furniture hides it from the default camera (all checked by `Oyen/wander.test.ts`). At each spot it pauses 3–8 s to look around, groom a paw or loaf; every 3–5 hops it lies down for 15–30 s and stretches when it gets up. Any click, tap or key press, an open panel, or a speech bubble makes it ease to a halt and sit; clicking Oyen also turns it to face the camera. It never walks at night (asleep on the bed), with reduced motion, or before the room is ready. Its state is mirrored to `<main data-oyen>` (`sitting`, `walking` or `resting`) for the e2e suite |
| **Click** | A speech bubble (see [04](04-ui-and-visual-design.md#oyens-speech-bubble)). The first click gives the greeting; later clicks rotate through fun lines and hints ([05](05-content.md#oyen-copy)). A purr sound effect if sound is on |
| **Phase 2** | Petting reactions and the mug push ([06](06-extras-and-easter-eggs.md#oyen-antics)) |

## Performance tiers

*Implementation note:* every visit **starts on the high tier** (there is no device guess). drei `PerformanceMonitor` (default thresholds, `flipflops={1}`) **steps down** to low when the frame rate declines, and it does not step back up during the same visit. The current tier is exposed as `data-tier` on `<main>` (`pages/Room`), which the tests and measurements read.

| Setting | High (desktop) | Low (phones / weak GPUs) |
| --- | --- | --- |
| Resolution (device pixel ratio) | Up to 2 | Up to 1.5 |
| Shadows | Soft directional shadow map + contact shadows | Contact shadows rendered once, then only while Oyen walks |
| Contact shadows | 1024, continuous | 512, rendered once and while Oyen walks |
| Ambient occlusion | Not built | Not built |
| Modal backdrop blur | 4px | None |
| Parallax | By input type, not tier: on for a fine pointer, off for touch and reduced motion | Same |
| Render loop | `frameloop="always"` (browsers already pause rAF in hidden tabs) | Same. The low tier drops DPR, shadows and contact-shadow cost instead of switching to on-demand rendering; `frameloop="demand"` + `invalidate()` is the fallback if real-device measurements miss 30 fps |

**Budget:** 3D assets ≤ **about 2 MB** compressed in total (see [07](07-quality.md#performance-budgets)).

## Fallback

- **Before mounting the canvas:** a capability check tries to create a WebGL context. If that fails, `webgl = unsupported`.
- **During the visit:** the `webglcontextlost` event and a **canvas error boundary** both set `webgl = lost`.
- **In fallback mode:** the canvas is replaced by a **static poster** of the room. The phone menu, on-screen buttons and every panel keep working, and panels grow from the center of the screen.
- **The poster:** screenshots of **our own scene** (day and night) captured from the running site with `yarn poster` (`scripts/capture-poster.mts`, Playwright + SwiftShader + `sharp`). It opens `/?poster=1`, which renders the bare scene (no HUD, bubble or loader), and writes `public/poster/room-day.webp` and `room-night.webp` (1600 px WebP, shown by the `Poster` molecule with `unoptimized`). The day capture, cropped to 1200×630, is `public/poster/og.png`, the **OG link-preview image**. `POSTER_BASE_URL` points the script at a different server.
- **Re-capture note:** the current captures were taken at about 04:20 WIB, so the window shows the night sky in both. Re-run `yarn poster` in Bogor daytime before launch (see the README launch checklist).
- **Errors:** there are no external models to fail, so there is no per-object boundary. One `SceneErrorBoundary` around the Canvas sets `webgl = lost`, which swaps in the poster.
