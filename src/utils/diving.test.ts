import { describe, expect, it } from 'vitest'

import type { IDive } from '@models/dive'

import { depthScaleMax, formatDepth } from './diving'

const dive = (id: string, depthM: number) =>
  ({
    id,
    site: `Site ${id}`,
    location: '',
    depthM,
    year: null,
    photos: [],
    note: '',
  }) satisfies IDive

describe('depthScaleMax', () => {
  it('rounds the deepest dive up to 5 m, never below 20 m', () => {
    expect(depthScaleMax([dive('a', 12)])).toBe(20)
    expect(depthScaleMax([dive('a', 21)])).toBe(25)
    expect(depthScaleMax([dive('a', 30)])).toBe(30)
  })
})

describe('formatDepth', () => {
  it('says the depth is rough', () => {
    expect(formatDepth(12)).toBe('about 12 m')
  })
})
