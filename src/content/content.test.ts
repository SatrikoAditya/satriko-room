import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { mountainShapes } from '@constants/mountainShapes'
import { site } from '@constants/site'

import { about } from './about'
import { contact } from './contact'
import { dives } from './diving'
import { education } from './education'
import { jobs } from './experience'
import { gaming } from './gaming'
import { helpContent } from './help'
import { hikes } from './hiking'
import { oyenLines } from './oyen'
import { staticIntros } from './panelIntros'
import { projects } from './projects'
import { remoteWork } from './remoteWork'
import { resume } from './resume'
import { skillShelves, SOFT_SKILL, UNLINKED_SKILL_LABEL } from './skills'
import { travelPins } from './travel'

const forbidden = [/\+62/, /0851/, /Sugeng/, /Gilang/, /Fadel/, /Zaidan/]

describe('content', () => {
  it('has the four roles with exact dates', () => {
    expect(jobs.map((j) => [j.company, j.start, j.end])).toEqual([
      ['Jitera', '2024-10', 'present'],
      ['Charcentric', '2022-01', '2024-10'],
      ['PT Immobi Solusi Prima', '2020-12', '2021-12'],
      ['Institut Pertanian Bogor (IPB) University', '2019-01', '2019-05'],
    ])
  })
  it('has five skill shelves and the Hacktiv8 honors', () => {
    expect(skillShelves.map((s) => s.id)).toEqual([
      'languages',
      'frontend',
      'backend',
      'devops',
      'toolbox',
    ])
    expect(education.find((e) => e.id === 'hacktiv8')?.honors).toBe(true)
  })
  it('never contains a phone number or referee details', () => {
    const blob = JSON.stringify({
      about,
      contact,
      education,
      jobs,
      skillShelves,
      SOFT_SKILL,
      UNLINKED_SKILL_LABEL,
      resume,
      oyenLines,
      staticIntros,
      helpContent,
      remoteWork,
      site,
      // Hobby content is empty until Satriko fills it in (launch checklist item 6).
      gaming,
      travelPins,
      hikes,
      dives,
      projects,
    })
    for (const re of forbidden) expect(blob).not.toMatch(re)
  })
  it('keeps the games snapshot to games and trophy counts', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => [
        k,
        ...(v && typeof v === 'object' ? keys(v) : []),
      ])
    expect(keys(gaming).join(' ')).not.toMatch(
      /accountId|onlineId|npsso|accessToken|refreshToken/i,
    )
    for (const game of gaming.recent)
      expect(Object.keys(game).sort()).toEqual([
        'cover',
        'id',
        'lastPlayed',
        'platform',
        'playtimeHours',
        'title',
      ])
  })
  it('keeps travel pins to the agreed shape', () => {
    expect(new Set(travelPins.map((p) => p.id)).size).toBe(travelPins.length)
    for (const pin of travelPins) {
      expect(pin.photos.length).toBeLessThanOrEqual(3)
      expect(pin.year === null || Number.isInteger(pin.year)).toBe(true)
      // Inside Indonesia's bounding box.
      expect(pin.lat).toBeGreaterThan(-11.5)
      expect(pin.lat).toBeLessThan(6.5)
      expect(pin.lon).toBeGreaterThan(94.5)
      expect(pin.lon).toBeLessThan(141.5)
      for (const photo of pin.photos) {
        expect(photo.alt.trim()).not.toBe('')
        expect(photo.src.startsWith(`/images/travel/${pin.id}/`)).toBe(true)
      }
    }
  })
  it('draws every mountain in its own shape', () => {
    for (const hike of hikes) expect(mountainShapes[hike.id]).toBeDefined()
  })
  it('lists hikes and dives latest first, each photo in public/', () => {
    for (const [kind, list] of [
      ['hiking', hikes],
      ['diving', dives],
    ] as const) {
      const years = list.map((item) => item.year ?? 0)
      expect(years).toEqual([...years].sort((a, b) => b - a))
      for (const item of list) {
        expect(item.photos.length).toBeLessThanOrEqual(3)
        for (const photo of item.photos) {
          expect(photo.alt.trim()).not.toBe('')
          expect(photo.src.startsWith(`/images/${kind}/${item.id}/`)).toBe(true)
          expect(existsSync(join('public', photo.src))).toBe(true)
        }
      }
    }
  })
})
