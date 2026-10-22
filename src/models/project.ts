export interface IProject {
  id: string
  /** Grouped in the panel under Work or Personal. */
  kind: 'work' | 'personal'
  title: string
  summary: string
  role: string
  /** Names as in `src/content/skills.ts` where possible. */
  tech: readonly string[]
  /** Under `public/images/projects/`; null shows a coloured tile instead. */
  screenshot: { src: string; alt: string } | null
  links: readonly { label: string; href: string }[]
}
