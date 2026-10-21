// src/interfaces/section.ts
import type { LucideIcon } from 'lucide-react'

export type SectionSlug =
  | 'about'
  | 'experience'
  | 'skills'
  | 'education'
  | 'gaming'
  | 'travel'
  | 'hiking'
  | 'diving'
  | 'remote-work'
  | 'contact'
  | 'resume'

export type PanelTheme =
  | 'scrapbook'
  | 'monitor'
  | 'shelf'
  | 'frames'
  | 'tv'
  | 'map'
  | 'journal'
  | 'logbook'
  | 'clocks'
  | 'envelope'
  | 'paper'

export type ObjectId =
  | 'photo-frame'
  | 'pc'
  | 'bookshelf'
  | 'edu-frames'
  | 'tv'
  | 'indonesia-map'
  | 'hiking-gear'
  | 'dive-gear'
  | 'clocks'
  | 'mailbox'
  | 'printer'
  | 'oyen'
  | 'light-switch'
  | 'radio'

export type Vec3 = readonly [number, number, number]

/** Camera pose when focused on an object. position = target + offset. */
export interface CameraPose {
  target: Vec3
  offset: Vec3
  zoomFactor: number // multiplied with the fitted default zoom (1 = default)
}

export interface Section {
  slug: SectionSlug
  title: string // panel title, e.g. 'Work Experience'
  label: string // short label for hover tags / phone, e.g. 'Experience'
  icon: LucideIcon
  objectId: Exclude<ObjectId, 'oyen' | 'light-switch' | 'radio'>
  cameraPose: CameraPose
  theme: PanelTheme
  seo: { title: string; description: string }
}
