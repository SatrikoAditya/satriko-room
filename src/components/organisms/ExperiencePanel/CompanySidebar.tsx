import { cn } from '@components/shadcn/utils'

import type { IJob, JobId } from '@models/job'

export default function CompanySidebar({
  jobs,
  selectedId,
  onSelect,
}: {
  jobs: readonly IJob[]
  selectedId: JobId
  onSelect: (id: JobId) => void
}) {
  return (
    <ul
      className="flex gap-2 overflow-x-auto sm:flex-col"
      aria-label="Companies"
    >
      {jobs.map((job) => (
        <li key={job.id}>
          <button
            type="button"
            aria-pressed={job.id === selectedId}
            onClick={() => onSelect(job.id)}
            className={cn(
              'min-h-11 w-full rounded-lg px-3 py-2 text-left font-mono text-sm',
              job.id === selectedId ? 'bg-sky text-ink' : 'hover:bg-paper-2',
            )}
          >
            📄 {job.id}.md
            <span className="font-body text-ink-muted block text-xs">
              {job.company}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
