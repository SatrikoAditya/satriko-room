import { describe, expect, it } from 'vitest'

import type { IHike } from '@models/hike'

import { mountainPath, peakHeights, summitStats, tripLine } from './hiking'

const hike = (id: string, elevationM: number, extra: Partial<IHike> = {}) =>
  ({
    id,
    name: `Mount ${id}`,
    location: '',
    elevationM,
    year: null,
    route: null,
    days: null,
    photos: [],
    story: '',
    ...extra,
  }) satisfies IHike

describe('summitStats', () => {
  it('counts the summits and finds the highest', () => {
    expect(
      summitStats([hike('a', 2958), hike('b', 3726), hike('c', 2565)]),
    ).toEqual({
      count: 3,
      highest: { name: 'Mount b', elevationM: 3726 },
    })
  })
  it('is null with no hikes', () => {
    expect(summitStats([])).toBeNull()
  })
})

describe('peakHeights', () => {
  it('scales to the tallest mountain with a floor for small ones', () => {
    const h = peakHeights([hike('a', 3726), hike('b', 1863), hike('c', 100)], {
      max: 150,
      floor: 50,
    })
    expect(h[0]).toBe(150)
    expect(h[1]).toBeCloseTo(100)
    expect(h[2]).toBeGreaterThanOrEqual(50)
    expect(h[2]).toBeLessThan(h[1])
  })
})

describe('tripLine', () => {
  it('joins the route and days, leaving out what is empty', () => {
    expect(tripLine(hike('a', 1, { route: 'via Sembalun', days: 3 }))).toBe(
      'via Sembalun · 3 days on the trail',
    )
    expect(tripLine(hike('a', 1, { days: 1 }))).toBe('1 day on the trail')
    expect(tripLine(hike('a', 1))).toBe('')
  })
})

describe('mountainPath', () => {
  const shape = {
    points: [
      [-0.5, 0.4],
      [0.2, 1],
      [0.6, 0.5],
    ] as const,
  }
  it('runs from the left base to the right base', () => {
    const { d } = mountainPath(shape, {
      cx: 100,
      base: 200,
      half: 50,
      height: 80,
    })
    expect(d.startsWith('M50 200')).toBe(true)
    expect(d.trim().endsWith('150 200 Z')).toBe(true)
  })
  it('puts the summit at the highest point', () => {
    const { summit } = mountainPath(shape, {
      cx: 100,
      base: 200,
      half: 50,
      height: 80,
    })
    expect(summit).toEqual({ x: 110, y: 120 })
  })
})
