import { describe, expect, it } from 'vitest'

import { MAX_SHIFT, PIN_GAP } from '@constants/travel'
import type { ITravelPin } from '@models/travel'

import { layoutPins, newestFirst } from './travel'

const pin = (
  id: string,
  year: number | null,
  extra: Partial<ITravelPin> = {},
) =>
  ({
    id,
    place: id,
    region: '',
    lat: -6.6,
    lon: 106.8,
    year,
    photos: [],
    note: '',
    ...extra,
  }) satisfies ITravelPin

const dist = (p: { x: number; y: number }, q: { x: number; y: number }) =>
  Math.hypot(p.x - q.x, p.y - q.y)

describe('newestFirst', () => {
  it('sorts by year, newest first, keeping the written order within a year', () => {
    const pins = [
      pin('a', 2023),
      pin('b', 2025),
      pin('c', 2025),
      pin('d', 2024),
    ]
    expect(newestFirst(pins).map((p) => p.id)).toEqual(['b', 'c', 'd', 'a'])
  })

  it('puts places without a year last, in the written order', () => {
    const pins = [pin('x', null), pin('a', 2023), pin('y', null)]
    expect(newestFirst(pins).map((p) => p.id)).toEqual(['a', 'x', 'y'])
  })
})

describe('layoutPins', () => {
  // 1 unit of lon/lat = 1 map px, so the tests read in pixels.
  const project = (p: ITravelPin) => ({ x: p.lon, y: p.lat })

  it('keeps pins that are far apart where they are', () => {
    const laid = layoutPins(
      [pin('a', 2024, { lon: 100 }), pin('b', 2024, { lon: 200 })],
      project,
    )
    expect(laid.map(({ x }) => x)).toEqual([100, 200])
  })

  it('spreads a crowded cluster to the pin gap without moving any pin too far', () => {
    // Five pins within 12 px of each other, like Bogor, Jakarta and Tangerang.
    const spots = [
      [0, 0],
      [3, -8],
      [-8, -6],
      [6, 4],
      [-2, 9],
    ]
    const pins = spots.map(([lon, lat], i) => pin(`p${i}`, 2024, { lon, lat }))
    const laid = layoutPins(pins, project)
    for (const [i, a] of laid.entries()) {
      expect(dist(a, project(pins[i]))).toBeLessThanOrEqual(MAX_SHIFT + 1e-9)
      for (const b of laid.slice(i + 1))
        expect(dist(a, b)).toBeGreaterThanOrEqual(PIN_GAP * 0.9)
    }
    // The same input always gives the same layout.
    expect(layoutPins(pins, project)).toEqual(laid)
  })

  it('separates pins at exactly the same spot', () => {
    const laid = layoutPins(
      [pin('a', 2024), pin('b', 2024), pin('c', 2024)],
      project,
    )
    for (const [i, a] of laid.entries())
      for (const b of laid.slice(i + 1))
        expect(dist(a, b)).toBeGreaterThanOrEqual(PIN_GAP * 0.9)
  })
})
