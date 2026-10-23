import type { IDive } from '@models/dive'

/** The depth chart's bottom: the deepest dive rounded up to 5 m, at least 20 m. */
export function depthScaleMax(dives: readonly IDive[]) {
  const deepest = Math.max(0, ...dives.map((d) => d.depthM))
  return Math.max(20, Math.ceil(deepest / 5) * 5)
}

/** Depths are remembered, not logged, so they read as rough. */
export const formatDepth = (m: number) => `about ${m} m`
