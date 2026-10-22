import { describe, expect, it } from 'vitest'

import {
  RAIN_STREAKS,
  rainStreak,
  STREAK_LENGTH,
  STREAK_TILT,
} from './rainMotion'

const W = 2.4
const H = 1.8

describe('rainStreak', () => {
  it('keeps every streak inside the window', () => {
    const halfW = (Math.sin(STREAK_TILT) * STREAK_LENGTH) / 2 + 0.008
    const halfH = (Math.cos(STREAK_TILT) * STREAK_LENGTH) / 2
    for (let t = 0; t < 12; t += 0.03)
      for (let i = 0; i < RAIN_STREAKS; i++) {
        const s = rainStreak(i, t, W, H)
        expect(Math.abs(s.x) + halfW).toBeLessThanOrEqual(W / 2)
        expect(Math.abs(s.y) + halfH).toBeLessThanOrEqual(H / 2)
      }
  })

  it('falls and drifts a little to the side', () => {
    const a = rainStreak(5, 1.0, W, H)
    const b = rainStreak(5, 1.02, W, H)
    if (b.y < a.y) {
      expect(b.x).toBeLessThan(a.x)
    } else {
      // It just wrapped back to the top.
      expect(b.y).toBeGreaterThan(a.y)
    }
  })

  it('spreads the streaks across the window', () => {
    const xs = Array.from(
      { length: RAIN_STREAKS },
      (_, i) => rainStreak(i, 0, W, H).x,
    )
    expect(Math.min(...xs)).toBeLessThan(-W / 4)
    expect(Math.max(...xs)).toBeGreaterThan(W / 4)
  })

  it('is the same for the same moment', () => {
    expect(rainStreak(3, 2.5, W, H)).toEqual(rainStreak(3, 2.5, W, H))
  })
})
