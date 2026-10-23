'use client'

import { useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@components/shadcn/utils'

const SWIPE_PX = 40

/**
 * 0–3 photos with prev / next buttons, dots, swipe and ← → keys, announcing
 * "Photo 2 of 3". With no photos it shows `empty` (Travel and Hiking cards).
 */
export default function PhotoCarousel({
  photos,
  label,
  empty,
}: {
  photos: readonly { src: string; alt: string }[]
  /** Names the carousel for screen readers, e.g. "Photos of Bogor". */
  label: string
  empty: ReactNode
}) {
  const [index, setIndex] = useState(0)
  const downX = useRef<number | null>(null)
  const count = photos.length
  const photo = photos[index]
  const go = (step: number) => setIndex((i) => (i + step + count) % count)

  if (!photo) return empty
  return (
    <>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (count < 2) return
          if (e.key === 'ArrowLeft') go(-1)
          if (e.key === 'ArrowRight') go(1)
        }}
        onPointerDown={(e) => {
          downX.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (downX.current === null || count < 2) return
          const dx = e.clientX - downX.current
          downX.current = null
          if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1)
        }}
        className="relative touch-pan-y rounded-sm"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 35vw, 90vw"
          className="aspect-[4/3] h-auto w-full rounded-sm object-cover"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="bg-paper/85 absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="bg-paper/85 absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
        <p aria-live="polite" className="sr-only">
          Photo {index + 1} of {count}
        </p>
      </div>
      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  i === index ? 'bg-ink' : 'bg-ink/25',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
