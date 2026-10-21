'use client'

import { useState } from 'react'

import type { IJob, JobId } from '@models/job'

export function useExperiencePanel(jobs: readonly IJob[]) {
  const [selectedId, setSelectedId] = useState<JobId>(jobs[0].id)
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0]
  return { selected, selectedId, setSelectedId }
}
