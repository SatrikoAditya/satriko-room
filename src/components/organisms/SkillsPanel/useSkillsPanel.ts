'use client'

import { useCallback, useEffect, useState } from 'react'

import { jobs } from '@content/experience'
import type { ISkillShelf } from '@models/skill'
import { usedAt } from '@utils/skills'

export function shelvesWithUsage(shelves: readonly ISkillShelf[]) {
  return shelves.map((shelf) => ({
    ...shelf,
    books: shelf.skills.map((skill) => ({
      id: `${shelf.id}:${skill}`,
      skill,
      usedAt: usedAt(skill, jobs),
    })),
  }))
}

/** Marks a book's `<li>` so a click inside it doesn't count as "outside". */
export const SKILL_BOOK_ATTR = 'data-skill-book'

/**
 * Only one "Used at" note is open at a time. Pressing anywhere outside the open
 * book (another book, the shelves, the panel frame) closes it.
 */
export function useSkillsPanel() {
  const [openId, setOpenId] = useState<string | null>(null)
  useEffect(() => {
    if (openId === null) return
    const onPointerDown = (event: PointerEvent) => {
      const book =
        event.target instanceof Element
          ? event.target.closest(`[${SKILL_BOOK_ATTR}]`)
          : null
      if (book?.getAttribute(SKILL_BOOK_ATTR) !== openId) setOpenId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openId])
  const toggle = useCallback(
    (id: string) => setOpenId((current) => (current === id ? null : id)),
    [],
  )
  return { openId, toggle }
}
