import type { IMountainShape } from '@constants/mountainShapes'
import type { IHike } from '@models/hike'

/**
 * The highest mountain's elevation, which sets how tall each mountain is drawn.
 * Not shown as a stat: the list isn't every climb (decision 63).
 */
export function highestElevation(hikes: readonly IHike[]) {
  return Math.max(0, ...hikes.map((h) => h.elevationM))
}

/** "via Sembalun · 3 days on the trail", leaving out what is still empty. */
export function tripLine(hike: IHike) {
  return [
    hike.route,
    hike.days !== null &&
      `${hike.days} ${hike.days === 1 ? 'day' : 'days'} on the trail`,
  ]
    .filter(Boolean)
    .join(' · ')
}

export const formatMetres = (m: number) => `${m.toLocaleString('en-US')} m`

const round = (n: number) => Math.round(n * 10) / 10

/**
 * A mountain's outline as an SVG path: a smooth curve through its shape's
 * points (Catmull-Rom, eased so it barely overshoots), from the left base
 * corner to the right one. Also returns the summit (for the flag) and the vent
 * (where smoke rises).
 */
export function mountainPath(
  shape: IMountainShape,
  {
    cx,
    base,
    half,
    height,
  }: { cx: number; base: number; half: number; height: number },
) {
  const pts = [[-1, 0] as const, ...shape.points, [1, 0] as const].map(
    ([x, y]) => ({ x: cx + x * half, y: base - y * height }),
  )
  const k = 0.13
  let d = `M${round(pts[0].x)} ${round(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k }
    const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k }
    d += ` C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`
  }
  const top = shape.points.reduce((a, b) => (b[1] > a[1] ? b : a))
  const at = ([x, y]: readonly [number, number]) => ({
    x: round(cx + x * half),
    y: round(base - y * height),
  })
  return { d: `${d} Z`, summit: at(top), vent: at(shape.vent ?? top) }
}
