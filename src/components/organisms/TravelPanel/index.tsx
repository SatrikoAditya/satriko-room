import Image from 'next/image'

import EmptyState from '@components/molecules/EmptyState'

import { oyenLines } from '@content/oyen'
import { travelPins as defaultPins } from '@content/travel'
import type { ITravelPin } from '@models/travel'

export default function TravelPanel({
  pins = defaultPins,
}: {
  pins?: readonly ITravelPin[]
}) {
  return pins.length === 0 ? (
    <EmptyState message={oyenLines.empty.travel} />
  ) : (
    <ul className="grid gap-3 sm:grid-cols-2">
      {pins.map((p) => (
        <li key={p.id} className="bg-paper-2 rounded-xl p-3">
          <p className="font-display font-bold">
            {p.place} · {p.year}
          </p>
          <p className="text-ink-muted text-sm">{p.region}</p>
          {p.photos[0] && (
            <Image
              src={p.photos[0].src}
              alt={p.photos[0].alt}
              width={800}
              height={600}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-auto w-full rounded-lg"
            />
          )}
          <p>{p.note}</p>
        </li>
      ))}
    </ul>
  )
}
