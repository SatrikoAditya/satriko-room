import { describe, expect, it } from 'vitest'

import {
  isSectionSlug,
  sectionByObject,
  sectionBySlug,
  sections,
  sectionSlugs,
  slugFromPathname,
} from './sections'

describe('sections registry', () => {
  it('has the 11 sections in phone-menu order', () => {
    expect(sectionSlugs).toEqual([
      'about',
      'experience',
      'skills',
      'education',
      'gaming',
      'travel',
      'hiking',
      'diving',
      'remote-work',
      'contact',
      'resume',
    ])
  })
  it('has unique slugs and unique objectIds', () => {
    expect(new Set(sections.map((s) => s.slug)).size).toBe(11)
    expect(new Set(sections.map((s) => s.objectId)).size).toBe(11)
  })
  it('gives every section a title, label, icon, camera pose and seo copy', () => {
    for (const s of sections) {
      expect(s.title.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.icon).toBeTypeOf('object')
      expect(s.cameraPose.zoomFactor).toBeGreaterThan(1)
      expect(s.seo.title).toContain('Satriko Aditya')
      expect(s.seo.description.length).toBeGreaterThan(20)
    }
  })
  it('looks sections up by slug, object and pathname', () => {
    expect(isSectionSlug('skills')).toBe(true)
    expect(isSectionSlug('nope')).toBe(false)
    expect(sectionBySlug('resume').objectId).toBe('printer')
    expect(sectionByObject('pc')?.slug).toBe('experience')
    expect(sectionByObject('oyen')).toBeUndefined()
    expect(slugFromPathname('/')).toBeNull()
    expect(slugFromPathname('/experience')).toBe('experience')
    expect(slugFromPathname('/experience/')).toBe('experience')
    expect(slugFromPathname('/unknown')).toBeNull()
  })
})
