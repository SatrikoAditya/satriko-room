'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Poster() {
  const [broken, setBroken] = useState(false)
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--paper-2),transparent_70%)]"
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
