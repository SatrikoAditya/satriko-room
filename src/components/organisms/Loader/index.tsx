'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Button from '@components/atoms/Button'
import ProgressBar from '@components/atoms/ProgressBar'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import {
  loaderMessages,
  MESSAGE_INTERVAL_MS,
  MIN_LOADER_MS,
} from '@constants/loader'

import OyenWalk from './OyenWalk'

export default function Loader({ onEnter }: { onEnter: () => void }) {
  const phase = useRoomStore((s) => s.phase)
  const progress = useSceneStore((s) => s.progress)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const webgl = useSceneStore((s) => s.webgl)
  const { linkProps } = useSectionNavigation()
  const [msg, setMsg] = useState(0)
  const [mountedAt] = useState(() => Date.now())
  const fallback = webgl === 'unsupported' || webgl === 'lost'
  const shown =
    fallback || phase === 'gate'
      ? 100
      : sceneReady
        ? progress
        : Math.min(progress, 90)

  useEffect(() => {
    const id = window.setInterval(
      () => setMsg((m) => (m + 1) % loaderMessages.length),
      MESSAGE_INTERVAL_MS,
    )
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'loading') return
    const done = fallback || (sceneReady && progress >= 100)
    if (!done) return
    const wait = Math.max(0, MIN_LOADER_MS - (Date.now() - mountedAt))
    const t = window.setTimeout(
      () => useRoomStore.getState().setPhase('gate'),
      wait,
    )
    return () => window.clearTimeout(t)
  }, [phase, fallback, sceneReady, progress, mountedAt])

  const skip = linkProps('resume')
  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="bg-paper fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <OyenWalk progress={shown} />
      <ProgressBar value={shown} label="Loading the room" />
      <p className="font-display text-ink-muted text-lg">
        {phase === 'gate' ? 'Ready!' : loaderMessages[msg]}
      </p>
      <AnimatePresence>
        {phase === 'gate' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button onClick={onEnter} className="text-lg">
              {fallback ? 'Enter (simple view)' : 'Enter the room'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={skip.href}
        onClick={(e) => {
          skip.onClick(e)
          if (e.defaultPrevented) useRoomStore.getState().setPhase('ready')
        }}
        className="text-sm underline"
      >
        Skip to my resume →
      </a>
    </motion.div>
  )
}
