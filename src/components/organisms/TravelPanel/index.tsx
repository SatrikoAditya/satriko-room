'use client'

import { useState } from 'react'
import Image from 'next/image'

import EmptyState from '@components/molecules/EmptyState'
import MapPin from '@components/molecules/MapPin'

import { indonesiaMap } from '@constants/indonesiaMap'
import { oyenLines } from '@content/oyen'
import { travelPins as defaultPins } from '@content/travel'
import type { ITravelPin } from '@models/travel'
import { mercatorXY } from '@utils/map'

export default function TravelPanel({
  pins = defaultPins,
}: {
  pins?: readonly ITravelPin[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    pins[0]?.id ?? null,
  )
  const selected = pins.find((p) => p.id === selectedId) ?? null
  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <svg
        viewBox={`0 0 ${indonesiaMap.width} ${indonesiaMap.height}`}
        role="img"
        aria-label="Map of Indonesia with visited places"
        className="bg-sky/40 w-full rounded-xl"
      >
        <path
          d={indonesiaMap.path}
          fill="#9FD8C3"
          stroke="#7A5235"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {pins.map((p) => {
          const { x, y } = mercatorXY(
            p.lat,
            p.lon,
            indonesiaMap.scale,
            indonesiaMap.translate,
          )
          return (
            <MapPin
              key={p.id}
              pin={p}
              x={x}
              y={y}
              selected={p.id === selectedId}
              onSelect={setSelectedId}
            />
          )
        })}
      </svg>
      {pins.length === 0 ? (
        <EmptyState message={oyenLines.empty.travel} />
      ) : (
        <div>
          <ul className="mb-3 flex flex-wrap gap-2">
            {pins.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={p.id === selectedId}
                  onClick={() => setSelectedId(p.id)}
                  className="bg-paper-2 font-display aria-pressed:bg-peach min-h-11 rounded-full px-3 text-sm font-bold"
                >
                  {p.place}
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <article aria-live="polite" className="bg-paper-2 rounded-xl p-3">
              <p className="font-display text-lg font-extrabold">
                {selected.place} · {selected.year}
              </p>
              <p className="text-ink-muted text-sm">{selected.region}</p>
              {selected.photos[0] && (
                <Image
                  width={800}
                  height={600}
                  unoptimized
                  src={selected.photos[0].src}
                  alt={selected.photos[0].alt}
                  className="my-2 h-auto w-full rounded-lg"
                />
              )}
              <p>{selected.note}</p>
            </article>
          )}
        </div>
      )}
    </div>
  )
}
