export interface ITravelPin {
  id: string
  /** A place visited in Indonesia: a city, island, village or area (hikes and
   * dives live in their own panels). */
  place: string
  region: string
  /** The place's centre, never an exact spot (decision 53). */
  lat: number
  lon: number
  /** null until Satriko sends it; the postcard then shows just the place. */
  year: number | null
  /** 0–3 photos in public/images/travel/<id>/, metadata stripped. */
  photos: { src: string; alt: string }[]
  note: string
}
