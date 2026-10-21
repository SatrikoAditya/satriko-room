import {
  BookOpen,
  Clock,
  FileText,
  Gamepad2,
  GraduationCap,
  Mail,
  MapPin,
  Monitor,
  Mountain,
  UserRound,
  Waves,
} from 'lucide-react'

import type { ObjectId, Section, SectionSlug } from '@interfaces/section'

const by = (t: string) => `${t} · Satriko Aditya`

export const sections: readonly Section[] = [
  {
    slug: 'about',
    title: 'About me',
    label: 'About',
    icon: UserRound,
    objectId: 'photo-frame',
    theme: 'scrapbook',
    cameraPose: {
      target: [-0.9, 0.95, -4.1],
      offset: [3.2, 2.4, 3.2],
      zoomFactor: 2.6,
    },
    seo: {
      title: by('About'),
      description:
        'Full stack engineer from Bogor, Indonesia, working remotely across Singapore and Abu Dhabi.',
    },
  },
  {
    slug: 'experience',
    title: 'Work experience',
    label: 'Experience',
    icon: Monitor,
    objectId: 'pc',
    theme: 'monitor',
    cameraPose: {
      target: [0, 1.3, -4.4],
      offset: [3.4, 2.6, 3.4],
      zoomFactor: 2.2,
    },
    seo: {
      title: by('Experience'),
      description:
        'Full stack roles at Jitera, Charcentric and PT Immobi Solusi Prima.',
    },
  },
  {
    slug: 'skills',
    title: 'Skills',
    label: 'Skills',
    icon: BookOpen,
    objectId: 'bookshelf',
    theme: 'shelf',
    cameraPose: {
      target: [2.4, 1.4, -4.4],
      offset: [3.4, 2.4, 3.4],
      zoomFactor: 2.0,
    },
    seo: {
      title: by('Skills'),
      description:
        'Node.js, TypeScript, React, Next.js, NestJS, React Native, PostgreSQL, AWS, Docker and more.',
    },
  },
  {
    slug: 'education',
    title: 'Education',
    label: 'Education',
    icon: GraduationCap,
    objectId: 'edu-frames',
    theme: 'frames',
    cameraPose: {
      target: [-4.93, 3.5, 2],
      offset: [4.2, 1.7, 2.2],
      zoomFactor: 2.8,
    },
    seo: {
      title: by('Education'),
      description:
        'BSc Computer Science at BINUS, Hacktiv8 Honors Graduate, SMK Negeri 3 Bogor.',
    },
  },
  {
    slug: 'gaming',
    title: 'Gaming',
    label: 'Gaming',
    icon: Gamepad2,
    objectId: 'tv',
    theme: 'tv',
    cameraPose: {
      target: [-1.2, 0.9, 1.0],
      offset: [3.6, 2.2, 3.0],
      zoomFactor: 2.2,
    },
    seo: {
      title: by('Gaming'),
      description: 'What Satriko is playing right now.',
    },
  },
  {
    slug: 'travel',
    title: 'Travel',
    label: 'Travel',
    icon: MapPin,
    objectId: 'indonesia-map',
    theme: 'map',
    cameraPose: {
      target: [2.4, 3.9, -4.93],
      offset: [3.0, 1.6, 3.6],
      zoomFactor: 2.2,
    },
    seo: {
      title: by('Travel'),
      description: 'Places Satriko has explored around Indonesia.',
    },
  },
  {
    slug: 'hiking',
    title: 'Hiking',
    label: 'Hiking',
    icon: Mountain,
    objectId: 'hiking-gear',
    theme: 'journal',
    cameraPose: {
      target: [4.4, 0.5, -3.6],
      offset: [3.0, 2.4, 3.4],
      zoomFactor: 2.6,
    },
    seo: {
      title: by('Hiking'),
      description: 'Mountains and trails Satriko has hiked.',
    },
  },
  {
    slug: 'diving',
    title: 'Diving',
    label: 'Diving',
    icon: Waves,
    objectId: 'dive-gear',
    theme: 'logbook',
    cameraPose: {
      target: [-3.8, 0.6, -1.2],
      offset: [3.2, 2.4, 3.4],
      zoomFactor: 2.6,
    },
    seo: {
      title: by('Diving'),
      description: "Dive sites and highlights from Satriko's dive log.",
    },
  },
  {
    slug: 'remote-work',
    title: 'Remote work',
    label: 'Remote work',
    icon: Clock,
    objectId: 'clocks',
    theme: 'clocks',
    cameraPose: {
      target: [0, 4.1, -4.93],
      offset: [3.0, 1.6, 3.6],
      zoomFactor: 2.8,
    },
    seo: {
      title: by('Remote work'),
      description:
        'How Satriko works remotely across Bogor, Singapore and Abu Dhabi time zones.',
    },
  },
  {
    slug: 'contact',
    title: 'Contact',
    label: 'Contact',
    icon: Mail,
    objectId: 'mailbox',
    theme: 'envelope',
    cameraPose: {
      target: [3.5, 1.0, -4.88],
      offset: [3.0, 2.0, 3.6],
      zoomFactor: 2.8,
    },
    seo: {
      title: by('Contact'),
      description: 'Get in touch with Satriko by email, LinkedIn or GitHub.',
    },
  },
  {
    slug: 'resume',
    title: 'Resume',
    label: 'Resume',
    icon: FileText,
    objectId: 'printer',
    theme: 'paper',
    cameraPose: {
      target: [-2.2, 0.7, -4.3],
      offset: [3.4, 2.4, 3.4],
      zoomFactor: 2.6,
    },
    seo: {
      title: by('Resume'),
      description: "Download Satriko Aditya's resume (PDF).",
    },
  },
]

export const sectionSlugs: readonly SectionSlug[] = sections.map((s) => s.slug)

export function isSectionSlug(value: string): value is SectionSlug {
  return (sectionSlugs as readonly string[]).includes(value)
}

export function sectionBySlug(slug: SectionSlug): Section {
  const found = sections.find((s) => s.slug === slug)
  if (!found) throw new Error(`Unknown section: ${slug}`)
  return found
}

export function sectionByObject(objectId: ObjectId): Section | undefined {
  return sections.find((s) => s.objectId === objectId)
}

export function slugFromPathname(pathname: string): SectionSlug | null {
  const clean = pathname.replace(/\/+$/, '').replace(/^\//, '')
  return clean !== '' && isSectionSlug(clean) ? clean : null
}
