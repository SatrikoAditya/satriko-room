import { describe, expect, it } from 'vitest'

import { approach, fadeStep, skyPhase, sunHeight } from './sky'

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
  it('fades opacity linearly and clamps at 0', () => {
    expect(fadeStep(1, 1.5, 3)).toBeCloseTo(0.5)
    expect(fadeStep(0.2, 1, 3)).toBe(0)
  })

  it('eases a value toward a target without overshooting', () => {
    expect(approach(0, 1, 0.25)).toBeCloseTo(0.25)
    expect(approach(0.9, 1, 0.25)).toBe(1)
    expect(approach(1, 0, 0.4)).toBeCloseTo(0.6)
    expect(approach(0.1, 0, 0.4)).toBe(0)
  })
})
