import { describe, expect, it } from 'vitest'

import { site } from '@constants/site'

import { about } from './about'
import { contact } from './contact'
import { certification, dives } from './diving'
import { education } from './education'
import { jobs } from './experience'
import { games, platforms } from './gaming'
import { helpContent } from './help'
import { hikes } from './hiking'
import { oyenLines } from './oyen'
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
      helpContent,
      remoteWork,
      site,
      // Hobby content is empty until Satriko fills it in (launch checklist item 6).
      games,
      platforms,
      travelPins,
      hikes,
      dives,
      certification,
    })
    for (const re of forbidden) expect(blob).not.toMatch(re)
  })
})
