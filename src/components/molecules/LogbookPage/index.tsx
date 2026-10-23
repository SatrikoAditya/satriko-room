import { Waves } from 'lucide-react'

import Tape from '@components/atoms/Tape'
import PhotoCarousel from '@components/molecules/PhotoCarousel'

import type { IDive } from '@models/dive'
import { formatDepth } from '@utils/diving'

/** The selected dive as a page of a dive logbook (decision 56). */
export default function LogbookPage({ dive }: { dive: IDive }) {
  return (
    <article className="bg-paper relative rounded-md p-3 pb-4 shadow-md">
      <Tape />
      <PhotoCarousel
        photos={dive.photos}
        label={`Photos of ${dive.site}`}
        empty={
          <div
            aria-hidden="true"
            className="border-paper-2 bg-sky flex aspect-[4/3] w-full items-center justify-center rounded-sm border-4 border-dashed"
          >
            <Waves size={48} className="text-ink/60" />
          </div>
        }
      />
      <div className="relative mt-2 min-h-16 pr-20">
        {/* A round depth gauge, like the dial on a dive computer. */}
        <p className="border-wood font-display text-wood-dark dark:text-ink absolute top-0 right-0 flex size-16 flex-col items-center justify-center rounded-full border-4 border-double leading-tight font-extrabold">
          <span className="sr-only">Depth {formatDepth(dive.depthM)}</span>
          <span
            aria-hidden="true"
            className="text-[10px] tracking-wide uppercase"
          >
            about
          </span>
          <span aria-hidden="true">{dive.depthM} m</span>
        </p>
        <h4 className="font-display text-lg font-extrabold">
          {dive.site}
          {dive.year !== null && ` · ${dive.year}`}
        </h4>
        <p className="text-ink-muted text-sm">{dive.location}</p>
        {dive.note && <p className="mt-1">{dive.note}</p>}
      </div>
    </article>
  )
}
