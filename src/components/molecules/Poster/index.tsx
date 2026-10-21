'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@components/shadcn/utils'

export default function Poster({ hidden = false }: { hidden?: boolean }) {
  const [broken, setBroken] = useState(false)
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--paper-2),transparent_70%)] transition-opacity duration-700',
        hidden && 'opacity-0',
      )}
    >
      {!broken && (
        <Image
          src="/poster/room-day.webp"
          alt=""
          fill
          unoptimized
          onError={() => setBroken(true)}
          className="object-contain"
        />
      )}
    </div>
  )
}
