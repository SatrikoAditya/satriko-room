// src/interfaces/section.ts
import type { LucideIcon } from 'lucide-react'

export type SectionSlug =
  | 'about'
  | 'experience'
  | 'projects'
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
  | 'whiteboard'
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
  | 'bedside-lamp'
  | 'desk-lamp'
  | 'umbrella-stand'
  | 'whiteboard'

/** The two lamps a visitor can switch on and off. */
export type LampId = Extract<ObjectId, 'bedside-lamp' | 'desk-lamp'>

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
  objectId: Exclude<
    ObjectId,
    | 'oyen'
    | 'light-switch'
    | 'radio'
    | 'bedside-lamp'
    | 'desk-lamp'
    | 'umbrella-stand'
  >
  cameraPose: CameraPose
  theme: PanelTheme
  seo: { title: string; description: string }
}
