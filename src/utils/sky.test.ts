import { describe, expect, it } from 'vitest'

import { skyPhase, sunHeight } from './sky'

describe('sky', () => {
  it('maps Bogor minutes-of-day to phases', () => {
    expect(skyPhase(4 * 60)).toBe('night')
    expect(skyPhase(5 * 60)).toBe('dawn')
    expect(skyPhase(6 * 60 + 30)).toBe('day')
    expect(skyPhase(17 * 60 + 30)).toBe('sunset')
    expect(skyPhase(18 * 60 + 45)).toBe('night')
    expect(skyPhase(23 * 60)).toBe('night')
  })
  it('sun height peaks around noon and is 0 at night', () => {
    expect(sunHeight(12 * 60)).toBeCloseTo(1, 1)
    expect(sunHeight(6 * 60)).toBeCloseTo(0.07, 1)
    expect(sunHeight(2 * 60)).toBe(0)
  })
})
