import Image from 'next/image'

import EmptyState from '@components/molecules/EmptyState'

import { certification, dives as defaultDives } from '@content/diving'
import { oyenLines } from '@content/oyen'
import type { IDive } from '@models/dive'

export default function DivingPanel({
  items = defaultDives,
}: {
  items?: readonly IDive[]
}) {
  return (
    <div className="space-y-3">
      {certification !== null && (
        <p className="font-display font-bold">Certification: {certification}</p>
      )}
      {items.length === 0 ? (
        <EmptyState message={oyenLines.empty.diving} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((d) => (
            <li key={d.id} className="bg-paper-2 rounded-xl p-3">
              <p className="font-display font-bold">
                {d.site} · {d.maxDepthM} m
              </p>
              <p className="text-ink-muted text-sm">
                {d.location} · {d.date}
              </p>
              {d.photos[0] && (
                <Image
                  src={d.photos[0].src}
                  alt={d.photos[0].alt}
                  width={800}
                  height={600}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full rounded-lg"
                />
              )}
              <p>{d.highlights}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
