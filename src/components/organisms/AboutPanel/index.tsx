import Image from 'next/image'

import Chip from '@components/atoms/Chip'

import { about as defaultAbout } from '@content/about'
import type { IAbout } from '@models/about'

export default function AboutPanel({
  content = defaultAbout,
}: {
  content?: IAbout
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <figure className="bg-paper rotate-[-2deg] rounded-lg p-2 shadow-md">
        {content.photo ? (
          <Image
            src={content.photo.src}
            alt={content.photo.alt}
            width={220}
            height={220}
            className="rounded"
          />
        ) : (
          <div
            aria-hidden="true"
            className="bg-peach font-display flex aspect-square items-center justify-center rounded text-6xl"
          >
            🐾
          </div>
        )}
        <figcaption className="font-display pt-2 text-center font-bold">
          {content.name}
        </figcaption>
      </figure>
      <div>
        <p className="font-display text-xl font-extrabold">
          {content.title} · {content.location}
        </p>
        <p className="my-3 text-lg">{content.intro}</p>
        <ul className="mb-3 flex flex-wrap gap-2">
          {content.facts.map((f) => (
            <li key={f}>
              <Chip color="mint">{f}</Chip>
            </li>
          ))}
        </ul>
        <p className="text-ink-muted">{content.summary}</p>
      </div>
    </div>
  )
}
