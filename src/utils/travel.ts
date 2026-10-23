import { MAX_SHIFT, PIN_GAP } from '@constants/travel'
import type { ITravelPin } from '@models/travel'

/**
 * Newest trip first; pins from the same year keep the order they're written
 * in, and places without a year yet come last.
 */
export function newestFirst<T extends { year: number | null }>(
  items: readonly T[],
) {
  return items
    .map((item, i) => ({ item, i }))
    .sort(
      (a, b) =>
        (b.item.year ?? -Infinity) - (a.item.year ?? -Infinity) || a.i - b.i,
    )
    .map(({ item }) => item)
}

const PASSES = 80
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Projects each pin, then pushes pins closer than PIN_GAP apart (a few
 * deterministic passes), keeping every pin within MAX_SHIFT of its true spot,
 * so crowded areas like Jakarta and Bogor stay clickable.
 */
export function layoutPins(
  pins: readonly ITravelPin[],
  project: (pin: ITravelPin) => { x: number; y: number },
) {
  const home = pins.map(project)
  // Pins at the same spot start on a small golden-angle spiral, so they spread
  // in two directions instead of along one line.
  const at = home.map((p, k) => {
    const twins = home.slice(0, k).filter((q) => q.x === p.x && q.y === p.y)
    if (twins.length === 0) return { ...p }
    const angle = twins.length * GOLDEN_ANGLE
    return { x: p.x + Math.cos(angle), y: p.y + Math.sin(angle) }
  })
  for (let pass = 0; pass < PASSES; pass++) {
    let moved = false
    for (let i = 0; i < at.length; i++) {
      for (let j = i + 1; j < at.length; j++) {
        const dx = at[j].x - at[i].x
        const dy = at[j].y - at[i].y
        const d = Math.hypot(dx, dy)
        if (d >= PIN_GAP || d === 0) continue
        const push = (PIN_GAP - d) / 2
        const ux = dx / d
        const uy = dy / d
        at[i].x -= ux * push
        at[i].y -= uy * push
        at[j].x += ux * push
        at[j].y += uy * push
        moved = true
      }
    }
    for (const [k, p] of at.entries()) {
      const ox = p.x - home[k].x
      const oy = p.y - home[k].y
      const shift = Math.hypot(ox, oy)
      if (shift > MAX_SHIFT) {
        p.x = home[k].x + (ox / shift) * MAX_SHIFT
        p.y = home[k].y + (oy / shift) * MAX_SHIFT
      }
    }
    if (!moved) break
  }
  return pins.map((pin, k) => ({ pin, ...at[k] }))
}
