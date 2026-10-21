'use client'

import { useEffect, useState } from 'react'

export function useViewportSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )
  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
