export type EducationKind = 'degree' | 'bootcamp' | 'school'

export interface IEducation {
  id: string
  /** Shown as a tag, so the bootcamp isn't read as a degree (decision 64). */
  kind: EducationKind
  program: string
  institution: string
  location: string
  start: string
  end: string | 'present'
  note?: string
  honors?: boolean
}
