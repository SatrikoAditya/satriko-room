import type { IHike } from '@models/hike'

// Mountains Satriko has climbed (decision 54), each drawn in its own shape
// (decision 57, `mountainShapes`), in Satriko's order; the panel shows the
// latest climb first. Heights are the highest summit reached, from public
// sources. Days, photos and stories come one mountain at a time (checklist C12).
const PLACEHOLDER_STORY = 'Placeholder: Satriko will write about this hike.'

const mountain = (
  id: string,
  name: string,
  location: string,
  elevationM: number,
  year: number,
  route: string | null,
  facts = '',
): IHike => ({
  id,
  name,
  location,
  elevationM,
  year,
  route,
  days: null,
  photos: [],
  // A placeholder until Satriko sends the story with the photos.
  story: `${facts ? `${facts} ` : ''}${PLACEHOLDER_STORY}`,
})

export const hikes: readonly IHike[] = [
  // Salak has several summits: one entry for the three Satriko reached.
  mountain(
    'salak',
    'Mount Salak',
    'Bogor & Sukabumi, West Java',
    2211,
    2025,
    'via Cimelati and Ajisaka',
  ),
  mountain(
    'gede',
    'Mount Gede',
    'Gede Pangrango National Park, West Java',
    2958,
    2026,
    'via Gunung Putri',
    'Climbed in 2025, and again in 2026.',
  ),
  mountain(
    'pangrango',
    'Mount Pangrango',
    'Gede Pangrango National Park, West Java',
    3019,
    2025,
    'via Cibodas',
    'Climbed in 2018, and again in 2025.',
  ),
  mountain(
    'papandayan',
    'Mount Papandayan',
    'Garut, West Java',
    2665,
    2025,
    'via Cisurupan',
  ),
  mountain(
    'ciremai',
    'Mount Ciremai',
    'Kuningan & Majalengka, West Java',
    3078,
    2025,
    'via Apuy',
  ),
  mountain(
    'cikuray',
    'Mount Cikuray',
    'Garut, West Java',
    2821,
    2025,
    'via Pemancar',
  ),
  mountain('slamet', 'Mount Slamet', 'Central Java', 3428, 2026, 'via Guci'),
  mountain(
    'merbabu',
    'Mount Merbabu',
    'Magelang & Boyolali, Central Java',
    3145,
    2026,
    'via Thekelan & Wekas',
  ),
  mountain(
    'lawu',
    'Mount Lawu',
    'Central Java – East Java border',
    3265,
    2025,
    'via Candi Cetho',
  ),
  mountain(
    'andong',
    'Mount Andong',
    'Magelang, Central Java',
    1726,
    2026,
    'via Pendem',
  ),
  // Puncak Sejati, the highest point of the Raung caldera rim.
  mountain(
    'raung',
    'Mount Raung',
    'Banyuwangi & Bondowoso, East Java',
    3344,
    2026,
    'via Kalibaru',
  ),
  // 2,603 m, the summit Satriko reached (sources differ: 2,551 / 2,603 / 2,651 m).
  mountain('kawi', 'Mount Kawi', 'Malang, East Java', 2603, 2025, 'via Precet'),
  mountain(
    'kelud',
    'Mount Kelud',
    'Kediri & Blitar, East Java',
    1731,
    2025,
    'via Karangrejo',
  ),
  mountain(
    'bromo',
    'Mount Bromo',
    'Bromo Tengger Semeru National Park, East Java',
    2329,
    2025,
    null,
  ),
  mountain(
    'api-banda',
    'Mount Api Banda',
    'Banda Islands, Maluku',
    640,
    2026,
    null,
  ),
]
