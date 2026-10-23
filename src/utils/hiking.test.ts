import { describe, expect, it } from 'vitest'

import type { IHike } from '@models/hike'

import { highestElevation, mountainPath, tripLine } from './hiking'

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

describe('highestElevation', () => {
  it('finds the highest mountain, and 0 with none', () => {
    expect(
      highestElevation([hike('a', 2958), hike('b', 3726), hike('c', 2565)]),
    ).toBe(3726)
    expect(highestElevation([])).toBe(0)
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
