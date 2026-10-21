export interface IAbout {
  name: string
  title: string
  location: string
  photo: { src: string; alt: string } | null
  intro: string
  summary: string
  facts: string[]
}
