import SkillBook from '@components/molecules/SkillBook'

import { jobs } from '@content/experience'
import {
  skillShelves as defaultShelves,
  SOFT_SKILL,
  UNLINKED_SKILL_LABEL,
} from '@content/skills'
import type { ISkillShelf } from '@models/skill'
import { usedAt } from '@utils/skills'

import { shelvesWithUsage } from './useSkillsPanel'

export default function SkillsPanel({
  shelves = defaultShelves,
}: {
  shelves?: readonly ISkillShelf[]
}) {
  return (
    <div className="space-y-6">
      {shelvesWithUsage(shelves).map((shelf) => (
        <section key={shelf.id}>
          <h3 className="font-display mb-2 text-lg font-extrabold">
            {shelf.title}
          </h3>
          <ul
            aria-label={`${shelf.title} shelf`}
            className="border-wood bg-paper-2 flex flex-wrap items-end gap-1 rounded-b-lg border-b-8 p-2"
          >
            {shelf.books.map((b) => (
              <SkillBook
                key={b.skill}
                skill={b.skill}
                color={shelf.color}
                usedAt={b.usedAt}
                unlinkedLabel={UNLINKED_SKILL_LABEL}
              />
            ))}
          </ul>
        </section>
      ))}
      <p className="text-ink-muted text-sm">
        Bookend: <strong>{SOFT_SKILL}</strong> ·{' '}
        {usedAt(SOFT_SKILL, jobs).join(', ')}
      </p>
    </div>
  )
}
