# 04: UI & Visual Design

## Principles

1. **Cozy, not cluttered.** Soft shapes, warm colors, generous spacing.
2. **Text is always normal HTML,** never baked into the 3D scene. It stays readable, searchable, translatable and accessible.
3. **One motif everywhere:** cream paper with a **dashed "stitched" border** and stitched labels, inspired by the "Hi, my name is Work!" tag in the reference.
4. **Fast for people in a hurry.** Resume and Contact are always one click away, and the phone menu reaches everything.
5. **Original.** Animal Crossing–*inspired*, never copied (no NookPhone copy, no Nintendo fonts or assets).

## Screen layout

**Desktop:**

```text
┌──────────────────────────────────────────────────────────────────┐
│ [Satriko Aditya · Full Stack Engineer]               [🔊] [☀] [?] │
│                                                                  │
│                          (3D room)                               │
│                                                                  │
│                                      [Resume] [Contact] [📱]      │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile:**

```text
┌────────────────────────────────┐
│ [Satriko · Full Stack]  [🔊][☀][?] │
│                                │
│           (3D room)            │
│     tags float over objects    │
│                                │
├────────────────────────────────┤
│  [Resume]     [📱]    [Contact]  │  ← bottom bar
└────────────────────────────────┘
```

- **While a panel is open (desktop and mobile):** the on-screen controls and the phone are **not reachable**. The panel is a real modal dialog (focus trap, `aria-modal`), so the controls behind it are inert. This is deviation D11: modal semantics win over this document's original idea of controls staying usable above the backdrop. To go elsewhere, close the panel (✕, Esc, backdrop, Back) and use the controls again.
- **Mobile:** the panel is a bottom sheet with its own close control.

## Loader (on `/` only)

| Part | Spec |
| --- | --- |
| Background | Full-screen cream (day) or plum (night), matching the theme |
| Illustration | A 2D SVG of **Oyen padding along** a rounded progress bar (the bar is the floor Oyen walks on). It's 2D because the 3D scene is what's loading |
| Progress | A percentage from drei `useProgress` |
| Rotating copy | "Tidying up the room…" · "Fluffing the pillows…" · "Waking Oyen up…" |
| Ready | A big rounded **Enter the room** button (accent color). The click also unlocks audio for later, but sound stays off |
| Skip link | "Skip to my resume →" under the button, available while loading too. It opens `/resume` while the room keeps loading behind |
| If 3D fails | The button becomes **Enter (simple view)**, which enters poster fallback mode |
| After Enter | The loader fades out, the camera swoops into the default view, and Oyen greets ([05](05-content.md#oyen-copy)) |

**Direct links skip the loader:** the panel shows right away. A small corner pill ("Room loading… 63%") shows progress behind it.

## On-screen controls

| Control | Position (desktop / mobile) | Icon (Lucide) | Behavior |
| --- | --- | --- | --- |
| Name tag | Top-left / top-left (short form) | n/a | Stitched chip "Satriko Aditya · Full Stack Engineer" (the title part is hidden on small screens). It is a link that opens `/about` |
| Mute | Top-right | `Volume2` / `VolumeX` | Master sound on/off; **off by default**. One fixed label, "Sound", with `aria-pressed` for the state. See [06](06-extras-and-easter-eggs.md#radio--sound-phase-1) |
| Day / night | Top-right | `Sun` / `Moon` | Same as the wall light switch, reachable by keyboard |
| Help | Top-right | `CircleQuestionMark` | Opens the **Help sheet** (below). *Implementation note (D7):* `CircleQuestionMark` is the canonical name in lucide-react 1.x; `CircleHelp` is only an alias |
| Resume | Bottom-right / bottom bar | `FileDown` | Opens `/resume` |
| Contact | Bottom-right / bottom bar | `Mail` | Opens `/contact` |
| Phone | Bottom-right / bottom bar center | `Smartphone` | Opens the phone menu |

All controls are real buttons or links with visible labels or `aria-label`s, and at least **44×44 px** touch targets.

## Phone menu

An **original** phone-shaped panel, inspired by the cozy-game phone idea but not a copy of any existing design.

- **Size:** about 320×560 px on desktop, rising out of the phone button. On mobile it rises from the bottom bar to about 90% of the screen height.
- **Status bar:** live **Bogor time + "WIB"** (rendered client-side only), plus cute signal and battery glyphs.
- **Header:** "Hi! Where to?" with a round ✕ button ("Close menu"). Focus starts on the first app when the phone opens.
- **App grid:** 3 columns × 4 rows = **12 tiles**: 11 sections + Help. Each tile is a rounded pastel square with a Lucide icon and a label underneath.

| App | Icon | Tile color |
| --- | --- | --- |
| About | `UserRound` | Peach |
| Experience | `Monitor` | Sky |
| Skills | `BookOpen` | Mint |
| Education | `GraduationCap` | Wood-light (`wood` at 40%) |
| Gaming | `Gamepad2` | Lavender-pastel |
| Travel | `MapPin` | Peach |
| Hiking | `Mountain` | Mint |
| Diving | `Waves` | Sky |
| Remote work | `Clock` | Wood-light |
| Contact | `Mail` | Accent-light (`accent` at 30%) |
| Resume | `FileText` | Cream |
| Help | `CircleQuestionMark` | Paper-2 (cream) |

- **Behavior:** tapping an app slides the phone away, then runs the normal open flow (camera glide, then the modal grows from the object).
- **Keyboard:** arrow keys move around the grid, Enter opens, Esc closes. The grid is `role="grid"` with `role="row"` wrappers (rows of 3, `display: contents`) around the `gridcell`s, which keeps the ARIA valid for axe.
- **Focus return:** when a panel closes, focus goes back to the element that opened it; if that element is gone (a phone tile, because the phone closes on open), focus falls back to the phone button (`PanelFrame`'s `onCloseAutoFocus`).

## Modal

### Size and backdrop

| Viewport | Size | Notes |
| --- | --- | --- |
| Desktop / tablet (≥ 640 px) | Width `min(80vw, 1100px)`, height up to `80vh`, centered | The room stays visible around it |
| Mobile (< 640 px) | 95% width × 92% of the screen height, as a **bottom sheet** | A drag handle at the top; **swipe down to close** (a downward drag of more than 120 px). Sizes are computed in `src/utils/modalRect.ts` |

- **Backdrop:** the room is dimmed (a 30–35% cocoa/plum overlay) and blurred (about 4 px `backdrop-filter`).
- **On the low graphics tier**, the blur is dropped and only the dim is used, because blurring a live WebGL canvas is expensive on phones (D9, made explicit: `PanelFrame` adds `backdrop-blur-[4px]` only when the tier is `high`). The dim is `#2b2238` at 35%. The room keeps rendering behind the panel on both tiers (D10, see [03](03-room-scene.md#performance-tiers)).
- **Closing:** ✕, Esc, clicking the backdrop, the browser back button, or swiping down (mobile).

### The shared frame

- Cream **paper** background with an optional very light paper texture (≤ 10 KB tiling image), and **28 px** rounded corners.
- A **dashed stitched border**: 2 px, inset about 8 px, wood color at about 40% opacity.
- A soft shadow, e.g. `0 20px 60px rgb(74 52 38 / 0.25)`.
- A **stitched title label** overlapping the top-left edge: a fabric-style tag with the section icon and title in M PLUS Rounded 1c bold.
- A **close button**: round, 44×44 px, top-right, `aria-label="Close"`.
- The content area scrolls inside the frame; the page itself never scrolls.

### Themed interiors

The frame is always the same; what's inside depends on the object.

| Section | Theme | Inside |
| --- | --- | --- |
| About | `scrapbook` | Taped photo, sticker-style facts, friendly intro |
| Experience | `monitor` | A rounded **monitor bezel**. Inside, a cozy desktop window (title bar with 3 dots): a **sidebar of companies like files** (`jitera.md`, `charcentric.md`, …) and a detail pane. JetBrains Mono for file names and small "code-ish" details, Nunito for body text. In phase 2, a **Terminal** tab sits next to it |
| Skills | `shelf` | Wooden shelf rows with **book spines** colored by group. Clicking a book opens a small card: "Used at: Jitera, Charcentric" |
| Education | `frames` | Certificate cards in wooden frames; a ribbon on Hacktiv8's "Honors Graduate" |
| Gaming | `tv` | A **TV bezel** with a pixel-font (VT323) "SELECT GAME" menu of game tiles |
| Travel | `map` | An illustrated **Indonesia map** with pins, and a list beside it. Clicking a pin opens a photo + note |
| Hiking | `journal` | Trail journal pages, polaroid photos, elevation "stamps" |
| Diving | `logbook` | Dive-log table, a depth-gauge doodle, bubbles |
| Remote work | `clocks` | Three clock faces and a **timeline bar of overlapping working hours** |
| Contact | `envelope` | A letter on an envelope with a stamp; buttons for **Copy email**, **Send email**, **LinkedIn**, **GitHub** |
| Resume | `paper` | A printed sheet **slides out of the printer** and becomes the panel: highlights + a big **Download PDF** button |

**Empty hobby panels** use the same theme with a cozy placeholder: an Oyen doodle and "Oyen is still sorting these photos… check back soon!" ([05](05-content.md#empty-states)).

### Grow / shrink animation

| Step | Timing | Notes |
| --- | --- | --- |
| Camera glide to the object | About 0.6s ease-in-out | 3D (see [03](03-room-scene.md#camera)) |
| Frame grows from `originRect` to the final rectangle | About 0.35s spring (slight overshoot) | `motion` layout/transform animation |
| Content fades in | 0.15s, 30 ms stagger | After the frame lands |
| Close: content fades out | 0.1s | |
| Close: frame shrinks back into the object | About 0.25s | Then the camera glides back (about 0.6s) |

### Focus and semantics

Built on the **shadcn/ui (Radix) Dialog** primitive (same setup as the reference project, see [02](02-architecture.md#stack)), restyled with our frame and animated with `motion`. The section panel's dialog is rendered **inline, without a Radix portal**, so direct links are server-rendered ([02](02-architecture.md#grow-out-of-the-object)); the phone menu and Help sheet use portals as usual. `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title. On open, focus moves to the title; **focus is trapped** inside the modal; on close, focus returns to whatever opened it (a phone app, a button, or the canvas wrapper).

## Oyen's speech bubble

- **Look:** a cream bubble with 20 px rounded corners and the stitched border, a small **"Oyen" name tag** chip on the top-left, and a tail pointing at Oyen.
- **Position:** anchored to Oyen's head position projected onto the screen, and kept inside the viewport.
- **Text:** types out at about 35 characters per second. A click, tap or Enter first completes the line, then moves to the next one. It hides itself about 6s after the line finishes, unless hovered.
- **Accessibility:** an `aria-live="polite"` region gets the **full text right away**, so screen readers don't wait for the typing effect.
- **Reduced motion:** no typing effect; the full text appears at once.

## Help sheet

A small modal **with no URL**, opened by "?" or the Help app, with a round ✕ button ("Close help") next to its title:

- **How to explore:** mouse/trackpad and touch hints, drawn as our own simple icons.
- **Keyboard tips.**
- **Sound:** "sound is off by default; the radio or 🔊 turns it on".
- **Credits & licenses:** the sheet lists its credits from `src/content/help.ts`, kept in step with `CREDITS.md`.

## Typography

All fonts are loaded with `next/font/google` in `src/constants/fonts.ts`, which **hosts them with the site** (no requests to Google at runtime), using the `latin` subset. M PLUS Rounded 1c ships about 240 unicode-range shards for CJK, so it is loaded with `preload: false`; preloading them all stalled the load.

| Role | Font | Weight | Size (desktop / mobile) |
| --- | --- | --- | --- |
| Display: panel titles, loader | **M PLUS Rounded 1c** | 800 | 32 / 26 px |
| Headings | **M PLUS Rounded 1c** | 700 | 22 / 20 px |
| Labels, buttons, phone, bubble, hover tags | **M PLUS Rounded 1c** | 700 | 15 / 15 px |
| Body text | **Nunito** | 400 / 600 | 17 / 16 px, line-height 1.6 |
| Monitor interior details | **JetBrains Mono** | 400 / 600 | 14 px |
| TV interior | **VT323** | 400 | 22 px (pixel fonts need a larger size) |

- **Style test (done):** Zen Maru Gothic was compared against M PLUS Rounded 1c, and Satriko kept **M PLUS Rounded 1c**.
- **Why not the real Animal Crossing font:** that font is **FOT-Seurat** (Fontworks, part of Monotype since 2025). Legal web use requires a paid Adobe Fonts subscription or a Monotype license, so it's parked. Fonts are defined in one place, so switching later is a small change. **Never** use the unlicensed "New Horizons" font files from free-font sites.

## Palette

These are the values **as built** in `src/styles/globals.css` (the original proposal was adjusted by the style test and by axe contrast fixes). **All text/background pairs must pass WCAG AA** (4.5:1 for body text, 3:1 for large text and UI elements), and the axe suite checks it in both themes.

### Day

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#F7E3C6` → `#EFCFA8` (gradient) | Behind the diorama |
| `--paper` | `#FFF7E8` | Panel background |
| `--paper-2` | `#F6E7CC` | Cards inside panels |
| `--ink` | `#4A3426` | Body text (dark cocoa instead of black) |
| `--ink-muted` | `#665040` | Secondary text (darkened from the proposed `#7A6252` for AA) |
| `--wood` / `--wood-dark` | `#9A6A40` / `#7A5235` | Frames, stitching, tags (`--wood` darkened from `#B9875A` for AA) |
| `--mint` | `#9FD8C3` | Tiles, accents |
| `--sky` | `#A9D6F2` | Tiles, accents |
| `--peach` | `#FFC8A2` | Tiles, accents |
| `--lavender` | `#D9C8F0` | Gaming tile |
| `--accent` | `#B8553A` | Terracotta: **primary buttons with white text** (about 4.7:1 ✓) |
| `--accent-soft` | `#D2694A` | Decorative only (fails AA with white text, so never use it for text) |
| `--on-accent` | `#FFFFFF` | Text on `--accent` |

### Night

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#2B2238` → `#1E1828` | Behind the diorama |
| `--paper` | `#3A2F48` | Panel background |
| `--paper-2` | `#463A56` | Cards |
| `--ink` | `#FFF1DC` | Body text |
| `--ink-muted` | `#D9C7B0` | Secondary text |
| `--wood` / `--wood-dark` | `#B9875A` / `#7A5235` | Frames, stitching, tags |
| `--mint` | `#356E5A` | Tiles (darkened from `#7CC4AE` so the ink text passes AA) |
| `--sky` | `#24365C` | Tiles |
| `--peach` | `#8A4F3A` | Tiles (darkened for AA) |
| `--lavender` | `#6E5C8F` | Gaming tile |
| `--accent` / `--accent-soft` | `#F2A65A` / `#F2A65A` | Lamp amber; **use dark text on it** |
| `--on-accent` | `#2B2238` | Dark text on `--accent` |

### Fixed (both themes)

The Gaming panel's TV screen stays dark in both themes, so its colors are fixed Tailwind colors (`@theme inline` in `globals.css`), not theme tokens: `screen` `#0D0F1A` (the screen), `screen-ink` `#9FD8C3` (pixel text, about 11.9:1) and `screen-ink-soft` `#FFF7E8` (secondary text and the empty state, via `EmptyState tone="light"`).

Themes are applied by **next-themes** as `<html data-theme="day|night">` (D1: next-themes' own names stay `light` / `dark` and its `value` prop maps them to these attribute values; the dark variant is `@custom-variant dark` on `[data-theme='night']`), with CSS variables (in `src/styles/globals.css`) that Tailwind consumes. The 3D scene reads the same theme, mirrored into `useSceneStore`, for its lighting presets.

## Iconography

Lucide icons with a 2 px stroke and round line caps and joins, to match the rounded type. Icons always come with a visible label or an `aria-label`.

## Motion

| Motion | Duration | Easing |
| --- | --- | --- |
| 3D hover lift | About 0.2s | Smoothed spring |
| Camera glide | About 0.6s | Ease-in-out |
| Modal grow | About 0.35s | Spring, slight overshoot |
| Modal content fade | 0.15s + 30 ms stagger | Ease-out |
| Phone open / close | About 0.3s | Spring from the button |
| Day ↔ night | About 0.8s | Ease-in-out (lighting and UI tokens) |
| Speech bubble pop | About 0.2s | Spring |
| Printer paper slide (Resume) | About 0.6s | Ease-out |

### Reduced motion

When `prefers-reduced-motion: reduce` is set:

| Normally | Instead |
| --- | --- |
| Camera glides | Instant cut |
| Parallax | Off |
| Modal grow / shrink | 0.15s fade |
| Hover lift / bounce | Emissive highlight + label only |
| Speech bubble typing | Full text at once |
| Day ↔ night blend | Instant switch |
| Sparkles, Oyen's idle animation | Kept minimal (blink only) |
