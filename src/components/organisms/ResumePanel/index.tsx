import Button from '@components/atoms/Button'
import Chip from '@components/atoms/Chip'
import { formatRange } from '@components/organisms/ExperiencePanel/useExperiencePanel'

import { about } from '@content/about'
import { jobs } from '@content/experience'
import { resume as defaultResume } from '@content/resume'

export default function ResumePanel({
  content = defaultResume,
}: {
  content?: typeof defaultResume
}) {
  return (
    <div className="bg-paper p-6 shadow-inner">
      <h3 className="font-display text-2xl font-extrabold">{about.name}</h3>
      <p className="text-ink-muted">
        {about.title} · {about.location}
      </p>
      <p className="my-3">{about.summary}</p>
      <ul className="mb-3 space-y-1">
        {jobs.map((j) => (
          <li key={j.id}>
            <strong>{j.role}</strong>, {j.company} · {formatRange(j)}
          </li>
        ))}
      </ul>
      <ul className="mb-4 flex flex-wrap gap-2">
        {content.topSkills.map((s) => (
          <li key={s}>
            <Chip>{s}</Chip>
          </li>
        ))}
      </ul>
      <Button href={content.pdf} download>
        Download PDF
      </Button>
    </div>
  )
}
