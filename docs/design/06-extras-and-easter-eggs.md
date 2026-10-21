# 06: Extras & Easter Eggs

Phase 1 extras: **3 world clocks**, **light switch / night mode**, **live window sky**, **radio and sound**.
Phase 2 easter eggs: **PC terminal** and **Oyen antics**.

---

## 3 world clocks (phase 1)

Three chunky wall clocks above the desk tell the "remote across three time zones" story at a glance.

| Clock | City | Time zone |
| --- | --- | --- |
| Left | Bogor (home) | `Asia/Jakarta` (WIB, UTC+7) |
| Middle | Singapore | `Asia/Singapore` (UTC+8) |
| Right | Abu Dhabi | `Asia/Dubai` (UTC+4) |

- **Look:** cream face, wood rim, chunky rounded hour and minute hands (no second hand, to keep it calm), and a small city plate under each clock. The plates are decorative; the real information is in the panel.
- **Time:**
  - The current time in each zone comes from `Intl.DateTimeFormat(…, { timeZone, hour, minute, second, hourCycle: 'h23' }).formatToParts()`.
  - Hour hand angle = `((h % 12) + m / 60) × 30°`. Minute hand angle = `(m + s / 60) × 6°`.
  - Hands update once per second (cheap: 6 rotating meshes).
- **Click:** opens `/remote-work` (live clocks + overlap timeline, [05](05-content.md#remote-work-remote-work-3-clocks)).
- **Server rendering:** time-dependent, so it renders only after mount (see [02](02-architecture.md#rendering-rules)).
- **The same time logic** (`src/utils/time.ts`, zones in `src/constants/timezones.ts`) powers the phone's status bar and the Remote work panel.

---

## Light switch → night mode (phase 1)

| Aspect | Spec |
| --- | --- |
| Controls | The **wall light switch** (3D) and the **☀/🌙 button** (on-screen). Both call next-themes' `setTheme`; the resolved theme is mirrored into `useSceneStore` for the 3D lighting ([02](02-architecture.md#state-zustand-stores)) |
| Initial value | Handled by **next-themes**: saved choice → otherwise the system preference (`prefers-color-scheme`) → otherwise `day` |
| Room (3D) | Day ↔ night lighting presets, blended over 0.8s ([03](03-room-scene.md#art-direction-the-animal-crossing--clay-toy-recipe)): lamps glow, the main light dims, monitor and TV glow, moonlight through the window. Night preset as built (`lightingPresets.ts`): hemisphere `#3a4a70` / `#2a2238` at 1.5, sun `#9fb4ff` at 0.21, ambient 0.16, lamps 2.2, screen glow 1.1, moon 0.5 (day: hemisphere 2.4, sun 1.3, ambient 0.3, lamps 0, screen glow 0.5, moon 0) |
| UI | `<html data-theme="day|night">` switches the CSS tokens ([04](04-ui-and-visual-design.md#palette)) |
| Oyen | Day: sitting on the rug. Night: curled asleep on the bed |
| Switch feedback | The toggle flips; a "click" sound effect if sound is on |
| No flash | next-themes' injected script sets `data-theme` before first paint |
| Reduced motion | Instant switch, no blend |

---

## Live window sky (phase 1)

The window shows **the real sky in Bogor right now**, whatever the visitor's own time zone is. It's **independent of the light switch**: the switch controls the room's lamps, the window shows the actual outside.

| Phase | Bogor time (WIB) | Sky |
| --- | --- | --- |
| Dawn | 05:00–06:30 | Peach-to-blue gradient, low sun |
| Day | 06:30–17:30 | Soft blue, sun disc, slowly drifting rounded clouds |
| Sunset | 17:30–18:45 | Orange–pink gradient, low sun |
| Night | 18:45–05:00 | Deep blue, moon, twinkling stars |

- **Why fixed windows are enough:** Bogor is about 6.6° south of the equator, so sunrise (about 05:30–06:10) and sunset (about 17:35–18:20) barely change through the year. **No astronomy library is needed.**
- **Rendering:** a gradient plane behind the window glass (a 4×128 px canvas texture per phase, colors in `src/utils/sky.ts`), a sun or moon disc whose height follows the time (the sun follows an arc from about 05:50 to 18:00; the moon rides high), 2 rounded cloud meshes by day that drift slowly, and drei `Sparkles` as stars at night. *Implementation note:* the sky, sun and clouds are **unlit** (`meshBasicMaterial`, `toneMapped={false}`), so the window looks the same whatever the room lighting is, and a **two-plane crossfade** does the phase change: the new texture goes on the back plane while the previous one sits on a front plane that fades out (`WindowSky/index.tsx`). The window does **not** tint the room light (the per-phase `light` color in `sky.ts` is unused); this was left out.
- **Updates:** once a minute (`SKY_UPDATE_MS`); phase changes blend over 3s (`SKY_BLEND_SECONDS`), instantly with reduced motion.
- **Discoverability:** the Help sheet and one of Oyen's lines mention "the window shows the real sky in Bogor right now". The window **isn't clickable**, so it has no hover effect, which keeps "hover = clickable" consistent.

---

## Radio & sound (phase 1)

### Sound states

| State | Default | Controlled by |
| --- | --- | --- |
| `sound.master`: all audio on/off | **Off** | 🔊 mute button. **Remembered** between visits (localStorage, try/catch) |
| `sound.music`: radio music on/off | **Off, every visit** (music never auto-plays) | The 3D radio |

### Rules

- Clicking the radio while music is off → turns **master on** and **music on**, with a 1s fade-in.
- Clicking the radio while music is on → music off, with a 1s fade-out.
- 🔊 mute while music is playing → everything goes silent. Unmuting resumes the music if `music` is still on.
- Sound effects only play while `master` is on.
- **Browser autoplay rules:** the `AudioContext` is unlocked by the **Enter** click on `/`, or by the first interaction on a direct link.
- The music file is **loaded only the first time it's played** (not part of the initial load). It loops at volume about 0.35. Sound effects play at about 0.5.
- Audio **pauses when the tab is hidden** and resumes when the visitor comes back.
- **Radio feedback (3D):** while playing, the dial light is on, the radio gently bounces, and little music-note particles float up.

### Approach

A native `HTMLAudioElement` for music, and the Web Audio API with decoded buffers for low-latency sound effects. No audio library unless a real need shows up.

### Sound effects list

| Sound | When |
| --- | --- |
| Tick | Hovering a clickable object (desktop) |
| Pop | Clicking an object or button |
| Soft whoosh | Modal opens or closes |
| Switch click | Light switch |
| Printer whirr | Resume panel opens |
| Meow | Clicking Oyen |
| Purr | Oyen petting (phase 2) |
| Radio static blip | Radio turned on |

Each sound is ≤ about 30 KB, as **MP3 or M4A** for universal browser support. **Every audio file must be CC0 or royalty-free, with its license recorded** ([03](03-room-scene.md#assets--licenses)). Choosing the music track is checklist item C17 ([05](05-content.md#content-checklist)).

*Implementation note:* the 7 sound effects ship as **MP3** in `public/audio/` (`tick`, `pop`, `whoosh`, `switch`, `printer`, `radio`, `meow`; 15 KB in total). The CC0 OGG originals were converted to mono, 32 kHz, 48 kbps MP3 with `ffmpeg-static` by `yarn audio:convert` (`scripts/convert-audio.mjs`), and each file's source is in `CREDITS.md`. The purr is phase 2 and not shipped. **The music track is pending (C17):** `/audio/music-cozy.mp3` (`MUSIC_SRC`) does not exist yet, so the radio is silent; the audio code catches the failure and stays quiet.

---

## Phase 2 easter eggs

### PC terminal

A **Terminal** tab inside the Experience panel (the monitor theme). Everything it prints is generated from the content files, so there's a single source of truth.

- **Look:** JetBrains Mono, prompt `satriko@bogor:~$`, a blinking block cursor (no blinking with reduced motion).
- **Input:** clicking anywhere in the terminal focuses the input. ↑/↓ browse command history. **Tab** completes command names.

| Command | Output |
| --- | --- |
| `help` | Lists the available commands |
| `whoami` | "Satriko Aditya · Full Stack Software Engineer · Bogor, Indonesia · 5+ years with Node.js, TypeScript, React, Next.js, NestJS" |
| `ls` | `experience.txt` (plus a hint: "try `cat experience.txt`, or the commands `skills` and `contact`") |
| `cat experience.txt` | A compact timeline of the 4 roles (company, role, dates, location) |
| `skills` | The shelves and their skills, grouped |
| `contact` | Email, LinkedIn, GitHub |
| `sudo hire satriko` | `[sudo] password for recruiter: ********` → `✔ Permission granted. Opening contact…`, then after about 1s it **switches to `/contact`** |
| `sudo <anything else>` | "Nice try 😼 Only `sudo hire satriko` is allowed here." |
| `clear` | Clears the screen |
| `meow` | Oyen "walks across the keyboard": the input fills with `asdfjkl;;;;` → "Oyen has left the terminal." |
| Anything else | "command not found: `<x>`. Did Oyen sit on the keyboard again? Type `help`." |

**Accessibility:** the input is labeled "Terminal command", and output goes to a `role="log"` region with `aria-live="polite"`. Everything in the terminal is also available in the normal panels, so it's never the only way to get information.

### Oyen antics

| Antic | Trigger | What happens |
| --- | --- | --- |
| **Petting** | 5 clicks on Oyen within about 4s | Purr sound, Oyen **rolls over**, floating hearts, and the line "Prrrr… okay, you're my favorite visitor." 20s cooldown |
| **Mug push** | **45s with no interaction** and no panel open, **once per visit** | Oyen hops onto the desk (a simple arc), taps the mug twice, and the mug slides off and bounces on the floor (scripted animation, no physics engine). A **folded note** drops out and sparkles. Clicking it opens a small **note card** (no URL) with a hidden message |
| **At night** | Oyen is asleep | Petting gives "Zzz… *purr*". The mug push is disabled |
| **Reduced motion** | n/a | No hop or bounce: the mug is simply on the floor with the note next to it |

- **Hidden note text:** 📝 to be written when phase 2 starts (e.g. a fun fact about Satriko, or a thank-you for exploring).
- The mug resets on reload.

---

## Parked ideas (not planned)

Recorded so they aren't lost. Each would be a small addition later thanks to the section registry and the store.

| Idea | What it would need |
| --- | --- |
| Konami code → retro mini-game on the TV | A key-sequence listener and a tiny canvas game inside the TV panel |
| Discovery counter ("7/14 found") | A `visited` set in the store, a counter in the phone status bar, and a reward animation |
| Rubber duck with debugging tips | One code-built object, a quack sound and a list of tips |
| A message in the browser console for developers | A text-art Oyen + "Looking under the hood? Let's talk →" (very cheap) |
| Bogor "Kota Hujan" rain in the window | A rain layer for the live sky (it fits the City of Rain nickname) |
| 404 room | A 404 page showing an empty room with Oyen, instead of the simple cozy 404 |
| Projects pinboard | A registry entry, a `three/objects/Pinboard` object in the reserved wall slot, `src/content/projects.ts`, an `IProject` model and an `organisms/ProjectsPanel` |
