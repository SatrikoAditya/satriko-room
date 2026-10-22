'use client'

import Chip from '@components/atoms/Chip'
import { cn } from '@components/shadcn/utils'

import type { ISkillShelf } from '@models/skill'

/** One book on a shelf; the panel decides which book's note is open. */

export default function SkillBook({
  id,
  open,
  onToggle,
  skill,
  color,
  usedAt,
  unlinkedLabel,
}: {
  id: string
  open: boolean
  onToggle: () => void
  skill: string
  color: ISkillShelf['color']
  usedAt: string[]
  unlinkedLabel: string
}) {
  return (
    <li className="relative" data-skill-book={id}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'border-wood-dark/40 font-display text-ink min-h-11 rounded-t-md rounded-b-sm border-b-4 px-2 py-3 text-sm font-bold shadow-sm transition-transform hover:-translate-y-1',
          {
            mint: 'bg-mint',
            sky: 'bg-sky',
            peach: 'bg-peach',
            lavender: 'bg-lavender',
            wood: 'bg-wood text-on-accent',
          }[color],
        )}
      >
        {skill}
      </button>
      {open && (
        <div
          role="note"
          className="stitched bg-paper absolute top-full left-0 z-10 mt-1 w-max max-w-64 rounded-xl p-3 text-sm shadow-md"
        >
          <p className="mb-1 font-bold">Used at</p>
          {usedAt.length ? (
            <ul className="flex flex-wrap gap-1">
              {usedAt.map((c) => (
                <li key={c}>
                  <Chip color={color}>{c}</Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">{unlinkedLabel}</p>
          )}
        </div>
      )}
    </li>
  )
}
