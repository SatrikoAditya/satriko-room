import type { MouseEvent } from 'react'

import { cn } from '@components/shadcn/utils'

import type { Section } from '@interfaces/section'

const tileColor: Record<Section['slug'], string> = {
  about: 'bg-peach',
  experience: 'bg-sky',
  skills: 'bg-mint',
  education: 'bg-wood/40',
  gaming: 'bg-lavender',
  travel: 'bg-peach',
  hiking: 'bg-mint',
  diving: 'bg-sky',
  'remote-work': 'bg-wood/40',
  contact: 'bg-accent/30',
  resume: 'bg-paper-2',
}

export default function PhoneAppTile({
  section,
  href,
  onClick,
}: {
  section: Section
  href: string
  onClick: (e: MouseEvent) => void
}) {
  const Icon = section.icon
  return (
    <a
      href={href}
      onClick={onClick}
      className="focus-visible:ring-accent flex min-h-11 flex-col items-center gap-1 rounded-2xl p-2 outline-none focus-visible:ring-4"
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm',
          tileColor[section.slug],
        )}
      >
        <Icon size={26} />
      </span>
      <span className="font-display text-xs font-bold">{section.label}</span>
    </a>
  )
}
