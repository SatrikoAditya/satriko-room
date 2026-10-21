'use client'

import { useSceneStore } from '@store/useSceneStore'

export default function ProgressPill() {
  const progress = useSceneStore((s) => s.progress)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const webgl = useSceneStore((s) => s.webgl)
  if (webgl !== 'supported' || sceneReady) return null
  return (
    <div
      role="status"
      className="stitched bg-paper font-display fixed bottom-20 left-4 z-30 rounded-full px-3 py-1 text-xs font-bold shadow-md sm:bottom-4"
    >
      Room loading… {progress}%
    </div>
  )
}
