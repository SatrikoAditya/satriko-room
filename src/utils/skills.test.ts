import { describe, expect, it } from 'vitest'

import { jobs } from '@content/experience'

import { usedAt } from './skills'

describe('usedAt', () => {
  it('lists companies in job order for a skill used in several jobs', () => {
    expect(usedAt('React.js', jobs)).toEqual([
      'Jitera',
      'Charcentric',
      'PT Immobi Solusi Prima',
    ])
  })
  it('matches case-insensitively and returns an empty list for unused skills', () => {
    expect(usedAt('nestjs', jobs)).toEqual(['Jitera'])
    expect(usedAt('Vue.js', jobs)).toEqual([])
  })
})
