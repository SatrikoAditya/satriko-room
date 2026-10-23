import { MapPin } from 'lucide-react'

import Tape from '@components/atoms/Tape'
import PhotoCarousel from '@components/molecules/PhotoCarousel'

import type { ITravelPin } from '@models/travel'

/** The selected place as a polaroid: a 0–3 photo carousel, then its story. */
export default function Postcard({ pin }: { pin: ITravelPin }) {
  return (
    <article className="bg-paper relative rotate-[-1deg] rounded-md p-3 pb-4 shadow-md">
      <Tape />
      <PhotoCarousel
        photos={pin.photos}
        label={`Photos of ${pin.place}`}
        empty={
          <div
            aria-hidden="true"
            className="border-paper-2 bg-peach flex aspect-[4/3] w-full items-center justify-center rounded-sm border-4 border-dashed"
          >
            <MapPin size={48} className="text-ink/60" />
          </div>
        }
      />
      <p className="font-display mt-2 text-lg font-extrabold">
        {pin.place}
        {pin.year !== null && ` · ${pin.year}`}
      </p>
      <p className="text-ink-muted text-sm">{pin.region}</p>
      {pin.note && <p className="mt-1">{pin.note}</p>}
    </article>
  )
}
