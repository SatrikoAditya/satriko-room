import { describe, expect, it } from 'vitest'

import { jobs } from '@content/experience'

import { formatRange } from './dates'

describe('formatRange', () => {
  it('formats open and closed ranges', () => {
    expect(formatRange({ ...jobs[0], start: '2024-10', end: 'present' })).toBe(
      'Oct 2024 – Present',
    )
    expect(formatRange({ ...jobs[0], start: '2022-01', end: '2024-10' })).toBe(
      'Jan 2022 – Oct 2024',
    )
  })
})
