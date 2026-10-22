/** Rain streaks in the window, drawn as one instanced mesh. */
export const RAIN_STREAKS = 40
export const STREAK_LENGTH = 0.14
/** Sideways drift per unit of fall, a light wind. */
const SLANT = 0.18
/** How far the streak is tilted to follow its slanted fall. */
export const STREAK_TILT = Math.atan(SLANT)
const MARGIN = 0.04

/** A repeatable 0..1 value per streak, so every visit gets the same pattern. */
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Where streak `i` is at time `t` (seconds) in a window W wide and H tall,
 * centred on 0: it falls, drifts a little sideways and wraps back to the top,
 * always inside the window frame.
 */
export function rainStreak(i: number, t: number, W: number, H: number) {
  const top = H / 2 - MARGIN - STREAK_LENGTH / 2
  const fall = H - 2 * MARGIN - STREAK_LENGTH
  const speed = 1.6 + hash(i, 1) * 0.8
  const f = ((((t * speed) / fall + hash(i, 2)) % 1) + 1) % 1
  const drop = f * fall
  const xMin = -W / 2 + MARGIN
  const xMax = W / 2 - MARGIN
  const drift = SLANT * fall
  const x0 = xMin + drift + hash(i, 3) * (xMax - xMin - drift)
  return { x: x0 - SLANT * drop, y: top - drop }
}
