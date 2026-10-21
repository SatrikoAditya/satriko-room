'use client'

import Chip from '@components/atoms/Chip'

import { jobs as defaultJobs } from '@content/experience'
import type { IJob } from '@models/job'

import CompanySidebar from './CompanySidebar'
import { formatRange, useExperiencePanel } from './useExperiencePanel'

export default function ExperiencePanel({
  jobs = defaultJobs,
}: {
  jobs?: readonly IJob[]
}) {
  const { selected, selectedId, setSelectedId } = useExperiencePanel(jobs)
  return (
    <div className="border-ink/80 bg-paper rounded-2xl border-[10px] p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-accent h-3 w-3 rounded-full" />
        <span className="bg-peach h-3 w-3 rounded-full" />
        <span className="bg-mint h-3 w-3 rounded-full" />
        <span className="text-ink-muted ml-2 font-mono text-xs">
          ~/experience
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <CompanySidebar
          jobs={jobs}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <article aria-live="polite">
          <h3 className="font-display text-2xl font-extrabold">
            {selected.role}
          </h3>
          <p className="font-bold">
            {selected.company}
            {selected.kind === 'internship' ? ' · Internship' : ''}
          </p>
          <p className="text-ink-muted">
            <span>
              {selected.remote
                ? `Remote · ${selected.location}`
                : selected.location}
            </span>{' '}
            · {formatRange(selected)}
          </p>
          <ul className="my-4 space-y-3">
            {selected.highlights.map((h) => (
              <li key={h.title}>
                <strong>{h.title}:</strong> {h.text}
              </li>
            ))}
          </ul>
          {selected.tools.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tools">
              {selected.tools.map((t) => (
                <li key={t}>
                  <Chip color="sky">{t}</Chip>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  )
}
