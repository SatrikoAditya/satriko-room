import { jobs } from '@content/experience'
import type { ISkillShelf } from '@models/skill'
import { usedAt } from '@utils/skills'

export function shelvesWithUsage(shelves: readonly ISkillShelf[]) {
  return shelves.map((shelf) => ({
    ...shelf,
    books: shelf.skills.map((skill) => ({
      skill,
      usedAt: usedAt(skill, jobs),
    })),
  }))
}
