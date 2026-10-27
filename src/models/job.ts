export type JobId = 'jitera' | 'charcentric' | 'immobi' | 'ipb'
export interface IJob {
  id: JobId
  company: string
  role: string
  kind: 'full-time' | 'internship'
  location: string
  remote: boolean
  start: string
  end: string | 'present'
  /** One line on what the role was, shown above the highlights. */
  summary?: string
  highlights: string[]
  tools: string[]
}
