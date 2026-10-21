'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

import { cn } from '@components/shadcn/utils'

const subscribeNever = () => () => {}

export default function Poster({ hidden = false }: { hidden?: boolean }) {
  const [broken, setBroken] = useState(false)
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const night = mounted && resolvedTheme === 'dark'
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
          src={night ? '/poster/room-night.webp' : '/poster/room-day.webp'}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          unoptimized
          onError={() => setBroken(true)}
          className="object-contain"
        />
      )}
    </div>
  )
}
