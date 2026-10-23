'use client'

import { useState } from 'react'

import ChipStrip from '@components/molecules/ChipStrip'
import EmptyState from '@components/molecules/EmptyState'
import MapPin from '@components/molecules/MapPin'
import Postcard from '@components/molecules/Postcard'

import { indonesiaMap } from '@constants/indonesiaMap'
import { oyenLines } from '@content/oyen'
import { travelPins as defaultPins } from '@content/travel'
import type { ITravelPin } from '@models/travel'
import { mercatorXY } from '@utils/map'
import { layoutPins, newestFirst } from '@utils/travel'

const project = (p: ITravelPin) =>
  mercatorXY(p.lat, p.lon, indonesiaMap.scale, indonesiaMap.translate)

export default function TravelPanel({
  pins: unsorted = defaultPins,
}: {
  pins?: readonly ITravelPin[]
}) {
  const pins = newestFirst(unsorted)
  // The newest trip is selected on open (decision 53).
  const [selectedId, setSelectedId] = useState<string | null>(
    pins[0]?.id ?? null,
  )
  const selected = pins.find((p) => p.id === selectedId) ?? null
  // The place list sits right under the map, so a tap updates the postcard
  // below it. Phones: map, a sideways-scrolling city strip, the postcard.
  // Desktop: the map with the wrapping list under it, the postcard on the right.
  return (
    <div className="grid gap-4 [grid-template-areas:'map'_'list'_'card'] lg:grid-cols-[3fr_2fr] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'map_card'_'list_card']">
      <svg
        viewBox={`0 0 ${indonesiaMap.width} ${indonesiaMap.height}`}
        role="img"
        aria-label="Map of Indonesia with visited places"
        className="w-full rounded-xl [grid-area:map]"
        style={{ background: 'var(--scene-sky)' }}
      >
        <path
          d={indonesiaMap.path}
          style={{
            fill: 'var(--scene-land)',
            stroke: 'var(--scene-outline)',
          }}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* The selected pin is drawn last, so it sits on top. */}
        {layoutPins(pins, project)
          .sort(
            (a, b) =>
              Number(a.pin.id === selectedId) - Number(b.pin.id === selectedId),
          )
          .map(({ pin, x, y }) => (
            <MapPin
              key={pin.id}
              pin={pin}
              x={x}
              y={y}
              selected={pin.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
      </svg>
      {pins.length === 0 ? (
        <div className="[grid-area:card]">
          <EmptyState message={oyenLines.empty.travel} />
        </div>
      ) : (
        <>
          <ChipStrip
            items={pins.map((p) => ({ id: p.id, label: p.place }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
            label="Places, newest first"
            className="[grid-area:list]"
          />
          {selected && (
            <div aria-live="polite" className="self-start [grid-area:card]">
              <Postcard key={selected.id} pin={selected} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
