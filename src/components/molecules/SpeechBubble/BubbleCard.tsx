'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'

import Typewriter from '@components/atoms/Typewriter'

import { useSceneStore } from '@store/useSceneStore'

import { BUBBLE_HIDE_MS } from '@constants/hints'

// Per-line state lives here; the parent remounts it with key={text}.
export default function BubbleCard({
  text,
  left,
  top,
}: {
  text: string
  left: number
  top: number
}) {
  const [done, setDone] = useState(false)
  const [skip, setSkip] = useState(false)
  const [hover, setHover] = useState(false)
  useEffect(() => {
    if (!done || hover) return
    const t = window.setTimeout(
      () => useSceneStore.getState().setBubble(null),
      BUBBLE_HIDE_MS,
    )
    return () => window.clearTimeout(t)
  }, [done, hover])
  const advance = useCallback(() => {
    if (!done) setSkip(true)
    else useSceneStore.getState().setBubble(null)
  }, [done])
  const onDone = useCallback(() => setDone(true), [])
  return (
    <motion.button
      type="button"
      onClick={advance}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{ left, top }}
      className="stitched bg-paper font-display text-ink fixed z-30 w-72 rounded-2xl p-3 pt-5 text-left text-[15px] font-bold shadow-lg"
    >
      <span className="bg-accent text-on-accent absolute -top-3 left-3 rounded-full px-2 py-0.5 text-xs">
        Oyen
      </span>
      <Typewriter text={text} skip={skip} onDone={onDone} />
      <span
        aria-hidden="true"
        className="bg-paper absolute -bottom-2 left-10 h-4 w-4 rotate-45"
      />
    </motion.button>
  )
}
