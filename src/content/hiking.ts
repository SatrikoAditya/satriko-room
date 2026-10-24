import type { IHike } from '@models/hike'

// Mountains Satriko has climbed (decision 54), each drawn in its own shape
// (decision 57, `mountainShapes`), listed latest climb first, in Satriko's
// order. Heights are the highest summit reached, from public sources. Days
// and stories come one mountain at a time (checklist C12).
const PLACEHOLDER_STORY = 'Placeholder: Satriko will write about this hike.'

const mountain = (
  id: string,
  name: string,
  location: string,
  elevationM: number,
  year: number,
  route: string | null,
  /** Alt text for each photo in public/images/hiking/<id>/, in order. */
  photoAlts: string[] = [],
  facts = '',
): IHike => ({
  id,
  name,
  location,
  elevationM,
  year,
  route,
  days: null,
  photos: photoAlts.map((alt, i) => ({
    src: `/images/hiking/${id}/${i + 1}.webp`,
    alt,
  })),
  // A placeholder until Satriko sends the story.
  story: `${facts ? `${facts} ` : ''}${PLACEHOLDER_STORY}`,
})

export const hikes: readonly IHike[] = [
  mountain(
    'api-banda',
    'Mount Api Banda',
    'Banda Islands, Maluku',
    640,
    2026,
    null,
    [
      'Satriko on the summit cairn of Mount Api Banda, holding a summit sign',
      'Satriko at the summit flag of Mount Api Banda, the sea behind him',
      'Satriko sitting on the crater rim path of Mount Api Banda',
    ],
  ),
  mountain(
    'merbabu',
    'Mount Merbabu',
    'Magelang & Boyolali, Central Java',
    3145,
    2026,
    'via Thekelan & Wekas',
    [
      'Satriko in silhouette watching the sunrise above the clouds on Mount Merbabu',
      'Satriko on a Merbabu ridge with Mount Merapi behind',
      "Satriko and friends on Mount Merbabu's golden grass slopes",
    ],
  ),
  mountain(
    'andong',
    'Mount Andong',
    'Magelang, Central Java',
    1726,
    2026,
    'via Pendem',
    [
      'Satriko beside the summit marker of Mount Andong',
      'Neighbouring volcanoes rising above the morning haze, seen from Mount Andong',
      'The Makam Joko Pekik shelter on the summit ridge of Mount Andong',
    ],
  ),
  // Puncak Sejati, the highest point of the Raung caldera rim.
  mountain(
    'raung',
    'Mount Raung',
    'Banyuwangi & Bondowoso, East Java',
    3344,
    2026,
    'via Kalibaru',
    [
      'Satriko at the 3,344 m summit sign of Mount Raung',
      'Satriko standing between the rock spires of Mount Raung',
      'Satriko in silhouette on a rock above a sea of clouds on Mount Raung',
    ],
  ),
  mountain('slamet', 'Mount Slamet', 'Central Java', 3428, 2026, 'via Guci', [
    'Satriko looking out over the clouds near the summit of Mount Slamet',
    'Satriko on the forest trail of Mount Slamet',
    'Satriko and friends at the Mount Slamet summit sign',
  ]),
  mountain(
    'gede',
    'Mount Gede',
    'Gede Pangrango National Park, West Java',
    2958,
    2026,
    'via Gunung Putri',
    [
      'Satriko at the summit marker of Mount Gede, holding a summit sign',
      'Satriko on the summit of Mount Gede with a sea of clouds behind',
      'Satriko and friends on the trail of Mount Gede',
    ],
    'Climbed in 2025, and again in 2026.',
  ),
  mountain(
    'papandayan',
    'Mount Papandayan',
    'Garut, West Java',
    2665,
    2025,
    'via Cisurupan',
    [
      'Satriko in a misty meadow on Mount Papandayan',
      'Satriko and friends on Mount Papandayan, a peak behind them',
      'Satriko and friends squeezed into a tent at camp on Mount Papandayan',
    ],
  ),
  mountain(
    'lawu',
    'Mount Lawu',
    'Central Java – East Java border',
    3265,
    2025,
    'via Candi Cetho',
    [
      'The Milky Way above the forest on the night climb up Mount Lawu',
      'Satriko at the Cetho trailhead gate of Mount Lawu',
      'Satriko and friends at the summit pillar of Mount Lawu',
    ],
  ),
  mountain(
    'ciremai',
    'Mount Ciremai',
    'Kuningan & Majalengka, West Java',
    3078,
    2025,
    'via Apuy',
    [
      'Satriko climbing the trail of Mount Ciremai with a trekking pole',
      'Satriko beside a dead tree above the clouds on Mount Ciremai',
      'Satriko holding a summit sign on the crater rim of Mount Ciremai',
    ],
  ),
  // 2,603 m, the summit Satriko reached (sources differ: 2,551 / 2,603 / 2,651 m).
  mountain(
    'kawi',
    'Mount Kawi',
    'Malang, East Java',
    2603,
    2025,
    'via Precet',
    [
      'Satriko at the Mount Kawi summit sign, holding a 2,603 m board',
      'A sea of clouds below the ridges of Mount Kawi',
    ],
  ),
  mountain(
    'kelud',
    'Mount Kelud',
    'Kediri & Blitar, East Java',
    1731,
    2025,
    'via Karangrejo',
    [
      "Satriko on a rocky ridge above Mount Kelud's turquoise crater lake",
      'Sunrise over the misty valleys from a ledge on Mount Kelud',
      'The turquoise crater lake of Mount Kelud between its peaks',
    ],
  ),
  mountain(
    'bromo',
    'Mount Bromo',
    'Bromo Tengger Semeru National Park, East Java',
    2329,
    2025,
    null,
    [
      'The smoking crater of Mount Bromo above the sea of sand',
      'A road across the Bromo savanna under a bright sky',
      'The green hills of the Bromo savanna',
    ],
  ),
  mountain(
    'pangrango',
    'Mount Pangrango',
    'Gede Pangrango National Park, West Java',
    3019,
    2025,
    'via Cibodas',
    [
      'Satriko at the Mount Pangrango summit marker, holding a 3,019 m sign',
      'Satriko in the meadow near the summit of Mount Pangrango',
      'Satriko and friends at the Mount Pangrango summit marker',
    ],
    'Climbed in 2018, and again in 2025.',
  ),
  mountain(
    'cikuray',
    'Mount Cikuray',
    'Garut, West Java',
    2821,
    2025,
    'via Pemancar',
    [
      'Satriko looking out over the clouds at dawn on Mount Cikuray',
      'Dawn breaking over the clouds from the summit of Mount Cikuray',
    ],
  ),
  // Salak has several summits: one entry for the three Satriko reached.
  mountain(
    'salak',
    'Mount Salak',
    'Bogor & Sukabumi, West Java',
    2211,
    2024,
    'via Cimelati and Ajisaka',
    [
      'Satriko at the Puncak Manik sign on the Salak 1 summit',
      'Satriko and friends at the Puncak Manik summit of Mount Salak',
    ],
  ),
]
