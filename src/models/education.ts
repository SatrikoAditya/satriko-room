export interface IEducation {
  id: string
  program: string
  institution: string
  location: string
  start: string
  end: string | 'present'
  note?: string
  honors?: boolean
}
