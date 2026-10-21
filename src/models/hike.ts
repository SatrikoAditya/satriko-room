export interface IHike {
  id: string
  name: string
  location: string
  elevationM: number
  date: string
  photos: { src: string; alt: string }[]
  story: string
}
