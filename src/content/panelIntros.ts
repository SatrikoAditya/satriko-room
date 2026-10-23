import type { IGamingSnapshot } from '@models/game'
import type { IJob } from '@models/job'
import type { SectionSlug } from '@interfaces/section'

// Oyen's one-line intro at the top of each panel (decision 62), in the third
// person. Only complete facts are counted (work years and companies); lists
// that aren't every item on the site (projects, skills, trips, climbs, dives)
// get no numbers (decision 63). Each
// panel passes its own data, so the lazy hobby chunks stay lazy.

/** Lines with nothing to count. */
export const staticIntros = {
  about:
    "That's my human! The short version is below; the PC has the long one.",
  education:
    'Satriko is studying Computer Science at BINUS, after graduating from Hacktiv8 with honors.',
  remoteWork:
    'Satriko works from Bogor with teams in Singapore and Abu Dhabi, and keeps hours to overlap.',
  contact:
    "Want to say hi to Satriko? Email, LinkedIn or GitHub. I'll make sure he reads it.",
  resume: "Satriko's whole story on two pages. Grab a copy!",
  // No counts here: not every project, skill or trip is on the site (decision 63).
  travel: 'Satriko loves exploring Indonesia, one place at a time.',
  projects:
    "A few things Satriko has built, for work and for fun. You're standing in one of them!",
  skills:
    'The tools Satriko reaches for most, shelf by shelf. Tap one to see where he used it.',
  // The panel's own stats line already gives the numbers, so these don't.
  hiking:
    'Beside work, Satriko loves climbing mountains. Pick one to see the trail he took.',
  diving:
    'Satriko dives just for fun, no certificate (yet!). Pick a dive to see what it was like.',
} as const

const YEAR_MS = 365.25 * 24 * 3600 * 1000

export const panelIntros = {
  experience(jobs: readonly IJob[], now: Date = new Date()) {
    const fullTime = jobs.filter((j) => j.kind === 'full-time')
    const first = fullTime.map((j) => j.start).sort()[0]
    const current = fullTime.find((j) => j.end === 'present')
    const years = first
      ? Math.floor((now.getTime() - Date.parse(`${first}-01`)) / YEAR_MS)
      : 0
    return [
      `Satriko has built software for ${years}+ years at ${fullTime.length} companies.`,
      current && `These days he's at ${current.company}.`,
    ]
      .filter(Boolean)
      .join(' ')
  },
  gaming(snapshot: IGamingSnapshot) {
    const latest = snapshot.recent[0]?.title
    return `After work, Satriko unwinds on his PlayStation.${latest ? ` Lately: ${latest}.` : ''}`
  },
}

/**
 * The line Oyen says over a section's panel. The data it reads (jobs, the
 * gaming snapshot) is passed in, so this module stays
 * free of content imports and each caller decides what it loads.
 */
export function introFor(
  slug: SectionSlug,
  data: {
    jobs: readonly IJob[]
    gaming: IGamingSnapshot
  },
): string {
  switch (slug) {
    case 'about':
      return staticIntros.about
    case 'experience':
      return panelIntros.experience(data.jobs)
    case 'projects':
      return staticIntros.projects
    case 'skills':
      return staticIntros.skills
    case 'education':
      return staticIntros.education
    case 'gaming':
      return panelIntros.gaming(data.gaming)
    case 'travel':
      return staticIntros.travel
    case 'hiking':
      return staticIntros.hiking
    case 'diving':
      return staticIntros.diving
    case 'remote-work':
      return staticIntros.remoteWork
    case 'contact':
      return staticIntros.contact
    case 'resume':
      return staticIntros.resume
  }
}
