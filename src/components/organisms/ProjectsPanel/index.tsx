import Image from 'next/image'
import { FolderKanban } from 'lucide-react'

import Button from '@components/atoms/Button'
import Chip from '@components/atoms/Chip'
import EmptyState from '@components/molecules/EmptyState'
import { cn } from '@components/shadcn/utils'

import { oyenLines } from '@content/oyen'
import { projects as defaultProjects } from '@content/projects'
import type { IProject } from '@models/project'
import type { ISkillShelf } from '@models/skill'

// Personal projects first, then work.
const groups = [
  { kind: 'personal', title: 'Personal' },
  { kind: 'work', title: 'Work' },
] as const

// Cards without a screenshot get a coloured tile, like sticky notes on the board.
const tiles = ['bg-mint', 'bg-sky', 'bg-peach', 'bg-lavender'] as const
const chipColors: readonly ISkillShelf['color'][] = [
  'sky',
  'mint',
  'peach',
  'lavender',
]

function ProjectCard({ project, index }: { project: IProject; index: number }) {
  return (
    <article className="bg-paper-2 flex h-full flex-col gap-2 rounded-xl p-3 shadow-sm">
      {project.screenshot ? (
        <Image
          src={project.screenshot.src}
          alt={project.screenshot.alt}
          width={1200}
          height={750}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="aspect-[16/10] h-auto w-full rounded-lg object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            'flex aspect-[16/10] w-full items-center justify-center rounded-lg',
            tiles[index % tiles.length],
          )}
        >
          <FolderKanban size={40} className="text-ink/60" />
        </div>
      )}
      <h4 className="font-display text-lg font-extrabold">{project.title}</h4>
      <p className="text-ink-muted text-sm font-bold">{project.role}</p>
      <p>{project.summary}</p>
      {project.tech.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
          {project.tech.map((t, i) => (
            <li key={t}>
              <Chip color={chipColors[i % chipColors.length]}>{t}</Chip>
            </li>
          ))}
        </ul>
      )}
      {project.links.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {project.links.map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              href={l.href}
              target="_blank"
              rel="noreferrer"
            >
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </article>
  )
}

export default function ProjectsPanel({
  items = defaultProjects,
}: {
  items?: readonly IProject[]
}) {
  if (items.length === 0)
    return <EmptyState message={oyenLines.empty.projects} />
  return (
    <div className="space-y-6">
      {groups.map(({ kind, title }) => {
        const list = items.filter((p) => p.kind === kind)
        if (list.length === 0) return null
        return (
          <section key={kind} aria-labelledby={`projects-${kind}`}>
            <h3
              id={`projects-${kind}`}
              className="font-display mb-3 text-xl font-extrabold"
            >
              {title}
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <li key={p.id}>
                  <ProjectCard project={p} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
