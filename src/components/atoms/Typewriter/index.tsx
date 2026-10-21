'use client'

import { useEffect, useState } from 'react'
import { useReducedMotionConfig } from 'motion/react'

import { TYPEWRITER_CPS } from '@constants/hints'

// A new line remounts this component (parent keys on the text), so `shown`
// always starts at 0 for a fresh line.
export default function Typewriter({
  text,
  onDone,
  skip = false,
}: {
  text: string
  onDone?: () => void
  skip?: boolean
}) {
  const reduced = useReducedMotionConfig()
  const [typed, setTyped] = useState(0)
  const instant = Boolean(reduced) || skip
  const shown = instant ? text.length : typed
  useEffect(() => {
    if (shown >= text.length) return
    const t = window.setTimeout(
      () => setTyped((n) => n + 1),
      1000 / TYPEWRITER_CPS,
    )
    return () => window.clearTimeout(t)
  }, [shown, text.length])
  useEffect(() => {
    if (shown >= text.length) onDone?.()
  }, [shown, text.length, onDone])
  return <span aria-hidden="true">{text.slice(0, shown)}</span>
}
