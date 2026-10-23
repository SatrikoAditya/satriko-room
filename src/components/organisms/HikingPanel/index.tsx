'use client'

import { useState } from 'react'

import ChipStrip from '@components/molecules/ChipStrip'
import EmptyState from '@components/molecules/EmptyState'
import JournalPage from '@components/molecules/JournalPage'
import MountainScene from '@components/molecules/MountainScene'

import { hikes as defaultHikes } from '@content/hiking'
import { oyenLines } from '@content/oyen'
import type { IHike } from '@models/hike'
import { highestElevation } from '@utils/hiking'
import { newestFirst } from '@utils/travel'

export default function HikingPanel({
  items: unsorted = defaultHikes,
}: {
  items?: readonly IHike[]
}) {
  const hikes = newestFirst(unsorted)
  // The newest hike is selected on open (decision 54).
  const [selectedId, setSelectedId] = useState<string | null>(
    hikes[0]?.id ?? null,
  )
  const selected = hikes.find((h) => h.id === selectedId) ?? null
  if (hikes.length === 0) return <EmptyState message={oyenLines.empty.hiking} />
  // Same layout as Travel: phones get the selected mountain, a sideways
  // mountain strip, then the journal page; desktop puts the page on the right.
  return (
    <div className="grid gap-4 [grid-template-areas:'sky'_'list'_'card'] lg:grid-cols-[3fr_2fr] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'sky_card'_'list_card']">
      <div className="[grid-area:sky]">
        {selected && (
          <MountainScene hike={selected} tallestM={highestElevation(hikes)} />
        )}
      </div>
      <ChipStrip
        items={hikes.map((h) => ({ id: h.id, label: h.name }))}
        selectedId={selectedId}
        onSelect={setSelectedId}
        label="Mountains, newest first"
        className="[grid-area:list]"
      />
      {selected && (
        <div aria-live="polite" className="self-start [grid-area:card]">
          <JournalPage key={selected.id} hike={selected} />
        </div>
      )}
    </div>
  )
}
