import { describe, expect, it } from 'vitest'

import { sections } from '@constants/sections'

import { jobs } from './experience'
import { gaming } from './gaming'
import { introFor, panelIntros, staticIntros } from './panelIntros'

const NOW = new Date('2026-10-23T00:00:00Z')

describe('panel intros', () => {
  it('counts work years from the first full-time job, and names the current one', () => {
    expect(panelIntros.experience(jobs, NOW)).toBe(
      "Satriko has built software for 5+ years at 3 companies. These days he's at Jitera.",
    )
  })
  it('names the latest game, or leaves it out when there is none', () => {
    expect(panelIntros.gaming({ ...gaming, recent: [] })).toBe(
      'After work, Satriko unwinds on his PlayStation.',
    )
    expect(
      panelIntros.gaming({
        ...gaming,
        recent: [
          {
            id: 'a',
            title: 'Astro Bot',
            platform: 'PS5',
            cover: null,
            lastPlayed: '',
            playtimeHours: null,
          },
        ],
      }),
    ).toBe('After work, Satriko unwinds on his PlayStation. Lately: Astro Bot.')
  })
  it('gives no counts for lists that are not complete', () => {
    for (const slug of [
      'projects',
      'skills',
      'travel',
      'hiking',
      'diving',
    ] as const)
      expect(introFor(slug, { jobs, gaming })).not.toMatch(/\d/)
  })
  it('has a short line for every section, also with the night yawn', () => {
    for (const { slug } of sections) {
      const line = introFor(slug, { jobs, gaming })
      expect(line.length).toBeGreaterThan(10)
      expect(line.length).toBeLessThanOrEqual(120)
      expect(`yawn… ${line}`.length).toBeLessThanOrEqual(130)
    }
    for (const line of Object.values(staticIntros))
      expect(line.length).toBeLessThanOrEqual(120)
  })
})
