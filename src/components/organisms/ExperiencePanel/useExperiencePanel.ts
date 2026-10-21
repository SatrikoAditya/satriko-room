'use client'

import { useState } from 'react'

import type { IJob, JobId } from '@models/job'

export function formatRange(job: IJob) {
  const f = (ym: string) =>
    new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  return `${f(job.start)} – ${job.end === 'present' ? 'Present' : f(job.end)}`
}
export function useExperiencePanel(jobs: readonly IJob[]) {
  const [selectedId, setSelectedId] = useState<JobId>(jobs[0].id)
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0]
  return { selected, selectedId, setSelectedId }
}
