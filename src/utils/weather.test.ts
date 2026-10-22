import { describe, expect, it } from 'vitest'

import { P_START_RAIN, P_STOP_RAIN } from '@constants/weather'

import {
  forcedWeather,
  initialWeather,
  nextWeather,
  RAIN_SHARE,
} from './weather'

/** Small deterministic generator so the random choices are repeatable. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('weather', () => {
  it('rains about a third of the time in the long run', () => {
    expect(RAIN_SHARE).toBeCloseTo(P_START_RAIN / (P_START_RAIN + P_STOP_RAIN))
    expect(RAIN_SHARE).toBeCloseTo(1 / 3)
    const rng = seeded(7)
    let weather = initialWeather(rng)
    let rainy = 0
    const steps = 20000
    for (let i = 0; i < steps; i++) {
      weather = nextWeather(weather, rng)
      if (weather === 'rain') rainy++
    }
    expect(rainy / steps).toBeGreaterThan(0.3)
    expect(rainy / steps).toBeLessThan(0.37)
  })

  it('opens with rain about one visit in three', () => {
    const rng = seeded(3)
    let rainy = 0
    for (let i = 0; i < 9000; i++) if (initialWeather(rng) === 'rain') rainy++
    expect(rainy / 9000).toBeGreaterThan(0.3)
    expect(rainy / 9000).toBeLessThan(0.37)
  })

  it('starts and stops rain with the set chances', () => {
    expect(nextWeather('clear', () => P_START_RAIN - 0.01)).toBe('rain')
    expect(nextWeather('clear', () => P_START_RAIN + 0.01)).toBe('clear')
    expect(nextWeather('rain', () => P_STOP_RAIN - 0.01)).toBe('clear')
    expect(nextWeather('rain', () => P_STOP_RAIN + 0.01)).toBe('rain')
  })

  it('repeats the same weather for the same seed', () => {
    const run = (seed: number) => {
      const rng = seeded(seed)
      const out = [initialWeather(rng)]
      for (let i = 0; i < 12; i++)
        out.push(nextWeather(out[out.length - 1], rng))
      return out
    }
    expect(run(11)).toEqual(run(11))
  })

  it('lets the address force the weather, and keeps posters clear', () => {
    expect(forcedWeather('?weather=rain')).toBe('rain')
    expect(forcedWeather('?weather=clear')).toBe('clear')
    expect(forcedWeather('?poster=1')).toBe('clear')
    expect(forcedWeather('?poster=1&weather=rain')).toBe('rain')
    expect(forcedWeather('?weather=snow')).toBeNull()
    expect(forcedWeather('')).toBeNull()
  })
})
