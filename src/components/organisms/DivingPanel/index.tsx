'use client'

import { useState } from 'react'

import ChipStrip from '@components/molecules/ChipStrip'
import DepthChart from '@components/molecules/DepthChart'
import EmptyState from '@components/molecules/EmptyState'
import LogbookPage from '@components/molecules/LogbookPage'

import { dives as defaultDives } from '@content/diving'
import { oyenLines } from '@content/oyen'
import type { IDive } from '@models/dive'
import { diveStats, formatDepth } from '@utils/diving'
import { newestFirst } from '@utils/travel'

export default function DivingPanel({
  items: unsorted = defaultDives,
}: {
  items?: readonly IDive[]
}) {
  const dives = newestFirst(unsorted)
  // The newest dive is selected on open (decision 56).
  const [selectedId, setSelectedId] = useState<string | null>(
    dives[0]?.id ?? null,
  )
  const selected = dives.find((d) => d.id === selectedId) ?? null
  const stats = diveStats(dives)

  if (!stats) return <EmptyState message={oyenLines.empty.diving} />
  // Same layout as Travel and Hiking: phones get the chart, a sideways dive
  // strip, then the logbook page; desktop puts the page on the right.
  return (
    <div className="grid gap-4 [grid-template-areas:'stats'_'chart'_'list'_'card'] lg:grid-cols-[3fr_2fr] lg:grid-rows-[auto_auto_1fr] lg:[grid-template-areas:'stats_card'_'chart_card'_'list_card']">
      <p className="font-display font-extrabold [grid-area:stats]">
        {stats.count} {stats.count === 1 ? 'dive' : 'dives'} · deepest{' '}
        {formatDepth(stats.deepest.depthM)} ({stats.deepest.site})
      </p>
      <div className="[grid-area:chart]">
        <DepthChart
          dives={dives}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <ChipStrip
        items={dives.map((d) => ({ id: d.id, label: d.site }))}
        selectedId={selectedId}
        onSelect={setSelectedId}
        label="Dives, newest first"
        className="[grid-area:list]"
      />
      {selected && (
        <div aria-live="polite" className="self-start [grid-area:card]">
          <LogbookPage key={selected.id} dive={selected} />
        </div>
      )}
    </div>
  )
}
