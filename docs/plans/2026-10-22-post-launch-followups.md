# Post-launch follow-ups

Triaged on 2026-10-22 from the per-task reviews and the final whole-branch review. None of these block the launch; each is a contained improvement. Items Satriko must do before launch are in the README "Launch checklist".

## Performance

- **Trim `motion` from the first load.** First-load JS on a direct link is 238 KB gzip against the 250 KB guard; `motion`/`framer-motion` is the largest app-chosen part (about 63 KB). Switch to `LazyMotion` + `m` with features loaded lazily (the panel sheet's drag needs `domMax`). Re-check with `yarn analyze` and `yarn budgets`.
- **Per-frame work while the room is static.** `ContactShadows` re-renders every frame on the high tier (`frames={Infinity}`); `Lighting` walks the whole scene every frame (`scene.traverse`) and re-parses colour strings; the invisible hit boxes still render (`visible={false}` keeps raycasting). Cache the matched lamp/screen objects once and pause work while a panel covers the room.
- ~~**Frozen shadows after the tier drops.**~~ Done with Oyen wandering: `SceneCanvas/ShadowRefresh.tsx` recompiles materials on every tier change, so the low tier really drops the shadow map instead of freezing its last frame.
- ~~**Oyen anchor updates at 60 Hz.**~~ Done with Oyen wandering: the anchor is published only while a bubble is visible (and once at start).
- **Loader progress is effectively 0 → 100.** `useProgress` only tracks drei loads; the real wait is the 3D chunk. Track the dynamic import (or a fetch of the chunk) to drive the bar.
- **Panels ship as client code** because `panels.ts` is imported by the client `ModalHost`. Only worth revisiting if the budget tightens.

## Camera and state machine

- **Two opens within about 60 ms push two history entries.** `useSectionNavigation.open` decides push vs replace from the React `active` value, which is stale until the first `pushState` commits; a double click on a HUD button can then leave two entries, and Back during the following glide frames the wrong object. Read the slug from `currentSlug()` (as `openFromScene` already does). Found by the final re-review; pre-existing, not user-reachable at human speed.
- **Opens ignored during a glide are invisible to callers.** `openSection` drops opens while `focusing`/`entering` (final fix wave); the phone menu still closes on such a tap, and the loader skip link still ends the enter swoop. Return a boolean from `openSection` and let callers react.
- **A direct `history.replaceState` to another section mid-glide still frames the first object.** No UI path does this; closing it needs the camera refactor below.
- **Make the requested section a store value the camera reacts to** instead of relying on `transition` edges. The fix wave guards opens during `focusing`/`entering`; the refactor removes that class of bug and lets e2e cover "switch during focus" and "open during the enter swoop".
- **Camera promise chains have no `.catch`.** camera-controls resolves on interrupt, so this is latent; add a guard if the library changes.
- **Parallax overlaps the tail of the return glide**; redundant `fitDefault` on entering → ready; `ROOM_BOX`/`PADDING` could live in `@constants/camera`.

## Accessibility and UX

- **Panel scroll region is announced with the dialog's own name** (`role="region"` added for axe `scrollable-region-focusable`) and adds one Tab stop. Give it a distinct name such as "<title> content".
- **Mobile direct links jump from a centred dialog to a bottom sheet after hydration** (`PanelFrame` computes the sheet layout from the viewport after mount). Use CSS-first layout for the sheet so the server render already matches.
- **Phone menu roving focus:** every tile is a tab stop; add roving `tabindex` and Home/End. Rows use `display: contents` (older engines drop ARIA roles on such elements).
- **Mute button** label vs pressed state, `LightSwitch` label describes state rather than action, speech-bubble button is named only "Oyen", bubble hover sticks on touch, bubble tail stays at `left-10` when clamped near the edge, reduced-motion toggled at runtime leaves Oyen's scale/rotation where it was.
- **SkillBook popover:** Escape closes the whole panel instead of the popover; may clip inside the scrolling panel. `aria-live` wraps the whole Experience article (announce only the heading). `TravelPanel`'s `role="img"` on the SVG makes the pin buttons presentational — switch to `role="group"` before adding pins (axe will flag it otherwise). `MapPin` lacks a focus-visible style; `OverlapBar` bars lack an accessible name.
- **Poster mode** (`?poster=1`) still runs the idle hints; `capture-poster.mts` waits a fixed 3 s with no scene-ready signal and no `try/finally` (a timed-out run leaves Chromium open).

## Three.js hygiene

- Dispose `CanvasTexture`s in `useMapTexture` and the sky's intermediate textures; `contextlost` listener is never removed; the scene bridge object is recreated each render (memoise); `Printer` uses `side={2}` (use `DoubleSide`); `Bookshelf` colour map typed `Record<string, string>` and more than 11 books per shelf would overrun; `Sparkles` sit outside the lifted group.
- `useIdleHint` listeners only attach while no section is open, so a deep-link first visit restarts hints after closing the panel.

## Tests

- Unit gaps: `Button` anchor vs button, `CertificateFrame`, `Loader` skip-link/`lost`-label cases, `ENTER_TIMEOUT_MS` safety net, `globals.test` asserts token presence not values, `stores.test` resets only the sound store (order-dependent), `ModalHost.test` spies are never restored.
- e2e: visual baseline is darwin-only (other OSes need their own); `visual.spec` uses a fixed 1.5 s wait; `reuseExistingServer` on `localhost:3000` could pick up a dev server; keyboard spec opens only Experience (title overstates "every section"); add an audio smoke test that counts `AudioContext`s and a `webglcontextlost` mid-visit case.
- Sound effects: no negative/in-flight cache for SFX fetches; hover tick not gated to fine pointers.

## Docs

- `useSectionNavigation.switchTo` is unused (kept because the Shared Interfaces contract names it); drop it from the contract or use it.
- Decision-log row 31 wording says "1.3 vs 1.15" though only 1.0 vs 1.3 was tested.
