import { describe, expect, it } from 'vitest'

import {
  clockAngles,
  formatHHMM,
  overlapWindow,
  utcOffsetMinutes,
  zonedTime,
} from './time'

const at = (iso: string) => new Date(iso)

describe('time', () => {
  it('converts an instant into wall-clock time per zone', () => {
    const d = at('2026-10-21T05:04:09Z')
    expect(zonedTime(d, 'Asia/Jakarta')).toEqual({ h: 12, m: 4, s: 9 })
    expect(zonedTime(d, 'Asia/Singapore')).toEqual({ h: 13, m: 4, s: 9 })
    expect(zonedTime(d, 'Asia/Dubai')).toEqual({ h: 9, m: 4, s: 9 })
    expect(formatHHMM({ h: 9, m: 4, s: 9 })).toBe('09:04')
  })
  it('gives clock hand angles in degrees', () => {
    expect(clockAngles({ h: 3, m: 0, s: 0 })).toEqual({ hour: 90, minute: 0 })
    expect(clockAngles({ h: 12, m: 30, s: 0 })).toEqual({
      hour: 15,
      minute: 180,
    })
  })
  it('knows UTC offsets', () => {
    const d = at('2026-10-21T05:00:00Z')
    expect(utcOffsetMinutes(d, 'Asia/Jakarta')).toBe(420)
    expect(utcOffsetMinutes(d, 'Asia/Dubai')).toBe(240)
  })
  it('computes the three-way working-hours overlap in Bogor minutes', () => {
    const d = at('2026-10-21T05:00:00Z')
    expect(
      overlapWindow(
        d,
        ['Asia/Jakarta', 'Asia/Singapore', 'Asia/Dubai'],
        'Asia/Jakarta',
      ),
    ).toEqual({ start: 12 * 60, end: 17 * 60 })
    expect(
      overlapWindow(d, ['Asia/Jakarta', 'America/Los_Angeles'], 'Asia/Jakarta'),
    ).toBeNull()
  })
})
