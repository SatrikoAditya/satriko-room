export interface IDive {
  id: string
  /** The dive site, or the place when the site's name isn't known. */
  site: string
  /** The region line, e.g. "West Manggarai, East Nusa Tenggara". */
  location: string
  /** Rough max depth in metres (fun dives, no logbook; decision 56). */
  depthM: number
  /** null until Satriko sends it with the photos. */
  year: number | null
  /** 0–3 photos in public/images/diving/<id>/, metadata stripped. */
  photos: { src: string; alt: string }[]
  /** What it was like, including what Satriko saw; empty until sent. */
  note: string
}
