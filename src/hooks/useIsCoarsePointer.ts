'use client'

import { useEffect, useState } from 'react'

export function useIsCoarsePointer() {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    // Old browsers and test DOMs may lack matchMedia: treat them as a mouse.
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return matches
}
