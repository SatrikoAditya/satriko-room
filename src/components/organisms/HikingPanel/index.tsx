import Image from 'next/image'

import EmptyState from '@components/molecules/EmptyState'

import { hikes as defaultHikes } from '@content/hiking'
import { oyenLines } from '@content/oyen'
import type { IHike } from '@models/hike'

export default function HikingPanel({
  items = defaultHikes,
}: {
  items?: readonly IHike[]
}) {
  return items.length === 0 ? (
    <EmptyState message={oyenLines.empty.hiking} />
  ) : (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((h) => (
        <li key={h.id} className="bg-paper-2 rounded-xl p-3">
          <p className="font-display font-bold">
            {h.name} · {h.elevationM} m
          </p>
          <p className="text-ink-muted text-sm">
            {h.location} · {h.date}
          </p>
          {h.photos[0] && (
            <Image
              src={h.photos[0].src}
              alt={h.photos[0].alt}
              width={800}
              height={600}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-auto w-full rounded-lg"
            />
          )}
          <p>{h.story}</p>
        </li>
      ))}
    </ul>
  )
}
