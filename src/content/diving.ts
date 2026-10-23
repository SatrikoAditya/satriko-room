import type { IDive } from '@models/dive'

// Fun dives Satriko has done (decision 56): no certification or logbook, so
// depths are rough. One placeholder for review until Satriko sends the dives;
// years, notes and photos come one dive at a time (checklist C13).
export const dives: readonly IDive[] = [
  {
    id: 'placeholder-dive',
    site: 'Labuan Bajo (placeholder)',
    location: 'West Manggarai, East Nusa Tenggara',
    depthM: 12,
    year: null,
    photos: [],
    note: 'Placeholder note: Satriko will write about this dive.',
  },
]
