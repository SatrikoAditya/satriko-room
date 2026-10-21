import { describe, expect, it } from 'vitest'

import { finalRect, growTransform } from './modalRect'

describe('modalRect', () => {
  it('centers an 80% panel capped at 1100px on desktop', () => {
    expect(finalRect(1920, 1000)).toEqual({
      x: 410,
      y: 100,
      width: 1100,
      height: 800,
    })
    expect(finalRect(1000, 800)).toEqual({
      x: 100,
      y: 80,
      width: 800,
      height: 640,
    })
  })
  it('uses a bottom sheet under 640px', () => {
    const r = finalRect(390, 844)
    expect(r.width).toBe(371)
    expect(r.height).toBe(776)
    expect(r.y).toBe(844 - 776)
  })
  it('computes the transform that maps the final rect onto the origin rect', () => {
    const to = { x: 100, y: 80, width: 800, height: 640 }
    expect(growTransform(to, to)).toEqual({ x: 0, y: 0, scaleX: 1, scaleY: 1 })
    expect(
      growTransform({ x: 300, y: 200, width: 200, height: 160 }, to),
    ).toEqual({ x: 200, y: 120, scaleX: 0.25, scaleY: 0.25 })
  })
})
