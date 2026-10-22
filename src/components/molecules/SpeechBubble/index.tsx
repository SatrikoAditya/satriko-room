'use client'

import { AnimatePresence } from 'motion/react'

import { useSceneStore } from '@store/useSceneStore'

import BubbleCard, { BUBBLE_WIDTH } from './BubbleCard'

const EDGE = 8
/** The tail's tip stops this far above the top of Oyen's head. */
const GAP = 12
/** Room kept for the bubble above its bottom edge, so it never leaves the top of the screen. */
const MAX_HEIGHT = 110
/** The tail stays this far inside the bubble's rounded corners. */
const TAIL_INSET = 24

export default function SpeechBubble() {
  const text = useSceneStore((s) => s.bubble)
  const anchor = useSceneStore((s) => s.oyenAnchor)
  const x = anchor?.x ?? 160
  const viewport = typeof window === 'undefined' ? 1200 : window.innerWidth
  // Centred on Oyen, but kept on screen; the tail then slides to point at him.
  const left = Math.min(
    Math.max(x - BUBBLE_WIDTH / 2, EDGE),
    viewport - BUBBLE_WIDTH - EDGE,
  )
  const tailX = Math.min(
    Math.max(x - left, TAIL_INSET),
    BUBBLE_WIDTH - TAIL_INSET,
  )
  // The bubble sits on its bottom edge, just above his head, whatever its height.
  const bottom = Math.max((anchor?.y ?? 300) - GAP, EDGE + MAX_HEIGHT)
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {text ?? ''}
      </div>
      <AnimatePresence>
        {text && (
          <BubbleCard
            key={text}
            text={text}
            left={left}
            bottom={bottom}
            tailX={tailX}
          />
        )}
      </AnimatePresence>
    </>
  )
}
