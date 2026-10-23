import { Mountain } from 'lucide-react'

import Tape from '@components/atoms/Tape'
import PhotoCarousel from '@components/molecules/PhotoCarousel'

import type { IHike } from '@models/hike'
import { formatMetres, tripLine } from '@utils/hiking'

/** The selected mountain as a page of a trail journal (decision 54). */
export default function JournalPage({ hike }: { hike: IHike }) {
  const trip = tripLine(hike)
  return (
    <article className="bg-paper relative rounded-md p-3 pb-4 shadow-md">
      <Tape />
      <PhotoCarousel
        photos={hike.photos}
        label={`Photos of ${hike.name}`}
        // The mountain is drawn on the left; this placeholder holds the spot
        // for Satriko's photos.
        empty={
          <div
            aria-hidden="true"
            className="border-paper-2 bg-mint flex aspect-[4/3] w-full items-center justify-center rounded-sm border-4 border-dashed"
          >
            <Mountain size={48} className="text-ink/60" />
          </div>
        }
      />
      {/* Lined notebook paper under the text. */}
      <div
        className="relative mt-2 pr-24"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 27px, rgb(122 82 53 / 0.14) 27px 28px)',
          lineHeight: '28px',
        }}
      >
        <p className="border-wood font-display text-wood-dark dark:text-ink absolute top-1 right-0 flex rotate-[8deg] items-center gap-1 rounded-full border-2 border-dashed px-2 text-sm leading-7 font-extrabold">
          <Mountain size={14} aria-hidden="true" />
          <span className="sr-only">Elevation </span>
          {formatMetres(hike.elevationM)}
        </p>
        <h4 className="font-display text-lg font-extrabold">
          {hike.name}
          {hike.year !== null && ` · ${hike.year}`}
        </h4>
        <p className="text-ink-muted text-sm leading-7">{hike.location}</p>
        {trip && <p className="text-sm leading-7 font-bold">{trip}</p>}
        {hike.story && <p>{hike.story}</p>}
      </div>
    </article>
  )
}
