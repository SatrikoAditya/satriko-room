import type { ITravelPin } from '@models/travel'

// Places Satriko has visited in Indonesia (decision 53), A to Z until the years
// arrive. Each pin is at the place's centre, never an exact spot. Years, notes
// and photos come one place at a time with the photos (checklist C11).
const PLACEHOLDER_NOTE = 'Placeholder: Satriko will write about this place.'

const place = (
  id: string,
  name: string,
  region: string,
  lat: number,
  lon: number,
  note = '',
): ITravelPin => ({
  id,
  place: name,
  region,
  lat,
  lon,
  year: null,
  photos: [],
  // A placeholder until Satriko sends the note with the photos.
  note: `${note ? `${note} ` : ''}${PLACEHOLDER_NOTE}`,
})

export const travelPins: readonly ITravelPin[] = [
  place('ambon', 'Ambon', 'Maluku', -3.695, 128.181),
  place(
    'banda-neira',
    'Banda Neira',
    'Island · Central Maluku, Maluku',
    -4.525,
    129.896,
  ),
  place('bandung', 'Bandung', 'West Java', -6.917, 107.619),
  place('banyuwangi', 'Banyuwangi', 'East Java', -8.219, 114.369),
  place('blitar', 'Blitar', 'East Java', -8.098, 112.168),
  place('bogor', 'Bogor', 'West Java', -6.595, 106.816),
  place('dieng', 'Dieng', 'Plateau · Central Java', -7.209, 109.907),
  place('garut', 'Garut', 'West Java', -7.227, 107.909),
  place('jakarta', 'Jakarta', 'Jakarta', -6.2, 106.845),
  place(
    'karimun-jawa',
    'Karimun Jawa',
    'Islands · Central Java',
    -5.85,
    110.433,
  ),
  // Tual and Langgur face each other across a bridge, so they share one pin.
  // Bair and Adranan are day trips from there, so they live in its postcard.
  place(
    'kei-islands',
    'Kei Islands',
    'Tual & Langgur, Maluku',
    -5.63,
    132.742,
    "Island hopping to Bair, the 'mini Raja Ampat', and Adranan next to it.",
  ),
  place(
    'labuan-bajo',
    'Labuan Bajo',
    'West Manggarai, East Nusa Tenggara',
    -8.497,
    119.888,
  ),
  place('magelang', 'Magelang', 'Central Java', -7.47, 110.218),
  place('makassar', 'Makassar', 'South Sulawesi', -5.147, 119.432),
  place('malang', 'Malang', 'East Java', -7.966, 112.633),
  // Mules Island in the Savu Sea, the only island in Manggarai Regency.
  place(
    'nuca-molas',
    'Nuca Molas',
    'Island · Manggarai, East Nusa Tenggara',
    -8.9,
    120.283,
  ),
  place('solo', 'Solo', 'Central Java', -7.576, 110.824),
  place('sukabumi', 'Sukabumi', 'West Java', -6.921, 106.927),
  place('surabaya', 'Surabaya', 'East Java', -7.257, 112.752),
  place(
    'wae-rebo',
    'Wae Rebo',
    'Village · Manggarai, East Nusa Tenggara',
    -8.769,
    120.284,
  ),
  place(
    'yogyakarta',
    'Yogyakarta',
    'Special Region of Yogyakarta',
    -7.797,
    110.37,
  ),
]
