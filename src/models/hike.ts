export interface IHike {
  id: string
  name: string
  /** The region line, e.g. "Lombok, West Nusa Tenggara". */
  location: string
  elevationM: number
  /** null until Satriko sends it with the photos (decision 54). */
  year: number | null
  /** The trail or basecamp, e.g. "via Sembalun". */
  route: string | null
  /** Days on the trail. */
  days: number | null
  /** 0–3 photos in public/images/hiking/<id>/, metadata stripped. */
  photos: { src: string; alt: string }[]
  story: string
}
