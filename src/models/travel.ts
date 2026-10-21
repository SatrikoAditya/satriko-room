export interface ITravelPin {
  id: string
  place: string
  region: string
  lat: number
  lon: number
  year: number
  photos: { src: string; alt: string }[]
  note: string
}
