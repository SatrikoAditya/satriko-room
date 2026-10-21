import { describe, expect, it } from 'vitest'

import { indonesiaMap } from '@constants/indonesiaMap'

import { mercatorXY } from './map'

describe('mercatorXY', () => {
  it('matches the Mercator formula', () => {
    expect(mercatorXY(0, 0, 100, [0, 0])).toEqual({ x: 0, y: 0 })
    expect(mercatorXY(0, 180, 100, [0, 0]).x).toBeCloseTo(100 * Math.PI, 5)
    expect(mercatorXY(45, 0, 100, [0, 0]).y).toBeCloseTo(-88.137, 2)
  })
  it('projects Jakarta inside the generated map board', () => {
    const { x, y } = mercatorXY(
      -6.2,
      106.8,
      indonesiaMap.scale,
      indonesiaMap.translate,
    )
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(indonesiaMap.width)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(indonesiaMap.height)
  })
})
