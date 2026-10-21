import type { IJob } from '@models/job'

export function usedAt(skill: string, jobs: readonly IJob[]): string[] {
  const needle = skill.toLowerCase()
  return jobs
    .filter((job) => job.tools.some((t) => t.toLowerCase() === needle))
    .map((job) => job.company)
}
