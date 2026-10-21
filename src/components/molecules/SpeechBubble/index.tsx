'use client'

import { AnimatePresence } from 'motion/react'

import { useSceneStore } from '@store/useSceneStore'

import BubbleCard from './BubbleCard'

export default function SpeechBubble() {
  const text = useSceneStore((s) => s.bubble)
  const anchor = useSceneStore((s) => s.oyenAnchor)
  const left = Math.min(
    Math.max((anchor?.x ?? 160) - 140, 8),
    (typeof window === 'undefined' ? 1200 : window.innerWidth) - 288,
  )
  const top = Math.max((anchor?.y ?? 300) - 120, 8)
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {text ?? ''}
      </div>
      <AnimatePresence>
        {text && <BubbleCard key={text} text={text} left={left} top={top} />}
      </AnimatePresence>
    </>
  )
}
