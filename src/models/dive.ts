export interface IDive {
  id: string
  site: string
  location: string
  maxDepthM: number
  date: string
  highlights: string
  photos: { src: string; alt: string }[]
}
