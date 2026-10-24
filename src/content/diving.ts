import type { IDive } from '@models/dive'

// Fun dives Satriko has done (decision 56): no certification or logbook, so
// depths are rough. Listed latest first; notes come one dive at a time
// (checklist C13).
const PLACEHOLDER_NOTE = 'Placeholder note: Satriko will write about this dive.'

export const dives: readonly IDive[] = [
  {
    id: 'lava-flow',
    kind: 'scuba',
    site: 'Lava Flow',
    location: 'Banda Islands, Maluku',
    depthM: 10,
    year: 2026,
    photos: [
      {
        src: '/images/diving/lava-flow/1.webp',
        alt: 'Satriko scuba diving over the coral at Lava Flow',
      },
      {
        src: '/images/diving/lava-flow/2.webp',
        alt: 'Satriko giving an OK sign underwater at Lava Flow',
      },
      {
        src: '/images/diving/lava-flow/3.webp',
        alt: 'Satriko diving down towards the coral at Lava Flow',
      },
    ],
    note: PLACEHOLDER_NOTE,
  },
  {
    id: 'menjangan',
    kind: 'freedive',
    site: 'Menjangan Island',
    location: 'Buleleng, Bali',
    depthM: 5,
    year: 2026,
    photos: [
      {
        src: '/images/diving/menjangan/1.webp',
        alt: 'Satriko freediving above the coral at Menjangan Island',
      },
      {
        src: '/images/diving/menjangan/2.webp',
        alt: 'Satriko freediving with arms spread wide over the reef at Menjangan Island',
      },
    ],
    note: PLACEHOLDER_NOTE,
  },
]
