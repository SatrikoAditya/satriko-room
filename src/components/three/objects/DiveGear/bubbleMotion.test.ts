import { describe, expect, it } from 'vitest'

import {
  BUBBLE_COUNT,
  BUBBLE_CYCLE,
  BUBBLE_RISE,
  bubbleAt,
} from './bubbleMotion'

describe('bubbleAt', () => {
  it('keeps every bubble between the regulator and the top of its rise', () => {
    for (let t = 0; t < 10; t += 0.07)
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const b = bubbleAt(t, i)
        expect(b.y).toBeGreaterThanOrEqual(0)
        expect(b.y).toBeLessThan(BUBBLE_RISE)
        expect(b.opacity).toBeGreaterThanOrEqual(0)
        expect(b.opacity).toBeLessThanOrEqual(1)
      }
  })

  it('fades in at the regulator and out at the top', () => {
    // Bubble 0 starts its rise at t = 0.
    expect(bubbleAt(0, 0).opacity).toBe(0)
    expect(bubbleAt(BUBBLE_CYCLE * 0.5, 0).opacity).toBe(1)
    expect(bubbleAt(BUBBLE_CYCLE * 0.99, 0).opacity).toBeLessThan(0.05)
  })

  it('grows a little as it rises', () => {
    expect(bubbleAt(BUBBLE_CYCLE * 0.8, 0).scale).toBeGreaterThan(
      bubbleAt(BUBBLE_CYCLE * 0.1, 0).scale,
    )
  })

  it('spreads the bubbles out so they rise one after another', () => {
    const heights = Array.from({ length: BUBBLE_COUNT }, (_, i) =>
      bubbleAt(0, i).y.toFixed(3),
    )
    expect(new Set(heights).size).toBe(BUBBLE_COUNT)
  })

  it('loops with the cycle', () => {
    for (let i = 0; i < BUBBLE_COUNT; i++)
      expect(bubbleAt(0.3 + BUBBLE_CYCLE, i).y).toBeCloseTo(bubbleAt(0.3, i).y)
  })
})
