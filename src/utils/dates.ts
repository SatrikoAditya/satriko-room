import { BASE_ZONE } from '@constants/timezones'
import type { IJob } from '@models/job'

export function formatRange(job: IJob) {
  const f = (ym: string) =>
    new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  return `${f(job.start)} – ${job.end === 'present' ? 'Present' : f(job.end)}`
}

/** "20 Oct 2026", as the day falls in Bogor. */
export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: BASE_ZONE,
  })
}
